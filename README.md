# ⚡ BusinessOS-AI: Autonomous Enterprise AI Operating System

> **A state-of-the-art, multi-tenant enterprise operating system powered by autonomous AI tool execution, safe real-time Text-to-SQL over relational databases, interactive RBAC simulation, automated workflows, and multi-format data export.**

---

## 🌟 Core Architecture & Key Modules

```
                                 ┌────────────────────────────────────────────────────────┐
                                 │              BusinessOS Frontend (Next.js 16)          │
                                 │   • Dual-Theme (White & Light Sky Blue / Midnight Navy)│
                                 │   • RBAC Simulator & 17-Permission Toggle Sandbox      │
                                 │   • Floating Live AI Copilot & Markdown Tables         │
                                 │   • Universal Export (CSV / JSON / Printable PDF)      │
                                 └───────────────────────────┬────────────────────────────┘
                                                             │ REST API / JWT
                                                             ▼
                                 ┌────────────────────────────────────────────────────────┐
                                 │             FastAPI Enterprise Backend Engine          │
                                 │   • Multi-Provider LLM Service (OpenAI / Gemini / Groq)│
                                 │   • Autonomous Relational Introspection Engine        │
                                 │   • Safe Read-Only Text-to-SQL Query Sandbox           │
                                 │   • Granular Role-Based Access Control (RBAC)          │
                                 └───────────────────────────┬────────────────────────────┘
                                                             │ Async SQLAlchemy 2.0
                                                             ▼
                                 ┌────────────────────────────────────────────────────────┐
                                 │             Relational Database (SQLite / Postgres)    │
                                 │   • 91 Enterprise Client Accounts & Contacts           │
                                 │   • 830 Purchase Orders & Invoicing Ledger             │
                                 │   • 77 Products & Real-time Warehouse Inventory        │
                                 │   • Staff Directory, Departments & RBAC Policies       │
                                 └────────────────────────────────────────────────────────┘
```

---

## ✨ Flagship Capabilities

### 1. 🤖 Live Database AI Copilot & Safe Text-to-SQL
- Direct relational database awareness across 91 Northwind clients, 830 orders, 77 products with inventory, tasks, projects, and finances.
- **Safe Text-to-SQL**: Execute safe read-only queries like `SQL: SELECT company_name, city, country FROM clients LIMIT 5` directly in chat, rendered in styled Markdown tables.
- **Action Dispatcher**: Direct AI to create tasks (`Create task: Schedule Q3 executive review with High priority`) which automatically sync to the Kanban board.
- **Multi-Provider Fallback**: Seamless fallback across OpenAI $\to$ Google Gemini $\to$ Groq $\to$ Autonomous Business Engine.

### 2. 🛡️ Interactive RBAC Simulator & Policy Sandbox (`/rbac-simulator`)
- **1-Click Persona Switching**:
  - 👑 **Super Administrator** (*Full root clearance on all 17 system permissions*)
  - 💼 **Sales & Client Executive** (*Access to CRM & Projects; restricted from employee data & security roles*)
  - 👥 **HR & Operations Director** (*Access to Staff directory & Departments; restricted from CRM*)
  - 🚀 **Technical Project Lead** (*Control over Projects, Tasks, and Workflows*)
  - 👁️ **Read-Only Auditor / Guest** (*Strictly view-only inspection access; mutating actions blocked*)
- **Real-Time Policy Evaluator**: Test any Module + Action pair and receive live `200 AUTHORIZED` or `403 FORBIDDEN` audit traces.
- **Granular 17-Permission Matrix**: Toggle individual permissions live and watch the application UI adapt dynamically.

### 3. 🧾 Financial Center & Live PDF Invoice Generator (`/finance`)
- Full corporate receivables ledger with Paid Revenue, Pending Invoices, and Overdue tracking.
- **1-Click Corporate PDF Invoices**: Generates executive, print-ready corporate invoices with itemized line items, tax calculations, discounts, and payment terms.

