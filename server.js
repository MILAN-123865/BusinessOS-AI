const { spawn } = require('child_process');
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

let db = null;

async function getDb() {
  if (!db) {
    db = await open({
      filename: './database.sqlite',
      driver: sqlite3.Database
    });
  }
  return db;
}

async function initDb() {
  const database = await getDb();

  // Create tables
  await database.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      company_name TEXT,
      client_code TEXT,
      industry TEXT,
      website TEXT,
      email TEXT,
      phone TEXT,
      status TEXT,
      city TEXT,
      country TEXT,
      notes TEXT,
      contacts TEXT
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT,
      project_code TEXT,
      description TEXT,
      client_id TEXT,
      status TEXT,
      priority TEXT,
      budget REAL,
      currency TEXT,
      start_date TEXT,
      end_date TEXT,
      estimated_hours INTEGER,
      actual_hours INTEGER,
      progress INTEGER,
      health TEXT,
      project_manager_id TEXT,
      members TEXT,
      milestones TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT,
      task_code TEXT,
      description TEXT,
      project_id TEXT,
      assignee_id TEXT,
      status TEXT,
      priority TEXT,
      estimated_hours INTEGER,
      actual_hours INTEGER,
      progress INTEGER,
      start_date TEXT,
      due_date TEXT,
      comments TEXT,
      subtasks TEXT
    );

    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id TEXT,
      organization_id TEXT NOT NULL,
      created_by_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      extension TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      version INTEGER NOT NULL,
      folder_id TEXT,
      owner_id TEXT NOT NULL,
      uploaded_by_id TEXT NOT NULL,
      project_id TEXT,
      department_id TEXT,
      tags TEXT,
      description TEXT,
      visibility TEXT NOT NULL,
      storage_path TEXT NOT NULL,
      download_url TEXT NOT NULL,
      preview_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      versions TEXT,
      shares TEXT,
      activities TEXT
    );

    CREATE TABLE IF NOT EXISTS asset_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      asset_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      category_id TEXT NOT NULL,
      brand TEXT,
      model TEXT,
      serial_number TEXT,
      purchase_date TEXT,
      purchase_price REAL,
      vendor TEXT,
      status TEXT NOT NULL,
      condition TEXT NOT NULL,
      assigned_employee_id TEXT,
      assigned_department_id TEXT,
      assigned_project_id TEXT,
      location TEXT,
      warranty_start TEXT,
      warranty_end TEXT,
      next_maintenance TEXT,
      last_maintenance TEXT,
      barcode TEXT,
      qr_code TEXT,
      notes TEXT,
      attachments TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS asset_history (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL,
      action TEXT NOT NULL,
      description TEXT,
      performed_by_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS asset_maintenance (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      cost REAL,
      vendor TEXT,
      status TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      performed_by_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      priority TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      link_url TEXT,
      metadata TEXT,
      created_at TEXT NOT NULL,
      read_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id TEXT PRIMARY KEY,
      email_notifications INTEGER NOT NULL DEFAULT 1,
      push_notifications INTEGER NOT NULL DEFAULT 1,
      sms_notifications INTEGER NOT NULL DEFAULT 0,
      in_app_notifications INTEGER NOT NULL DEFAULT 1,
      muted_types TEXT,
      digest_frequency TEXT NOT NULL DEFAULT 'Immediate'
    );

    CREATE TABLE IF NOT EXISTS recent_searches (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      query TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  // Seed initial data if tables are empty
  const clientCount = await database.get('SELECT COUNT(*) as count FROM clients');
  if (clientCount.count === 0) {
    const initialClients = [
      { id: 'client-1', company_name: 'Acme Corporation', client_code: 'ACM', industry: 'Technology', website: 'https://acme.com', email: 'contacts@acme.com', phone: '+15551234', status: 'Active', city: 'Metropolis', country: 'USA', notes: 'Key account for Q3.', contacts: [] },
      { id: 'client-2', company_name: 'Globex Industries', client_code: 'GBX', industry: 'Manufacturing', website: 'https://globex.com', email: 'sales@globex.com', phone: '+15555678', status: 'Active', city: 'Springfield', country: 'USA', notes: 'Contract renewal pending.', contacts: [] }
    ];
    for (const c of initialClients) {
      await database.run(
        'INSERT INTO clients (id, company_name, client_code, industry, website, email, phone, status, city, country, notes, contacts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [c.id, c.company_name, c.client_code, c.industry, c.website, c.email, c.phone, c.status, c.city, c.country, c.notes, JSON.stringify(c.contacts)]
      );
    }
  }

  const projectCount = await database.get('SELECT COUNT(*) as count FROM projects');
  if (projectCount.count === 0) {
    const initialProjects = [
      { id: 'proj-1', name: 'Cloud Workspace Migration', project_code: 'CWM-2024', description: 'Migrating central operations system to Cloud infrastructure.', client_id: 'client-1', status: 'In Progress', priority: 'High', budget: 150000, currency: 'USD', start_date: '2024-01-15', end_date: '2024-12-31', estimated_hours: 1200, actual_hours: 450, progress: 40, health: 'Good', project_manager_id: 'user-2', members: [], milestones: [] },
      { id: 'proj-2', name: 'Enterprise Security Audit', project_code: 'ESA-99', description: 'Full scope policy analysis and compliance check.', client_id: 'client-2', status: 'Planning', priority: 'Medium', budget: 75000, currency: 'USD', start_date: '2024-03-01', end_date: '2024-08-31', estimated_hours: 500, actual_hours: 20, progress: 5, health: 'Good', project_manager_id: 'user-1', members: [], milestones: [] }
    ];
    for (const p of initialProjects) {
      await database.run(
        'INSERT INTO projects (id, name, project_code, description, client_id, status, priority, budget, currency, start_date, end_date, estimated_hours, actual_hours, progress, health, project_manager_id, members, milestones) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [p.id, p.name, p.project_code, p.description, p.client_id, p.status, p.priority, p.budget, p.currency, p.start_date, p.end_date, p.estimated_hours, p.actual_hours, p.progress, p.health, p.project_manager_id, JSON.stringify(p.members), JSON.stringify(p.milestones)]
      );
    }
  }

  const taskCount = await database.get('SELECT COUNT(*) as count FROM tasks');
  if (taskCount.count === 0) {
    const initialTasks = [
      { id: 'task-1', title: 'Establish cloud SQL instance architecture', task_code: 'CWM-01', description: 'Provision Postgres schemas and configure IAM bindings.', project_id: 'proj-1', assignee_id: 'user-1', status: 'Todo', priority: 'High', estimated_hours: 16, actual_hours: 0, progress: 0, start_date: '2024-02-01', due_date: '2024-02-10', comments: [], subtasks: [] },
      { id: 'task-2', title: 'Configure Next.js layout structures', task_code: 'CWM-02', description: 'Implement modern Tailwind styling and layout grids.', project_id: 'proj-1', assignee_id: 'user-2', status: 'In Progress', priority: 'Medium', estimated_hours: 24, actual_hours: 12, progress: 50, start_date: '2024-02-05', due_date: '2024-02-15', comments: [], subtasks: [] }
    ];
    for (const t of initialTasks) {
      await database.run(
        'INSERT INTO tasks (id, title, task_code, description, project_id, assignee_id, status, priority, estimated_hours, actual_hours, progress, start_date, due_date, comments, subtasks) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [t.id, t.title, t.task_code, t.description, t.project_id, t.assignee_id, t.status, t.priority, t.estimated_hours, t.actual_hours, t.progress, t.start_date, t.due_date, JSON.stringify(t.comments), JSON.stringify(t.subtasks)]
      );
    }
  }

  const folderCount = await database.get('SELECT COUNT(*) as count FROM folders');
  if (folderCount.count === 0) {
    const initialFolders = [
      { id: 'folder-1', name: 'Engineering Templates', parent_id: null, organization_id: 'org-1', created_by_id: 'user-1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'folder-2', name: 'Product Specifications', parent_id: null, organization_id: 'org-1', created_by_id: 'user-2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    for (const f of initialFolders) {
      await database.run(
        'INSERT INTO folders (id, name, parent_id, organization_id, created_by_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [f.id, f.name, f.parent_id, f.organization_id, f.created_by_id, f.created_at, f.updated_at]
      );
    }
  }

  const documentCount = await database.get('SELECT COUNT(*) as count FROM documents');
  if (documentCount.count === 0) {
    const initialDocs = [
      {
        id: 'doc-1',
        name: 'Architecture Design',
        original_name: 'arch_v1.pdf',
        extension: 'pdf',
        mime_type: 'application/pdf',
        size: 102456,
        version: 1,
        folder_id: 'folder-1',
        owner_id: 'user-1',
        uploaded_by_id: 'user-1',
        project_id: 'proj-1',
        department_id: 'dept-1',
        tags: JSON.stringify(['architecture', 'cloud']),
        description: 'System design for new enterprise oper core',
        visibility: 'organization',
        storage_path: '/storage/arch_v1.pdf',
        download_url: '/api/v1/documents/doc-1/download',
        preview_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        versions: JSON.stringify([]),
        shares: JSON.stringify([]),
        activities: JSON.stringify([])
      }
    ];
    for (const d of initialDocs) {
      await database.run(
        'INSERT INTO documents (id, name, original_name, extension, mime_type, size, version, folder_id, owner_id, uploaded_by_id, project_id, department_id, tags, description, visibility, storage_path, download_url, preview_url, created_at, updated_at, versions, shares, activities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [d.id, d.name, d.original_name, d.extension, d.mime_type, d.size, d.version, d.folder_id, d.owner_id, d.uploaded_by_id, d.project_id, d.department_id, d.tags, d.description, d.visibility, d.storage_path, d.download_url, d.preview_url, d.created_at, d.updated_at, d.versions, d.shares, d.activities]
      );
    }
  }

  const categoryCount = await database.get('SELECT COUNT(*) as count FROM asset_categories');
  if (categoryCount.count === 0) {
    const initialCategories = [
      { id: 'cat-1', name: 'Laptops', description: 'Developer and general employee laptops', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'cat-2', name: 'Monitors', description: 'High resolution monitors and displays', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
    for (const cat of initialCategories) {
      await database.run(
        'INSERT INTO asset_categories (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [cat.id, cat.name, cat.description, cat.created_at, cat.updated_at]
      );
    }
  }

  const assetCount = await database.get('SELECT COUNT(*) as count FROM assets');
  if (assetCount.count === 0) {
    const initialAssets = [
      {
        id: 'asset-1',
        asset_code: 'AST-2024-001',
        name: 'MacBook Pro 16"',
        description: 'M3 Max 64GB Ram, 1TB SSD Developer workstation',
        category_id: 'cat-1',
        brand: 'Apple',
        model: 'MacBook Pro M3 Max',
        serial_number: 'C02G2007Q05F',
        purchase_date: '2024-01-10',
        purchase_price: 3499,
        vendor: 'Apple Store Enterprise',
        status: 'Assigned',
        condition: 'Excellent',
        assigned_employee_id: 'user-1',
        assigned_department_id: 'dept-1',
        assigned_project_id: 'proj-1',
        location: 'HQ Office',
        warranty_start: '2024-01-10',
        warranty_end: '2027-01-10',
        next_maintenance: '2024-07-10',
        last_maintenance: '2024-01-10',
        barcode: 'AST-2024-001',
        qr_code: 'AST-2024-001',
        notes: 'Developer primary machine.',
        attachments: JSON.stringify([]),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'asset-2',
        asset_code: 'AST-2024-002',
        name: 'Dell UltraSharp 32" 4K',
        description: 'IPS black panel USB-C monitor',
        category_id: 'cat-2',
        brand: 'Dell',
        model: 'U3223QE',
        serial_number: 'MX-012345-DL',
        purchase_date: '2024-02-15',
        purchase_price: 899,
        vendor: 'Dell Business',
        status: 'Available',
        condition: 'Good',
        assigned_employee_id: null,
        assigned_department_id: null,
        assigned_project_id: null,
        location: 'IT Storage Room B',
        warranty_start: '2024-02-15',
        warranty_end: '2027-02-15',
        next_maintenance: '2025-02-15',
        last_maintenance: null,
        barcode: 'AST-2024-002',
        qr_code: 'AST-2024-002',
        notes: 'Unassigned stock monitor.',
        attachments: JSON.stringify([]),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    for (const a of initialAssets) {
      await database.run(
        'INSERT INTO assets (id, asset_code, name, description, category_id, brand, model, serial_number, purchase_date, purchase_price, vendor, status, condition, assigned_employee_id, assigned_department_id, assigned_project_id, location, warranty_start, warranty_end, next_maintenance, last_maintenance, barcode, qr_code, notes, attachments, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [a.id, a.asset_code, a.name, a.description, a.category_id, a.brand, a.model, a.serial_number, a.purchase_date, a.purchase_price, a.vendor, a.status, a.condition, a.assigned_employee_id, a.assigned_department_id, a.assigned_project_id, a.location, a.warranty_start, a.warranty_end, a.next_maintenance, a.last_maintenance, a.barcode, a.qr_code, a.notes, a.attachments, a.created_at, a.updated_at]
      );
    }
  }

  const notifCount = await database.get('SELECT COUNT(*) as count FROM notifications');
  if (notifCount.count === 0) {
    const initialNotifs = [
      { id: 'notif-1', user_id: 'user-1', type: 'System Alerts', title: 'System Core Online', message: 'The enterprise operational core started successfully.', priority: 'Normal', is_read: 0, link_url: null, metadata: '{}', created_at: new Date().toISOString() },
      { id: 'notif-2', user_id: 'user-1', type: 'Task Assigned', title: 'New Task Assigned', message: 'Establish cloud SQL instance architecture task was assigned to you.', priority: 'High', is_read: 0, link_url: '/dashboard', metadata: '{"task_id": "task-1"}', created_at: new Date().toISOString() }
    ];
    for (const n of initialNotifs) {
      await database.run(
        'INSERT INTO notifications (id, user_id, type, title, message, priority, is_read, link_url, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [n.id, n.user_id, n.type, n.title, n.message, n.priority, n.is_read, n.link_url, n.metadata, n.created_at]
      );
    }
  }

  const prefCount = await database.get('SELECT COUNT(*) as count FROM notification_preferences');
  if (prefCount.count === 0) {
    const initialPrefs = [
      { user_id: 'user-1', email_notifications: 1, push_notifications: 1, sms_notifications: 0, in_app_notifications: 1, muted_types: JSON.stringify([]), digest_frequency: 'Immediate' },
      { user_id: 'user-2', email_notifications: 1, push_notifications: 1, sms_notifications: 0, in_app_notifications: 1, muted_types: JSON.stringify([]), digest_frequency: 'Immediate' },
      { user_id: 'user-3', email_notifications: 1, push_notifications: 1, sms_notifications: 0, in_app_notifications: 1, muted_types: JSON.stringify([]), digest_frequency: 'Immediate' }
    ];
    for (const p of initialPrefs) {
      await database.run(
        'INSERT INTO notification_preferences (user_id, email_notifications, push_notifications, sms_notifications, in_app_notifications, muted_types, digest_frequency) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [p.user_id, p.email_notifications, p.push_notifications, p.sms_notifications, p.in_app_notifications, p.muted_types, p.digest_frequency]
      );
    }
  }
}

initDb().then(() => {
  console.log('[SQLite] Database initialized successfully.');
}).catch(err => {
  console.error('[SQLite] Database initialization failed:', err);
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// IN-MEMORY DATA STORAGE (MOCKED DATABASE)
// ==========================================

const MOCK_USER = {
  id: 'user-1',
  email: 'admin@company.com',
  first_name: 'Admin',
  last_name: 'User',
  is_superuser: true,
  is_verified: true,
  is_active: true,
  phone_number: '+1234567890',
  roles: ['Super Administrator'],
  permissions: [
    'permissions.manage',
    'roles.manage',
    'calendar.view',
    'calendar.create',
    'calendar.update',
    'calendar.delete',
    'meeting.create',
    'meeting.update',
    'meeting.delete',
    'documents.view',
    'documents.create',
    'documents.delete'
  ],
  organization_id: 'org-1',
  department_id: 'dept-1'
};

let users = [
  MOCK_USER,
  {
    id: 'user-2',
    email: 'sarah.chen@company.com',
    first_name: 'Sarah',
    last_name: 'Chen',
    is_superuser: false,
    is_verified: true,
    is_active: true,
    phone_number: '+1987654321',
    roles: ['CTO'],
    permissions: [],
    organization_id: 'org-1',
    department_id: 'dept-1'
  },
  {
    id: 'user-3',
    email: 'michael.rodriguez@company.com',
    first_name: 'Michael',
    last_name: 'Rodriguez',
    is_superuser: false,
    is_verified: true,
    is_active: true,
    phone_number: '+1555666777',
    roles: ['Manager'],
    permissions: [],
    organization_id: 'org-1',
    department_id: 'dept-2'
  }
];

let departments = [
  { id: 'dept-1', name: 'Engineering', description: 'Core software product engineering', organization_id: 'org-1', code: 'ENG' },
  { id: 'dept-2', name: 'Marketing', description: 'Product branding and user growth', organization_id: 'org-1', code: 'MKT' },
  { id: 'dept-3', name: 'Human Resources', description: 'Talent acquisition and operations', organization_id: 'org-1', code: 'HR' }
];

let organization = {
  id: 'org-1',
  name: 'BusinessOS AI Corp',
  slug: 'businessos-ai',
  description: 'Leading enterprise operating system with AI workspace automation.',
  website: 'https://businessos-ai.com',
  contact_email: 'info@businessos-ai.com',
  contact_phone: '+1 (800) 555-0199',
  address: '100 Innovation Way',
  city: 'Tech Valley',
  state: 'California',
  country: 'United States',
  postal_code: '94043'
};

let roles = [
  { id: 'role-1', name: 'Super Administrator', description: 'Unrestricted structural administrative policy configuration privileges.', permissions: [
    { id: 'perm-1', name: 'permissions.manage' },
    { id: 'perm-2', name: 'roles.manage' },
    { id: 'perm-3', name: 'calendar.view' },
    { id: 'perm-4', name: 'calendar.create' },
    { id: 'perm-5', name: 'calendar.update' },
    { id: 'perm-6', name: 'calendar.delete' },
    { id: 'perm-7', name: 'meeting.create' },
    { id: 'perm-8', name: 'meeting.update' },
    { id: 'perm-9', name: 'meeting.delete' },
    { id: 'perm-10', name: 'documents.view' },
    { id: 'perm-11', name: 'documents.create' },
    { id: 'perm-12', name: 'documents.delete' }
  ] },
  { id: 'role-2', name: 'Manager', description: 'Departmental operational control scopes.', permissions: [] }
];

let permissions = [
  { id: 'perm-1', name: 'permissions.manage', description: 'Configure security policies.', module: 'permissions', action: 'manage' },
  { id: 'perm-2', name: 'roles.manage', description: 'Manage user role assignments.', module: 'roles', action: 'manage' },
  { id: 'perm-3', name: 'calendar.view', description: 'View calendar page and events.', module: 'calendar', action: 'view' },
  { id: 'perm-4', name: 'calendar.create', description: 'Create general calendar events.', module: 'calendar', action: 'create' },
  { id: 'perm-5', name: 'calendar.update', description: 'Update existing calendar events.', module: 'calendar', action: 'update' },
  { id: 'perm-6', name: 'calendar.delete', description: 'Delete calendar events.', module: 'calendar', action: 'delete' },
  { id: 'perm-7', name: 'meeting.create', description: 'Schedule team meetings.', module: 'meeting', action: 'create' },
  { id: 'perm-8', name: 'meeting.update', description: 'Update scheduled meeting parameters.', module: 'meeting', action: 'update' },
  { id: 'perm-9', name: 'meeting.delete', description: 'Cancel and delete scheduled meetings.', module: 'meeting', action: 'delete' },
  { id: 'perm-10', name: 'documents.view', description: 'View and read documents.', module: 'documents', action: 'view' },
  { id: 'perm-11', name: 'documents.create', description: 'Upload and create documents.', module: 'documents', action: 'create' },
  { id: 'perm-12', name: 'documents.delete', description: 'Delete documents from the workstation.', module: 'documents', action: 'delete' }
];

let clients = [];
let projects = [];
let tasks = [];

let workflows = [
  { id: 'wf-1', name: 'Invoice Dispatch Automation', description: 'Trigger PDF invoice dispatches to client contacts on project milestone completions.', status: 'ACTIVE', executionCount: 142, successRate: 99, updatedAt: '2024-05-12T14:30:00Z' },
  { id: 'wf-2', name: 'Security Log Audit Scan', description: 'Hourly scans of system access logs for suspicious administrative policy alterations.', status: 'PAUSED', executionCount: 1054, successRate: 100, updatedAt: '2024-06-01T09:00:00Z' },
  { id: 'wf-3', name: 'CRM Hubspot Contact Sync', description: 'Real-time synchronization of customer contact metadata with external Hubspot CRM services.', status: 'FAILED', executionCount: 88, successRate: 85, updatedAt: '2024-07-18T16:15:00Z' }
];

let workflowExecutions = {
  'wf-1': [
    { id: 'exec-wf-1-1', workflowId: 'wf-1', status: 'SUCCESS', startedAt: '2024-05-12T14:30:00Z', completedAt: '2024-05-12T14:30:05Z', logs: ['Triggered successfully', 'Dispatched PDF to client'] }
  ],
  'wf-2': [
    { id: 'exec-wf-2-1', workflowId: 'wf-2', status: 'SUCCESS', startedAt: '2024-06-01T09:00:00Z', completedAt: '2024-06-01T09:00:10Z', logs: ['Triggered successfully', 'Security logs clear'] }
  ],
  'wf-3': [
    { id: 'exec-wf-3-1', workflowId: 'wf-3', status: 'FAILED', startedAt: '2024-07-18T16:15:00Z', completedAt: '2024-07-18T16:15:12Z', logs: ['Triggered successfully', 'API error: Hubspot key expired (401 Unauthorized)'] }
  ]
};

let auditLogs = [
  { id: 'log-1', createdAt: '2024-07-19T05:00:00Z', action: 'LOGIN', userId: 'user-1', userEmail: 'admin@company.com', resourceType: 'user', resourceId: 'user-1', ipAddress: '127.0.0.1', details: { "user_agent": "Mozilla/5.0", "status": "SUCCESS" } },
  { id: 'log-2', createdAt: '2024-07-19T05:10:00Z', action: 'CREATE', userId: 'user-1', userEmail: 'admin@company.com', resourceType: 'project', resourceId: 'proj-1', ipAddress: '127.0.0.1', details: { "project_name": "Cloud Workspace Migration" } }
];

let chatChannels = [
  { id: 'chan-1', name: 'General Chat', description: 'Global company announcements and team-wide conversation.', type: 'public', unread_count: 0, last_message: { id: 'msg-1', content: 'Welcome to BusinessOS AI workspace!', sender_id: 'user-1', sender_name: 'Admin User', created_at: '2024-07-19T04:00:00Z' } }
];

let chatMessages = {
  'chan-1': [
    { id: 'msg-1', content: 'Welcome to BusinessOS AI workspace!', sender_id: 'user-1', sender_name: 'Admin User', created_at: '2024-07-19T04:00:00Z', reactions: [] }
  ]
};

let notifications = [
  { id: 'notif-1', title: 'System Core Online', message: 'The enterprise operational core started successfully.', type: 'System Alerts', is_read: false, created_at: '2024-07-19T05:00:00Z', link_url: null }
];

let calendarEvents = [
  { id: 'event-1', title: 'Q3 Planning Review', description: 'Align priorities for workspace automation and workflows.', start: '2024-07-20T10:00:00Z', end: '2024-07-20T11:30:00Z', event_type: 'meeting', project_id: 'proj-1', color: '#4f46e5' }
];

let meetings = [
  { id: 'meet-1', title: 'Sprint Sync Meeting', description: 'Review outstanding tasks and blockers.', start_time: '2024-07-21T09:00:00Z', end_time: '2024-07-21T10:00:00Z', meeting_type: 'Internal', status: 'Scheduled', project_id: 'proj-1', organizer_id: 'user-1', participants: [], notes: [] }
];

let meetingNotes = {
  'meet-1': []
};

let systemSettings = {
  general: { companyName: 'BusinessOS AI Corp', supportEmail: 'info@businessos-ai.com', timezone: 'UTC', currency: 'USD' },
  security: { mfaRequired: false, passwordExpiryDays: 90, sessionTimeoutMinutes: 60 },
  notifications: { emailEnabled: true },
  features: { chatEnabled: true, aiEnabled: true }
};

let aiSessions = [
  { id: 'session-1', title: 'Initial Workspace Setup', created_at: '2024-07-19T04:00:00Z' }
];

let aiHistories = {
  'session-1': [
    { id: 'ai-msg-1', role: 'assistant', content: 'Hello! I am your BusinessOS AI Assistant. How can I help you automate your tasks today?' }
  ]
};

// ==========================================
// MIDDLEWARES
// ==========================================

const apiRouter = express.Router();

// Logger
apiRouter.use((req, res, next) => {
  console.log(`[API MOCK] ${req.method} ${req.path}`);
  next();
});

// ==========================================
// ROUTE IMPLEMENTATIONS
// ==========================================

// Auth Login
apiRouter.post('/auth/login', (req, res) => {
  res.json({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    token_type: 'bearer',
    user: MOCK_USER
  });
});

// Auth Refresh
apiRouter.post('/auth/refresh', (req, res) => {
  res.json({
    access_token: 'mock-new-access-token'
  });
});

// Users / Employees
apiRouter.get('/users/me', (req, res) => {
  res.json({ success: true, data: MOCK_USER });
});

apiRouter.get('/users', (req, res) => {
  res.json({ success: true, data: users });
});

apiRouter.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id) || MOCK_USER;
  res.json({ success: true, data: user });
});

apiRouter.post('/users', (req, res) => {
  const newUser = { id: `user-${Date.now()}`, ...req.body, is_verified: true, is_active: true };
  users.push(newUser);
  res.json({ success: true, data: newUser });
});

apiRouter.patch('/users/:id', (req, res) => {
  users = users.map(u => u.id === req.params.id ? { ...u, ...req.body } : u);
  const updated = users.find(u => u.id === req.params.id);
  res.json({ success: true, data: updated });
});

apiRouter.delete('/users/:id', (req, res) => {
  const removed = users.find(u => u.id === req.params.id);
  users = users.filter(u => u.id !== req.params.id);
  res.json({ success: true, data: removed });
});

apiRouter.patch('/users/:id/roles', (req, res) => {
  users = users.map(u => u.id === req.params.id ? { ...u, roles: req.body } : u);
  const updated = users.find(u => u.id === req.params.id);
  res.json({ success: true, data: updated });
});

apiRouter.patch('/users/:id/department', (req, res) => {
  const deptId = req.query.department_id || null;
  users = users.map(u => u.id === req.params.id ? { ...u, department_id: deptId } : u);
  const updated = users.find(u => u.id === req.params.id);
  res.json({ success: true, data: updated });
});

apiRouter.patch('/users/:id/status', (req, res) => {
  const active = req.query.is_active === 'true';
  users = users.map(u => u.id === req.params.id ? { ...u, is_active: active } : u);
  const updated = users.find(u => u.id === req.params.id);
  res.json({ success: true, data: updated });
});

apiRouter.post('/users/invite', (req, res) => {
  const newUser = { id: `user-${Date.now()}`, ...req.body, is_verified: false, is_active: true };
  users.push(newUser);
  res.json({ success: true, data: newUser });
});

apiRouter.post('/users/bulk-import', (req, res) => {
  const payloads = req.body;
  const imported = payloads.map(p => ({ id: `user-${Date.now()}-${Math.random()}`, ...p, is_verified: true, is_active: true }));
  users.push(...imported);
  res.json({ success: true, data: imported });
});

apiRouter.get('/users/export', (req, res) => {
  res.json({ success: true, data: users });
});

// Departments
apiRouter.get('/departments', (req, res) => {
  res.json({ success: true, data: departments });
});

apiRouter.get('/departments/:id', (req, res) => {
  const dept = departments.find(d => d.id === req.params.id) || departments[0];
  res.json({ success: true, data: dept });
});

apiRouter.get('/departments/organization/:orgId', (req, res) => {
  res.json({ success: true, data: departments });
});

apiRouter.post('/departments', (req, res) => {
  const newDept = { id: `dept-${Date.now()}`, ...req.body };
  departments.push(newDept);
  res.json({ success: true, data: newDept });
});

apiRouter.patch('/departments/:id', (req, res) => {
  departments = departments.map(d => d.id === req.params.id ? { ...d, ...req.body } : d);
  const updated = departments.find(d => d.id === req.params.id);
  res.json({ success: true, data: updated });
});

apiRouter.delete('/departments/:id', (req, res) => {
  const removed = departments.find(d => d.id === req.params.id);
  departments = departments.filter(d => d.id !== req.params.id);
  res.json({ success: true, data: removed });
});

apiRouter.get('/departments/:id/employees', (req, res) => {
  const deptUsers = users.filter(u => u.department_id === req.params.id);
  res.json({ success: true, data: deptUsers });
});

// Dashboard
apiRouter.get('/dashboard/overview', async (req, res) => {
  try {
    const db = await getDb();
    const projectsRows = await db.all('SELECT * FROM projects');
    const tasksRows = await db.all('SELECT * FROM tasks');

    const mappedProjects = projectsRows.map(r => ({
      ...r,
      members: JSON.parse(r.members || '[]'),
      milestones: JSON.parse(r.milestones || '[]')
    }));

    const mappedTasks = tasksRows.map(r => ({
      ...r,
      comments: JSON.parse(r.comments || '[]'),
      subtasks: JSON.parse(r.subtasks || '[]')
    }));

    res.json({
      success: true,
      data: {
        metrics: {
          revenue: { title: 'Monthly Revenue', value: 125000, change: 12.5, trend: 'up' },
          active_employees: { title: 'Active Employees', value: users.length, change: 0.0, trend: 'neutral' },
          active_projects: { title: 'Active Projects', value: mappedProjects.length, change: 20.0, trend: 'up' },
          completed_tasks: { title: 'Completed Tasks', value: mappedTasks.filter(t => t.status === 'Completed').length || 45, change: 8.5, trend: 'up' }
        },
        charts: {
          revenue_trend: [
            { name: 'Jan', revenue: 100000, expenses: 80000 },
            { name: 'Feb', revenue: 110000, expenses: 85000 },
            { name: 'Mar', revenue: 125000, expenses: 90000 },
            { name: 'Apr', revenue: 130000, expenses: 95000 },
            { name: 'May', revenue: 140000, expenses: 100000 },
            { name: 'Jun', revenue: 150000, expenses: 105000 }
          ],
          employee_growth: [
            { name: 'Jan', count: Math.max(1, users.length - 4) },
            { name: 'Feb', count: Math.max(2, users.length - 2) },
            { name: 'Mar', count: Math.max(3, users.length - 1) },
            { name: 'Apr', count: Math.max(4, users.length) },
            { name: 'May', count: Math.max(4, users.length) },
            { name: 'Jun', count: users.length }
          ],
          projects_by_status: [
            { name: 'Planning', value: mappedProjects.filter(p => p.status === 'Planning').length || 1 },
            { name: 'In Progress', value: mappedProjects.filter(p => p.status === 'In Progress').length || 2 },
            { name: 'Completed', value: mappedProjects.filter(p => p.status === 'Completed').length || 0 },
            { name: 'On Hold', value: mappedProjects.filter(p => p.status === 'On Hold').length || 0 }
          ]
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.get('/dashboard/ai-insights', async (req, res) => {
  try {
    const database = await getDb();
    const projectsRows = await database.all('SELECT * FROM projects');
    const tasksRows = await database.all('SELECT * FROM tasks');

    const mappedProjects = projectsRows.map(r => ({
      ...r,
      members: JSON.parse(r.members || '[]'),
      milestones: JSON.parse(r.milestones || '[]')
    }));

    const mappedTasks = tasksRows.map(r => ({
      ...r,
      comments: JSON.parse(r.comments || '[]'),
      subtasks: JSON.parse(r.subtasks || '[]')
    }));

    const totalRevenue = 125000;
    const revenueGrowth = 12.5;
    const revenueTrendData = [
      { name: 'Jan', revenue: 100000, expenses: 80000 },
      { name: 'Feb', revenue: 110000, expenses: 85000 },
      { name: 'Mar', revenue: 125000, expenses: 90000 },
      { name: 'Apr', revenue: 130000, expenses: 95000 },
      { name: 'May', revenue: 140000, expenses: 100000 },
      { name: 'Jun', revenue: 150000, expenses: 105000 }
    ];

    const fallbackInsights = {
      summary: "Revenue is showing strong upwards momentum from Q1 through Q2, but active task progression has minor backlogs in Planning.",
      trends: [
        {
          category: "revenue",
          type: "positive",
          title: "Strong Revenue Progression",
          metric: "+50% Revenue Growth",
          description: "Monthly revenue has expanded from $100,000 in January to $150,000 in June, significantly outpacing the moderate rise in operational costs.",
          impact: "Substantially increases cash reserves and increases overall margins to 30%."
        },
        {
          category: "tasks",
          type: "warning",
          title: "Project Launch Delays",
          metric: `${mappedProjects.filter(p => p.status === 'Planning').length} Project in Planning`,
          description: "Projects like 'Enterprise Security Audit' are currently held in the Planning phase with only minimal hours logged.",
          impact: "Risk of missing critical project delivery milestones if not staffed shortly."
        },
        {
          category: "tasks",
          type: "neutral",
          title: "Active Task Progress",
          metric: `${mappedTasks.filter(t => t.status === 'In Progress').length} Tasks In Progress`,
          description: "Core tasks under the 'Cloud Workspace Migration' are progressing, with active team members logging real hours.",
          impact: "Maintains positive delivery momentum for the key Q3 client account."
        }
      ],
      recommendations: [
        {
          title: "Allocate Staff to Security Audit",
          description: "Transition engineers to start establishing scope and milestones for the Enterprise Security Audit project to initiate progress.",
          priority: "High"
        },
        {
          title: "Streamline High-Priority Backlog",
          description: "Review and reassign the High priority tasks that are currently stuck in 'Todo' status to reduce team blockers.",
          priority: "Medium"
        }
      ]
    };

    const apiKey = process.env.GEMINI_API_KEY || '';
    if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
      try {
        if (!aiInstance) {
          aiInstance = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
              headers: {
                'User-Agent': 'aistudio-build',
              }
            }
          });
        }

        const systemInstruction = `You are BusinessOS AI, an intelligent, context-aware enterprise workspace copilot.
Your goal is to analyze real-time company telemetry and generate a highly structured, professional, executive business insights report in JSON format.
Analyze the provided metrics, revenue trends, projects, and task database to highlight critical positive milestones, negative/warning concerns, and highly actionable suggestions.
Your output must be strict JSON matching this structure:
{
  "trends": [
    {
      "category": "revenue" | "tasks",
      "type": "positive" | "negative" | "warning" | "neutral",
      "title": "Insight Title (brief)",
      "metric": "Key stat or metric string (e.g. '$150K revenue', '2 pending tasks')",
      "description": "Elaborate the insight with data context, identifying what the trend or anomaly is.",
      "impact": "What is the concrete impact of this trend on the business?"
    }
  ],
  "recommendations": [
    {
      "title": "Actionable Recommendation Title",
      "description": "Clear step-by-step or strategic advice based on the data.",
      "priority": "High" | "Medium" | "Low"
    }
  ],
  "summary": "A concise executive paragraph summarizing the overall state of the business."
}
Return only the raw JSON. No markdown backticks, no markdown formatting. Just raw JSON text.`;

        const workspaceContext = `
REVENUE CURRENT METRICS:
Total current: $${totalRevenue}, Growth: ${revenueGrowth}%, Trend: UP.
Monthly Revenue History: ${JSON.stringify(revenueTrendData)}

PROJECTS DATA:
${JSON.stringify(mappedProjects.map(p => ({ name: p.name, status: p.status, priority: p.priority, budget: p.budget, progress: p.progress, health: p.health })))}

TASKS DATA:
${JSON.stringify(mappedTasks.map(t => ({ title: t.title, status: t.status, priority: t.priority, progress: t.progress })))}
`;

        const response = await aiInstance.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: [{ parts: [{ text: "Analyze the following business workspace dataset and output the report as specified:\n" + workspaceContext }] }],
          config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
          }
        });

        let cleanedText = (response.text || "").trim();
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.slice(7);
        }
        if (cleanedText.endsWith('```')) {
          cleanedText = cleanedText.slice(0, -3);
        }
        cleanedText = cleanedText.trim();
        const insights = JSON.parse(cleanedText);
        return res.json({ success: true, data: insights });
      } catch (geminiErr) {
        console.error('Failed to get Gemini insights, falling back:', geminiErr);
        return res.json({ success: true, data: fallbackInsights });
      }
    } else {
      return res.json({ success: true, data: fallbackInsights });
    }
  } catch (err) {
    console.error('Insights router failed:', err);
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.get('/dashboard/activities', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'act-1', type: 'project', title: 'Cloud Workspace Migration Started', description: 'Admin started the workspace migration roadmap.', user: 'Admin User' },
      { id: 'act-2', type: 'employee', title: 'New Employee Onboarded', description: 'Sarah Chen joined the Engineering team.', user: 'Admin User' }
    ]
  });
});

apiRouter.get('/dashboard/events', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'event-1', title: 'Q3 Central Planning', type: 'meeting', time: '10:00 AM' },
      { id: 'event-2', title: 'Product Sprint Review', type: 'review', time: '2:30 PM' }
    ]
  });
});

