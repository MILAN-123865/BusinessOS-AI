'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Search,
  Sparkles,
  FileText,
  Shield,
  Briefcase,
  Users,
  Lock,
  ArrowRight,
  CheckCircle2,
  Download,
  Eye,
  X,
  MessageSquare,
  Bot,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'

interface KnowledgeDoc {
  id: string
  title: string
  category: 'HR & People' | 'Security & Compliance' | 'Operations' | 'Finance'
  summary: string
  content: string
  version: string
  updatedAt: string
  matchScore?: number
}

const SAMPLE_DOCS: KnowledgeDoc[] = [
  {
    id: 'kb_sec_01',
    title: 'ISO-27001 Information Security & Access Policy',
    category: 'Security & Compliance',
    summary: 'Governs database credential rotation, RBAC role assignment, and zero-trust remote access protocols.',
    version: 'v3.2',
    updatedAt: '2026-09-12',
    content: `1. PURPOSE & SCOPE
This document outlines the mandatory baseline security procedures for all BusinessOS AI infrastructure, production databases, and user access roles.

2. ACCESS CONTROL & AUTHENTICATION
- Multi-factor authentication (MFA) is strictly required for all administrative access.
- Role-Based Access Control (RBAC) must adhere to the principle of least privilege (PoLP).
- Direct SQL mutations require Super Admin authorization.

3. DATA ENCRYPTION & AUDIT LOGGING
- All customer and financial records must be encrypted in transit (TLS 1.3) and at rest (AES-256).
- Audit logs are immutable and streamed in real-time to the central compliance ledger.`,
  },
  {
    id: 'kb_hr_02',
    title: 'Employee Onboarding & Hybrid Workplace Guidelines',
    category: 'HR & People',
    summary: 'Standard operating procedure for new hires, remote equipment stipend, and annual performance reviews.',
    version: 'v2.4',
    updatedAt: '2026-08-20',
    content: `1. ONBOARDING WORKFLOW
All new team members must complete the 14-day onboarding sprint, including workspace provisioning, security clearance, and mentor assignment.

2. REMOTE STIPEND & EQUIPMENT
Full-time team members are eligible for a $1,500 annual home office technology stipend.

3. PERFORMANCE & PROMOTION CYCLES
Bi-annual 360-degree reviews occur in June and December. Promotion criteria emphasize technical execution, leadership, and cross-functional impact.`,
  },
  {
    id: 'kb_fin_03',
    title: 'Corporate Expense & Invoicing Settlement Terms',
    category: 'Finance',
    summary: 'Standard settlement windows (Net 30), allowable corporate card expenses, and VAT/sales tax rules.',
    version: 'v4.0',
    updatedAt: '2026-09-28',
    content: `1. ACCOUNTS RECEIVABLE TERMS
- Standard customer invoices carry Net 30-day payment terms unless otherwise stipulated in Master Service Agreements.
- Late payments beyond 45 days incur a 1.5% compounding monthly surcharge.

2. TRAVEL & MEAL REIMBURSEMENT
- All expenses over $50 require itemized digital receipts uploaded to the Finance Portal within 14 business days.`,
  },
  {
    id: 'kb_ops_04',
    title: 'Northwind Supplier Quality & Cold-Chain Protocol',
    category: 'Operations',
    summary: 'Temperature requirements, shipping inspection checklists, and perishable inventory replenishment criteria.',
    version: 'v1.8',
    updatedAt: '2026-09-05',
    content: `1. PERISHABLE PRODUCT HANDLING
Seafood (Carnarvon Tigers) and Dairy (Camembert Pierrot) must be maintained at constant temperatures between 0°C and 4°C during global transit.

2. RE-ORDER TRIGGERS
When warehouse stock falls below the 15-unit threshold, the Automated Workflow Engine triggers an immediate PO to the primary vendor.`,
  },
]