### 4. ⚡ Visual Automated Workflow Engine (`/workflows`)
- Visual node pipeline (`[Trigger Node] ➔ [Condition] ➔ [AI Assistant Evaluation] ➔ [Action Dispatch]`).
- Pre-built automation pipelines:
  - *High-Value Order Auto-Dispatch ($1,000+)*
  - *Low-Stock Autonomous Restock Draft (<= 15 units)*
  - *Overdue Invoice Escalation Bot*
  - *New Employee Onboarding Sequence*
- **1-Click Simulation Runner**: Animate step execution live with simulated latency and terminal logs.

### 5. 📊 Universal Multi-Format Data Export Suite
- **1-Click Export Dropdown** across all major pages (`/clients`, `/finance`, `/settings/audit-logs`, `/tasks`).
- Export to **CSV Spreadsheet** (Excel / Google Sheets), **JSON Raw Feed**, or **Printable PDF Corporate Report**.

### 6. 📜 Enterprise Audit Logs & Security Compliance (`/settings/audit-logs`)
- Live immutable stream of user logins, AI Text-to-SQL queries, simulated role evaluations, and workflow triggers.
- Filterable by Actor, Severity (`INFO`, `WARNING`, `CRITICAL`), and Module with simulated compliance event injection.

### 7. ⏱️ System Health & Latency Diagnostics Benchmark (`/settings/diagnostics`)
- 1-Click diagnostic test suite measuring real-time latency across SQLite Database (`SELECT 1`), FastAPI microservices, AI AST sanitizer, and client V8 memory.
- Live telemetry stream with JSON report exporter.

### 8. 🏢 Interactive Corporate Hierarchy & Org Chart (`/organization/org-chart`)
- Node-based organizational tree visualizer with expandable reporting lines.
- Detailed department inspector highlighting division headcounts, budgets, and contact profiles.

### 9. 📚 Enterprise Knowledge Base & Policy RAG (`/knowledge-base`)
- Internal policy repository (ISO-27001 Security, Onboarding, Net 30 Invoicing, Cold-Chain Protocols).
- Semantic search scoring and instant AI Policy Assistant synthesizer.

### 10. 📦 Warehouse Inventory & Barcode Scanner Simulator (`/inventory`)
- Real-time Northwind SKU tracking with low-stock alerts and valuation ledger.
- Industrial Barcode Terminal simulator with laser viewport animation, sound synthesis, and 1-click PO restock triggers.

### 11. 💳 Interactive Checkout & Payment Gateway Simulator (`/finance`)
- Embedded payment terminal supporting Credit Cards, ACH, and FedWire with 1-click test cards (`4242 •••• •••• 4242`).
- 3D Secure verification simulation with instant status synchronization to `Paid`.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+

### 1. Start the Backend API
```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate  # On Windows (or source .venv/bin/activate on Linux/Mac)
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API Docs (Swagger UI): [`http://127.0.0.1:8000/docs`](http://127.0.0.1:8000/docs)

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
```
- Open Application: [`http://localhost:3000`](http://localhost:3000)

---

## 🔑 Demo Test Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin@example.com` | `Admin123!` | Full Root Authority |
| **VP of Sales & Ops** | `andrew.fuller@northwind.com` | `Admin123!` | Department Lead |
| **Sales Representative** | `nancy.davolio@northwind.com` | `Admin123!` | CRM & Orders |

*Alternatively, use the **RBAC Simulator** dock in the top navigation bar to test all 5 enterprise personas with 1 click without re-logging in.*

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router & Turbopack), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, React Query, Zustand.
- **Backend**: FastAPI (Python 3.13), SQLAlchemy 2.0 (Async), Pydantic v2, Uvicorn, SQLite / PostgreSQL.
- **AI & Text-to-SQL**: Multi-provider LLM Engine (OpenAI GPT-4o-mini / Google Gemini 1.5 / Groq LLaMA 3.3 / Autonomous Business Engine).
