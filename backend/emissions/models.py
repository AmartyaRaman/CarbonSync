"""
Emissions app — Django models.

Defines the data layer for the ESG platform:
Organization, Source, RawRecord, NormalizedRecord, AuditLog.
"""

from django.db import models


# ──────────────────────────────────────────────
# Organization
# ──────────────────────────────────────────────
class Organization(models.Model):
    """Company / tenant entity."""

    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


# ──────────────────────────────────────────────
# Source
# ──────────────────────────────────────────────
class Source(models.Model):
    """Data source type (SAP, Utility, Travel)."""

    class SourceType(models.TextChoices):
        SAP = "SAP", "SAP"
        UTILITY = "Utility", "Utility"
        TRAVEL = "Travel", "Travel"

    source_type = models.CharField(
        max_length=20,
        choices=SourceType.choices,
        unique=True,
    )

    def __str__(self) -> str:
        return self.source_type


# ──────────────────────────────────────────────
# RawRecord
# ──────────────────────────────────────────────
class RawRecord(models.Model):
    """Stores the original uploaded CSV row as JSON."""

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="raw_records",
    )
    source = models.ForeignKey(
        Source,
        on_delete=models.CASCADE,
        related_name="raw_records",
    )
    raw_data = models.JSONField(
        help_text="Original CSV row stored as a JSON object.",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self) -> str:
        return f"RawRecord #{self.pk} ({self.source})"


# ──────────────────────────────────────────────
# NormalizedRecord
# ──────────────────────────────────────────────
class NormalizedRecord(models.Model):
    """Cleaned, validated emission record."""

    class Status(models.TextChoices):
        APPROVED = "Approved", "Approved"
        FAILED = "Failed", "Failed"
        SUSPICIOUS = "Suspicious", "Suspicious"
        PENDING = "Pending", "Pending"

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="normalized_records",
    )
    source = models.ForeignKey(
        Source,
        on_delete=models.CASCADE,
        related_name="normalized_records",
    )
    raw_record = models.OneToOneField(
        RawRecord,
        on_delete=models.CASCADE,
        related_name="normalized",
        null=True,
        blank=True,
    )
    category = models.CharField(max_length=255)
    quantity = models.FloatField()
    unit = models.CharField(max_length=50)
    scope = models.CharField(max_length=20)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.category} — {self.quantity} {self.unit} ({self.status})"


# ──────────────────────────────────────────────
# AuditLog
# ──────────────────────────────────────────────
class AuditLog(models.Model):
    """Tracks all modifications to normalized records."""

    record = models.ForeignKey(
        NormalizedRecord,
        on_delete=models.CASCADE,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=100)
    old_value = models.JSONField(null=True, blank=True)
    new_value = models.JSONField(null=True, blank=True)
    modified_by = models.CharField(
        max_length=255,
        default="system",
        help_text="Username or 'system' for automated changes.",
    )
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self) -> str:
        return f"Audit: {self.action} on Record #{self.record_id}"
