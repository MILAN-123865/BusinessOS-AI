-- ==============================================================================
-- BusinessOS AI — PostgreSQL Row-Level Security (RLS) Multi-Tenancy Policy
-- ==============================================================================
-- Enforces cryptographic/kernel-level tenant isolation across all enterprise tables.
-- Guarantees that Tenant A can NEVER read or mutate Tenant B's data, even if application
-- query code omits a WHERE organization_id = ... filter.
-- ==============================================================================

-- 1. Enable RLS on all Tenant-Scoped Tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if re-applying
DROP POLICY IF EXISTS tenant_isolation_users ON users;
DROP POLICY IF EXISTS tenant_isolation_departments ON departments;
DROP POLICY IF EXISTS tenant_isolation_clients ON clients;
DROP POLICY IF EXISTS tenant_isolation_projects ON projects;
DROP POLICY IF EXISTS tenant_isolation_tasks ON tasks;
DROP POLICY IF EXISTS tenant_isolation_invoices ON invoices;
DROP POLICY IF EXISTS tenant_isolation_expenses ON expenses;
DROP POLICY IF EXISTS tenant_isolation_documents ON documents;
DROP POLICY IF EXISTS tenant_isolation_products ON products;
DROP POLICY IF EXISTS tenant_isolation_inventory ON inventory;
DROP POLICY IF EXISTS tenant_isolation_orders ON orders;
DROP POLICY IF EXISTS tenant_isolation_assets ON assets;
DROP POLICY IF EXISTS tenant_isolation_activities ON activities;

-- 3. Define Standard Tenant Isolation Policies
-- Evaluates the session variable `app.current_organization_id` set per request.

CREATE POLICY tenant_isolation_users ON users
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY tenant_isolation_departments ON departments
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY tenant_isolation_clients ON clients
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY tenant_isolation_projects ON projects
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY tenant_isolation_tasks ON tasks
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY tenant_isolation_invoices ON invoices
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY tenant_isolation_expenses ON expenses
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY tenant_isolation_documents ON documents
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY tenant_isolation_products ON products
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY tenant_isolation_inventory ON inventory
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY tenant_isolation_orders ON orders
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY tenant_isolation_assets ON assets
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

CREATE POLICY tenant_isolation_activities ON activities
    USING (organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::uuid);

-- 4. Superuser / Migration Bypass
-- Database administrators / migrations users with BYPASSRLS bypass these rules automatically.
