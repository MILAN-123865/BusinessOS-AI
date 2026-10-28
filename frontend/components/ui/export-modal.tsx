'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  X,
  FileSpreadsheet,
  FileCode,
  Printer,
  Check,
  Loader2,
  Calendar,
  Building2,
  DollarSign,
  CheckSquare,
  Sparkles,
  Layers,
} from 'lucide-react'
import { api } from '@/services/axios'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  defaultDataset?: 'analytics' | 'clients' | 'tasks'
}

export function ExportModal({ isOpen, onClose, defaultDataset = 'analytics' }: ExportModalProps) {
  const [selectedDataset, setSelectedDataset] = useState<'analytics' | 'clients' | 'tasks'>(defaultDataset)
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [selectedRange, setSelectedRange] = useState<'7d' | '30d' | 'qtd' | 'all'>('30d')
  const [isExporting, setIsExporting] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const handleExecuteExport = async () => {
    setIsExporting(true)
    setDownloadSuccess(false)

    try {
      if (selectedFormat === 'pdf') {
        // Trigger browser print preview with tailored stylesheet
        window.print()
        setIsExporting(false)
        setDownloadSuccess(true)
        setTimeout(() => setDownloadSuccess(false), 2500)
        return
      }

      let endpoint = '/analytics/export'
      let defaultFileName = `businessos_${selectedDataset}_export.${selectedFormat}`

      if (selectedDataset === 'clients') {
        // Generate clients CSV/JSON from clients endpoint
        const resp = await api.get('/clients')
        const clients = resp.data?.data || []
        
        if (selectedFormat === 'json') {
          const blob = new Blob([JSON.stringify(clients, null, 2)], { type: 'application/json' })
          triggerBlobDownload(blob, defaultFileName)
        } else {
          // Format CSV
          const headers = ['Company Name', 'Client Code', 'Industry', 'City', 'Country', 'Phone', 'Email', 'Status']
          const rows = clients.map((c: any) => [
            `"${c.company_name || ''}"`,
            `"${c.client_code || ''}"`,
            `"${c.industry || ''}"`,
            `"${c.city || ''}"`,
            `"${c.country || ''}"`,
            `"${c.phone || ''}"`,
            `"${c.email || ''}"`,
            `"${c.status || ''}"`,
          ].join(','))
          const csvContent = [headers.join(','), ...rows].join('\n')
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          triggerBlobDownload(blob, defaultFileName)
        }
      } else if (selectedDataset === 'tasks') {
        const resp = await api.get('/tasks')
        const tasks = resp.data?.data || []
        
        if (selectedFormat === 'json') {
          const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' })
          triggerBlobDownload(blob, defaultFileName)
        } else {
          const headers = ['Title', 'Status', 'Priority', 'Due Date', 'Description']
          const rows = tasks.map((t: any) => [
            `"${(t.title || '').replace(/"/g, '""')}"`,
            `"${t.status || ''}"`,
            `"${t.priority || ''}"`,
            `"${t.due_date || ''}"`,
            `"${(t.description || '').replace(/"/g, '""')}"`,
          ].join(','))
          const csvContent = [headers.join(','), ...rows].join('\n')
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
          triggerBlobDownload(blob, defaultFileName)
        }
      } else {
        // Analytics
        const response = await api.get(`/analytics/export?format=${selectedFormat}&period=${selectedRange}`, {
          responseType: 'blob',
        })
        triggerBlobDownload(new Blob([response.data]), defaultFileName)
      }

      setIsExporting(false)
      setDownloadSuccess(true)
      setTimeout(() => {
        setDownloadSuccess(false)
        onClose()
      }, 1500)
    } catch (err) {
      console.error('Export failed:', err)
      setIsExporting(false)
    }
  }

  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.parentNode?.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-lg rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-sky-950 px-5 py-4 bg-sky-50/50 dark:bg-[#0F172A]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Export Enterprise Datasets
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Generate live CSV, JSON, or PDF reports
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 transition-colors"
              >
                <X size={17} />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 text-xs">
              {/* 1. Dataset Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  1. Target Workspace Dataset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'analytics', label: 'Financials & KPIs', icon: DollarSign },
                    { id: 'clients', label: 'Clients & CRM', icon: Building2 },
                    { id: 'tasks', label: 'Tasks & Roadmap', icon: CheckSquare },
                  ].map((ds) => {
                    const Icon = ds.icon
                    const isSel = selectedDataset === ds.id
                    return (
                      <button
                        key={ds.id}
                        type="button"
                        onClick={() => setSelectedDataset(ds.id as any)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl p-2.5 border transition-all cursor-pointer ${
                          isSel
                            ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-500 text-sky-700 dark:text-sky-300 font-bold shadow-xs ring-1 ring-sky-500/30'
                            : 'bg-slate-50 dark:bg-[#070D1E] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-sky-300'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-[11px] text-center leading-tight">{ds.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 2. Format Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  2. Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'csv', label: 'CSV Spreadsheet', desc: '.csv for Excel/Sheets', icon: FileSpreadsheet },
                    { id: 'json', label: 'JSON Data', desc: '.json raw dataset', icon: FileCode },
                    { id: 'pdf', label: 'PDF / Printable', desc: 'Formatted report', icon: Printer },
                  ].map((fmt) => {
                    const Icon = fmt.icon
                    const isSel = selectedFormat === fmt.id
                    return (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setSelectedFormat(fmt.id as any)}
                        className={`flex flex-col items-center gap-1 rounded-xl p-2.5 border transition-all cursor-pointer ${
                          isSel
                            ? 'bg-sky-50 dark:bg-sky-950/70 border-sky-500 text-sky-700 dark:text-sky-300 font-bold shadow-xs ring-1 ring-sky-500/30'
                            : 'bg-slate-50 dark:bg-[#070D1E] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-sky-300'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-[11px] font-semibold">{fmt.label}</span>
                        <span className="text-[9px] text-slate-400 text-center">{fmt.desc}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 3. Range selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  3. Reporting Interval
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: '7d', label: 'Last 7 Days' },
                    { id: '30d', label: 'Last 30 Days' },
                    { id: 'qtd', label: 'Quarter-to-Date' },
                    { id: 'all', label: 'All Records' },
                  ].map((rg) => (
                    <button
                      key={rg.id}
                      type="button"
                      onClick={() => setSelectedRange(rg.id as any)}
                      className={`rounded-lg py-1.5 text-[10px] font-semibold border transition-all cursor-pointer ${
                        selectedRange === rg.id
                          ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-[#070D1E] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-sky-300'
                      }`}
                    >
                      {rg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between border-t border-sky-100 dark:border-sky-950 px-5 py-3.5 bg-slate-50 dark:bg-[#070D1E]">
              <span className="text-[11px] text-slate-400">
                Grounded in Northwind Database
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="rounded-xl px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteExport}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-md shadow-sky-500/20 hover:from-sky-700 hover:to-blue-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <Check size={13} />
                      <span>Exported!</span>
                    </>
                  ) : (
                    <>
                      <Download size={13} />
                      <span>Download {selectedFormat.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
