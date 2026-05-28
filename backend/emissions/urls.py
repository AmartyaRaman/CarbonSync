"""
Emissions app — URL routing.

Maps API routes to views as specified in the architecture.
"""

from django.urls import path

from . import views

app_name = "emissions"

urlpatterns = [
    # ── Upload APIs ──
    path("upload/sap/", views.UploadSAPView.as_view(), name="upload-sap"),
    path("upload/utility/", views.UploadUtilityView.as_view(), name="upload-utility"),
    path("upload/travel/", views.UploadTravelView.as_view(), name="upload-travel"),
    
    # ── Dashboard APIs ──
    path("records/", views.RecordListView.as_view(), name="record-list"),
    path(
        "records/suspicious/",
        views.SuspiciousRecordListView.as_view(),
        name="records-suspicious",
    ),
    path(
        "records/approved/",
        views.ApprovedRecordListView.as_view(),
        name="records-approved",
    ),
    path(
        "records/<int:pk>/approve/",
        views.ApproveRecordView.as_view(),
        name="record-approve",
    ),
    path(
        "records/<int:pk>/flag/",
        views.FlagSuspiciousRecordView.as_view(),
        name="record-flag",
    ),
    path(
        "audit/<int:pk>/",
        views.AuditLogListView.as_view(),
        name="audit-log",
    ),
]
