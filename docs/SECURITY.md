# BusinessOS AI — Enterprise Security & Compliance Architecture

## 1. Security Architecture & Threat Model

BusinessOS AI is built with defense-in-depth principles designed to protect enterprise data, multi-tenant boundaries, and AI execution pipelines against threats identified in the **STRIDE** model:

| Threat Category | Description | BusinessOS AI Mitigation |
| :--- | :--- | :--- |
| **Spoofing** | Impersonation of legitimate users or services | Cryptographically signed JWT tokens, strict password hashing, and user identity validation on every request |
| **Tampering** | Unauthorized modification of business data | Immutable audit logs, parameterized queries, and strict role permission boundaries |
| **Repudiation** | Denying an action took place | High-fidelity append-only `activities` table logging actor ID, IP address, timestamp, and entity payload |
| **Information Disclosure** | Data leakage across tenant boundaries | Strict multi-tenant `organization_id` scoping on all queries and upcoming PostgreSQL Row-Level Security (RLS) |
| **Denial of Service** | Resource starvation or token exhaustion | Redis-backed rate limiting, request validation bounds, and LLM tool execution timeouts |
| **Elevation of Privilege** | Gaining unauthorized administrative control | Granular 17-permission RBAC middleware evaluating permissions before executing controller logic |

---

## 2. Authentication & Credential Management

### 2.1. Password Hashing
- **Algorithm:** Bcrypt with a minimum work factor of 12 rounds.
- **Complexity Policy:** Enforced via Pydantic validator:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one digit
  - At least one special character (`!@#$%^&*()_+-=[]{}|;:,.<>?`)

### 2.2. JWT Token Lifecycle
- **Algorithm:** HMAC-SHA256 (`HS256`) using high-entropy secrets (`JWT_SECRET_KEY` and `JWT_REFRESH_SECRET_KEY`, minimum 32 bytes).
- **Access Tokens:** 15-minute lifespan to limit the exposure window if compromised.
- **Refresh Tokens:** 7-day lifespan, stored securely for session continuity.
- **Client Storage Best Practice:** Refresh tokens must be transmitted via `HttpOnly`, `Secure`, `SameSite=Strict` cookies to mitigate Cross-Site Scripting (XSS).

---

## 3. Role-Based Access Control (RBAC) Matrix

BusinessOS AI defines 17 granular permission scopes across five standard enterprise personas:

| Permission Code | Super Admin | Sales & CRM Lead | HR Director | Project Lead | Auditor / Guest |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `users:read` | ✅ | ❌ | ✅ | ✅ | ✅ |
| `users:manage` | ✅ | ❌ | ✅ | ❌ | ❌ |
| `roles:manage` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `clients:read` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `clients:write` | ✅ | ✅ | ❌ | ❌ | ❌ |
| `projects:read` | ✅ | ✅ | ❌ | ✅ | ✅ |
| `projects:write` | ✅ | ❌ | ❌ | ✅ | ❌ |
| `tasks:read` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `tasks:write` | ✅ | ❌ | ❌ | ✅ | ❌ |
| `finance:read` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `finance:write` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `invoices:approve` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `documents:read` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `documents:upload` | ✅ | ✅ | ✅ | ✅ | ❌ |
| `audit:read` | ✅ | ❌ | ❌ | ❌ | ✅ |
| `ai:chat` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ai:execute_sql` | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 4. AI Copilot & Safe Text-to-SQL Sandbox

Allowing an LLM to query a production relational database presents unique security challenges. BusinessOS AI implements strict safety controls in `backend/app/services/ai/tools.py`:

```
User Query ──► LLM Intent ──► SQL Sandbox Validator ──► Read-Only Execution ──► Sanitized Output
                                      │
                               (Validation Fail)
                                      ▼
                                403 Security Alert
```

### Safety Controls
1. **Strict SELECT-Only Enforcement:**
   - Any query containing forbidden mutating DDL/DML keywords (`INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `REPLACE`, `EXEC`, `CREATE`) is rejected immediately with a security exception.
2. **Transaction Rollback Protection:**
   - Even if an injection attempts nested transactions, the database session executes in a read-only transaction context that is explicitly rolled back.
3. **Multi-Tenant Constraint:**
   - Queries must include or be rewritten with an `organization_id` filter matching the authenticated user's organization.
4. **Result Set Limits:**
   - All queries enforce a hard limit (`LIMIT 50`) to prevent denial-of-service memory exhaustion.

---

## 5. Data Encryption Standards

- **In Transit:** All external and inter-service HTTP traffic must be encrypted using **TLS 1.3** with modern cipher suites. HSTS (HTTP Strict Transport Security) headers are enforced.
- **At Rest:** Database volumes and uploaded document storage are encrypted using **AES-256** (via cloud provider managed KMS keys or filesystem-level encryption).

---

## 6. Vulnerability Disclosure & Incident Response

We welcome responsible security research. If you discover a potential vulnerability in BusinessOS AI:
1. **Contact:** Email our security team directly at `security@businessos.internal`.
2. **Details:** Include reproduction steps, sample HTTP requests, and the environment tested.
3. **Policy:** Do not publicly disclose vulnerabilities until an official patch has been deployed. We commit to acknowledging reports within 24 hours.
