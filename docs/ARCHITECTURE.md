# BusinessOS AI — System Architecture Specification

## 1. Executive Summary & Architecture Decision Record (ADR-001)

### Status
**DECIDED (Authoritative Architecture Standard)**

### Context
Previously, the repository contained a split architecture with a 2,700-line temporary Express mock server (`server.js`) in the root alongside a Python FastAPI enterprise application in `backend/`. This caused schema drift, confusion over the single source of truth, and mock data discrepancies.

### Decision
**Python FastAPI** is designated as the **single authoritative backend** for BusinessOS AI:
1. **Authoritative Backend Service:** FastAPI (`backend/app/main.py`) running on `http://127.0.0.1:8000/api/v1` handles all business logic, authentication, RBAC, commerce, operations, and AI tool calling.
2. **Authoritative Frontend Service:** Next.js 14 App Router (`frontend/`) running on `http://localhost:3000` provides the executive interface, visualizations, and reactive state management.
3. **Retired Mock Layer:** Root `server.js` is archived to `scripts/archive/server.mock.js`. A unified development runner (`scripts/dev.js`) boots both FastAPI and Next.js concurrently with process monitoring and graceful shutdown.

---

## 2. High-Level System Topology

```mermaid
graph TD
    Client["Enterprise User Browser (Desktop / Tablet)"]
    
    subgraph Frontend Layer [Next.js 14 / TypeScript (Port 3000)]
        UI["React Server & Client Components / TailwindCSS / Radix UI"]
        Store["State Management (Zustand Stores)"]
        Axios["API Client (Axios + Interceptors)"]
        UI --> Store
        Store --> Axios
    end

    subgraph Gateway & Backend Layer [FastAPI / Python 3.13 (Port 8000)]
        Middleware["Auth & CORS Middleware (EnterpriseAuthContextMiddleware)"]
        Routers["Versioned Routers (/api/v1)"]
        AuthRouter["Auth & Security (/auth)"]
        DashRouter["Dashboard & Metrics (/dashboard)"]
        OpsRouter["Operations (Clients, Projects, Tasks, Employees)"]
        FinRouter["Finance (Invoices, Expenses)"]
        CommRouter["Commerce (Products, Inventory, Orders)"]
        DocRouter["Knowledge & Documents (/documents)"]
        AIRouter["AI Copilot & Tool Calling (/ai)"]
        
        Middleware --> Routers
        Routers --> AuthRouter
        Routers --> DashRouter
        Routers --> OpsRouter
        Routers --> FinRouter
        Routers --> CommRouter
        Routers --> DocRouter
        Routers --> AIRouter
    end

    subgraph AI Engine Layer [LLM Service & Autonomous Agent]
        LLMService["Multi-Provider LLM Service (Google Gemini / OpenAI / Groq / Ollama)"]
        ToolExecutor["Autonomous Tool Calling & Read-Only SQL Inspector"]
        AIRouter --> LLMService
        LLMService --> ToolExecutor
    end

    subgraph Persistence Layer [SQLAlchemy 2.0 Async]
        Session["AsyncSession (SQLAlchemy + AsyncEngine)"]
        DB[(Relational DB: PostgreSQL in Prod / SQLite in Dev)]
        ToolExecutor --> Session
        Routers --> Session
        Session --> DB
    end

    Client --> Frontend Layer
    Axios --> Gateway & Backend Layer
```

---

## 3. Core Layer Breakdown

### 3.1. Frontend Presentation Layer (`frontend/`)
- **Framework:** Next.js 14 with App Router, React 18, TypeScript.
- **Styling & UI:** Tailwind CSS, Framer Motion animations, Lucide React icons, Radix UI primitives.
- **Data Fetching:** Axios instance configured in `frontend/services/axios.ts` targeting `NEXT_PUBLIC_API_URL` (default: `http://127.0.0.1:8000/api/v1`).
- **Authentication State:** Zustand `useAuthStore` managing JWT tokens, user profiles, and active organizational context.

### 3.2. Backend Core Layer (`backend/app/`)
- **Framework:** FastAPI with Uvicorn ASGI server.
- **Configuration:** Pydantic Settings (`app.config.settings.Settings`) strictly typed from `.env`.
- **Database Engine:** SQLAlchemy 2.0 async engine (`create_async_engine`) with `async_sessionmaker`.
  - Development: `sqlite+aiosqlite:///./businessos.db_ai`
  - Production: `postgresql+asyncpg://user:pass@host:5432/businessos`
- **Dependency Injection:** Centralized session injection via `app.dependencies.database.get_db_session` and token validation via `app.dependencies.auth.get_current_active_user`.

### 3.3. Autonomous AI Engine (`backend/app/services/ai/`)
- **Multi-Provider Support:**
  - Google Gemini (`gemini-2.5-pro` / `gemini-2.5-flash`) via `@google/genai` SDK and REST API
  - OpenAI (`gpt-4o`, `gpt-4o-mini`)
  - Groq (`llama-3.3-70b-versatile`)
  - Local Ollama
- **Database Tool Calling:**
  - Dynamic inspection of organizational KPIs (`tool_get_organization_overview`)
  - Deep-dive queries for projects, tasks, invoices, employees, and inventory
  - Automated task creation (`tool_create_task`)
  - Read-only SQL query validation and execution against live business data (`tool_execute_readonly_sql`)

---

## 4. API Specification & Route Topology

All API endpoints are versioned under `/api/v1`:

| Domain | Router Prefix | Description |
| :--- | :--- | :--- |
| **Authentication** | `/api/v1/auth` | Login, registration, token refresh, and user profile verification |
| **Dashboard** | `/api/v1/dashboard` | KPI metrics, revenue telemetries, and operational summaries |
| **Organization & HR** | `/api/v1/organizations`, `/api/v1/departments`, `/api/v1/roles`, `/api/v1/users` | Multi-tenant organization structure, departments, roles, and employee records |
| **Operations** | `/api/v1/clients`, `/api/v1/projects`, `/api/v1/tasks` | Client CRM, project management, and task boards |
| **Finance** | `/api/v1/invoices`, `/api/v1/expenses` | Invoicing, accounts receivable, and expense tracking |
| **Commerce** | `/api/v1/products`, `/api/v1/inventory`, `/api/v1/orders` | Product catalog, inventory stock management, and customer orders |
| **Documents & KB** | `/api/v1/documents`, `/api/v1/folders` | Document storage, categorization, and enterprise knowledge base |
| **AI Assistant** | `/api/v1/ai/chat`, `/api/v1/ai/query`, `/api/v1/ai/sessions` | Multi-turn conversational AI copilot with database tool execution |
| **Notifications** | `/api/v1/notifications`, `/api/v1/notification-preferences` | User notifications and notification settings |
| **Assets** | `/api/v1/assets`, `/api/v1/asset-categories` | Corporate hardware and software asset tracking |
| **Audit Logs** | `/api/v1/audit-logs` | Immutable audit trail and CSV export |
| **System** | `/api/v1/settings`, `/health` | System preferences and infrastructure liveness probe |

---

## 5. Development & Production Operations

### Running Locally
```bash
# Starts both FastAPI (port 8000) and Next.js (port 3000)
npm run dev

# Start only the FastAPI backend
npm run dev:backend

# Start only the Next.js frontend
npm run dev:frontend
```

### Interactive API Documentation
- **Swagger UI:** `http://127.0.0.1:8000/docs`
- **ReDoc:** `http://127.0.0.1:8000/redoc`
- **OpenAPI JSON:** `http://127.0.0.1:8000/api/v1/openapi.json`
