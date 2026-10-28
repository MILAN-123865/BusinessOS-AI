'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Users,
  ChevronDown,
  ChevronRight,
  Shield,
  Briefcase,
  DollarSign,
  Mail,
  Phone,
  Layers,
  Sparkles,
  Printer,
  Search,
  UserCheck,
  CheckCircle2,
  Share2,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { ExportDropdown } from '@/components/ui/export-dropdown'

interface OrgNode {
  id: string
  name: string
  title: string
  department: string
  headcount: number
  budget: string
  leaderName: string
  leaderEmail: string
  avatarColor: string
  children?: OrgNode[]
}

const ORG_TREE: OrgNode = {
  id: 'exec_1',
  name: 'Executive Office',
  title: 'Chief Executive Officer',
  department: 'Executive Leadership',
  headcount: 48,
  budget: '$4,200,000 / yr',
  leaderName: 'Nancy Davolio',
  leaderEmail: 'nancy.davolio@northwind.com',
  avatarColor: 'from-amber-500 to-orange-600',
  children: [
    {
      id: 'tech_1',
      name: 'Engineering & AI Architecture',
      title: 'VP of Technology & Data Systems',
      department: 'Technology',
      headcount: 18,
      budget: '$1,800,000 / yr',
      leaderName: 'Andrew Fuller',
      leaderEmail: 'andrew.fuller@northwind.com',
      avatarColor: 'from-sky-500 to-blue-600',
      children: [
        {
          id: 'tech_ai',
          name: 'AI Agent & Core NLP Team',
          title: 'Principal AI Architect',
          department: 'Technology',
          headcount: 8,
          budget: '$850,000 / yr',
          leaderName: 'Janet Leverling',
          leaderEmail: 'janet.leverling@northwind.com',
          avatarColor: 'from-indigo-500 to-purple-600',
        },
        {
          id: 'tech_infra',
          name: 'Cloud Infrastructure & SRE',
          title: 'Lead DevOps Specialist',
          department: 'Technology',
          headcount: 10,
          budget: '$950,000 / yr',
          leaderName: 'Margaret Peacock',
          leaderEmail: 'margaret.peacock@northwind.com',
          avatarColor: 'from-cyan-500 to-teal-600',
        },
      ],
    },
    {
      id: 'sales_1',
      name: 'Global Sales & Enterprise Accounts',
      title: 'Chief Commercial Officer',
      department: 'Sales & Growth',
      headcount: 16,
      budget: '$1,350,000 / yr',
      leaderName: 'Steven Buchanan',
      leaderEmail: 'steven.buchanan@northwind.com',
      avatarColor: 'from-emerald-500 to-teal-600',
      children: [
        {
          id: 'sales_emea',
          name: 'EMEA Regional Accounts',
          title: 'Regional Sales Director (EU)',
          department: 'Sales & Growth',
          headcount: 7,
          budget: '$620,000 / yr',
          leaderName: 'Michael Suyama',
          leaderEmail: 'michael.suyama@northwind.com',
          avatarColor: 'from-green-500 to-emerald-600',
        },
        {
          id: 'sales_apac',
          name: 'North America & APAC Accounts',
          title: 'Regional Sales Director (NA/APAC)',
          department: 'Sales & Growth',
          headcount: 9,
          budget: '$730,000 / yr',
          leaderName: 'Robert King',
          leaderEmail: 'robert.king@northwind.com',
          avatarColor: 'from-teal-500 to-cyan-600',
        },
      ],
    },
    {
      id: 'ops_1',
      name: 'Operations & Human Capital',
      title: 'VP of People & Operations',
      department: 'Operations',
      headcount: 14,
      budget: '$1,050,000 / yr',
      leaderName: 'Laura Callahan',
      leaderEmail: 'laura.callahan@northwind.com',
      avatarColor: 'from-rose-500 to-pink-600',
      children: [
        {
          id: 'ops_hr',
          name: 'Talent Acquisition & Culture',
          title: 'Director of People Operations',
          department: 'Operations',
          headcount: 6,
          budget: '$450,000 / yr',
          leaderName: 'Anne Dodsworth',
          leaderEmail: 'anne.dodsworth@northwind.com',
          avatarColor: 'from-fuchsia-500 to-pink-600',
        },
        {
          id: 'ops_audit',
          name: 'Legal, Compliance & Security Audits',
          title: 'Chief Compliance Counsel',
          department: 'Compliance',
          headcount: 8,
          budget: '$600,000 / yr',
          leaderName: 'Sarah Jenkins',
          leaderEmail: 'sarah.jenkins@northwind.com',
          avatarColor: 'from-slate-600 to-slate-800',
        },
      ],
    },
  ],
}

