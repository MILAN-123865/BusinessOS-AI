'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign,
  Receipt,
  Printer,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  FileText,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  Loader2,
  Trash2,
  Sparkles,
  CreditCard,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { ExportDropdown } from '@/components/ui/export-dropdown'
import { printCorporateInvoice, InvoiceData, InvoiceLineItem } from '@/lib/invoice-pdf'
import { PaymentModal } from '@/components/finance/payment-modal'


const SAMPLE_INVOICES: InvoiceData[] = [
  {
    invoiceNumber: 'INV-2026-084',
    issueDate: '2026-09-15',
    dueDate: '2026-10-15',
    status: 'Paid',
    client: {
      name: 'Alfreds Futterkiste',
      code: 'ALFKI',
      address: 'Obere Str. 57',
      city: 'Berlin',
      country: 'Germany',
      email: 'maria.anders@alfki.de',
      phone: '030-0074321',
    },
    organization: {
      name: 'Northwind Traders Enterprise',
      address: 'One Microsoft Way, Redmond, WA 98052',
      email: 'billing@northwind.com',
      phone: '+1 (800) 555-0199',
      taxNumber: 'US-94-2849102',
    },
    items: [
      { id: '1', description: 'Northwind Aniseed Syrup (Case of 24)', quantity: 15, unitPrice: 10.0, total: 150.0 },
      { id: '2', description: 'Grandma Boysenberry Spread (Case of 12)', quantity: 20, unitPrice: 25.0, total: 500.0 },
      { id: '3', description: 'Chef Anton Cajun Seasoning (Standard)', quantity: 30, unitPrice: 22.0, total: 660.0 },
    ],
    subtotal: 1310.0,
    taxRate: 0.08,
    taxAmount: 104.8,
    discount: 50.0,
    totalAmount: 1364.8,
    notes: 'Payment received via SEPA Direct Bank Transfer. Thank you for your continued partnership.',
  },
  {
    invoiceNumber: 'INV-2026-085',
    issueDate: '2026-09-20',
    dueDate: '2026-10-20',
    status: 'Pending',
    client: {
      name: 'Ana Trujillo Emparedados y helados',
      code: 'ANATR',
      address: 'Avda. de la Constitución 2222',
      city: 'Mexico City',
      country: 'Mexico',
      email: 'ana.trujillo@anatr.com.mx',
      phone: '(5) 555-4729',
    },
    organization: {
      name: 'Northwind Traders Enterprise',
      address: 'One Microsoft Way, Redmond, WA 98052',
      email: 'billing@northwind.com',
      phone: '+1 (800) 555-0199',
      taxNumber: 'US-94-2849102',
    },
    items: [
      { id: '1', description: 'Sir Rodney Scones (Bulk Pack)', quantity: 40, unitPrice: 10.0, total: 400.0 },
      { id: '2', description: 'Gustaf Knäckebröd (Case of 24)', quantity: 25, unitPrice: 21.0, total: 525.0 },
    ],
    subtotal: 925.0,
    taxRate: 0.08,
    taxAmount: 74.0,
    discount: 0.0,
    totalAmount: 999.0,
    notes: 'Payment terms: Net 30 days. Wire transfer to Account #9481-20481.',
  },
  {
    invoiceNumber: 'INV-2026-086',
    issueDate: '2026-08-25',
    dueDate: '2026-09-25',
    status: 'Overdue',
    client: {
      name: 'Around the Horn',
      code: 'AROUT',
      address: '120 Hanover Sq.',
      city: 'London',
      country: 'UK',
      email: 'thomas.hardy@aroundthehorn.co.uk',
      phone: '(171) 555-7788',
    },
    organization: {
      name: 'Northwind Traders Enterprise',
      address: 'One Microsoft Way, Redmond, WA 98052',
      email: 'billing@northwind.com',
      phone: '+1 (800) 555-0199',
      taxNumber: 'US-94-2849102',
    },
    items: [
      { id: '1', description: 'Carnarvon Tigers Jumbo Prawns', quantity: 18, unitPrice: 62.5, total: 1125.0 },
      { id: '2', description: 'Alice Mutton Prime Selection', quantity: 12, unitPrice: 39.0, total: 468.0 },
    ],
    subtotal: 1593.0,
    taxRate: 0.08,
    taxAmount: 127.44,
    discount: 0.0,
    totalAmount: 1720.44,
    notes: '⚠️ Overdue Notice: Immediate settlement required. 1.5% monthly late fee applies.',
  },
  {
    invoiceNumber: 'INV-2026-087',
    issueDate: '2026-09-28',
    dueDate: '2026-10-28',
    status: 'Paid',
    client: {
      name: 'Berglunds snabbköp',
      code: 'BERGS',
      address: 'Berguvsvägen 8',
      city: 'Luleå',
      country: 'Sweden',
      email: 'christina.berglund@bergs.se',
      phone: '0921-12 34 65',
    },
    organization: {
      name: 'Northwind Traders Enterprise',
      address: 'One Microsoft Way, Redmond, WA 98052',
      email: 'billing@northwind.com',
      phone: '+1 (800) 555-0199',
      taxNumber: 'US-94-2849102',
    },
    items: [
      { id: '1', description: 'Camembert Pierrot Gourmet Cheese', quantity: 20, unitPrice: 34.0, total: 680.0 },
      { id: '2', description: 'Chai Tea Premium Blend', quantity: 30, unitPrice: 18.0, total: 540.0 },
    ],
    subtotal: 1220.0,
    taxRate: 0.08,
    taxAmount: 97.6,
    discount: 20.0,
    totalAmount: 1297.6,
    notes: 'Paid in full via Bank Wire on 2026-09-30.',
  },
]

