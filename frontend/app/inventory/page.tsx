'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Boxes,
  Scan,
  Barcode,
  Search,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Plus,
  RefreshCw,
  Truck,
  DollarSign,
  PackageCheck,
  Zap,
  Filter,
  Volume2,
} from 'lucide-react'
import { AppLayout } from '@/components/layout/app-layout'
import { ExportDropdown } from '@/components/ui/export-dropdown'

interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  unitsInStock: number
  unitsOnOrder: number
  reorderLevel: number
  unitPrice: number
  supplier: string
  lastScanned?: string
}

const SAMPLE_INVENTORY: InventoryItem[] = [
  {
    id: 'prod_1',
    sku: 'NW-SKU-1001',
    name: 'Chai Tea Classic Blend',
    category: 'Beverages',
    unitsInStock: 39,
    unitsOnOrder: 0,
    reorderLevel: 10,
    unitPrice: 18.0,
    supplier: 'Exotic Liquids',
  },
  {
    id: 'prod_2',
    sku: 'NW-SKU-1002',
    name: 'Chang Craft Pale Ale',
    category: 'Beverages',
    unitsInStock: 17,
    unitsOnOrder: 40,
    reorderLevel: 25,
    unitPrice: 19.0,
    supplier: 'Exotic Liquids',
  },
  {
    id: 'prod_3',
    sku: 'NW-SKU-1003',
    name: 'Aniseed Syrup (Case of 24)',
    category: 'Condiments',
    unitsInStock: 13,
    unitsOnOrder: 70,
    reorderLevel: 25,
    unitPrice: 10.0,
    supplier: 'Exotic Liquids',
  },
  {
    id: 'prod_4',
    sku: 'NW-SKU-1004',
    name: "Chef Anton's Cajun Seasoning",
    category: 'Condiments',
    unitsInStock: 53,
    unitsOnOrder: 0,
    reorderLevel: 15,
    unitPrice: 22.0,
    supplier: "New Orleans Cajun Delights",
  },
  {
    id: 'prod_5',
    sku: 'NW-SKU-1005',
    name: "Grandma's Boysenberry Spread",
    category: 'Condiments',
    unitsInStock: 8,
    unitsOnOrder: 50,
    reorderLevel: 25,
    unitPrice: 25.0,
    supplier: "Grandma Kelly's Homestead",
  },
  {
    id: 'prod_6',
    sku: 'NW-SKU-1006',
    name: "Uncle Bob's Organic Dried Pears",
    category: 'Produce',
    unitsInStock: 15,
    unitsOnOrder: 0,
    reorderLevel: 10,
    unitPrice: 30.0,
    supplier: "Grandma Kelly's Homestead",
  },
  {
    id: 'prod_7',
    sku: 'NW-SKU-1007',
    name: 'Carnarvon Tigers Jumbo Prawns',
    category: 'Seafood',
    unitsInStock: 4,
    unitsOnOrder: 30,
    reorderLevel: 15,
    unitPrice: 62.5,
    supplier: 'Pavlova, Ltd.',
  },
]