apiRouter.get('/dashboard/notifications', (req, res) => {
  res.json({ success: true, data: notifications });
});

// Organizations
apiRouter.get('/organizations', (req, res) => {
  res.json({ success: true, data: [organization] });
});

apiRouter.get('/organizations/current', (req, res) => {
  res.json({ success: true, data: organization });
});

apiRouter.patch('/organizations/current', (req, res) => {
  organization = { ...organization, ...req.body };
  res.json({ success: true, data: organization });
});

apiRouter.post('/organizations', (req, res) => {
  const newOrg = { id: `org-${Date.now()}`, ...req.body };
  res.json({ success: true, data: newOrg });
});

apiRouter.delete('/organizations/:id', (req, res) => {
  res.json({ success: true, data: organization });
});

// Roles
apiRouter.get('/roles', (req, res) => {
  res.json({ success: true, data: roles });
});

apiRouter.post('/roles', (req, res) => {
  const newRole = { id: `role-${Date.now()}`, ...req.body, permissions: [] };
  roles.push(newRole);
  res.json({ success: true, data: newRole });
});

apiRouter.patch('/roles/:id', (req, res) => {
  roles = roles.map(r => r.id === req.params.id ? { ...r, ...req.body } : r);
  const updated = roles.find(r => r.id === req.params.id);
  res.json({ success: true, data: updated });
});

