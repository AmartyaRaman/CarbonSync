# Environmental Data Sources & Research (SOURCES.md)

This document presents our research, analysis, and implementation details for the three core enterprise data streams (SAP ERP, Utility Smart-Meters, and Travel Booking Agencies) ingested by the **BreatheESG (CarbonSync)** platform.

---

## 1. SAP ERP Procurement (Scope 1 & Scope 3)

### Real-World Format Researched
* **Source Module**: SAP Materials Management (MM) / Financial Accounting (FI) module exports.
* **Characteristics**: SAP material logs track inventory movements, procurement purchases, and fuel allocations across facilities. The output columns typically consist of transaction ledger IDs, material descriptors, transaction posting dates, quantities, and units.

### What We Learned & Implemented
* **Unit Variance**: Raw data uses highly fragmented unit abbreviations depending on the supplier catalog (e.g., `ltr`, `l`, `kg`, `tons`). Standardizing these into a canonical lookup table (`unit_mapper.py`) is mandatory.
* **Naming Variations**: Material names are often extremely messy (e.g., `"DIESEL FUEL - GENSET B"` vs. `"NATURAL GAS PIPELINE"`). Whitelist searching (lowercased and stripped) is the most reliable way to match records deterministically.

### Sample Data Structure
```csv
material_name,quantity,unit,posting_date,plant_code
Diesel Fuel,5000,ltr,2026-05-26,PL-101
Natural Gas,1200,m3,26/05/2026,PL-102
Steel Rods,15,tonnes,2026/05/24,PL-101
```
* **Normalisation Design**:
  * Row 1 becomes: `category: "Diesel Fuel"`, `quantity: 5000.0`, `unit: "liter"`, `scope: "Scope 1"`.
  * Row 3 becomes: `category: "Steel Rods"`, `quantity: 15.0`, `unit: "tonne"`, `scope: "Scope 3"`.

### Real-World Deployment Failure Modes (What Would Break)
* **Reversals/Credit Memos**: Negative quantities representing item returns or material transfer adjustments. Standard pipelines treat these as positive consumption unless signed float accounting is integrated.
* **Ad-Hoc Line Items**: Custom free-text material names entered by purchase agents (e.g., `"MISC ENERGY FUEL FOR SITE B"`), which bypass whitelists and fall back onto generic Procurement categorizations.

---

## 2. Utility Electricity (Scope 2)

### Real-World Format Researched
* **Source Module**: Utility smart-meter billing exports (e.g., PG&E, ConEd, or smart-meter green-button XML/CSV exports).
* **Characteristics**: Billing reports track historical electricity and gas consumption mapped to physical building meters. The data includes meter serial numbers, billing cycle start/end dates, total active energy consumed, and tariff descriptors.

### What We Learned & Implemented
* **Calendar Misalignment**: Utility bills rarely align cleanly with calendar months (e.g., a billing cycle might run from January 14 to February 12).
* **Power Scaling**: Consumption can be reported in standard Kilowatt-hours (`kWh`) or large-scale Megawatt-hours (`MWh`). The platform must scale large-scale metrics cleanly (`×1000`) on ingestion to ensure aggregate calculations are accurate.

### Sample Data Structure
```csv
meter_id,facility,billing_start,billing_end,consumption,unit,tariff_type
MET-8890,Main Office,2026-04-01,2026-04-30,12.5,MWh,Commercial-Peak
MET-9912,Factory A,2026-04-12,2026-05-11,8400,kWh,Industrial-Flat
```
* **Normalisation Design**:
  * Row 1 consumption is scaled: `12.5 MWh` × `1,000` = `12,500.0 kWh`, matching canonical `unit: "kWh"`.
  * Billing periods are structured as readable ranges for simple time-series distribution: `"2026-04-01 to 2026-04-30"`.

### Real-World Deployment Failure Modes (What Would Break)
* **Meter Swaps**: A physical electricity meter is replaced mid-billing cycle, creating two overlapping consumption periods for a single building that can lead to double-counting.
* **Estimated Bills**: Utility companies occasionally output "Estimated Billing" records, which are later retroactively corrected by an "Actual Billing" correction row, requiring state reconciliation.

---

## 3. Corporate Travel (Scope 3)

### Real-World Format Researched
* **Source Module**: Travel booking agency exports (e.g., SAP Concur, American Express Global Business Travel, or corporate flight booking platforms).
* **Characteristics**: Travel ledgers track flight and train itineraries, hotel stays, and ground transportation. Rows contain employee IDs, transaction dates, travel classes, origin/destination codes, and travel classifications.

### What We Learned & Implemented
* **Event-based Accounting**: Travel data tracks discrete transactions rather than volumes. Each journey is mapped as `quantity: 1` and `unit: "trip"`.
* **Airport Location Mapping**: Travel reports record location as 3-letter IATA codes (e.g., `BOM`, `LHR`, `JFK`). Resolving IATA codes into full city names (e.g., `Mumbai`, `London`, `New York`) using a local look-up (`airport_mapper.py`) provides immediate human clarity for auditor reviews.

### Sample Data Structure
```csv
trip_id,employee_id,travel_type,origin,destination,trip_date
TR-789,EMP-401,Flight,BOM,LHR,2026-05-20
TR-790,EMP-402,Hotel,JFK,,2026-05-22
```
* **Normalisation Design**:
  * Row 1 resolves coordinates: `origin: "Mumbai"`, `destination: "London"`, `category: "Flight"`, `scope: "Scope 3"`.

### Real-World Deployment Failure Modes (What Would Break)
* **Multi-Leg Itineraries**: A multi-stop journey (e.g., Mumbai to Dubai to London) might be exported as a single round-trip ticket or separate flight legs, complicating emissions modeling.
* **Cancellations/Unused Tickets**: Booked flights that are ultimately cancelled or refunded, which remain in booking system logs but do not represent physical environmental impact.
