"""
Emissions app — Django admin registration.
"""

from django.contrib import admin

from .models import AuditLog, NormalizedRecord, Organization, RawRecord, Source


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "created_at"]
    search_fields = ["name"]


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ["id", "source_type"]


@admin.register(RawRecord)
class RawRecordAdmin(admin.ModelAdmin):
    list_display = ["id", "organization", "source", "uploaded_at"]
    list_filter = ["source", "organization"]
    readonly_fields = ["raw_data"]


@admin.register(NormalizedRecord)
class NormalizedRecordAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "organization",
        "source",
        "category",
        "quantity",
        "unit",
        "scope",
        "status",
        "created_at",
    ]
    list_filter = ["status", "scope", "source", "organization"]
    search_fields = ["category"]


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["id", "record", "action", "modified_by", "timestamp"]
    list_filter = ["action", "modified_by"]
    readonly_fields = ["old_value", "new_value"]
