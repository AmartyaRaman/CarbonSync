"""
Utility mappers — category to GHG Protocol scope.

Maps emission categories to Scope 1, 2, or 3 per GHG Protocol.
"""

# ──────────────────────────────────────────────
# Scope classification
# ──────────────────────────────────────────────

# Scope 1 — Direct emissions from owned/controlled sources
SCOPE_1_CATEGORIES: set[str] = {
    "diesel",
    "diesel fuel",
    "petrol",
    "natural gas",
    "coal",
    "lubricant oil",
}

# Scope 2 — Indirect emissions from purchased energy
SCOPE_2_CATEGORIES: set[str] = {
    "electricity",
}

# Scope 3 — All other indirect emissions
SCOPE_3_CATEGORIES: set[str] = {
    "flight",
    "flights",
    "hotel",
    "hotels",
    "ground transport",
    "groundtransport",
    "procurement",
}

# Materials that are not fuel go into Scope 3 Procurement
PROCUREMENT_MATERIALS: set[str] = {
    "cement",
    "steel rods",
    "steel sheets",
    "copper wire",
}


def get_scope(category: str) -> str:
    """
    Determine the GHG Protocol scope for a given category.

    Returns one of: 'Scope 1', 'Scope 2', 'Scope 3'.
    Falls back to 'Scope 3' for unknown categories (conservative default).
    """
    key = category.strip().lower()

    if key in SCOPE_1_CATEGORIES:
        return "Scope 1"

    if key in SCOPE_2_CATEGORIES:
        return "Scope 2"

    if key in SCOPE_3_CATEGORIES or key in PROCUREMENT_MATERIALS:
        return "Scope 3"

    # Conservative default: unknown = Scope 3
    return "Scope 3"
