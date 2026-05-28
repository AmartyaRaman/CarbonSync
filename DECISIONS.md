# Design Decisions & Ambiguity Resolutions (DECISIONS.md)

This document chronicles the major engineering decisions, structural trade-offs, and logical interpretations adopted during the development of the **BreatheESG (CarbonSync)** platform.

---

## 1. Ambiguities Resolved & Selected Approaches

### 1.1 Inconsistent Raw Date Formats
* **The Ambiguity**: Real-world corporate spreadsheets are notorious for date format inconsistencies (e.g., some columns use ISO `2026-05-28`, while others use British slash notation `28/05/2026` or hyphens `28-05-2026`).
* **Our Resolution**: We built a resilient date-parsing loop (`_DATE_FORMATS` in `normalize_sap.py`) that sequentially attempts to parse dates using multiple standard formats:
  * `%Y-%m-%d` (ISO)
  * `%d/%m/%Y` (British/Indian slash)
  * `%Y/%m/%d` (Alternative slash)
  * `%d-%m-%Y` (Hyphenated)
  * If all parsing fails, it safely falls back to storing the raw string, ensuring the ingestion pipeline never crashes due to a string formatting error.

### 1.2 Quantitative Units for Corporate Travel
* **The Ambiguity**: Standard travel booking exports often lack numerical "quantities" of fuel or energy. Instead, they list discrete travel events (e.g., "Flight from BOM to LHR").
* **Our Resolution**: We resolved that corporate travel records track discrete **events** rather than physical volumes. Therefore, travel normalizations are assigned:
  * **Quantity**: `1` (canonical representation of a single journey).
  * **Unit**: `trip`.
  * **Location Mapping**: We built `airport_mapper.py` to automatically translate raw IATA codes (e.g., `JFK`, `LHR`, `BOM`) into canonical human-readable city names (e.g., `New York`, `London`, `Mumbai`) to provide compliance officers with instant geographical context during data reviews.

### 1.3 Unrecognized Materials in SAP Procurement
* **The Ambiguity**: SAP material databases frequently output hundreds of ad-hoc items that do not fit into predefined fossil fuel categories (Scope 1) or electricity categories (Scope 2).
* **Our Resolution**: To maintain strict environmental reporting integrity without interrupting the user's workflow, we designed a conservative fallback mechanism in `scope_mapper.py`:
  * All explicitly recognized fossil fuels are routed to **Scope 1**.
  * Purchased electricity is routed to **Scope 2**.
  * Any unrecognized material name automatically defaults to **Scope 3 (Procurement)**. This ensures all incoming corporate activity is accounted for rather than discarded, following a conservative, audit-friendly default.

---

## 2. Ingestion Coverage (What We Handled vs. Ignored)

| Data Source | Subset Handled & Normalized | Ignored / Discarded Fields |
| :--- | :--- | :--- |
| **SAP Procurement** | Material names, quantities, units, and posting dates. | Metadata fields such as `plant_code`, `vendor`, `material_id`, and `cost_center` (retained in `raw_data` JSON for lineage, but excluded from primary normalized queries to optimize index performance). |
| **Utility Electricity** | Meter IDs, facility names, billing periods (billing start & end), and total energy consumption (normalized to kWh). | Tariff details, billing charges, currency symbols, and demand charges (which relate to billing finances rather than direct carbon emissions). |
| **Corporate Travel** | Trip IDs, employee IDs, travel types, travel dates, and origin/destination locations (fully converted from IATA codes). | Seat classes (Economy vs. Business), ticket price, flight duration, and airline name. |

---

## 3. Outstanding Questions for the Product Manager (PM)

If we were collaborating in a real-world enterprise environment, we would prioritize seeking alignment on the following product decisions:

1. **Travel Distance Calculations vs. Trip Event Logging**:
   * *The Issue*: Currently, corporate travel is tracked as a discrete `trip` event. For accurate Scope 3 Carbon Calculations, should we integrate a Great-Circle distance formula (using latitude/longitude coordinates of IATA codes) to calculate exact passenger-kilometers, or is event-level logging sufficient for the current reporting phase?
2. **Postgres Schemas vs. Row-Level Isolation for Multi-Tenancy**:
   * *The Issue*: Currently, data is isolated logically via `organization_id` on shared tables. For high-security enterprise clients, does the product roadmap require physical database schema isolation (separate PostgreSQL schemas per organization) to satisfy strict security compliance audits?
3. **Seeding and Ingestion Fallback Customizations**:
   * *The Issue*: When an unrecognized material is ingested, it defaults to **Scope 3 (Procurement)**. Should we build a frontend UI workflow allowing ESG Analysts to reclassify "Unmapped" materials to other custom Scopes, or should all mappings be hardcoded in the platform configuration?
