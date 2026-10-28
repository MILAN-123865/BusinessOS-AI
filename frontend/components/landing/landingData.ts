export interface DashboardMetric {
  revenue: string
  revenueGrowth: string
  arr: string
  operatingMargin: string
  tasksCompleted: number
  tasksInProgress: number
  tasksBlocked: number
}

export const HERO_METRICS: DashboardMetric = {
  revenue: '$2.84M',
  revenueGrowth: '+18.6%',
  arr: '$34.1M',
  operatingMargin: '32.4%',
  tasksCompleted: 842,
  tasksInProgress: 312,
  tasksBlocked: 88,
}

export const AI_BRIEF_INSIGHTS = [
  'Revenue tracking 8.4% above Q3 target ($2.84M current vs $2.62M target).',
  'Engineering delivery velocity increased 12% following sprint workflow consolidation.',
  '3 high-priority operational risks require executive attention.',
  'Marketing spend efficiency improved 14.2% week-over-week across channels.',
]

export const PRESET_AI_QUERIES = [
  'Why did operating margin decline this month?',
  'Show all high-priority blocked tasks',
  'What is our ARR growth forecast for Q4?',
]

export interface FeatureTab {
  id: string
  title: string
  subtitle: string
  description: string
  meta: string
  metrics: { label: string; value: string; trend?: string }[]
}

export const FEATURE_TABS: FeatureTab[] = [
  {
    id: 'financial',
    title: 'Financial Telemetry',
    subtitle: 'Real-Time Financial Operating Picture',
    description: 'Turn fragmented financial data into an executive-level operating picture with live revenue curves, cash burn tracking, and margin forecasting.',
    meta: 'Financial Intelligence · Real-time telemetry engine',
    metrics: [
      { label: 'Monthly Revenue', value: '$2.84M', trend: '+18.6%' },
      { label: 'Monthly Burn Rate', value: '$410K', trend: '-4.2%' },
      { label: 'Operating Margin', value: '34.2%', trend: '+2.1%' },
      { label: 'Cash Runway', value: '28 Months' },
    ],
  },
  {
    id: 'copilot',
    title: 'Executive AI Copilot',
    subtitle: 'Context-Aware Business Intelligence',
    description: 'Query your entire organization in plain English. Get instant explanations for financial variance, delivery delays, and operational bottlenecks.',
    meta: 'AI Copilot · Context-aware intelligence engine',
    metrics: [
      { label: 'Query Latency', value: '< 240ms' },
      { label: 'Cross-System Context', value: '100% Unified' },
      { label: 'Briefing Schedule', value: 'Daily Executive' },
      { label: 'Decision Accuracy', value: '99.4%' },
    ],
  },
  {
    id: 'task-matrix',
    title: 'Agile Task Matrix',
    subtitle: 'Unified Execution & Dependency Mapping',
    description: 'Cross-functional project tracking with real-time dependency risk scoring, resource allocation telemetry, and milestone tracking.',
    meta: 'Task Matrix · Execution & dependency tracking',
    metrics: [
      { label: 'Sprint Velocity', value: '+14.8%' },
      { label: 'Active Projects', value: '34 Live' },
      { label: 'On-Time Completion', value: '94.2%' },
      { label: 'Blocked Bottlenecks', value: '3 Flagged' },
    ],
  },
  {
    id: 'governance',
    title: 'Governance & RBAC',
    subtitle: 'Enterprise Security & Immutable Audit Logs',
    description: 'Enforce granular role-based access controls across multi-organization workspaces with real-time audit streaming and compliance monitoring.',
    meta: 'Governance · RBAC & audit logging',
    metrics: [
      { label: 'Access Control', value: 'Fine-Grained RBAC' },
      { label: 'Audit Log Lag', value: '< 10ms' },
      { label: 'Compliance Readiness', value: 'SOC 2 Ready' },
      { label: 'Active Sessions', value: '142 Monitored' },
    ],
  },
]

