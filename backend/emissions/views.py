"""
Emissions app — API views.

Implements all REST endpoints defined in the architecture:
- Upload APIs (POST /api/upload/sap, /utility, /travel)
- Dashboard APIs (GET /api/records, /records/suspicious, /records/approved)
- Audit APIs (PATCH /api/records/:id/approve, GET /api/audit/:id)
"""

from rest_framework import generics, status
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AuditLog, NormalizedRecord
from .permissions import IsAdminOrAnalyst
from .serializers import (
    AuditLogSerializer,
    FileUploadSerializer,
    NormalizedRecordSerializer,
)
from .services.ingestion_service import ingest_csv


# Authentication APIs
class CustomObtainAuthToken(ObtainAuthToken):
    """
    POST /api/auth/login

    Returns token + user profile info including role (group membership).
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, _ = Token.objects.get_or_create(user=user)

        # Determine role from group membership
        groups = list(user.groups.values_list("name", flat=True))
        if "Admin" in groups:
            role = "Admin"
        elif "Analyst" in groups:
            role = "Analyst"
        else:
            role = "Viewer"

        return Response({
            "token": token.key,
            "user_id": user.pk,
            "username": user.username,
            "email": user.email,
            "role": role,
        })


class UserProfileView(APIView):
    """
    GET /api/auth/me

    Return the currently authenticated user's profile.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        groups = list(user.groups.values_list("name", flat=True))
        if "Admin" in groups:
            role = "Admin"
        elif "Analyst" in groups:
            role = "Analyst"
        else:
            role = "Viewer"

        return Response({
            "user_id": user.pk,
            "username": user.username,
            "email": user.email,
            "role": role,
        })


# Upload APIs
class BaseUploadView(APIView):
    """
    Base class for CSV upload endpoints.

    Subclasses set ``source_type`` to route to the correct normalizer.
    """

    parser_classes = [MultiPartParser, FormParser]
    source_type: str = ""

    def post(self, request):
        serializer = FileUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        csv_file = serializer.validated_data["file"]
        organization = serializer.validated_data.get(
            "organization", "Default Organization"
        )

        try:
            file_content = csv_file.read()
            summary = ingest_csv(
                file_content=file_content,
                source_type=self.source_type,
                organization_name=organization,
            )
        except Exception as exc:
            return Response(
                {"error": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": f"{self.source_type} data ingested successfully.",
                "summary": summary,
            },
            status=status.HTTP_201_CREATED,
        )


class UploadSAPView(BaseUploadView):
    """POST /api/upload/sap"""
    source_type = "SAP"


class UploadUtilityView(BaseUploadView):
    """POST /api/upload/utility"""
    source_type = "Utility"


class UploadTravelView(BaseUploadView):
    """POST /api/upload/travel"""
    source_type = "Travel"


# ══════════════════════════════════════════════
# Dashboard APIs
# ══════════════════════════════════════════════
class RecordListView(generics.ListAPIView):
    """
    GET /api/records
    GET /api/records?scope=Scope+1&source=SAP

    List all normalized records with optional query-param filtering.
    """

    serializer_class = NormalizedRecordSerializer

    def get_queryset(self):
        qs = NormalizedRecord.objects.select_related("organization", "source").all()

        # Optional filters
        scope = self.request.query_params.get("scope")
        if scope:
            qs = qs.filter(scope=scope)

        source = self.request.query_params.get("source")
        if source:
            qs = qs.filter(source__source_type=source)

        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)

        return qs


class SuspiciousRecordListView(generics.ListAPIView):
    """GET /api/records/suspicious"""

    serializer_class = NormalizedRecordSerializer

    def get_queryset(self):
        return (
            NormalizedRecord.objects.select_related("organization", "source")
            .filter(status="Suspicious")
        )


class ApprovedRecordListView(generics.ListAPIView):
    """GET /api/records/approved"""

    serializer_class = NormalizedRecordSerializer

    def get_queryset(self):
        return (
            NormalizedRecord.objects.select_related("organization", "source")
            .filter(status="Approved")
        )


# ══════════════════════════════════════════════
# Audit APIs
# ══════════════════════════════════════════════
class ApproveRecordView(APIView):
    """
    PATCH /api/records/:id/approve

    Approve a record (change status to Approved) and log the action.
    """
    permission_classes = [IsAdminOrAnalyst]

    def patch(self, request, pk):
        try:
            record = NormalizedRecord.objects.get(pk=pk)
        except NormalizedRecord.DoesNotExist:
            return Response(
                {"error": "Record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        old_status = record.status

        if old_status == "Approved":
            return Response(
                {"message": "Record is already approved."},
                status=status.HTTP_200_OK,
            )

        record.status = "Approved"
        record.save(update_fields=["status"])

        # Create audit log
        AuditLog.objects.create(
            record=record,
            action="approved",
            old_value={"status": old_status},
            new_value={"status": "Approved"},
            modified_by=getattr(request.user, "username", "anonymous"),
        )

        serializer = NormalizedRecordSerializer(record)
        return Response(serializer.data, status=status.HTTP_200_OK)


class FlagSuspiciousRecordView(APIView):
    """
    PATCH /api/records/:id/flag

    Flag a record (including approved ones) as suspicious, with an optional reason.
    """
    permission_classes = [IsAdminOrAnalyst]

    def patch(self, request, pk):
        try:
            record = NormalizedRecord.objects.get(pk=pk)
        except NormalizedRecord.DoesNotExist:
            return Response(
                {"error": "Record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        old_status = record.status
        reason = request.data.get("reason", "Flagged manually by user.")

        if old_status == "Suspicious":
            return Response(
                {"message": "Record is already flagged as suspicious."},
                status=status.HTTP_200_OK,
            )

        record.status = "Suspicious"
        record.save(update_fields=["status"])

        # Create audit log
        AuditLog.objects.create(
            record=record,
            action="flagged_suspicious",
            old_value={"status": old_status},
            new_value={"status": "Suspicious", "reason": reason},
            modified_by=getattr(request.user, "username", "anonymous"),
        )

        serializer = NormalizedRecordSerializer(record)
        return Response(serializer.data, status=status.HTTP_200_OK)



class AuditLogListView(generics.ListAPIView):
    """
    GET /api/audit/:id

    Retrieve the audit trail for a specific normalized record.
    """

    serializer_class = AuditLogSerializer

    def get_queryset(self):
        record_id = self.kwargs["pk"]
        return AuditLog.objects.filter(record_id=record_id)
