# Project Trade-offs (TRADEOFFS.md)

This document lists three features we deliberately did not build, along with a simple explanation of why.

---

## 1. Frontend Data Visualizations (Charts & Graphs)

* **What we omitted**: We did not build interactive charts (like Recharts or D3 graphs) to visualize emission trends.
* **Why**: We prioritized the core data table, status filters, and the audit log timeline. Implementing complex visualization libraries would take focus away from database integrity. Simple summary statistics on the dashboard are sufficient for this version.

---

## 2. Separate Databases per Tenant

* **What we omitted**: We did not create separate databases or PostgreSQL schemas for each organization.
* **Why**: Managing multiple database instances dynamically is expensive, slows down server response times, and makes updates complex. Using an `organization_id` column to separate tenant data in a single database is secure, cheap, and scales easily.

---

## 3. CSV Export for Normalized Data

* **What we omitted**: We did not build a "Download as CSV" export button for the filtered review table.
* **Why**: We focused on the validation pipeline, letting users upload files, flag suspicious items, and track audit trails. While exporting data is useful, users can view all necessary details directly in the dashboard UI for now.