const INVOICE_EXPORT_COLUMNS = [
  { header: 'Invoice Number', key: 'invoiceNumber' },
  { header: 'Client Name', key: (inv: any) => inv.client.name },
  { header: 'Client Code', key: (inv: any) => inv.client.code || 'N/A' },
  { header: 'Status', key: 'status' },
  { header: 'Issue Date', key: 'issueDate' },
  { header: 'Due Date', key: 'dueDate' },
  { header: 'Subtotal ($)', key: (inv: any) => `$${inv.subtotal.toFixed(2)}` },
  { header: 'Total Amount ($)', key: (inv: any) => `$${inv.totalAmount.toFixed(2)}` },
]

export default function FinancePage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>(SAMPLE_INVOICES)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Create Invoice Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [lineItems, setLineItems] = useState<{ description: string; qty: number; price: number }[]>([
    { description: 'Northwind Aniseed Syrup', qty: 10, price: 10.0 },
  ])

  // Payment Gateway Modal State
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceData | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const handleOpenPayment = (inv: InvoiceData) => {
    setSelectedInvoiceForPayment(inv)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentSuccess = (invoiceNumber: string, transactionId: string) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.invoiceNumber === invoiceNumber
          ? {
              ...inv,
              status: 'Paid' as const,
              notes: `${inv.notes || ''} | Settled via Enterprise Gateway [${transactionId}] on ${new Date().toISOString().split('T')[0]}`,
            }
          : inv
      )
    )
  }

  // Financial Metrics
  const paidTotal = invoices.filter((i) => i.status === 'Paid').reduce((acc, curr) => acc + curr.totalAmount, 0)
  const pendingTotal = invoices.filter((i) => i.status === 'Pending').reduce((acc, curr) => acc + curr.totalAmount, 0)
  const overdueTotal = invoices.filter((i) => i.status === 'Overdue').reduce((acc, curr) => acc + curr.totalAmount, 0)
  const grandTotal = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0)

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      searchQuery === '' ||
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.client.city && inv.client.city.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = (invoiceNumber: string, newStatus: InvoiceData['status']) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.invoiceNumber === invoiceNumber ? { ...inv, status: newStatus } : inv))
    )
  }

  const handleAddLineItem = () => {
    setLineItems((prev) => [...prev, { description: '', qty: 1, price: 0.0 }])
  }

  const handleRemoveLineItem = (idx: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || lineItems.length === 0) return

    const items: InvoiceLineItem[] = lineItems.map((item, idx) => ({
      id: String(idx + 1),
      description: item.description || 'Custom Line Item',
      quantity: Number(item.qty) || 1,
      unitPrice: Number(item.price) || 0.0,
      total: (Number(item.qty) || 1) * (Number(item.price) || 0.0),
    }))

    const subtotal = items.reduce((acc, curr) => acc + curr.total, 0)
    const taxRate = 0.08
    const taxAmount = subtotal * taxRate
    const totalAmount = subtotal + taxAmount

    const newInvoice: InvoiceData = {
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'Pending',
      client: {
        name: clientName.trim(),
        email: clientEmail.trim() || 'client@enterprise.com',
        city: 'Global Account',
        country: 'Enterprise',
      },
      organization: {
        name: 'Northwind Traders Enterprise',
        address: 'One Microsoft Way, Redmond, WA 98052',
        email: 'billing@northwind.com',
        phone: '+1 (800) 555-0199',
        taxNumber: 'US-94-2849102',
      },
      items,
      subtotal,
      taxRate,
      taxAmount,
      discount: 0.0,
      totalAmount,
      notes: 'Net 30 days payment terms. Wire transfer to Northwind Traders Corporate.',
    }

    setInvoices((prev) => [newInvoice, ...prev])
    setIsCreateOpen(false)
    setClientName('')
    setClientEmail('')
    setLineItems([{ description: 'Northwind Product Batch', qty: 10, price: 15.0 }])

    // Prompt to immediately print PDF invoice
    printCorporateInvoice(newInvoice)
  }

  const getStatusBadge = (status: InvoiceData['status']) => {
    switch (status) {
      case 'Paid':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
      case 'Pending':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
      case 'Overdue':
        return 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 dark:border-sky-950 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
              <Receipt size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  Financial Ledger & Invoice Center
                </h1>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Live PDF Generator
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Generate executive PDF corporate invoices, monitor receivables, and audit cash flow ledger records.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ExportDropdown
              filename="Northwind_Invoices_Ledger"
              title="Accounts Receivable & Invoices Ledger"
              subtitle="Northwind Enterprise Financial Center"
              data={filteredInvoices}
              columns={INVOICE_EXPORT_COLUMNS}
            />
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-sky-700 transition-all shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <Plus size={15} />
              <span>Create Invoice</span>
            </button>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Paid Revenue</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              ${paidTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Realized Operating Liquidity</p>
          </div>

          <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Pending Receivables</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                <Clock size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              ${pendingTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-amber-600 font-semibold mt-1">Awaiting 30-Day Settlement</p>
          </div>

          <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Overdue Invoices</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <AlertCircle size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              ${overdueTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-rose-600 font-semibold mt-1">Requires Immediate Dunning Notice</p>
          </div>

          <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Total Invoiced</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                <DollarSign size={15} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-sky-600 font-semibold mt-1">{invoices.length} Registered Billings</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-4 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice #, client, or city..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Status Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300 outline-none"
            >
              <option value="ALL">All Invoices</option>
              <option value="Paid">Paid Only</option>
              <option value="Pending">Pending Only</option>
              <option value="Overdue">Overdue Only</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070D1E] text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="px-4 py-3">Invoice / Client</th>
                  <th className="px-4 py-3">Dates (Issue / Due)</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.invoiceNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-mono font-bold text-sky-700 dark:text-sky-400">
                        {inv.invoiceNumber}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-0.5 flex items-center gap-1.5">
                        <Building2 size={12} className="text-slate-400" />
                        <span>{inv.client.name}</span>
                        {inv.client.code && (
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.2 text-[9px] text-slate-500 font-mono">
                            {inv.client.code}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-[11px] text-slate-500 dark:text-slate-400">
                      <div>Issue: <strong>{inv.issueDate}</strong></div>
                      <div>Due: <strong className={inv.status === 'Overdue' ? 'text-rose-600' : ''}>{inv.dueDate}</strong></div>
                    </td>

                    <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-slate-900 dark:text-slate-200">{inv.items.length} product(s)</span>
                      <p className="truncate max-w-[200px] text-[10px] text-slate-400">
                        {inv.items.map((i) => i.description).join(', ')}
                      </p>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        ${inv.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Subtotal: ${inv.subtotal.toFixed(2)}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={inv.status}
                        onChange={(e) => handleStatusChange(inv.invoiceNumber, e.target.value as any)}
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold outline-none cursor-pointer ${getStatusBadge(
                          inv.status
                        )}`}
                      >
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                      {inv.status !== 'Paid' && (
                        <button
                          onClick={() => handleOpenPayment(inv)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:from-emerald-600 hover:to-teal-700 transition-all cursor-pointer shadow-xs"
                          title="Simulate Instant Checkout / Gateway Payment"
                        >
                          <CreditCard size={13} />
                          <span>Pay Now</span>
                        </button>
                      )}
                      <button
                        onClick={() => printCorporateInvoice(inv)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 hover:border-sky-300 transition-all cursor-pointer shadow-2xs"
                        title="Print / Save PDF Corporate Invoice"
                      >
                        <Printer size={13} />
                        <span>Print PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Invoice Modal */}
        <AnimatePresence>
          {isCreateOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-xl rounded-2xl border border-sky-100 dark:border-sky-900 bg-white dark:bg-[#0B132B] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-3 border-b border-sky-100 dark:border-sky-950">
                  <div className="flex items-center gap-2">
                    <Receipt size={18} className="text-sky-600 dark:text-sky-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Corporate Invoice</h3>
                  </div>
                  <button
                    onClick={() => setIsCreateOpen(false)}
                    className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Client / Customer Name
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Quick-Stop Gourmet"
                        required
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-3.5 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                        Client Billing Email
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="accounting@quickstop.com"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-3.5 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* Line Items Builder */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Invoice Line Items ({lineItems.length})
                      </span>
                      <button
                        type="button"
                        onClick={handleAddLineItem}
                        className="text-[11px] font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} /> Add Item
                      </button>
                    </div>

                    <div className="space-y-2">
                      {lineItems.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const val = e.target.value
                              setLineItems((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, description: val } : it))
                              )
                            }}
                            placeholder="Item description (e.g. Alice Mutton)"
                            required
                            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500"
                          />
                          <input
                            type="number"
                            value={item.qty}
                            min={1}
                            onChange={(e) => {
                              const val = Number(e.target.value)
                              setLineItems((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, qty: val } : it))
                              )
                            }}
                            placeholder="Qty"
                            className="w-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 text-center outline-none"
                          />
                          <input
                            type="number"
                            value={item.price}
                            step="0.01"
                            min={0}
                            onChange={(e) => {
                              const val = Number(e.target.value)
                              setLineItems((prev) =>
                                prev.map((it, i) => (i === idx ? { ...it, price: val } : it))
                              )
                            }}
                            placeholder="Price"
                            className="w-20 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-2 py-1.5 text-xs text-slate-900 dark:text-slate-100 text-right outline-none"
                          />
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveLineItem(idx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsCreateOpen(false)}
                      className="rounded-xl px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2 font-bold text-white hover:bg-sky-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <Printer size={14} />
                      <span>Save & Print PDF</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Payment Gateway Modal */}
        <PaymentModal
          invoice={selectedInvoiceForPayment}
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      </div>
    </AppLayout>

  )
}