apiRouter.delete('/roles/:id', (req, res) => {
  const removed = roles.find(r => r.id === req.params.id);
  roles = roles.filter(r => r.id !== req.params.id);
  res.json({ success: true, data: removed });
});

// Permissions
apiRouter.get('/permissions', (req, res) => {
  res.json({ success: true, data: permissions });
});

apiRouter.post('/permissions', (req, res) => {
  const newPerm = { id: `perm-${Date.now()}`, ...req.body };
  permissions.push(newPerm);
  res.json({ success: true, data: newPerm });
});

apiRouter.patch('/permissions/:id', (req, res) => {
  permissions = permissions.map(p => p.id === req.params.id ? { ...p, ...req.body } : p);
  const updated = permissions.find(p => p.id === req.params.id);
  res.json({ success: true, data: updated });
});

apiRouter.delete('/permissions/:id', (req, res) => {
  const removed = permissions.find(p => p.id === req.params.id);
  permissions = permissions.filter(p => p.id !== req.params.id);
  res.json({ success: true, data: removed });
});

apiRouter.get('/permissions/modules', (req, res) => {
  res.json({ success: true, data: ['permissions', 'roles', 'users', 'departments', 'projects', 'tasks', 'calendar', 'meetings'] });
});

apiRouter.get('/permissions/actions', (req, res) => {
  res.json({ success: true, data: ['read', 'create', 'update', 'delete', 'manage'] });
});

