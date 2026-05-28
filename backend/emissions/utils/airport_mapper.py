"""
Utility mappers — IATA airport code to city name.

Used by the travel normalizer to resolve airport codes.
"""

# ──────────────────────────────────────────────
# IATA code → City name
# ──────────────────────────────────────────────
AIRPORT_MAP: dict[str, str] = {
    "DEL": "Delhi",
    "BLR": "Bengaluru",
    "BOM": "Mumbai",
    "CCU": "Kolkata",
    "MAA": "Chennai",
    "HYD": "Hyderabad",
    "DXB": "Dubai",
    "PNQ": "Pune",
    "JAI": "Jaipur",
    "AMD": "Ahmedabad",
    "LKO": "Lucknow",
    "PAT": "Patna",
    "GOI": "Goa",
    "COK": "Kochi",
    "TRV": "Thiruvananthapuram",
    "GAU": "Guwahati",
    "IXC": "Chandigarh",
    "SXR": "Srinagar",
    "ATQ": "Amritsar",
    "IXB": "Bagdogra",
}


def get_city_name(code_or_city: str) -> str:
    """
    Resolve an IATA code to a city name.

    If the input is already a city name (not in the map as a code),
    return it as-is with title casing.
    """
    key = code_or_city.strip().upper()
    if key in AIRPORT_MAP:
        return AIRPORT_MAP[key]
    # Already a city name — title-case it for consistency
    return code_or_city.strip().title()
