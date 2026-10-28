# BusinessOS AI — Relational Database Architecture

## 1. Overview & Storage Engine

BusinessOS AI uses an asynchronous relational data architecture powered by **SQLAlchemy 2.0 Async** with declarative models.

- **Development:** SQLite via `aiosqlite` (`sqlite+aiosqlite:///./businessos.db_ai`) for zero-dependency local development and testing.
- **Production:** PostgreSQL 15+ via `asyncpg` (`postgresql+asyncpg://user:pass@host:5432/businessos`) with connection pooling and SSL encryption.

---

## 2. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    ORGANIZATION ||--o{ USER : contains
    ORGANIZATION ||--o{ DEPARTMENT : contains
    ORGANIZATION ||--o{ CLIENT : manages
    ORGANIZATION ||--o{ PROJECT : owns
    ORGANIZATION ||--o{ INVOICE : issues
    ORGANIZATION ||--o{ EXPENSE : logs
    ORGANIZATION ||--o{ PRODUCT : catalogs
    ORGANIZATION ||--o{ ASSET : tracks

    DEPARTMENT ||--o{ USER : assigns
    DEPARTMENT ||--o{ EXPENSE : allocates

    USER ||--o{ USER_ROLE : has
    ROLE ||--o{ USER_ROLE : assigned_to
    ROLE ||--o{ ROLE_PERMISSION : grants
    PERMISSION ||--o{ ROLE_PERMISSION : included_in

    CLIENT ||--o{ CLIENT_CONTACT : contacts
    CLIENT ||--o{ PROJECT : contracts
    CLIENT ||--o{ INVOICE : billed_to
    CLIENT ||--o{ ORDER : places

    PROJECT ||--o{ TASK : includes
    USER ||--o{ TASK : assigned_to

    PRODUCT ||--o{ INVENTORY : stocked_in
    ORDER ||--o{ ORDER_ITEM : details
    PRODUCT ||--o{ ORDER_ITEM : ordered_as

    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ ACTIVITY : generates
    USER ||--o{ AI_CHAT_SESSION : conducts
    AI_CHAT_SESSION ||--o{ AI_MESSAGE : contains
```

---

## 3. Schema & Table Specifications

### 3.1. Core Multi-Tenant & Identity Tables

#### `organizations`
Primary multi-tenant boundary. Every operational record is scoped to an organization.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Unique organization identifier (v4) |
| `name` | VARCHAR(255) | NOT NULL | Legal corporate name |
| `domain` | VARCHAR(100) | UNIQUE, NULLABLE | Corporate email domain (for SSO routing) |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account operational status |
| `created_at` | TIMESTAMPTZ | NOT NULL | Creation timestamp (UTC) |
| `updated_at` | TIMESTAMPTZ | NOT NULL | Last update timestamp (UTC) |

#### `departments`
Organizational business units (e.g., Engineering, Sales, Human Resources, Finance).
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Department identifier |
| `organization_id` | UUID | FK -> organizations(id) | Tenant scope |
| `name` | VARCHAR(100) | NOT NULL | Department title |
| `code` | VARCHAR(20) | NOT NULL | Short department code (e.g., `ENG`, `FIN`) |
| `description` | VARCHAR(500) | NULLABLE | Department scope |

#### `users`
Enterprise user accounts.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | User identifier |
| `organization_id` | UUID | FK -> organizations(id) | Tenant scope |
| `department_id` | UUID | FK -> departments(id) | Assigned department |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login email address |
| `hashed_password` | VARCHAR(255) | NOT NULL | Bcrypt password hash (min 12 rounds) |
| `first_name` | VARCHAR(100) | NOT NULL | Given name |
| `last_name` | VARCHAR(100) | NOT NULL | Family name |
| `avatar_url` | VARCHAR(500) | NULLABLE | Profile picture URL |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account access flag |
| `is_superuser` | BOOLEAN | DEFAULT FALSE | System administrator flag |
| `created_at` | TIMESTAMPTZ | NOT NULL | Account creation date |

#### `roles`, `permissions`, `user_roles`, `role_permissions`
Granular Role-Based Access Control (RBAC) schema supporting arbitrary roles and 17 core permissions.
- **Roles:** `id`, `organization_id`, `name` (e.g., "Super Admin", "Finance Director", "Project Manager"), `description`.
- **Permissions:** `id`, `code` (e.g., `invoices:create`, `users:manage`, `ai:execute_sql`), `name`, `module`.
- **User Roles & Role Permissions:** Normalized join tables with cascading foreign keys.

---

### 3.2. Operational CRM & Project Management

#### `clients`
Enterprise customer and account records (seeded from Northwind corporate dataset).
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Client record identifier |
| `organization_id` | UUID | FK -> organizations(id) | Tenant scope |
| `company_name` | VARCHAR(255) | NOT NULL | Client company name |
| `client_code` | VARCHAR(50) | UNIQUE, NOT NULL | Standard client code (e.g., `ALFKI`, `QUICK`) |
| `industry` | VARCHAR(100) | NULLABLE | Industry sector |
| `email` | VARCHAR(255) | NULLABLE | Primary contact email |
| `phone` | VARCHAR(50) | NULLABLE | Primary phone number |
| `city` | VARCHAR(100) | NULLABLE | Headquarter city |
| `country` | VARCHAR(100) | NULLABLE | Headquarter country |
| `status` | VARCHAR(50) | DEFAULT 'Active' | Client status (`Active`, `Inactive`, `Lead`) |

#### `projects`
Client and internal initiatives.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Project identifier |
| `organization_id` | UUID | FK -> organizations(id) | Tenant scope |
| `client_id` | UUID | FK -> clients(id) | Associated client account |
| `name` | VARCHAR(255) | NOT NULL | Project name |
| `status` | VARCHAR(50) | DEFAULT 'Planning' | `Planning`, `In Progress`, `Review`, `Completed` |
| `priority` | VARCHAR(50) | DEFAULT 'Medium' | `Low`, `Medium`, `High`, `Urgent` |
| `budget` | NUMERIC(12, 2) | DEFAULT 0.00 | Allocated currency budget |
| `start_date` | DATE | NULLABLE | Scheduled start date |
| `end_date` | DATE | NULLABLE | Projected completion date |

#### `tasks`
Individual assignments tracked on Kanban and list views.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Task identifier |
| `organization_id` | UUID | FK -> organizations(id) | Tenant scope |
| `project_id` | UUID | FK -> projects(id) | Associated project |
| `assignee_id` | UUID | FK -> users(id) | Assigned employee |
| `title` | VARCHAR(255) | NOT NULL | Task title |
| `description` | TEXT | NULLABLE | Detailed instructions |
| `status` | VARCHAR(50) | DEFAULT 'Todo' | `Todo`, `In Progress`, `Review`, `Completed` |
| `priority` | VARCHAR(50) | DEFAULT 'Medium' | `Low`, `Medium`, `High`, `Urgent` |
| `due_date` | DATE | NULLABLE | Due date |

---

### 3.3. Financial Ledger

#### `invoices`
Accounts receivable and billing records.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Invoice identifier |
| `organization_id` | UUID | FK -> organizations(id) | Tenant scope |
| `client_id` | UUID | FK -> clients(id) | Client account billed |
| `project_id` | UUID | FK -> projects(id) | Associated project |
| `invoice_number` | VARCHAR(50) | UNIQUE, NOT NULL | Number (e.g. `INV-2026-084`) |
| `amount` | NUMERIC(12, 2) | NOT NULL | Total invoiced amount |
| `status` | VARCHAR(20) | DEFAULT 'Pending' | `Paid`, `Pending`, `Sent`, `Overdue`, `Cancelled` |
| `issue_date` | DATE | NOT NULL | Date issued |
| `due_date` | DATE | NOT NULL | Payment deadline |

#### `expenses`
Operational expenditures and departmental costs.
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PRIMARY KEY | Expense identifier |
| `organization_id` | UUID | FK -> organizations(id) | Tenant scope |
| `department_id` | UUID | FK -> departments(id) | Budget department charged |
| `user_id` | UUID | FK -> users(id) | Employee who submitted |
| `amount` | NUMERIC(12, 2) | NOT NULL | Expense cost |
| `category` | VARCHAR(50) | NOT NULL | `Travel`, `Software`, `Hardware`, `Office`, `Marketing` |
| `description` | VARCHAR(500) | NULLABLE | Expense explanation |
| `expense_date` | DATE | NOT NULL | Date incurred |

---

### 3.4. Commerce & Warehouse

- **`products`**: `id`, `organization_id`, `name`, `sku`, `price`, `category`, `is_active`.
- **`inventory`**: `id`, `organization_id`, `product_id`, `quantity`, `location`, `last_restocked`.
- **`orders`**: `id`, `organization_id`, `customer_id` (FK to clients), `order_number`, `total_amount`, `status`, `order_date`.

---

### 3.5. AI & Operational Telemetry

- **`ai_chat_sessions`**: `id`, `user_id`, `organization_id`, `title`, `created_at`, `updated_at`.
- **`ai_messages`**: `id`, `session_id`, `role` (`user`, `assistant`, `system`), `content`, `tokens_used`, `tool_calls`.
- **`assets` & `asset_categories`**: Corporate hardware and software asset tracking with serial numbers and warranty dates.
- **`activities` (Audit Logs)**: Append-only event stream tracking actor, entity, action type, description, and timestamp.

---

## 4. Indexing & Multi-Tenancy Strategy

1. **Compound Multi-Tenant Indexes:**
   - Every major table contains an index on `(organization_id, created_at DESC)` for fast paginated queries.
   - Example: `CREATE INDEX idx_invoices_org_created ON invoices(organization_id, created_at DESC);`
2. **UUID Primary Keys:** All primary keys use RFC 4122 v4 UUIDs, preventing ID enumeration attacks and easing future database sharding.
3. **Database Migrations (Alembic):**
   - Environment configured in `backend/alembic/env.py`.
   - New migration command:
     ```bash
     cd backend
     alembic revision --autogenerate -m "Add description to invoices"
     alembic upgrade head
     ```
