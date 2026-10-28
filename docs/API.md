# BusinessOS AI — REST API Specification

## 1. Overview & Conventions

All endpoints adhere to RESTful design principles and are versioned under the `/api/v1` prefix.

- **Base URL:** `http://127.0.0.1:8000/api/v1`
- **Interactive OpenAPI Documentation (Swagger):** `http://127.0.0.1:8000/docs`
- **ReDoc Documentation:** `http://127.0.0.1:8000/redoc`
- **OpenAPI Schema (JSON):** `http://127.0.0.1:8000/api/v1/openapi.json`

---

## 2. Standard Request & Response Envelopes

Every JSON API response follows a consistent envelope structure.

### Success Response Envelope (HTTP 200, 201)
```json
{
  "success": true,
  "message": "Resource retrieved successfully.",
  "data": {
    "id": "c7a8b412-9c3f-4e02-8f19-b1d5e683f231",
    "name": "Cloud Workspace Migration"
  },
  "errors": null
}
```

### Error Response Envelope (HTTP 400, 401, 403, 404, 422, 500)
```json
{
  "success": false,
  "message": "The request payload failed structural parameter validation.",
  "data": null,
  "errors": {
    "amount": "Field required"
  }
}
```

---

## 3. Authentication & Authorization

All authenticated endpoints require an RFC 6750 Bearer token in the `Authorization` header:

```http
Authorization: Bearer <ACCESS_TOKEN>
Content-Type: application/json
```

- **Access Token:** Short-lived JWT (15-minute validity).
- **Refresh Token:** Long-lived JWT (7-day validity) used to obtain a new access token without re-authenticating.

---

## 4. Complete Endpoint Catalog

### 4.1. Authentication (`/api/v1/auth`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | No | Authenticate with email/password; returns access & refresh tokens |
| `POST` | `/auth/register` | No | Register a new user and bootstrap organization |
| `GET` | `/auth/me` | Bearer | Retrieve currently authenticated user profile and roles |
| `POST` | `/auth/refresh` | Bearer | Issue a new access token using a valid refresh token |
| `POST` | `/auth/logout` | Bearer | Invalidate active session |

---

### 4.2. Executive Dashboard (`/api/v1/dashboard`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/metrics` | Bearer | High-level organizational KPIs (revenue, active users, tasks, projects) |
| `GET` | `/dashboard/overview` | Bearer | Detailed breakdown of operational department health and pipeline |
| `GET` | `/dashboard/activities`| Bearer | Recent team activity stream |

---

### 4.3. Client Relationship Management (`/api/v1/clients`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/clients` | Bearer | List client accounts with filtering and pagination |
| `POST` | `/clients` | Bearer | Create a new client account |
| `GET` | `/clients/{id}` | Bearer | Get detailed client account record |
| `PATCH`| `/clients/{id}` | Bearer | Update client details |
| `DELETE`| `/clients/{id}`| Bearer | Delete or soft-delete client account |
| `GET` | `/clients/{id}/contacts` | Bearer | List client contact persons |

---

### 4.4. Projects & Tasks (`/api/v1/projects`, `/api/v1/tasks`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/projects` | Bearer | List projects (with status, priority, and budget) |
| `POST` | `/projects` | Bearer | Create a new project |
| `GET` | `/projects/{id}` | Bearer | Retrieve project details and team assignees |
| `PATCH`| `/projects/{id}` | Bearer | Update project status, health, or schedule |
| `DELETE`| `/projects/{id}`| Bearer | Remove project |
| `GET` | `/tasks` | Bearer | List tasks (filterable by `project_id`, `status`, `assignee`) |
| `POST` | `/tasks` | Bearer | Create a task |
| `PATCH`| `/tasks/{id}` | Bearer | Move task across Kanban columns or update priority |
| `DELETE`| `/tasks/{id}` | Bearer | Delete task |

---

### 4.5. Financial Center (`/api/v1/invoices`, `/api/v1/expenses`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/invoices` | Bearer | List all invoices with client and project associations |
| `POST` | `/invoices` | Bearer | Issue a new corporate invoice |
| `GET` | `/invoices/{id}` | Bearer | Retrieve invoice details and line items |
| `PATCH`| `/invoices/{id}` | Bearer | Mark invoice as Paid, Cancelled, or Overdue |
| `DELETE`| `/invoices/{id}`| Bearer | Delete an invoice record |
| `GET` | `/expenses` | Bearer | List departmental expense entries |
| `POST` | `/expenses` | Bearer | Record a new operational expenditure |

---

### 4.6. Commerce & Warehouse (`/api/v1/products`, `/api/v1/inventory`, `/api/v1/orders`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Bearer | Catalog of active merchandise and services |
| `POST` | `/products` | Bearer | Add a product to the catalog |
| `GET` | `/inventory` | Bearer | Warehouse stock levels, locations, and low-stock warnings |
| `PATCH`| `/inventory/{id}` | Bearer | Adjust inventory quantities |
| `GET` | `/orders` | Bearer | Customer purchase orders with status tracking |
| `POST` | `/orders` | Bearer | Create a new purchase order |

---

### 4.7. AI Assistant & Database Copilot (`/api/v1/ai`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/ai/chat` | Bearer | Send prompt to executive AI assistant with automated tool calling |
| `POST` | `/ai/query` | Bearer | Execute safe read-only SQL queries or business insights |
| `GET` | `/ai/sessions` | Bearer | List past conversational chat sessions |
| `GET` | `/ai/sessions/{id}`| Bearer | Retrieve chat history and tool results for a specific session |

---

### 4.8. Knowledge Base & Documents (`/api/v1/documents`, `/api/v1/folders`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/documents` | Bearer | List enterprise files, specifications, and whitepapers |
| `POST` | `/documents` | Bearer | Upload document metadata and binary payload |
| `GET` | `/documents/{id}` | Bearer | Get document details and version history |
| `DELETE`| `/documents/{id}`| Bearer | Remove document |

---

### 4.9. Hardware & IT Assets (`/api/v1/assets`, `/api/v1/asset-categories`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/assets` | Bearer | List tracked assets (laptops, monitors, licenses) |
| `POST` | `/assets` | Bearer | Register a new corporate asset |
| `PATCH`| `/assets/{id}` | Bearer | Update asset status (`Available`, `Assigned`, `Maintenance`) |
| `GET` | `/asset-categories` | Bearer | List asset categories |

---

### 4.10. Notifications (`/api/v1/notifications`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Bearer | Fetch notification feed for the current user |
| `POST` | `/notifications/{id}/read` | Bearer | Mark notification as read |
| `POST` | `/notifications/read-all` | Bearer | Mark all user notifications as read |
| `GET` | `/notification-preferences` | Bearer | Get email/push digest preferences |

---

### 4.11. Search, Audit & Infrastructure
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/search?q={query}` | Bearer | Global fuzzy search across all CRM and project entities |
| `GET` | `/audit-logs` | Bearer | Security audit trail of all mutations |
| `GET` | `/audit-logs/export` | Bearer | Download full audit trail as a formatted CSV |
| `GET` | `/settings` | Bearer | Fetch global system configurations |
| `PATCH`| `/settings` | Bearer | Update system configuration parameters |
| `GET` | `/health` | No | Infrastructure liveness probe indicating service capacity |
