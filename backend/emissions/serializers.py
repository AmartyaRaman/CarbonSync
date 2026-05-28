"""
Emissions app — DRF serializers.
"""

from rest_framework import serializers

from .models import AuditLog, NormalizedRecord, Organization, RawRecord, Source


# ──────────────────────────────────────────────
# Organization
# ──────────────────────────────────────────────
class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]


# ──────────────────────────────────────────────
# Source
# ──────────────────────────────────────────────
class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = ["id", "source_type"]
        read_only_fields = ["id"]


# ──────────────────────────────────────────────
# RawRecord
# ──────────────────────────────────────────────
class RawRecordSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(
        source="organization.name", read_only=True
    )
    source_type = serializers.CharField(
        source="source.source_type", read_only=True
    )

    class Meta:
        model = RawRecord
        fields = [
            "id",
            "organization",
            "organization_name",
            "source",
            "source_type",
            "raw_data",
            "uploaded_at",
        ]
        read_only_fields = ["id", "uploaded_at"]


# ──────────────────────────────────────────────
# NormalizedRecord
# ──────────────────────────────────────────────
class NormalizedRecordSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(
        source="organization.name", read_only=True
    )
    source_type = serializers.CharField(
        source="source.source_type", read_only=True
    )

    class Meta:
        model = NormalizedRecord
        fields = [
            "id",
            "organization",
            "organization_name",
            "source",
            "source_type",
            "category",
            "quantity",
            "unit",
            "scope",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


# ──────────────────────────────────────────────
# AuditLog
# ──────────────────────────────────────────────
class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = [
            "id",
            "record",
            "action",
            "old_value",
            "new_value",
            "modified_by",
            "timestamp",
        ]
        read_only_fields = ["id", "timestamp"]


# ──────────────────────────────────────────────
# File Upload (non-model serializer)
# ──────────────────────────────────────────────
class FileUploadSerializer(serializers.Serializer):
    """Validates the CSV file upload request."""

    file = serializers.FileField(
        help_text="CSV file to upload.",
    )
    organization = serializers.CharField(
        required=False,
        default="Default Organization",
        help_text="Organization name for multi-tenancy.",
    )
