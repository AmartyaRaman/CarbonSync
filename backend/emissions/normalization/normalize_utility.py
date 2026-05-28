"""
Normalization — Utility electricity data parser.

Reads utility CSV rows and produces normalized records.
Converts all energy values to kWh and assigns Scope 2.
"""

from __future__ import annotations

from typing import Any

import pandas as pd

from emissions.utils.unit_mapper import convert_to_kwh, normalize_unit


def normalize_utility(df: pd.DataFrame) -> list[dict[str, Any]]:
    """
    Normalize a utility DataFrame into a list of record dicts.

    Expected columns: meter_id, facility, billing_start, billing_end,
                      consumption, unit, tariff_type

    Returns a list of dicts with keys:
        category, quantity, unit, scope, facility, billing_period, raw_data
    """
    records: list[dict[str, Any]] = []

    for _, row in df.iterrows():
        raw_data = row.to_dict()

        try:
            consumption = float(row.get("consumption", 0))
        except (ValueError, TypeError):
            consumption = 0.0

        raw_unit = str(row.get("unit", "kWh"))
        quantity_kwh = convert_to_kwh(consumption, raw_unit)

        facility = str(row.get("facility", "")).strip()
        billing_start = str(row.get("billing_start", "")).strip()
        billing_end = str(row.get("billing_end", "")).strip()

        records.append(
            {
                "category": "Electricity",
                "quantity": quantity_kwh,
                "unit": "kWh",
                "scope": "Scope 2",
                "facility": facility,
                "billing_period": f"{billing_start} to {billing_end}",
                "raw_data": raw_data,
            }
        )

    return records