export interface ComparisonRow {
  capability: string
  businessOS: string | boolean
  legacyStack: string | boolean
  highlight?: boolean
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  { capability: 'Financial Telemetry & ARR Tracking', businessOS: true, legacyStack: 'Fragmented Spreadsheets', highlight: true },
  { capability: 'Agile Task & Project Execution', businessOS: true, legacyStack: 'Separate Jira Subscriptions' },
  { capability: 'Executive AI Assistant with Cross-App Context', businessOS: true, legacyStack: false, highlight: true },
  { capability: 'Native Team Messaging & Channel Context', businessOS: true, legacyStack: 'Disconnected Slack Workspace' },
  { capability: 'Unified Governance & RBAC Enforcement', businessOS: true, legacyStack: 'Siloed Multi-App Permissions', highlight: true },
  { capability: 'Centralized Immutable Audit Trails', businessOS: true, legacyStack: 'Manual Log Consolidation' },
  { capability: 'Cross-System Operational Visibility', businessOS: true, legacyStack: 'Weekly Manual Reports', highlight: true },
  { capability: 'Subscription & License Overhead', businessOS: '1 Unified Platform', legacyStack: '4+ Overlapping SaaS Bills' },
  { capability: 'Time to Full Deployment', businessOS: '< 1 Day', legacyStack: '3-6 Months Enterprise Integration' },
]

export interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  isFeatured?: boolean
  features: string[]
  ctaText: string
  ctaHref: string
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'growth',
    name: 'Growth',
    description: 'Ideal for fast-scaling startups & small operations teams needing unified execution.',
    monthlyPrice: 1499,
    annualPrice: 1199,
    features: [
      'Up to 25 Team Workspace Seats',
      'Core Financial Telemetry Overview',
      'Agile Task & Kanban Board Matrix',
      'Standard Document & Asset Management',
      'Basic AI Executive Briefings',
      'Standard Role-Based Access (RBAC)',
      'Community & Email Support',
    ],
    ctaText: 'Start Free Trial',
    ctaHref: '/register',
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'Designed for mid-market enterprises demanding deep financial AI telemetry & governance.',
    monthlyPrice: 3499,
    annualPrice: 2799,
    isFeatured: true,
    features: [
      'Unlimited Workspace Team Seats',
      'Everything in Growth plan',
      'Real-Time Financial Telemetry & Forecasting',
      'Full Executive AI Copilot & Custom Prompts',
      'Granular Column/Row Level RBAC Security',
      'Real-Time Immutable Audit Logging',
      'Automated Multi-Step Workflows',
      '24/7 Priority SLA & Dedicated Account Lead',
    ],
    ctaText: 'Start Free Trial',
    ctaHref: '/register',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Suite',
    description: 'For large corporate entities requiring multi-org partitioning & custom integrations.',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      'Everything in Scale plan',
      'Multi-Organization Hierarchy & Partitioning',
      'Custom LLM Fine-Tuning & On-Prem AI Connectors',
      'SAML 2.0 / SSO & SCIM Directory Sync',
      'Dedicated Isolated Database Instances',
      'Custom SLA Guarantees (Up to 99.99%)',
      'Custom Security Audits & Dedicated Support',
    ],
    ctaText: 'Talk to Sales',
    ctaHref: '/login',
  },
]

export const SECURITY_FEATURES = [
  {
    title: 'Tenant Isolation',
    description: 'Strict logical database row and organization boundary enforcement prevents data leakage across tenants.',
  },
  {
    title: 'Fine-Grained RBAC',
    description: 'Configurable role definitions, domain permission gates, and employee-level access privileges.',
  },
  {
    title: 'End-to-End Encryption',
    description: 'AES-256 encryption at rest with TLS 1.3 cryptographic transport protection for all API endpoints.',
  },
  {
    title: 'Immutable Audit Trail',
    description: 'Comprehensive logging of every administrative configuration change, access grant, and authentication attempt.',
  },
  {
    title: 'Token Security & JWT',
    description: 'Cryptographically signed session tokens with refresh mechanics and automated session revocation.',
  },
  {
    title: 'API Rate Limiting',
    description: 'Automated distributed rate limiters protecting against denial of service and brute force access attempts.',
  },
]
