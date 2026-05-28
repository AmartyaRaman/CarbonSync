# BreatheESG (CarbonSync) — Enterprise Carbon Accounting Platform

BreatheESG is a multi-tenant corporate carbon accounting and ESG compliance platform. It automates the parsing, normalization, scope mapping, and auditing of enterprise sustainability reports across SAP procurement files, electricity utilities, and travel booking records.

---

## 📂 Project Structure

This project is organized as a monorepo containing:
* **`backend/`**: Django REST Framework API using the fast `uv` package manager and SQLite database.
* **`frontend/`**: React, Vite, and TypeScript SPA styled with vanilla CSS.
* **`vercel.json`**: Root configuration mapping both services under Vercel's multi-service architecture.

---

## 🛠️ Prerequisites

Ensure you have the following installed locally:
* **Python** (version 3.13 or higher)
* **Node.js** (LTS version)
* **uv** (Astral's fast Python package manager)
  * Install with: `pip install uv` or `curl -LsSf https://astral.sh/uv/install.sh | sh`

---

## ⚡ Local Environment Setup

### 1. Backend Setup (Django)

Open a terminal and navigate to the `backend/` directory:
```bash
cd backend
```

#### Install dependencies and sync virtual environment:
```bash
uv sync
```

#### Run Database Migrations:
```bash
uv run python manage.py migrate
```

#### Seed the Database:
The project comes with a pre-seeded SQLite database (`db.sqlite3`). If you ever need to reset or run migrations, you can create a superuser:
```bash
uv run python manage.py createsuperuser
```

#### Start the Backend Server:
```bash
uv run python manage.py runserver
```
The Django REST API will be running locally at: `http://127.0.0.1:8000/`

---

### 2. Frontend Setup (React/Vite)

Open a separate terminal and navigate to the `frontend/` directory:
```bash
cd frontend
```

#### Install Node Dependencies:
```bash
npm install
```

#### Configure Environment Variables:
Create a `.env` file in the `frontend/` directory (if it does not already exist) and define the API base URL:
```env
VITE_API_BASE_URL=http://localhost:8000/api/
```

#### Start the Frontend Development Server:
```bash
npm run dev
```
The client application will be running locally at: `http://localhost:5173/`

---

## 🔑 Available Test Accounts

For testing, you can sign in to the local or deployed application using the following pre-seeded user accounts:

| Username | Password | Role / Permissions |
| :--- | :--- | :--- |
| **`admin`** | `admin123` | Full access (review, upload, flag, and approve records). |
| **`analyst`** | `analyst123` | Ingest and view records. |
| **`viewer`** | `viewer123` | Read-only access to dashboard statistics and review logs. |

---

## 🌐 Production Deployment on Vercel

This repository is configured for multi-service deployment using Vercel's `experimentalServices` framework.

1. Import the repository in **Vercel**.
2. Go to **Settings > General** and set the **Framework Preset** to **"Services"**.
3. Vercel will automatically detect `vercel.json` at the root and build the Vite frontend (mounted at `/`) and the Django backend (mounted at `/_/backend`).
4. In production, SQLite writes are automatically redirected to `/tmp/db.sqlite3` and seeded from the build directory to ensure serverless compatibility.
