# Breathe ESG – Project Architecture

## Overview

This project is a prototype ESG data platform that ingests enterprise sustainability data from multiple sources, normalizes it into a common structure, and allows analysts to review and approve records before audit lock.

The system handles:

- SAP fuel/procurement data
- Utility electricity data
- Corporate travel data

Flow:

```text
Data Sources
     ↓
CSV Upload/API
     ↓
Ingestion Layer
     ↓
Normalization Layer
     ↓
Validation Engine
     ↓
SQLite
     ↓
Review Dashboard
     ↓
Audit Approval
```

---

# System Architecture

```text
                    React Frontend
                           │
                           │ Axios
                           ↓
                  Django REST API
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ↓                ↓                ↓
    Upload APIs      Review APIs      Audit APIs
          │
          ↓
    Ingestion Service
          │
          ↓
       Pandas Engine
          │
 ┌────────┼─────────┐
 │        │         │
 ↓        ↓         ↓
SAP   Utility   Travel
Parser Parser    Parser
 │        │         │
 └────────┴─────────┘
          │
          ↓
Normalization Engine
          │
          ↓
Validation Engine
          │
          ↓
Suspicious Detection
          │
          ↓
         SQLite
```

---

# Data Flow

```text
CSV Upload
     ↓
Store raw record
     ↓
Normalize fields
     ↓
Convert units
     ↓
Normalize dates
     ↓
Assign scope
     ↓
Run validation rules
     ↓
Mark:
    Approved
    Failed
    Suspicious
     ↓
Store normalized record
     ↓
Display on dashboard
```

---

# Technology Stack

Frontend:

- React
- Axios
- Tailwind CSS

Backend:

- Django
- Django REST Framework
- Pandas

Database:

- SQLite (development) / PostgreSQL (production)

Deployment:

Frontend:
- Vercel

Backend + Database:
- Railway

---

# Backend Folder Structure

```text
backend/
│
├── manage.py
│
├── core/
│   │
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
├── emissions/
│   │
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── urls.py
│   ├── admin.py
│   ├── permissions.py
│   │
│   ├── services/
│   │     │
│   │     ├── ingestion_service.py
│   │     ├── validation_service.py
│   │     └── suspicious_service.py
│   │
│   ├── normalization/
│   │     │
│   │     ├── normalize_sap.py
│   │     ├── normalize_utility.py
│   │     └── normalize_travel.py
│   │
│   ├── utils/
│   │     │
│   │     ├── unit_mapper.py
│   │     ├── airport_mapper.py
│   │     └── scope_mapper.py
│   │
│   └── migrations/
│
├── media/
│      uploaded_csvs/
│
└── pyproject.toml
```

---

# Frontend Folder Structure

```text
frontend/
│
├── src/
│   │
│   ├── pages/
│   │     │
│   │     ├── Dashboard.jsx
│   │     ├── Upload.jsx
│   │     └── Review.jsx
│   │
│   ├── components/
│   │     │
│   │     ├── UploadCard.jsx
│   │     ├── ReviewTable.jsx
│   │     ├── AuditTimeline.jsx
│   │     └── StatCard.jsx
│   │
│   ├── hooks/
│   │      useRecords.js
│   │
│   ├── services/
│   │      api.js
│   │
│   └── context/
│          OrganizationContext.jsx
│
└── package.json
```

---

# Database Design

## Organization

Stores company information.

Fields:

```python
id
name
created_at
```

---

## Source

Stores source type.

Examples:

- SAP
- Utility
- Travel

Fields:

```python
id
source_type
```

---

## RawRecord

Stores original uploaded rows.

Fields:

```python
id
organization
source
raw_data
uploaded_at
```

Example:

```json
{
  "material":"Diesel Fuel",
  "quantity":"1000",
  "unit":"LTR"
}
```

---

## NormalizedRecord

Stores cleaned records.

Fields:

```python
id
organization
source
category
quantity
unit
scope
status
created_at
```

Example:

```json
{
   "category":"Diesel Fuel",
   "quantity":1000,
   "unit":"liter",
   "scope":"Scope 1",
   "status":"Approved"
}
```

---

## AuditLog

Tracks all modifications.

Fields:

```python
id
record
action
old_value
new_value
modified_by
timestamp
```

---

# Entity Relationship

```text
Organization
      │
      │
      ├──── RawRecord
      │
      └──── NormalizedRecord
                     │
                     │
                     └──── AuditLog
```

---

# Scope Mapping

Scope 1

Direct emissions:

- Diesel
- Petrol
- Natural Gas

Scope 2

Purchased electricity:

- Electricity

Scope 3

Indirect emissions:

- Flights
- Hotels
- Ground Transport
- Procurement

---

# Validation Rules

SAP:

```python
quantity <=0
```

Status:

```text
Failed
```

Utility:

```python
consumption>10000
```

Status:

```text
Suspicious
```

Travel:

```python
origin==destination
```

Status:

```text
Suspicious
```

---

# API Routes

Upload APIs:

```text
POST /api/upload/sap
POST /api/upload/utility
POST /api/upload/travel
```

Dashboard APIs:

```text
GET /api/records
GET /api/records/suspicious
GET /api/records/approved
```

Audit APIs:

```text
PATCH /api/records/:id/approve
GET /api/audit/:id
```

---

# Multi-Tenancy Strategy

Approach used:

Shared Database + Shared Schema

Reason:

- Simpler for prototype
- Lower operational complexity
- Easy tenant isolation

Data isolation:

```python
records=NormalizedRecord.objects.filter(
    organization=user.organization
)
```

---

# Future Improvements

1. Direct SAP OData integration
2. Utility PDF parsing
3. Background processing with Celery
4. Emission factor calculations
5. ML-based anomaly detection