export default function KnowledgeBasePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>(SAMPLE_DOCS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [activeDoc, setActiveDoc] = useState<KnowledgeDoc | null>(null)

  // AI Q&A Chat Sandbox
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [isAiThinking, setIsAiThinking] = useState(false)

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const filteredDocs = docs
    .map((doc) => {
      if (!searchQuery.trim()) return { ...doc, matchScore: 100 }
      const q = searchQuery.toLowerCase()
      const titleMatch = doc.title.toLowerCase().includes(q)
      const contentMatch = doc.content.toLowerCase().includes(q)
      const summaryMatch = doc.summary.toLowerCase().includes(q)
      const score = titleMatch ? 98 : summaryMatch ? 89 : contentMatch ? 76 : 0
      return { ...doc, matchScore: score }
    })
    .filter((doc) => {
      const matchesCategory = selectedCategory === 'ALL' || doc.category === selectedCategory
      const matchesSearch = !searchQuery.trim() || (doc.matchScore && doc.matchScore > 0)
      return matchesCategory && matchesSearch
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiQuestion.trim()) return
    setIsAiThinking(true)
    setAiAnswer(null)

    setTimeout(() => {
      const q = aiQuestion.toLowerCase()
      if (q.includes('security') || q.includes('password') || q.includes('mfa') || q.includes('rbac')) {
        setAiAnswer(
          '🔒 According to the **ISO-27001 Access Policy (v3.2)**, MFA is strictly mandatory for all administrative access. Direct SQL mutations require Super Admin authorization, and all customer data is encrypted at rest using AES-256 with immutable audit logs.'
        )
      } else if (q.includes('invoice') || q.includes('payment') || q.includes('net 30') || q.includes('late')) {
        setAiAnswer(
          '💵 Per the **Corporate Invoicing Settlement Terms (v4.0)**, standard invoices carry **Net 30-day payment terms**. Settlement beyond 45 days incurs a 1.5% compounding monthly surcharge.'
        )
      } else if (q.includes('onboard') || q.includes('stipend') || q.includes('remote')) {
        setAiAnswer(
          '👥 According to the **Employee Onboarding Guidelines (v2.4)**, all full-time hires receive a **$1,500 annual home office technology stipend** and follow a structured 14-day onboarding sprint.'
        )
      } else {
        setAiAnswer(
          `🤖 **AI Synthesis**: Based on Northwind Knowledge Base policies, your inquiry regarding "${aiQuestion}" relates to internal operational workflows. All policies enforce strict compliance, PoLP role access, and automated workflow triggers.`
        )
      }
      setIsAiThinking(false)
    }, 1000)
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 dark:border-sky-950 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  Enterprise Knowledge Base & Policy RAG
                </h1>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Semantic Embeddings Active
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Search internal corporate policies, compliance standards, and SOPs with instant AI synthesis.
              </p>
            </div>
          </div>
        </div>

        {/* AI Semantic Ask Bar */}
        <div className="rounded-3xl border border-sky-200 dark:border-sky-900/80 bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-bold text-xs uppercase tracking-wider">
            <Sparkles size={16} />
            <span>Ask BusinessOS AI Policy Assistant</span>
          </div>

          <form onSubmit={handleAskAI} className="flex gap-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={(e) => setAiQuestion(e.target.value)}
              placeholder="e.g. What are our Net 30 payment terms and late fee surcharges?"
              className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070D1E] px-4 py-3 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500 shadow-2xs"
            />
            <button
              type="submit"
              disabled={isAiThinking}
              className="flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-xs font-bold text-white hover:bg-sky-700 transition-colors shadow-md shadow-sky-500/20 cursor-pointer disabled:opacity-50"
            >
              <Bot size={15} />
              <span>{isAiThinking ? 'Analyzing...' : 'Ask AI'}</span>
            </button>
          </form>

          {aiAnswer && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-white/90 dark:bg-[#0B132B]/90 p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed shadow-xs"
            >
              <div className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>AI Policy Synthesis & Cited Sources</span>
              </div>
              <p>{aiAnswer}</p>
            </motion.div>
          )}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-4 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search knowledge documents by keyword or topic..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {['ALL', 'Security & Compliance', 'HR & People', 'Finance', 'Operations'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Document Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="group rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-5 shadow-xs hover:border-sky-300 dark:hover:border-sky-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-full bg-sky-50 dark:bg-sky-950/80 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    {doc.category}
                  </span>
                  {searchQuery && (
                    <span className="font-mono text-[10px] font-bold text-emerald-600">
                      {doc.matchScore}% Match
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {doc.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-mono">
                  {doc.version} • Updated {doc.updatedAt}
                </span>

                <button
                  onClick={() => setActiveDoc(doc)}
                  className="flex items-center gap-1 font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Read Policy</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Document Viewer Modal */}
        <AnimatePresence>
          {activeDoc && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-2xl rounded-3xl border border-sky-100 dark:border-sky-900 bg-white dark:bg-[#0B132B] shadow-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                      {activeDoc.category} • {activeDoc.version}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {activeDoc.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveDoc(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="rounded-2xl bg-slate-50 dark:bg-[#070D1E] p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {activeDoc.content}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveDoc(null)}
                    className="rounded-xl bg-sky-600 px-5 py-2 text-xs font-bold text-white hover:bg-sky-700 transition-colors cursor-pointer"
                  >
                    Close Policy Viewer
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
