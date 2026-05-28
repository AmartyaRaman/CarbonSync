"""
Ingestion service — orchestrator.

End-to-end pipeline: CSV upload → parse → normalize → validate → persist.
"""

from __future__ import annotations

import io
from typing import Any

import pandas as pd

from emissions.models import (
    AuditLog,
    NormalizedRecord,
    Organization,
    RawRecord,
    Source,
)
from emissions.normalization import (
    normalize_sap,
    normalize_travel,
    normalize_utility,
)
from emissions.services.suspicious_service import check_suspicious
from emissions.services.validation_service import validate_record

# Parser dispatch
NORMALIZERS = {
    "SAP": normalize_sap,
    "Utility": normalize_utility,
    "Travel": normalize_travel,
}


def ingest_csv(
    file_content: bytes | str,
    source_type: str,
    organization_name: str = "Default Organization",
) -> dict[str, Any]:
    """
    Ingest a CSV file through the full pipeline.

    Args:
        file_content: Raw CSV bytes or string.
        source_type: One of 'SAP', 'Utility', 'Travel'.
        organization_name: Name of the tenant organization.

    Returns:
        Summary dict with counts of created records by status.
    """

    organization, _ = Organization.objects.get_or_create(name=organization_name)
    source, _ = Source.objects.get_or_create(source_type=source_type)

    # Parse csv file into DataFrame
    if isinstance(file_content, bytes):
        file_content = file_content.decode("utf-8")
    df = pd.read_csv(io.StringIO(file_content))

    # Normalize
    normalizer = NORMALIZERS.get(source_type)
    normalizer = NORMALIZERS.get(source_type)
    if normalizer is None:
        raise ValueError(f"Unknown source type: {source_type}")

    normalized_rows = normalizer(df)

    # Validate, detect suspicious, and persist
    summary: dict[str, int] = {
        "total": 0,
        "approved": 0,
        "failed": 0,
        "suspicious": 0,
    }

    for row in normalized_rows:
        summary["total"] += 1

        # Persist raw record
        raw_record = RawRecord.objects.create(
            organization=organization,
            source=source,
            raw_data=row["raw_data"],
        )

        # Determine status
        status = validate_record(source_type, row)

        # Additional suspicious heuristics (may upgrade to Suspicious)
        warnings = check_suspicious(source_type, row)
        if warnings and status == "Approved":
            status = "Suspicious"

        # Persist normalized record
        normalized_record = NormalizedRecord.objects.create(
            organization=organization,
            source=source,
            raw_record=raw_record,
            category=row["category"],
            quantity=row["quantity"],
            unit=row["unit"],
            scope=row["scope"],
            status=status,
        )

        # Create audit log entry
        AuditLog.objects.create(
            record=normalized_record,
            action="created",
            new_value={
                "category": row["category"],
                "quantity": row["quantity"],
                "unit": row["unit"],
                "scope": row["scope"],
                "status": status,
                "warnings": warnings,
            },
        )

        # Update summary
        status_key = status.lower()
        if status_key in summary:
            summary[status_key] += 1

    return summary
