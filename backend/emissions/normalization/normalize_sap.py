"""
Normalization — SAP fuel/procurement data parser.

Reads SAP CSV rows and produces normalized records with canonical
units, parsed dates, and correct scope assignments.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

import pandas as pd

from emissions.utils.scope_mapper import get_scope
from emissions.utils.unit_mapper import normalize_unit


# Date formats found in sample SAP data
_DATE_FORMATS = [
    "%Y-%m-%d",   # 2026-05-26
    "%d/%m/%Y",   # 26/05/2026
    "%Y/%m/%d",   # 2026/05/24
    "%d-%m-%Y",   # 24-05-2026
]


def _parse_date(raw: str) -> str:
    """Try multiple date formats and return ISO-format string."""
    for fmt in _DATE_FORMATS:
        try:
            return datetime.strptime(raw.strip(), fmt).date().isoformat()
        except ValueError:
            continue
    return raw.strip()


def normalize_sap(df: pd.DataFrame) -> list[dict[str, Any]]:
    """
    Normalize a SAP DataFrame into a list of record dicts.

    Expected columns: material_name, quantity, unit, posting_date
    Optional columns: record_id, material_id, plant_code, vendor, cost_center

    Returns a list of dicts with keys:
        category, quantity, unit, scope, posting_date, raw_data
    """
    records: list[dict[str, Any]] = []

    for _, row in df.iterrows():
        raw_data = row.to_dict()

        material = str(row.get("material_name", "")).strip()
        try:
            quantity = float(row.get("quantity", 0))
        except (ValueError, TypeError):
            quantity = 0.0

        unit = normalize_unit(str(row.get("unit", "")))
        posting_date = _parse_date(str(row.get("posting_date", "")))
        scope = get_scope(material)

        records.append(
            {
                "category": material,
                "quantity": quantity,
                "unit": unit,
                "scope": scope,
                "posting_date": posting_date,
                "raw_data": raw_data,
            }
        )

    return records