interface TreeNodeProps {
  node: OrgNode
  depth?: number
  selectedId: string | null
  onSelect: (node: OrgNode) => void
}

function TreeNode({ node, depth = 0, selectedId, onSelect }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const isSelected = selectedId === node.id
  const hasChildren = node.children && node.children.length > 0

  return (
    <div className="flex flex-col items-center">
      {/* Node Card */}
      <motion.div
        layout
        onClick={() => onSelect(node)}
        className={`group relative flex flex-col w-72 rounded-2xl border p-4 transition-all cursor-pointer shadow-xs ${
          isSelected
            ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/50 shadow-md ring-2 ring-sky-500/20'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] hover:border-sky-300 dark:hover:border-sky-700'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${node.avatarColor} text-white font-bold text-sm shadow-xs`}
          >
            {node.leaderName.split(' ').map((n) => n[0]).join('')}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{node.name}</h4>
            <p className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 truncate">{node.title}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{node.leaderName}</p>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2.5 text-[10px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 font-semibold">
            <Users size={12} className="text-slate-400" />
            {node.headcount} members
          </span>
          <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{node.budget}</span>
        </div>

        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E1733] text-slate-500 hover:text-sky-600 shadow-2xs transition-transform"
          >
            <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        )}
      </motion.div>

      {/* Children Nodes & Connecting Lines */}
      {hasChildren && isExpanded && (
        <div className="relative pt-8 flex gap-6">
          {/* Vertical Stem Line from Parent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-sky-200 dark:bg-sky-900" />

          {/* Children branch container */}
          <div className="flex gap-6 items-start">
            {node.children!.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                depth={depth + 1}
                selectedId={selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrgChartPage() {
  const [selectedNode, setSelectedNode] = useState<OrgNode>(ORG_TREE)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 dark:border-sky-950 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  Corporate Hierarchy & Org Chart
                </h1>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Live Visualizer
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Interactive node-based organizational tree, reporting lines, and departmental budget telemetry.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B132B] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Tree</span>
            </button>
          </div>
        </div>

        {/* Main Visualizer Area & Detail Drawer */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Visual Interactive Tree Canvas */}
          <div className="lg:col-span-3 rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-slate-50/50 dark:bg-[#070D1E] p-8 shadow-xs overflow-x-auto min-h-[520px] flex justify-center">
            <TreeNode
              node={ORG_TREE}
              selectedId={selectedNode?.id || null}
              onSelect={(node) => setSelectedNode(node)}
            />
          </div>

          {/* Department / Leader Details Inspector */}
          <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-5 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Briefcase size={16} className="text-sky-600 dark:text-sky-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Department Inspector
              </h3>
            </div>

            {selectedNode ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Division</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{selectedNode.name}</h4>
                  <p className="text-sky-600 dark:text-sky-400 font-semibold">{selectedNode.title}</p>
                </div>

                <div className="rounded-xl bg-slate-50 dark:bg-[#070D1E] p-3 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Department Head:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedNode.leaderName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Team Size:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedNode.headcount} specialists</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Allocated Budget:</span>
                    <span className="font-mono font-bold text-emerald-600">{selectedNode.budget}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Contact Direct</span>
                  <a
                    href={`mailto:${selectedNode.leaderEmail}`}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 p-2 text-slate-700 dark:text-slate-300 hover:border-sky-500 transition-colors"
                  >
                    <Mail size={13} className="text-sky-500" />
                    <span className="truncate">{selectedNode.leaderEmail}</span>
                  </a>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                    <CheckCircle2 size={13} />
                    <span>Active Reporting Line Connected</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Click any node in the tree to inspect details.</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
