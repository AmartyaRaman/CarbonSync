"""
Utility mappers — unit normalization.

Maps various unit string representations to canonical forms.
"""

# ──────────────────────────────────────────────
# Canonical unit lookup
# ──────────────────────────────────────────────
UNIT_MAP: dict[str, str] = {
    # Volume — liters
    "l": "liter",
    "ltr": "liter",
    "liters": "liter",
    "liter": "liter",
    "litres": "liter",
    "litre": "liter",
    # Volume — cubic metres
    "m3": "m3",
    "m³": "m3",
    "cubic meter": "m3",
    "cubic meters": "m3",
    "cubic metre": "m3",
    # Mass — kilograms
    "kg": "kg",
    "kgs": "kg",
    "kilogram": "kg",
    "kilograms": "kg",
    # Mass — tonnes
    "ton": "tonne",
    "tons": "tonne",
    "tonne": "tonne",
    "tonnes": "tonne",
    "t": "tonne",
    # Energy — kilowatt-hours
    "kwh": "kWh",
    "kw/h": "kWh",
    "kilowatt-hour": "kWh",
    # Energy — megawatt-hours
    "mwh": "MWh",
    "megawatt-hour": "MWh",
}


def normalize_unit(raw_unit: str) -> str:
    """
    Convert a raw unit string to its canonical form.

    Returns the original string (lowered, stripped) if no mapping is found.
    """
    key = raw_unit.strip().lower()
    return UNIT_MAP.get(key, key)


def convert_to_kwh(value: float, unit: str) -> float:
    """
    Convert an energy value to kWh.

    Supports kWh (identity) and MWh (×1000).
    """
    canonical = normalize_unit(unit)
    if canonical == "MWh":
        return value * 1000.0
    return value
