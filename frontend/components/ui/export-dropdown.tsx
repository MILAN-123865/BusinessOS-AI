'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileSpreadsheet, FileJson, Printer, ChevronDown } from 'lucide-react'
import { exportToCsv, exportToJson, exportToPrintableReport, ExportColumn } from '@/lib/export-utils'

interface ExportDropdownProps<T extends Record<string, any>> {
  filename: string
  title: string
  subtitle?: string
  data: T[]
  columns: ExportColumn<T>[]
  buttonLabel?: string
  className?: string
}

export function ExportDropdown<T extends Record<string, any>>({
  filename,
  title,
  subtitle = 'Enterprise workspace records',
  data,
  columns,
  buttonLabel = 'Export',
  className = '',
}: ExportDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleExportCsv = () => {
    exportToCsv(filename, data, columns)
    setIsOpen(false)
  }

  const handleExportJson = () => {
    exportToJson(filename, data)
    setIsOpen(false)
  }

  const handleExportPrint = () => {
    exportToPrintableReport(title, subtitle, data, columns)
    setIsOpen(false)
  }

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!data || data.length === 0}
        className="flex items-center gap-2 rounded-xl border border-sky-200/80 dark:border-sky-900/80 bg-white dark:bg-[#0F172A] px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs hover:border-sky-400 dark:hover:border-sky-700 hover:bg-sky-50/50 dark:hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-50"
      >
        <Download size={14} className="text-sky-600 dark:text-sky-400" />
        <span>{buttonLabel}</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1.5 w-48 rounded-xl border border-sky-100 dark:border-sky-900 bg-white dark:bg-[#0B132B] p-1.5 text-slate-800 dark:text-slate-200 shadow-xl z-50 backdrop-blur-xl space-y-0.5"
          >
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Export Format ({data.length} rows)
            </div>

            <button
              onClick={handleExportCsv}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-sky-50 dark:hover:bg-sky-950/50 text-slate-700 dark:text-slate-200 hover:text-sky-600 transition-colors text-left cursor-pointer"
            >
              <FileSpreadsheet size={15} className="text-emerald-500" />
              <div>
                <p className="font-semibold">CSV Spreadsheet</p>
                <p className="text-[10px] text-slate-400">Excel / Google Sheets</p>
              </div>
            </button>

            <button
              onClick={handleExportJson}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-sky-50 dark:hover:bg-sky-950/50 text-slate-700 dark:text-slate-200 hover:text-sky-600 transition-colors text-left cursor-pointer"
            >
              <FileJson size={15} className="text-amber-500" />
              <div>
                <p className="font-semibold">JSON Raw Data</p>
                <p className="text-[10px] text-slate-400">Structured machine feed</p>
              </div>
            </button>

            <button
              onClick={handleExportPrint}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium hover:bg-sky-50 dark:hover:bg-sky-950/50 text-slate-700 dark:text-slate-200 hover:text-sky-600 transition-colors text-left cursor-pointer"
            >
              <Printer size={15} className="text-indigo-500" />
              <div>
                <p className="font-semibold">Printable PDF Report</p>
                <p className="text-[10px] text-slate-400">Clean print preview sheet</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
