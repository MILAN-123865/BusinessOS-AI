'use client'

import React, { useState } from 'react'
import { QueryProvider } from '@/components/providers/query-provider'
import { PermissionProvider } from '@/components/providers/permission-provider'
import { AssetHeader } from '@/components/assets/AssetHeader'
import { AssetFilters } from '@/components/assets/AssetFilters'
import { AssetSearch } from '@/components/assets/AssetSearch'
import { AssetTable } from '@/components/assets/AssetTable'
import { AssetGrid } from '@/components/assets/AssetGrid'
import { DeleteAssetDialog } from '@/components/assets/DeleteAssetDialog'
import { useAssets } from '@/hooks/useAssets'
import { Asset, AssetStatus, AssetCondition } from '@/types/asset'
import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'

function AssetsPageContent() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<AssetStatus | 'All'>('All')
  const [condition, setCondition] = useState<AssetCondition | 'All'>('All')
  const [view, setView] = useState<'grid' | 'table'>('table')
  
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null)
  
  const { data: assets = [], isLoading } = useAssets({
    search: search || undefined,
    status: status !== 'All' ? status : undefined,
    condition: condition !== 'All' ? condition : undefined,
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AssetHeader />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <AssetSearch value={search} onChange={setSearch} />
        <div className="flex items-center gap-4">
          <AssetFilters 
            status={status} 
            setStatus={setStatus} 
            condition={condition} 
            setCondition={setCondition} 
          />
          <div className="flex bg-slate-900 border border-slate-800 rounded-md p-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${view === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${view === 'table' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}
              onClick={() => setView('table')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {view === 'table' ? (
        <AssetTable assets={assets} isLoading={isLoading} onDelete={setAssetToDelete} />
      ) : (
        <AssetGrid assets={assets} isLoading={isLoading} onDelete={setAssetToDelete} />
      )}

      <DeleteAssetDialog 
        asset={assetToDelete} 
        open={!!assetToDelete} 
        onOpenChange={(open) => !open && setAssetToDelete(null)} 
      />
    </div>
  )
}

export default function AssetsPage() {
  return (
    <QueryProvider>
      <PermissionProvider>
        <AssetsPageContent />
      </PermissionProvider>
    </QueryProvider>
  )
}