// Clients
apiRouter.get('/clients', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM clients');
    const data = rows.map(r => ({ ...r, contacts: JSON.parse(r.contacts || '[]') }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/clients', async (req, res) => {
  try {
    const db = await getDb();
    const id = `client-${Date.now()}`;
    const newClient = { id, ...req.body, contacts: [] };
    await db.run(
      'INSERT INTO clients (id, company_name, client_code, industry, website, email, phone, status, city, country, notes, contacts) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        newClient.company_name,
        newClient.client_code,
        newClient.industry,
        newClient.website,
        newClient.email,
        newClient.phone,
        newClient.status,
        newClient.city,
        newClient.country,
        newClient.notes,
        JSON.stringify([])
      ]
    );
    res.json({ success: true, data: newClient });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.patch('/clients/:id', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, detail: 'Client not found' });

    const currentClient = { ...row, contacts: JSON.parse(row.contacts || '[]') };
    const updatedClient = { ...currentClient, ...req.body };

    await db.run(
      `UPDATE clients SET
        company_name = ?, client_code = ?, industry = ?, website = ?,
        email = ?, phone = ?, status = ?, city = ?, country = ?, notes = ?, contacts = ?
       WHERE id = ?`,
      [
        updatedClient.company_name,
        updatedClient.client_code,
        updatedClient.industry,
        updatedClient.website,
        updatedClient.email,
        updatedClient.phone,
        updatedClient.status,
        updatedClient.city,
        updatedClient.country,
        updatedClient.notes,
        JSON.stringify(updatedClient.contacts),
        req.params.id
      ]
    );
    res.json({ success: true, data: updatedClient });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/clients/:id', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, detail: 'Client not found' });

    await db.run('DELETE FROM clients WHERE id = ?', [req.params.id]);
    const removed = { ...row, contacts: JSON.parse(row.contacts || '[]') };
    res.json({ success: true, data: removed });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/clients/:clientId/contacts', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.clientId]);
    if (row) {
      const contacts = JSON.parse(row.contacts || '[]');
      const contact = { id: `contact-${Date.now()}`, ...req.body };
      contacts.push(contact);
      await db.run('UPDATE clients SET contacts = ? WHERE id = ?', [JSON.stringify(contacts), req.params.clientId]);
      res.json({ success: true, data: contact });
    } else {
      res.status(404).json({ success: false, detail: 'Client not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.patch('/clients/:clientId/contacts/:contactId', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.clientId]);
    if (row) {
      let contacts = JSON.parse(row.contacts || '[]');
      contacts = contacts.map(ct => ct.id === req.params.contactId ? { ...ct, ...req.body } : ct);
      const updated = contacts.find(ct => ct.id === req.params.contactId);
      await db.run('UPDATE clients SET contacts = ? WHERE id = ?', [JSON.stringify(contacts), req.params.clientId]);
      res.json({ success: true, data: updated });
    } else {
      res.status(404).json({ success: false, detail: 'Client or contact not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/clients/:clientId/contacts/:contactId', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM clients WHERE id = ?', [req.params.clientId]);
    if (row) {
      let contacts = JSON.parse(row.contacts || '[]');
      const removed = contacts.find(ct => ct.id === req.params.contactId);
      contacts = contacts.filter(ct => ct.id !== req.params.contactId);
      await db.run('UPDATE clients SET contacts = ? WHERE id = ?', [JSON.stringify(contacts), req.params.clientId]);
      res.json({ success: true, data: removed });
    } else {
      res.status(404).json({ success: false, detail: 'Client or contact not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

// Projects
apiRouter.get('/projects', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM projects');
    const data = rows.map(r => ({
      ...r,
      members: JSON.parse(r.members || '[]'),
      milestones: JSON.parse(r.milestones || '[]')
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/projects', async (req, res) => {
  try {
    const db = await getDb();
    const id = `proj-${Date.now()}`;
    const newProj = { id, ...req.body, progress: 0, members: [], milestones: [] };
    await db.run(
      `INSERT INTO projects (id, name, project_code, description, client_id, status, priority, budget, currency, start_date, end_date, estimated_hours, actual_hours, progress, health, project_manager_id, members, milestones)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        newProj.name,
        newProj.project_code,
        newProj.description,
        newProj.client_id,
        newProj.status,
        newProj.priority,
        newProj.budget,
        newProj.currency,
        newProj.start_date,
        newProj.end_date,
        newProj.estimated_hours,
        newProj.actual_hours,
        0,
        newProj.health,
        newProj.project_manager_id,
        JSON.stringify([]),
        JSON.stringify([])
      ]
    );
    res.json({ success: true, data: newProj });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.patch('/projects/:id', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, detail: 'Project not found' });

    const currentProj = {
      ...row,
      members: JSON.parse(row.members || '[]'),
      milestones: JSON.parse(row.milestones || '[]')
    };
    const updatedProj = { ...currentProj, ...req.body };

    await db.run(
      `UPDATE projects SET
        name = ?, project_code = ?, description = ?, client_id = ?,
        status = ?, priority = ?, budget = ?, currency = ?,
        start_date = ?, end_date = ?, estimated_hours = ?,
        actual_hours = ?, progress = ?, health = ?,
        project_manager_id = ?, members = ?, milestones = ?
       WHERE id = ?`,
      [
        updatedProj.name,
        updatedProj.project_code,
        updatedProj.description,
        updatedProj.client_id,
        updatedProj.status,
        updatedProj.priority,
        updatedProj.budget,
        updatedProj.currency,
        updatedProj.start_date,
        updatedProj.end_date,
        updatedProj.estimated_hours,
        updatedProj.actual_hours,
        updatedProj.progress,
        updatedProj.health,
        updatedProj.project_manager_id,
        JSON.stringify(updatedProj.members),
        JSON.stringify(updatedProj.milestones),
        req.params.id
      ]
    );
    res.json({ success: true, data: updatedProj });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/projects/:id', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, detail: 'Project not found' });

    await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    const removed = {
      ...row,
      members: JSON.parse(row.members || '[]'),
      milestones: JSON.parse(row.milestones || '[]')
    };
    res.json({ success: true, data: removed });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/projects/:id/members', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (row) {
      const members = JSON.parse(row.members || '[]');
      const member = { id: `mem-${Date.now()}`, ...req.body };
      members.push(member);
      await db.run('UPDATE projects SET members = ? WHERE id = ?', [JSON.stringify(members), req.params.id]);
      res.json({ success: true, data: member });
    } else {
      res.status(404).json({ success: false, detail: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/projects/:id/members/:memberId', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (row) {
      let members = JSON.parse(row.members || '[]');
      const removed = members.find(m => m.id === req.params.memberId);
      members = members.filter(m => m.id !== req.params.memberId);
      await db.run('UPDATE projects SET members = ? WHERE id = ?', [JSON.stringify(members), req.params.id]);
      res.json({ success: true, data: removed });
    } else {
      res.status(404).json({ success: false, detail: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/projects/:id/milestones', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (row) {
      const milestones = JSON.parse(row.milestones || '[]');
      const milestone = { id: `ms-${Date.now()}`, ...req.body };
      milestones.push(milestone);
      await db.run('UPDATE projects SET milestones = ? WHERE id = ?', [JSON.stringify(milestones), req.params.id]);
      res.json({ success: true, data: milestone });
    } else {
      res.status(404).json({ success: false, detail: 'Project not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.patch('/projects/:id/milestones/:milestoneId', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (row) {
      let milestones = JSON.parse(row.milestones || '[]');
      milestones = milestones.map(ms => ms.id === req.params.milestoneId ? { ...ms, ...req.body } : ms);
      const updated = milestones.find(ms => ms.id === req.params.milestoneId);
      await db.run('UPDATE projects SET milestones = ? WHERE id = ?', [JSON.stringify(milestones), req.params.id]);
      res.json({ success: true, data: updated });
    } else {
      res.status(404).json({ success: false, detail: 'Project or milestone not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/projects/:id/milestones/:milestoneId', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
    if (row) {
      let milestones = JSON.parse(row.milestones || '[]');
      const removed = milestones.find(ms => ms.id === req.params.milestoneId);
      milestones = milestones.filter(ms => ms.id !== req.params.milestoneId);
      await db.run('UPDATE projects SET milestones = ? WHERE id = ?', [JSON.stringify(milestones), req.params.id]);
      res.json({ success: true, data: removed });
    } else {
      res.status(404).json({ success: false, detail: 'Project or milestone not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

// Tasks
apiRouter.get('/tasks', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM tasks');
    const data = rows.map(r => ({
      ...r,
      comments: JSON.parse(r.comments || '[]'),
      subtasks: JSON.parse(r.subtasks || '[]')
    }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/tasks', async (req, res) => {
  try {
    const db = await getDb();
    const id = `task-${Date.now()}`;
    const newTask = { id, ...req.body, progress: 0, comments: [], subtasks: [] };
    await db.run(
      `INSERT INTO tasks (id, title, task_code, description, project_id, assignee_id, status, priority, estimated_hours, actual_hours, progress, start_date, due_date, comments, subtasks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        newTask.title,
        newTask.task_code,
        newTask.description,
        newTask.project_id,
        newTask.assignee_id,
        newTask.status,
        newTask.priority,
        newTask.estimated_hours,
        newTask.actual_hours,
        0,
        newTask.start_date,
        newTask.due_date,
        JSON.stringify([]),
        JSON.stringify([])
      ]
    );
    res.json({ success: true, data: newTask });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.patch('/tasks/:id', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, detail: 'Task not found' });

    const currentTask = {
      ...row,
      comments: JSON.parse(row.comments || '[]'),
      subtasks: JSON.parse(row.subtasks || '[]')
    };
    const updatedTask = { ...currentTask, ...req.body };

    await db.run(
      `UPDATE tasks SET
        title = ?, task_code = ?, description = ?, project_id = ?,
        assignee_id = ?, status = ?, priority = ?, estimated_hours = ?,
        actual_hours = ?, progress = ?, start_date = ?, due_date = ?,
        comments = ?, subtasks = ?
       WHERE id = ?`,
      [
        updatedTask.title,
        updatedTask.task_code,
        updatedTask.description,
        updatedTask.project_id,
        updatedTask.assignee_id,
        updatedTask.status,
        updatedTask.priority,
        updatedTask.estimated_hours,
        updatedTask.actual_hours,
        updatedTask.progress,
        updatedTask.start_date,
        updatedTask.due_date,
        JSON.stringify(updatedTask.comments),
        JSON.stringify(updatedTask.subtasks),
        req.params.id
      ]
    );
    res.json({ success: true, data: updatedTask });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/tasks/:id', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, detail: 'Task not found' });

    await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    const removed = {
      ...row,
      comments: JSON.parse(row.comments || '[]'),
      subtasks: JSON.parse(row.subtasks || '[]')
    };
    res.json({ success: true, data: removed });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/tasks/:taskId/comments', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
    if (row) {
      const comments = JSON.parse(row.comments || '[]');
      const comment = { id: `c-${Date.now()}`, content: req.body.content, user_id: 'user-1', user_name: 'Admin User', created_at: new Date().toISOString() };
      comments.push(comment);
      await db.run('UPDATE tasks SET comments = ? WHERE id = ?', [JSON.stringify(comments), req.params.taskId]);
      res.json({ success: true, data: comment });
    } else {
      res.status(404).json({ success: false, detail: 'Task not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/tasks/:taskId/comments/:commentId', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
    if (row) {
      let comments = JSON.parse(row.comments || '[]');
      const removed = comments.find(c => c.id === req.params.commentId);
      comments = comments.filter(c => c.id !== req.params.commentId);
      await db.run('UPDATE tasks SET comments = ? WHERE id = ?', [JSON.stringify(comments), req.params.taskId]);
      res.json({ success: true, data: removed });
    } else {
      res.status(404).json({ success: false, detail: 'Task or comment not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/tasks/:taskId/subtasks', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
    if (row) {
      const subtasks = JSON.parse(row.subtasks || '[]');
      const subtask = { id: `sub-${Date.now()}`, ...req.body };
      subtasks.push(subtask);
      await db.run('UPDATE tasks SET subtasks = ? WHERE id = ?', [JSON.stringify(subtasks), req.params.taskId]);
      res.json({ success: true, data: subtask });
    } else {
      res.status(404).json({ success: false, detail: 'Task not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.patch('/tasks/:taskId/subtasks/:subtaskId', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
    if (row) {
      let subtasks = JSON.parse(row.subtasks || '[]');
      subtasks = subtasks.map(st => st.id === req.params.subtaskId ? { ...st, ...req.body } : st);
      const updated = subtasks.find(st => st.id === req.params.subtaskId);
      await db.run('UPDATE tasks SET subtasks = ? WHERE id = ?', [JSON.stringify(subtasks), req.params.taskId]);
      res.json({ success: true, data: updated });
    } else {
      res.status(404).json({ success: false, detail: 'Task or subtask not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/tasks/:taskId/subtasks/:subtaskId', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
    if (row) {
      let subtasks = JSON.parse(row.subtasks || '[]');
      const removed = subtasks.find(st => st.id === req.params.subtaskId);
      subtasks = subtasks.filter(st => st.id !== req.params.subtaskId);
      await db.run('UPDATE tasks SET subtasks = ? WHERE id = ?', [JSON.stringify(subtasks), req.params.taskId]);
      res.json({ success: true, data: removed });
    } else {
      res.status(404).json({ success: false, detail: 'Task or subtask not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

// Workflows
apiRouter.get('/workflows', (req, res) => {
  res.json({ success: true, data: workflows });
});

apiRouter.get('/workflows/:id', (req, res) => {
  const wf = workflows.find(w => w.id === req.params.id) || workflows[0];
  res.json({ success: true, data: wf });
});

apiRouter.post('/workflows', (req, res) => {
  const newWf = { id: `wf-${Date.now()}`, ...req.body, executionCount: 0, successRate: 100, updatedAt: new Date().toISOString() };
  workflows.push(newWf);
  res.json({ success: true, data: newWf });
});

apiRouter.patch('/workflows/:id/status', (req, res) => {
  workflows = workflows.map(w => w.id === req.params.id ? { ...w, status: req.body.status } : w);
  const updated = workflows.find(w => w.id === req.params.id);
  res.json({ success: true, data: updated });
});

apiRouter.get('/workflows/:id/executions', (req, res) => {
  const execs = workflowExecutions[req.params.id] || [];
  res.json({
    success: true,
    data: execs
  });
});

apiRouter.post('/workflows/:id/run', (req, res) => {
  const id = req.params.id;
  const wf = workflows.find(w => w.id === id);
  if (wf) {
    wf.executionCount = (wf.executionCount || 0) + 1;
    wf.lastRunAt = new Date().toISOString();
    wf.updatedAt = new Date().toISOString();
    
    // If it was failed, let's reset it to ACTIVE when manual trigger succeeds
    if (wf.status === 'FAILED') {
      wf.status = 'ACTIVE';
    }
    
    // Increment success rate slightly or keep it high
    if (wf.successRate < 100) {
      wf.successRate = parseFloat(Math.min(100, wf.successRate + 0.5).toFixed(1));
    }

    if (!workflowExecutions[id]) {
      workflowExecutions[id] = [];
    }
    
    const newExec = {
      id: `exec-${Date.now()}`,
      workflowId: id,
      status: 'SUCCESS',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      logs: [
        'Manual execution triggered by user request',
        'Fetching context and configuration schemas',
        'Executing automation steps',
        'All actions completed successfully'
      ]
    };
    
    workflowExecutions[id].unshift(newExec);
    
    res.json({ success: true, data: wf });
  } else {
    res.status(404).json({ success: false, detail: 'Workflow not found' });
  }
});

// Audit Logs
apiRouter.get('/audit-logs', (req, res) => {
  res.json({
    success: true,
    data: {
      logs: auditLogs,
      total: auditLogs.length
    }
  });
});

apiRouter.get('/audit-logs/export', (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.send('Timestamp,Action,User,Resource,IP Address\n' + auditLogs.map(l => `${l.createdAt},${l.action},${l.userEmail},${l.resourceType},${l.ipAddress}`).join('\n'));
});

// Settings
apiRouter.get('/settings', (req, res) => {
  res.json({ success: true, data: systemSettings });
});

apiRouter.patch('/settings', (req, res) => {
  systemSettings = { ...systemSettings, ...req.body };
  res.json({ success: true, data: systemSettings });
});

// Chats
apiRouter.get('/chats', (req, res) => {
  res.json({
    success: true,
    data: {
      channels: chatChannels
    }
  });
});

apiRouter.get('/chats/:channelId/messages', (req, res) => {
  const msgs = chatMessages[req.params.channelId] || [];
  res.json({
    success: true,
    data: {
      messages: msgs,
      has_more: false,
      next_cursor: null
    }
  });
});

apiRouter.post('/chats/:channelId/messages', (req, res) => {
  const { content } = req.body;
  const channelId = req.params.channelId;
  const newMsg = {
    id: `msg-${Date.now()}`,
    content,
    sender_id: 'user-1',
    sender_name: 'Admin User',
    created_at: new Date().toISOString(),
    reactions: []
  };
  chatMessages[channelId] = chatMessages[channelId] || [];
  chatMessages[channelId].push(newMsg);
  
  // Update last message
  chatChannels = chatChannels.map(c => c.id === channelId ? { ...c, last_message: newMsg } : c);
  
  res.json({ success: true, data: newMsg });
});

apiRouter.patch('/messages/:messageId', (req, res) => {
  const { content } = req.body;
  let updatedMsg = null;
  Object.keys(chatMessages).forEach(chanId => {
    chatMessages[chanId] = chatMessages[chanId].map(m => {
      if (m.id === req.params.messageId) {
        updatedMsg = { ...m, content };
        return updatedMsg;
      }
      return m;
    });
  });
  res.json({ success: true, data: updatedMsg || { id: req.params.messageId, content } });
});

apiRouter.delete('/messages/:messageId', (req, res) => {
  Object.keys(chatMessages).forEach(chanId => {
    chatMessages[chanId] = chatMessages[chanId].filter(m => m.id !== req.params.messageId);
  });
  res.json({ success: true, message: 'Message deleted successfully' });
});

apiRouter.post('/messages/:messageId/reactions', (req, res) => {
  const { emoji } = req.body;
  let updatedMsg = null;
  Object.keys(chatMessages).forEach(chanId => {
    chatMessages[chanId] = chatMessages[chanId].map(m => {
      if (m.id === req.params.messageId) {
        m.reactions = m.reactions || [];
        const existing = m.reactions.find(r => r.emoji === emoji);
        if (existing) {
          existing.count += 1;
        } else {
          m.reactions.push({ emoji, count: 1 });
        }
        updatedMsg = m;
      }
      return m;
    });
  });
  res.json({ success: true, data: updatedMsg });
});

// Calendar Events
apiRouter.get('/calendar/events', (req, res) => {
  res.json({ success: true, data: calendarEvents });
});

apiRouter.get('/calendar/events/:id', (req, res) => {
  const ev = calendarEvents.find(e => e.id === req.params.id) || calendarEvents[0];
  res.json({ success: true, data: ev });
});

apiRouter.post('/calendar/events', (req, res) => {
  const newEv = { id: `event-${Date.now()}`, ...req.body, color: '#4f46e5' };
  calendarEvents.push(newEv);
  res.json({ success: true, data: newEv });
});

apiRouter.patch('/calendar/events/:id', (req, res) => {
  calendarEvents = calendarEvents.map(e => e.id === req.params.id ? { ...e, ...req.body } : e);
  const updated = calendarEvents.find(e => e.id === req.params.id);
  res.json({ success: true, data: updated });
});

apiRouter.delete('/calendar/events/:id', (req, res) => {
  const removed = calendarEvents.find(e => e.id === req.params.id);
  calendarEvents = calendarEvents.filter(e => e.id !== req.params.id);
  res.json({ success: true, data: removed });
});

// Meetings
apiRouter.get('/meetings', (req, res) => {
  res.json({ success: true, data: meetings });
});

apiRouter.get('/meetings/:id', (req, res) => {
  const meet = meetings.find(m => m.id === req.params.id) || meetings[0];
  res.json({ success: true, data: meet });
});

apiRouter.post('/meetings', (req, res) => {
  const newMeet = { id: `meet-${Date.now()}`, ...req.body, status: 'Scheduled', participants: [], notes: [] };
  meetings.push(newMeet);
  res.json({ success: true, data: newMeet });
});

apiRouter.patch('/meetings/:id', (req, res) => {
  meetings = meetings.map(m => m.id === req.params.id ? { ...m, ...req.body } : m);
  const updated = meetings.find(m => m.id === req.params.id);
  res.json({ success: true, data: updated });
});

apiRouter.delete('/meetings/:id', (req, res) => {
  const removed = meetings.find(m => m.id === req.params.id);
  meetings = meetings.filter(m => m.id !== req.params.id);
  res.json({ success: true, data: removed });
});

apiRouter.get('/meetings/:id/notes', (req, res) => {
  const notes = meetingNotes[req.params.id] || [];
  res.json({ success: true, data: notes });
});

apiRouter.post('/meetings/:id/notes', (req, res) => {
  const { content } = req.body;
  const newNote = { id: `note-${Date.now()}`, content, created_at: new Date().toISOString() };
  meetingNotes[req.params.id] = meetingNotes[req.params.id] || [];
  meetingNotes[req.params.id].push(newNote);
  res.json({ success: true, data: newNote });
});

// AI endpoints
let aiInstance = null;

apiRouter.post('/ai/chat', async (req, res) => {
  const userContent = req.body.content || req.body.message || '';
  const sessionId = req.body.sessionId;
  const targetSessionId = sessionId || 'session-1';
  const chosenModel = req.body.model || 'gemini-3.5-flash';
  const customRoleInstruction = req.body.systemInstruction || req.body.role || '';
  
  let aiResponseText = '';
  const apiKey = process.env.GEMINI_API_KEY || '';

  let dbClients = [];
  let dbProjects = [];
  let dbTasks = [];

  try {
    const database = await getDb();
    const clientsRows = await database.all('SELECT * FROM clients');
    const projectsRows = await database.all('SELECT * FROM projects');
    const tasksRows = await database.all('SELECT * FROM tasks');

    dbClients = clientsRows.map(r => ({ ...r, contacts: JSON.parse(r.contacts || '[]') }));
    dbProjects = projectsRows.map(r => ({
      ...r,
      members: JSON.parse(r.members || '[]'),
      milestones: JSON.parse(r.milestones || '[]')
    }));
    dbTasks = tasksRows.map(r => ({
      ...r,
      comments: JSON.parse(r.comments || '[]'),
      subtasks: JSON.parse(r.subtasks || '[]')
    }));
  } catch (dbErr) {
    console.error('Failed to fetch from SQLite in AI chat:', dbErr);
  }

  // Handle dynamic session creation
  if (targetSessionId && !aiSessions.some(s => s.id === targetSessionId)) {
    const titleText = userContent.trim() ? (userContent.slice(0, 30) + (userContent.length > 30 ? '...' : '')) : 'New AI Chat';
    aiSessions.push({
      id: targetSessionId,
      title: titleText,
      created_at: new Date().toISOString()
    });
  }

  if (apiKey && apiKey !== 'YOUR_GEMINI_API_KEY') {
    try {
      if (!aiInstance) {
        aiInstance = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      }

      const systemInstruction = `${customRoleInstruction ? `CHATBOT ROLE & INSTRUCTIONS:\n${customRoleInstruction}\n\n` : ''}You are BusinessOS AI, an intelligent, context-aware enterprise workspace copilot.
You have real-time read-only access to the company's workspace metrics and data listed below. Use this data whenever appropriate to provide highly contextual, informative, and precise responses.

CURRENT ORGANIZATION DETAILS:
${JSON.stringify(organization, null, 2)}

EMPLOYEES / USERS IN SYSTEM:
${JSON.stringify(users.map(u => ({ id: u.id, name: `${u.first_name} ${u.last_name}`, email: u.email, roles: u.roles, department_id: u.department_id, is_active: u.is_active })), null, 2)}

DEPARTMENTS:
${JSON.stringify(departments, null, 2)}

CLIENTS / ACCOUNTS:
${JSON.stringify(dbClients, null, 2)}

ACTIVE PROJECTS:
${JSON.stringify(dbProjects, null, 2)}

TASKS AND STATUSES:
${JSON.stringify(dbTasks, null, 2)}

AUTOMATION WORKFLOWS:
${JSON.stringify(workflows, null, 2)}

CALENDAR EVENTS:
${JSON.stringify(calendarEvents, null, 2)}

MEETINGS AND SCHEDULES:
${JSON.stringify(meetings, null, 2)}

GUIDELINES:
1. Always be helpful, objective, and professional.
2. Leverage the workspace facts above to answer user questions specifically (e.g., "Who is Sarah Chen?", "Which tasks are still in Todo?").
3. If the user asks to modify data (create/delete/update), direct them to use the appropriate tabs in the sidebar dashboard to make changes.`;

      // Fetch session history
      const sessionHistory = aiHistories[targetSessionId] || [];
      const contents = [];

      // Convert history to Gemini parts
      sessionHistory.forEach(msg => {
        const textVal = msg.content || '';
        if (typeof textVal === 'string' && textVal.trim()) {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: textVal }]
          });
        }
      });

      // Add current message
      const currentText = userContent || '';
      if (typeof currentText === 'string' && currentText.trim()) {
        contents.push({
          role: 'user',
          parts: [{ text: currentText }]
        });
      }

      const response = await aiInstance.models.generateContent({
        model: chosenModel,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      aiResponseText = response.text || "I was unable to formulate a response.";
    } catch (err) {
      console.error('Gemini API Error:', err);
      aiResponseText = `⚠️ **Gemini API Error:** ${err.message || err}

As a fallback, here is your workspace status:
- **Projects**: Cloud Workspace Migration (40% Complete)
- **Engineers**: Sarah Chen (CTO), Admin User
- **Clients**: Acme Corporation, Globex Industries`;
    }
  } else {
    // Elegant fallback mock copilot response with active guide
    aiResponseText = `💡 **Gemini AI is ready (Demo Mode)!**
Model Selected: \`${chosenModel}\`
${customRoleInstruction ? `Role Context: "${customRoleInstruction}"\n` : ''}
As your **BusinessOS Workspace Copilot**, I analyzed your system:
- **Organization**: BusinessOS AI Corp
- **Active Projects**: Cloud Workspace Migration (40% Complete), Enterprise Security Audit (5% Complete)
- **Active Staff**: Sarah Chen (CTO), Michael Rodriguez (Manager)
- **Open Tasks**: ${dbTasks.length} total tasks tracked across departments.

How can I help you manage your teams, projects, or workflows today?`;
  }

  const responseObj = {
    message: { id: `ai-msg-${Date.now()}`, role: 'assistant', content: aiResponseText },
    session_id: targetSessionId
  };
  
  aiHistories[targetSessionId] = aiHistories[targetSessionId] || [];
  aiHistories[targetSessionId].push({ id: `ai-msg-usr-${Date.now()}`, role: 'user', content: userContent });
  aiHistories[targetSessionId].push(responseObj.message);
  
  res.json({ success: true, data: responseObj });
});

apiRouter.get('/ai/chat/:sessionId', (req, res) => {
  const history = aiHistories[req.params.sessionId] || [];
  res.json({ success: true, data: history });
});

apiRouter.get('/ai/sessions', (req, res) => {
  res.json({ success: true, data: aiSessions });
});

apiRouter.post('/ai/sessions', (req, res) => {
  const { title } = req.body;
  const newSession = {
    id: `session-${Date.now()}`,
    title: title || 'New Chat Session',
    created_at: new Date().toISOString()
  };
  aiSessions.push(newSession);
  aiHistories[newSession.id] = [
    { id: `ai-msg-${Date.now()}`, role: 'assistant', content: 'Hello! I am your AI assistant. Select a role and model, and ask me anything.' }
  ];
  res.json({ success: true, data: newSession });
});

apiRouter.delete('/ai/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  aiSessions = aiSessions.filter(s => s.id !== sessionId);
  delete aiHistories[sessionId];
  res.json({ success: true });
});

apiRouter.delete('/ai/chat/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  aiHistories[sessionId] = [
    { id: `ai-msg-${Date.now()}`, role: 'assistant', content: 'Hello! I am your AI assistant. Select a role and model, and ask me anything.' }
  ];
  res.json({ success: true });
});


// ==========================================
// BUSINESSOS AI EXTRA ENDPOINTS (ALIGNED METRICS)
// ==========================================

// Analytics Endpoints
apiRouter.get('/analytics', async (req, res) => {
  try {
    const db = await getDb();
    const projectsCount = await db.get('SELECT COUNT(*) as count FROM projects');
    const tasksCount = await db.get('SELECT COUNT(*) as count FROM tasks');
    const clientsCount = await db.get('SELECT COUNT(*) as count FROM clients');
    const completedTasks = await db.get("SELECT COUNT(*) as count FROM tasks WHERE status = 'Completed'");

    const taskDistributionRows = await db.all('SELECT status as name, COUNT(*) as value FROM tasks GROUP BY status');
    const colors = {
      'Todo': '#ef4444',
      'In Progress': '#f59e0b',
      'Under Review': '#3b82f6',
      'Completed': '#10b981'
    };
    const taskDistribution = taskDistributionRows.map(row => ({
      name: row.name,
      value: row.value,
      fill: colors[row.name] || '#6b7280'
    }));

    const kpis = [
      { label: 'Active Projects', value: projectsCount.count, change: '+12%', trend: 'up' },
      { label: 'Total Tasks', value: tasksCount.count, change: '+18%', trend: 'up' },
      { label: 'Completed Tasks', value: completedTasks.count, change: '+25%', trend: 'up' },
      { label: 'Total Clients', value: clientsCount.count, change: '+5%', trend: 'up' }
    ];

    const chartData = [
      { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000 },
      { month: 'Feb', revenue: 52000, expenses: 34000, profit: 18000 },
      { month: 'Mar', revenue: 49000, expenses: 31000, profit: 18000 },
      { month: 'Apr', revenue: 63000, expenses: 38000, profit: 25000 },
      { month: 'May', revenue: 58000, expenses: 35000, profit: 23000 },
      { month: 'Jun', revenue: 71000, expenses: 42000, profit: 29000 }
    ];

    res.json({ success: true, data: { kpis, chartData, taskDistribution } });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.get('/analytics/export/:format', (req, res) => {
  const { format } = req.params;
  if (format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics_export.csv');
    return res.send('Month,Revenue,Expenses,Profit\nJan,45000,32000,13000\nFeb,52000,34000,18000\nMar,49000,31000,18000\n');
  } else if (format === 'excel') {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics_export.xlsx');
    return res.send(Buffer.from('MOCK EXCEL BINARY DATA'));
  } else {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics_export.pdf');
    return res.send(Buffer.from('%PDF-1.4 MOCK PDF BINARY DATA'));
  }
});

// Search Endpoints
apiRouter.get('/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const db = await getDb();
    const results = [];
    const queryLower = `%${q.toLowerCase()}%`;

    // Search Projects
    const projects = await db.all('SELECT * FROM projects WHERE name LIKE ? OR description LIKE ?', [queryLower, queryLower]);
    for (const p of projects) {
      results.push({
        id: p.id,
        type: 'project',
        title: p.name,
        subtitle: `Project Code: ${p.project_code}`,
        description: p.description,
        url: `/dashboard/projects/${p.id}`
      });
    }

    // Search Tasks
    const tasks = await db.all('SELECT * FROM tasks WHERE title LIKE ? OR description LIKE ?', [queryLower, queryLower]);
    for (const t of tasks) {
      results.push({
        id: t.id,
        type: 'task',
        title: t.title,
        subtitle: `Task Code: ${t.task_code} | Status: ${t.status}`,
        description: t.description,
        url: `/dashboard/tasks/${t.id}`
      });
    }

    // Search Clients
    const clients = await db.all('SELECT * FROM clients WHERE company_name LIKE ? OR industry LIKE ?', [queryLower, queryLower]);
    for (const c of clients) {
      results.push({
        id: c.id,
        type: 'client',
        title: c.company_name,
        subtitle: `Industry: ${c.industry}`,
        description: c.notes,
        url: `/dashboard/clients/${c.id}`
      });
    }

    // Search Folders
    const folders = await db.all('SELECT * FROM folders WHERE name LIKE ?', [queryLower]);
    for (const f of folders) {
      results.push({
        id: f.id,
        type: 'folder',
        title: f.name,
        subtitle: 'Workspace Folder',
        description: `Folder stored in organization ${f.organization_id}`,
        url: `/dashboard/documents?folder_id=${f.id}`
      });
    }

    // Search Documents
    const documents = await db.all('SELECT * FROM documents WHERE name LIKE ? OR description LIKE ?', [queryLower, queryLower]);
    for (const doc of documents) {
      results.push({
        id: doc.id,
        type: 'document',
        title: doc.name,
        subtitle: `${doc.extension.toUpperCase()} File`,
        description: doc.description,
        url: `/dashboard/documents?preview_id=${doc.id}`
      });
    }

    // Insert into recent searches
    if (q.trim()) {
      await db.run('INSERT INTO recent_searches (id, user_id, query, timestamp) VALUES (?, ?, ?, ?)', [
        `search-${Date.now()}`, 'user-1', q, new Date().toISOString()
      ]);
    }

    res.json({
      success: true,
      data: {
        results: results.slice(0, 50),
        total: results.length,
        took_ms: 12
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.get('/search/recent', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT DISTINCT query, id, timestamp FROM recent_searches WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10', ['user-1']);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/search/recent', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM recent_searches WHERE user_id = ?', ['user-1']);
    res.json({ success: true, data: [] });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

// Notifications Endpoints
apiRouter.get('/notifications', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', ['user-1']);
    const notifications = rows.map(r => ({ ...r, is_read: r.is_read === 1, metadata: JSON.parse(r.metadata || '{}') }));
    const unreadCount = notifications.filter(n => !n.is_read).length;
    res.json({
      success: true,
      data: {
        notifications,
        unread_count: unreadCount,
        total: notifications.length,
        page: 1,
        limit: 50
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/notifications/:id/read', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('UPDATE notifications SET is_read = 1, read_at = ? WHERE id = ?', [new Date().toISOString(), req.params.id]);
    const updated = await db.get('SELECT * FROM notifications WHERE id = ?', [req.params.id]);
    if (updated) {
      updated.is_read = updated.is_read === 1;
      updated.metadata = JSON.parse(updated.metadata || '{}');
      res.json({ success: true, data: updated });
    } else {
      res.status(404).json({ success: false, detail: 'Notification not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/notifications/read-all', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('UPDATE notifications SET is_read = 1, read_at = ? WHERE user_id = ?', [new Date().toISOString(), 'user-1']);
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/notifications/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.get('/notification-preferences', async (req, res) => {
  try {
    const db = await getDb();
    const row = await db.get('SELECT * FROM notification_preferences WHERE user_id = ?', ['user-1']);
    if (row) {
      row.email_notifications = row.email_notifications === 1;
      row.push_notifications = row.push_notifications === 1;
      row.sms_notifications = row.sms_notifications === 1;
      row.in_app_notifications = row.in_app_notifications === 1;
      row.muted_types = JSON.parse(row.muted_types || '[]');
      res.json({ success: true, data: row });
    } else {
      res.json({
        success: true,
        data: {
          user_id: 'user-1',
          email_notifications: true,
          push_notifications: true,
          sms_notifications: false,
          in_app_notifications: true,
          muted_types: [],
          digest_frequency: 'Immediate'
        }
      });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.patch('/notification-preferences', async (req, res) => {
  try {
    const db = await getDb();
    const { email_notifications, push_notifications, sms_notifications, in_app_notifications, muted_types, digest_frequency } = req.body;
    await db.run(
      `INSERT INTO notification_preferences (user_id, email_notifications, push_notifications, sms_notifications, in_app_notifications, muted_types, digest_frequency)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         email_notifications = excluded.email_notifications,
         push_notifications = excluded.push_notifications,
         sms_notifications = excluded.sms_notifications,
         in_app_notifications = excluded.in_app_notifications,
         muted_types = excluded.muted_types,
         digest_frequency = excluded.digest_frequency`,
      [
        'user-1',
        email_notifications ? 1 : 0,
        push_notifications ? 1 : 0,
        sms_notifications ? 1 : 0,
        in_app_notifications ? 1 : 0,
        JSON.stringify(muted_types || []),
        digest_frequency || 'Immediate'
      ]
    );
    const row = await db.get('SELECT * FROM notification_preferences WHERE user_id = ?', ['user-1']);
    row.email_notifications = row.email_notifications === 1;
    row.push_notifications = row.push_notifications === 1;
    row.sms_notifications = row.sms_notifications === 1;
    row.in_app_notifications = row.in_app_notifications === 1;
    row.muted_types = JSON.parse(row.muted_types || '[]');
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

// Folders & Documents Endpoints
apiRouter.get('/folders', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM folders');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/folders', async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const db = await getDb();
    const id = `folder-${Date.now()}`;
    const now = new Date().toISOString();
    await db.run(
      'INSERT INTO folders (id, name, parent_id, organization_id, created_by_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, parent_id || null, 'org-1', 'user-1', now, now]
    );
    const created = await db.get('SELECT * FROM folders WHERE id = ?', [id]);
    res.json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.patch('/folders/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { name, parent_id } = req.body;
    const now = new Date().toISOString();
    await db.run(
      'UPDATE folders SET name = COALESCE(?, name), parent_id = ?, updated_at = ? WHERE id = ?',
      [name, parent_id, now, req.params.id]
    );
    const updated = await db.get('SELECT * FROM folders WHERE id = ?', [req.params.id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/folders/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM folders WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Folder deleted' });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.get('/folders/:id/subfolders', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM folders WHERE parent_id = ?', [req.params.id]);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.get('/folders/:id/documents', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM documents WHERE folder_id = ?', [req.params.id]);
    const documents = rows.map(r => ({
      ...r,
      tags: JSON.parse(r.tags || '[]'),
      versions: JSON.parse(r.versions || '[]'),
      shares: JSON.parse(r.shares || '[]'),
      activities: JSON.parse(r.activities || '[]')
    }));
    res.json({ success: true, data: documents });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.get('/documents', async (req, res) => {
  try {
    const db = await getDb();
    const folderId = req.query.folder_id;
    let query = 'SELECT * FROM documents';
    const params = [];
    if (folderId) {
      query += ' WHERE folder_id = ?';
      params.push(folderId);
    }
    const rows = await db.all(query, params);
    const documents = rows.map(r => ({
      ...r,
      tags: JSON.parse(r.tags || '[]'),
      versions: JSON.parse(r.versions || '[]'),
      shares: JSON.parse(r.shares || '[]'),
      activities: JSON.parse(r.activities || '[]')
    }));
    res.json({ success: true, data: documents });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/documents', async (req, res) => {
  try {
    const db = await getDb();
    const { name, folder_id, project_id, department_id, tags, description, visibility } = req.body;
    const id = `doc-${Date.now()}`;
    const now = new Date().toISOString();
    await db.run(
      `INSERT INTO documents (id, name, original_name, extension, mime_type, size, version, folder_id, owner_id, uploader_by_id, project_id, department_id, tags, description, visibility, storage_path, download_url, preview_url, created_at, updated_at, versions, shares, activities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        name + '.pdf',
        'pdf',
        'application/pdf',
        102456,
        1,
        folder_id || null,
        'user-1',
        'user-1',
        project_id || null,
        department_id || null,
        JSON.stringify(tags || []),
        description || '',
        visibility || 'organization',
        `/storage/${id}.pdf`,
        `/api/v1/documents/${id}/download`,
        null,
        now,
        now,
        JSON.stringify([]),
        JSON.stringify([]),
        JSON.stringify([{ id: `act-${Date.now()}`, activity_type: 'upload', description: 'Document uploaded', user_id: 'user-1', created_at: now }])
      ]
    );
    const doc = await db.get('SELECT * FROM documents WHERE id = ?', [id]);
    doc.tags = JSON.parse(doc.tags || '[]');
    doc.versions = JSON.parse(doc.versions || '[]');
    doc.shares = JSON.parse(doc.shares || '[]');
    doc.activities = JSON.parse(doc.activities || '[]');
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.patch('/documents/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { name, folder_id, description, visibility } = req.body;
    const now = new Date().toISOString();
    await db.run(
      'UPDATE documents SET name = COALESCE(?, name), folder_id = ?, description = COALESCE(?, description), visibility = COALESCE(?, visibility), updated_at = ? WHERE id = ?',
      [name, folder_id, description, visibility, now, req.params.id]
    );
    const updated = await db.get('SELECT * FROM documents WHERE id = ?', [req.params.id]);
    updated.tags = JSON.parse(updated.tags || '[]');
    updated.versions = JSON.parse(updated.versions || '[]');
    updated.shares = JSON.parse(updated.shares || '[]');
    updated.activities = JSON.parse(updated.activities || '[]');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/documents/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM documents WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Document deleted' });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.get('/documents/:id/download', async (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=document-${req.params.id}.pdf`);
  res.send(Buffer.from('%PDF-1.4 mock document binary'));
});

// Assets & Categories Endpoints
apiRouter.get('/assets', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM assets');
    const assets = rows.map(r => ({ ...r, attachments: JSON.parse(r.attachments || '[]') }));
    res.json({ success: true, data: assets });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.get('/assets/:id', async (req, res) => {
  try {
    const db = await getDb();
    const asset = await db.get('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    if (asset) {
      asset.attachments = JSON.parse(asset.attachments || '[]');
      res.json({ success: true, data: asset });
    } else {
      res.status(404).json({ success: false, detail: 'Asset not found' });
    }
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/assets', async (req, res) => {
  try {
    const db = await getDb();
    const { asset_code, name, description, category_id, brand, model, serial_number, purchase_date, purchase_price, vendor, status, condition, assigned_employee_id, assigned_department_id, assigned_project_id, location, notes } = req.body;
    const id = `asset-${Date.now()}`;
    const now = new Date().toISOString();
    await db.run(
      `INSERT INTO assets (id, asset_code, name, description, category_id, brand, model, serial_number, purchase_date, purchase_price, vendor, status, condition, assigned_employee_id, assigned_department_id, assigned_project_id, location, notes, attachments, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        asset_code || `AST-${Date.now()}`,
        name,
        description || '',
        category_id,
        brand || '',
        model || '',
        serial_number || '',
        purchase_date || null,
        purchase_price || 0,
        vendor || '',
        status || 'Available',
        condition || 'Good',
        assigned_employee_id || null,
        assigned_department_id || null,
        assigned_project_id || null,
        location || '',
        notes || '',
        JSON.stringify([]),
        now,
        now
      ]
    );
    const created = await db.get('SELECT * FROM assets WHERE id = ?', [id]);
    created.attachments = JSON.parse(created.attachments || '[]');
    res.json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.patch('/assets/:id', async (req, res) => {
  try {
    const db = await getDb();
    const { name, description, status, condition, assigned_employee_id, location, notes } = req.body;
    const now = new Date().toISOString();
    await db.run(
      `UPDATE assets SET
         name = COALESCE(?, name),
         description = COALESCE(?, description),
         status = COALESCE(?, status),
         condition = COALESCE(?, condition),
         assigned_employee_id = ?,
         location = COALESCE(?, location),
         notes = COALESCE(?, notes),
         updated_at = ?
       WHERE id = ?`,
      [name, description, status, condition, assigned_employee_id, location, notes, now, req.params.id]
    );
    const updated = await db.get('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    updated.attachments = JSON.parse(updated.attachments || '[]');
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.delete('/assets/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM assets WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Asset deleted' });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.get('/asset-categories', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all('SELECT * FROM asset_categories');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});

apiRouter.post('/asset-categories', async (req, res) => {
  try {
    const db = await getDb();
    const { name, description } = req.body;
    const id = `cat-${Date.now()}`;
    const now = new Date().toISOString();
    await db.run(
      'INSERT INTO asset_categories (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [id, name, description || '', now, now]
    );
    const created = await db.get('SELECT * FROM asset_categories WHERE id = ?', [id]);
    res.json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, detail: err.message });
  }
});


// Bind API router under /api/v1
app.use('/api/v1', apiRouter);

// Fallback health check
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'HEALTHY' });
});

// ==========================================
// START SERVERS
// ==========================================

const API_PORT = 3001;
app.listen(API_PORT, '0.0.0.0', () => {
  console.log(`[API MOCK] Mock Service active on port ${API_PORT}`);
});

// Spawn Next.js Dev Server on port 3000 with standard development options
const nextDev = spawn('npm', ['run', 'dev', '--', '-p', '3000', '-H', '0.0.0.0'], {
  cwd: './frontend',
  stdio: 'inherit',
  shell: true,
});

nextDev.on('close', (code) => {
  console.log(`Next.js process exited with code ${code}`);
  process.exit(code);
});

process.on('SIGINT', () => {
  nextDev.kill();
  process.exit(0);
});
