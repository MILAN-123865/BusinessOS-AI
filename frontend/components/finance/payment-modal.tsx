'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CreditCard,
  Building2,
  Lock,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Zap,
  Sparkles,
  X,
} from 'lucide-react'
import { InvoiceData } from '@/lib/invoice-pdf'

interface PaymentModalProps {
  invoice: InvoiceData | null
  isOpen: boolean
  onClose: () => void
  onPaymentSuccess: (invoiceNumber: string, transactionId: string) => void
}

export function PaymentModal({ invoice, isOpen, onClose, onPaymentSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<'card' | 'wire' | 'ach'>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  
  // Processing States: 'idle' | 'processing' | 'verifying' | 'success'
  const [paymentState, setPaymentState] = useState<'idle' | 'processing' | 'verifying' | 'success'>('idle')
  const [transactionId, setTransactionId] = useState('')

  if (!isOpen || !invoice) return null

  const handleAutofillTestCard = () => {
    setCardNumber('4242 •••• •••• 4242')
    setCardExpiry('12/28')
    setCardCvc('888')
    setCardHolder(invoice.client.name)
  }

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault()
    setPaymentState('processing')

    // Simulate 3D Secure / Stripe Webhook Gateway Verification
    setTimeout(() => {
      setPaymentState('verifying')
      
      setTimeout(() => {
        const txnId = `TXN_NW_${Math.random().toString(36).substring(2, 9).toUpperCase()}_2026`
        setTransactionId(txnId)
        setPaymentState('success')
        
        setTimeout(() => {
          onPaymentSuccess(invoice.invoiceNumber, txnId)
          onClose()
          setPaymentState('idle')
        }, 1800)
      }, 1200)
    }, 1000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg rounded-3xl border border-sky-100 dark:border-sky-900/80 bg-white dark:bg-[#0B132B] shadow-2xl overflow-hidden"
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-sky-600 to-blue-700 p-6 text-white">
          <button
            onClick={onClose}
            disabled={paymentState === 'processing' || paymentState === 'verifying'}
            className="absolute right-4 top-4 rounded-full p-1.5 text-white/80 hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2 text-sky-200 text-xs font-semibold uppercase tracking-wider mb-1">
            <Lock size={12} />
            <span>Secure Enterprise Checkout</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{invoice.invoiceNumber}</h3>
              <p className="text-xs text-sky-100/90 mt-0.5">{invoice.client.name}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-sky-200">Amount Due</span>
              <div className="text-2xl font-black">${invoice.totalAmount.toFixed(2)}</div>
            </div>
          </div>
        </div>

        {paymentState === 'success' ? (
          <div className="p-8 text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shadow-lg"
            >
              <CheckCircle2 size={36} />
            </motion.div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Payment Settled Successfully</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                Transaction ID: <span className="text-sky-600 dark:text-sky-400 font-bold">{transactionId}</span>
              </p>
              <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center justify-center gap-1.5">
                <Sparkles size={13} />
                Invoice marked as PAID in Ledger
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleProcessPayment} className="p-6 space-y-5 text-xs">
            {/* Method Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-[#070D1E] border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  method === 'card'
                    ? 'bg-white dark:bg-[#0B132B] text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <CreditCard size={13} />
                <span>Credit Card</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('ach')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  method === 'ach'
                    ? 'bg-white dark:bg-[#0B132B] text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 size={13} />
                <span>ACH Transfer</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('wire')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                  method === 'wire'
                    ? 'bg-white dark:bg-[#0B132B] text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Zap size={13} />
                <span>FedWire</span>
              </button>
            </div>

            {/* Autofill Demo Card Banner */}
            <div className="flex items-center justify-between rounded-xl bg-sky-50 dark:bg-sky-950/40 p-2.5 border border-sky-200 dark:border-sky-900">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-sky-600 dark:text-sky-400" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Sandboxed Enterprise Gateway
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutofillTestCard}
                className="rounded-lg bg-sky-600 px-2.5 py-1 text-[10px] font-bold text-white hover:bg-sky-700 transition-colors cursor-pointer"
              >
                Autofill Test Card
              </button>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="e.g. Maria Anders"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-3.5 py-2 text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] pl-9 pr-3.5 py-2 text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-sky-500"
                  />
                  <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Expiration (MM/YY)
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="12/28"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-3.5 py-2 text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                    CVC / CVV
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="•••"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] px-3.5 py-2 text-slate-900 dark:text-slate-100 font-mono outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={paymentState !== 'idle'}
                className="rounded-xl px-4 py-2 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={paymentState !== 'idle'}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 font-bold text-white hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-75 cursor-pointer"
              >
                {paymentState === 'processing' ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Processing Gateway...</span>
                  </>
                ) : paymentState === 'verifying' ? (
                  <>
                    <Loader2 size={15} className="animate-spin text-amber-200" />
                    <span>Verifying 3D Secure...</span>
                  </>
                ) : (
                  <>
                    <Lock size={13} />
                    <span>Pay ${invoice.totalAmount.toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
