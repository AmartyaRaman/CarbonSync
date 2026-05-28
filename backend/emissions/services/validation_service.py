"""
Validation service.

Applies source-specific validation rules to determine record status:
- Approved: passes all checks
- Failed: critical data quality issue
- Suspicious: anomalous but not necessarily wrong
"""

from __future__ import annotations

from typing import Any


def validate_record(source_type: str, record: dict[str, Any]) -> str:
    """
    Validate a single normalized record and return a status string.

    Args:
        source_type: One of 'SAP', 'Utility', 'Travel'.
        record: The normalized record dict.

    Returns:
        One of 'Approved', 'Failed', 'Suspicious'.
    """
    validators = {
        "SAP": _validate_sap,
        "Utility": _validate_utility,
        "Travel": _validate_travel,
    }

    validator = validators.get(source_type)
    if validator is None:
        return "Approved"

    return validator(record)


# ──────────────────────────────────────────────
# SAP validation
# ──────────────────────────────────────────────
def _validate_sap(record: dict[str, Any]) -> str:
    """
    SAP rule: quantity <= 0 → Failed.
    """
    quantity = record.get("quantity", 0)
    if quantity <= 0:
        return "Failed"
    return "Approved"


# ──────────────────────────────────────────────
# Utility validation
# ──────────────────────────────────────────────
def _validate_utility(record: dict[str, Any]) -> str:
    """
    Utility rule: consumption > 10,000 kWh → Suspicious.
    """
    quantity = record.get("quantity", 0)
    if quantity > 10_000:
        return "Suspicious"
    return "Approved"


# ──────────────────────────────────────────────
# Travel validation
# ──────────────────────────────────────────────
def _validate_travel(record: dict[str, Any]) -> str:
    """
    Travel rule: origin == destination → Suspicious.
    """
    origin = record.get("origin", "").strip().lower()
    destination = record.get("destination", "").strip().lower()

    if origin and destination and origin == destination:
        return "Suspicious"
    return "Approved"