const INVENTORY_COLUMNS = [
  { header: 'SKU', key: 'sku' },
  { header: 'Product Name', key: 'name' },
  { header: 'Category', key: 'category' },
  { header: 'Units in Stock', key: 'unitsInStock' },
  { header: 'Units on Order', key: 'unitsOnOrder' },
  { header: 'Reorder Level', key: 'reorderLevel' },
  { header: 'Unit Price ($)', key: (i: any) => `$${i.unitPrice.toFixed(2)}` },
  { header: 'Supplier', key: 'supplier' },
]

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>(SAMPLE_INVENTORY)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false)

  // Barcode Scanner Simulator State
  const [isScannerOpen, setIsScannerOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null)
  const [scanNotification, setScanNotification] = useState<string | null>(null)

  const lowStockCount = items.filter((i) => i.unitsInStock <= i.reorderLevel).length
  const totalStockUnits = items.reduce((acc, curr) => acc + curr.unitsInStock, 0)
  const totalInventoryValuation = items.reduce((acc, curr) => acc + curr.unitsInStock * curr.unitPrice, 0)

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLowStock = !filterLowStockOnly || item.unitsInStock <= item.reorderLevel
    return matchesSearch && matchesLowStock
  })

  // Play synthesized laser scanner sound
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(1800, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.12)
    } catch {
      // Ignore if audio permissions are restricted
    }
  }

  const handleSimulateBarcodeScan = (itemToScan: InventoryItem) => {
    setIsScanning(true)
    setScannedItem(null)

    setTimeout(() => {
      playBeep()
      setIsScanning(false)
      setScannedItem(itemToScan)
      setScanNotification(`Barcode Verified: ${itemToScan.sku} (${itemToScan.name})`)

      // Update last scanned timestamp
      setItems((prev) =>
        prev.map((it) =>
          it.id === itemToScan.id
            ? { ...it, lastScanned: new Date().toLocaleTimeString() }
            : it
        )
      )
    }, 1200)
  }

  const handleReorderStock = (itemId: string, addQty: number = 25) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, unitsInStock: it.unitsInStock + addQty, unitsOnOrder: Math.max(0, it.unitsOnOrder - addQty) }
          : it
      )
    )
    if (scannedItem && scannedItem.id === itemId) {
      setScannedItem((prev) => (prev ? { ...prev, unitsInStock: prev.unitsInStock + addQty } : null))
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sky-100 dark:border-sky-950 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20">
              <Boxes size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                  Inventory & Warehouse Operations
                </h1>
                <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Northwind SKU Catalog
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitor SKU quantities, reorder thresholds, and simulate real-time barcode scanning.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ExportDropdown
              filename="Northwind_Inventory_Stock"
              title="Warehouse Inventory & Stock Valuation"
              subtitle="Northwind Traders Enterprise"
              data={filteredItems}
              columns={INVENTORY_COLUMNS}
            />
            <button
              onClick={() => setIsScannerOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Scan size={15} />
              <span>Barcode Scanner</span>
            </button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Total Units in Stock</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                <Boxes size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              {totalStockUnits.toLocaleString()} units
            </div>
            <p className="text-[10px] text-sky-600 font-semibold mt-1">{items.length} Active SKUs</p>
          </div>

          <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Low-Stock Alerts</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
                <AlertTriangle size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-rose-600 mt-2">{lowStockCount} SKUs</div>
            <p className="text-[10px] text-rose-600 font-semibold mt-1">Below Reorder Level</p>
          </div>

          <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
              <span>Warehouse Valuation</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
              ${totalInventoryValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold mt-1">Realized Assets at Cost</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] p-4 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by SKU, product name, or supplier..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-sky-500"
            />
          </div>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              filterLowStockOnly
                ? 'border-rose-300 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D1E] text-slate-600 dark:text-slate-400'
            }`}
          >
            <AlertTriangle size={13} />
            <span>Low Stock Only ({lowStockCount})</span>
          </button>
        </div>

        {/* Inventory Table */}
        <div className="rounded-2xl border border-sky-100 dark:border-sky-900/60 bg-white dark:bg-[#0B132B] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-[#070D1E] text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="px-4 py-3">SKU / Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Stock Level</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredItems.map((item) => {
                  const isLow = item.unitsInStock <= item.reorderLevel
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                          <Barcode size={14} className="text-slate-400" />
                          <span>{item.sku}</span>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-0.5">
                          {item.name}
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          {item.category}
                        </span>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              isLow ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {item.unitsInStock}
                          </span>
                          <span className="text-[10px] text-slate-400">/ min {item.reorderLevel}</span>
                          {isLow && (
                            <span className="rounded-full bg-rose-100 dark:bg-rose-950 px-2 py-0.5 text-[9px] font-bold text-rose-700 dark:text-rose-300">
                              Low Stock
                            </span>
                          )}
                        </div>
                        {item.unitsOnOrder > 0 && (
                          <div className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5">
                            <Truck size={10} /> {item.unitsOnOrder} on order
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        ${item.unitPrice.toFixed(2)}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                        {item.supplier}
                      </td>

                      <td className="px-4 py-3 text-right whitespace-nowrap space-x-2">
                        <button
                          onClick={() => {
                            setIsScannerOpen(true)
                            handleSimulateBarcodeScan(item)
                          }}
                          className="inline-flex items-center gap-1 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 transition-colors cursor-pointer"
                          title="Simulate Laser Barcode Scan"
                        >
                          <Scan size={12} />
                          <span>Scan</span>
                        </button>
                        <button
                          onClick={() => handleReorderStock(item.id, 20)}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-900 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>+20 PO</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Barcode Scanner Simulator Modal */}
        <AnimatePresence>
          {isScannerOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#070D1E] p-6 shadow-2xl space-y-4 text-white overflow-hidden"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Scan size={18} className="text-emerald-400" />
                    <h3 className="text-sm font-bold">Industrial Barcode Terminal Simulator</h3>
                  </div>
                  <button
                    onClick={() => setIsScannerOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Laser Scanning Viewport */}
                <div className="relative h-44 rounded-2xl bg-black border border-slate-800 flex items-center justify-center overflow-hidden">
                  <div className="flex flex-col items-center gap-2 z-10">
                    <Barcode size={64} className="text-slate-600" />
                    <span className="font-mono text-xs text-slate-400">Target Barcode in Viewport</span>
                  </div>

                  {/* Animated Red Laser Scanline */}
                  <motion.div
                    animate={{ y: [-70, 70, -70] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute left-4 right-4 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e]"
                  />
                </div>

                {/* Scanned Result Card */}
                {scannedItem && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-emerald-800/80 bg-emerald-950/40 p-4 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-emerald-400">{scannedItem.sku}</span>
                      <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                        <CheckCircle2 size={12} /> VERIFIED
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white">{scannedItem.name}</div>
                    <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1">
                      <span>Stock: <strong className="text-white">{scannedItem.unitsInStock} units</strong></span>
                      <span>Price: <strong className="text-emerald-400">${scannedItem.unitPrice.toFixed(2)}</strong></span>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleReorderStock(scannedItem.id, 25)}
                        className="flex-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors"
                      >
                        +25 Restock PO
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Quick Scan SKU Buttons */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">1-Click Test SKU Scanners</span>
                  <div className="grid grid-cols-2 gap-2">
                    {items.slice(0, 4).map((it) => (
                      <button
                        key={it.id}
                        onClick={() => handleSimulateBarcodeScan(it)}
                        className="rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-left hover:border-emerald-500 transition-colors"
                      >
                        <div className="font-mono text-[10px] text-emerald-400 font-bold">{it.sku}</div>
                        <div className="text-[11px] font-medium text-slate-200 truncate">{it.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  )
}
