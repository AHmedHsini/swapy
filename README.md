# 🛒 Swapy Campus Monorepo

[![pnpm](https://img.shields.io/badge/package--manager-pnpm-orange.svg?style=flat-squr)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-blue.svg?style=flat-squr)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/language-Python-3776AB.svg?style=flat-squr)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/framework-FastAPI-009688.svg?style=flat-squr)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/framework-React--19-61DAFB.svg?style=flat-squr)](https://react.dev/)

**Swapy Campus** is a modular, high-performance circular-economy platform designed for university campuses. It enables students to buy, sell, exchange, donate, and repair items, reducing environmental footprints while building community trust.

This repository is structured as a **pnpm monorepo** consisting of a TypeScript Express API backend, a Python FastAPI AI microservice, and a Vite + React TypeScript single-page application frontend.

---

## 📂 Repository Structure

```text
swapy/
├── apps/
│   ├── backend/         # Express API + Prisma ORM + Vitest suite
│   ├── frontend/        # Vite + React + TypeScript Dashboard (Port 5173)
│   └── ai-service/      # Python FastAPI + Uvicorn Diagnostic microservice (Port 8001)
├── packages/            # Folder designated for shared configurations or helper utilities
├── docs/                # Architecture diagrams and Domain-model documentation
├── logs/                # Centralized logger outputs
├── docker-compose.yml   # Infrastructure container orchestrations (PostgreSQL)
├── package.json         # Workspace execution scripts
└── pnpm-workspace.yaml  # Monorepo packages declarations
```

---

## ⚡ Tech Stack & Modules

### 1. Backend API (`apps/backend`)
*   **Core**: Node.js, Express, TypeScript.
*   **Database & ORM**: PostgreSQL, mapped and queried via Prisma ORM.
*   **Validation**: Request schemas secured by Zod.
*   **Testing**: Unit and integration smoke tests driven by Vitest and Supertest.

### 2. Frontend SPA (`apps/frontend`)
*   **Core**: React 19, TypeScript, Vite.
*   **Design**: Modern dark-mode aesthetic with custom animations, glassmorphism, responsive grids, and live dashboard metrics.
*   **Mock Integration**: Integrated mock states to enable interactive preview of listings, diagnostics, metrics, and leaders.

### 3. AI Service (`apps/ai-service`)
*   **Core**: Python 3.10+, FastAPI, Uvicorn.
*   **Capabilities**: Rules-based device fault analyzer and cost-resale predictors.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
*   [Node.js](https://nodejs.org/) (v20 or higher)
*   [pnpm](https://pnpm.io/) (v9 or higher)
*   [Python 3.10+](https://www.python.org/) (for the AI service)
*   [Docker](https://www.docker.com/) (optional, for running PostgreSQL locally)

---

### Setup Instructions

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/swapy.git
    cd swapy
    ```

2.  **Install Workspace Dependencies**:
    ```bash
    pnpm install
    ```

3.  **Setup Environment Configs**:
    Copy the example configuration to a local `.env` file in the backend application:
    ```bash
    cp .env.example apps/backend/.env
    ```

4.  **Spin up the PostgreSQL Database**:
    Use Docker Compose to launch the database container:
    ```bash
    docker compose up -d postgres
    ```

5.  **Initialize Database & Prisma Client**:
    Generate the typesafe client and run schema migrations:
    ```bash
    pnpm prisma:generate
    pnpm prisma:migrate
    ```

6.  **Setup AI Python Service Dependencies**:
    Create a virtual environment and install dependencies inside the `apps/ai-service` directory:
    ```bash
    cd apps/ai-service
    python -m venv venv
    # On Windows:
    venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    
    pip install -r requirements.txt
    cd ../..
    ```

---

## 💻 Running the Services

### 1. Launch All Services Simultaneously (Recommended)
You can start the frontend development server and backend API concurrently using:
```bash
pnpm dev
```
*   **Frontend Dashboard**: runs at `http://localhost:5173`
*   **Backend Express API**: runs at `http://localhost:4000`

### 2. Start the AI Python Service
Activate the Python virtual environment and spin up the FastAPI service on port `8001`:
```bash
cd apps/ai-service
# (Activate virtual env)
uvicorn main:app --port 8001 --reload
```
*   **FastAPI endpoints**: runs at `http://127.0.0.1:8001`
*   **Swagger API Docs**: view at `http://127.0.0.1:8001/docs`

---

## 🛠️ Workspace Command Index

All command scripts should be run from the root of the workspace using `pnpm`:

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Run all applications concurrently in developer watch mode |
| `pnpm dev:backend` | Spin up backend Express API only |
| `pnpm dev:frontend` | Spin up React frontend development server only |
| `pnpm build` | Compile the whole monorepo |
| `pnpm test` | Run tests recursively across all packages |
| `pnpm test:backend` | Run Vitest tests for the Express API |
| `pnpm prisma:generate` | Update local Prisma Client schema |
| `pnpm prisma:migrate` | Sync PostgreSQL database schema with migration files |
| `pnpm prisma:studio` | Open Prisma Studio database explorer |
