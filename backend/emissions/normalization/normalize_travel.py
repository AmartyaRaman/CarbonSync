"""
Normalization — Corporate travel data parser.

Reads travel CSV rows and produces normalized records.
Resolves IATA airport codes to city names and assigns Scope 3 sub-categories.
"""

from __future__ import annotations

from typing import Any

import pandas as pd

from emissions.utils.airport_mapper import get_city_name
from emissions.utils.scope_mapper import get_scope


def normalize_travel(df: pd.DataFrame) -> list[dict[str, Any]]:
    """
    Normalize a travel DataFrame into a list of record dicts.

    Expected columns: trip_id, employee_id, travel_type, origin,
                      destination, trip_date

    Returns a list of dicts with keys:
        category, quantity, unit, scope, origin, destination, trip_date, raw_data
    """
    records: list[dict[str, Any]] = []

    for _, row in df.iterrows():
        raw_data = row.to_dict()

        travel_type = str(row.get("travel_type", "")).strip()
        origin = get_city_name(str(row.get("origin", "")).strip())
        destination = get_city_name(str(row.get("destination", "")).strip())
        trip_date = str(row.get("trip_date", "")).strip()

        # Travel records track trips (quantity = 1 trip)
        records.append(
            {
                "category": travel_type,
                "quantity": 1,
                "unit": "trip",
                "scope": get_scope(travel_type),
                "origin": origin,
                "destination": destination,
                "trip_date": trip_date,
                "raw_data": raw_data,
            }
        )

    return records
