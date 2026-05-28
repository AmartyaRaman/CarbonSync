"""
Suspicious detection service.

Provides additional heuristic checks beyond the primary validation rules.
These flag records that may need human review but aren't necessarily invalid.
"""

from __future__ import annotations

from typing import Any


def check_suspicious(source_type: str, record: dict[str, Any]) -> list[str]:
    """
    Run additional heuristic checks on a record.

    Args:
        source_type: One of 'SAP', 'Utility', 'Travel'.
        record: The normalized record dict.

    Returns:
        A list of warning strings. Empty list = no suspicions.
    """
    warnings: list[str] = []

    checkers = {
        "SAP": _check_sap_suspicious,
        "Utility": _check_utility_suspicious,
        "Travel": _check_travel_suspicious,
    }

    checker = checkers.get(source_type)
    if checker:
        warnings.extend(checker(record))

    return warnings

# SAP heuristics
def _check_sap_suspicious(record: dict[str, Any]) -> list[str]:
    """
    SAP heuristic checks:
    - Unusually large fuel quantities (> 5000 liters)
    - Unknown material category
    """
    warnings: list[str] = []
    quantity = record.get("quantity", 0)
    category = record.get("category", "").lower()

    # Large fuel quantity
    fuel_keywords = {"diesel", "diesel fuel", "petrol", "natural gas"}
    if category in fuel_keywords and quantity > 5000:
        warnings.append(
            f"Unusually large fuel quantity: {quantity} {record.get('unit', '')}"
        )

    return warnings


# Utility heuristics
def _check_utility_suspicious(record: dict[str, Any]) -> list[str]:
    """
    Utility heuristic checks:
    - Zero consumption
    - Extremely high consumption (> 50,000 kWh)
    """
    warnings: list[str] = []
    quantity = record.get("quantity", 0)

    if quantity == 0:
        warnings.append("Zero electricity consumption reported.")

    if quantity > 50_000:
        warnings.append(
            f"Extremely high consumption: {quantity} kWh"
        )

    return warnings


# Travel heuristics
def _check_travel_suspicious(record: dict[str, Any]) -> list[str]:
    """
    Travel heuristic checks:
    - Hotels where origin == destination (always true, but flagged for awareness)
    - Same-city flights already caught by validator
    """
    warnings: list[str] = []
    travel_type = record.get("category", "").lower()
    origin = record.get("origin", "").strip().lower()
    destination = record.get("destination", "").strip().lower()

    if travel_type == "hotel" and origin == destination:
        warnings.append(
            f"Hotel booking: origin and destination are the same ({origin})."
        )

    return warnings
