'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { QueryProvider } from '@/components/providers/query-provider'
import { PermissionProvider } from '@/components/providers/permission-provider'
import { AssetDetails } from '@/components/assets/AssetDetails'
import { useAsset } from '@/hooks/useAsset'
import { useDeleteAsset } from '@/hooks/useDeleteAsset'
import { ArrowLeft, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AssetStatusBadge } from '@/components/assets/AssetStatusBadge'
import { DeleteAssetDialog } from '@/components/assets/DeleteAssetDialog'

function AssetDetailsPageContent() {
  const router = useRouter()
  const { id } = router.query as { id: string }
  
  const { data: asset, isLoading } = useAsset(id)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  if (isLoading) {
    return <div className="p-6 text-center text-slate-400">Loading asset details...</div>
  }

  if (!asset) {
    return <div className="p-6 text-center text-slate-400">Asset not found.</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4 text-slate-400 hover:text-white"
        onClick={() => router.push('/assets')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Assets
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">{asset.name}</h1>
            <AssetStatusBadge status={asset.status} />
          </div>
          <p className="text-slate-400 mt-1 flex items-center gap-2">
            Code: <span className="text-slate-300 font-mono">{asset.asset_code}</span> | 
            Category: <span className="text-slate-300">{asset.category?.name || 'Uncategorized'}</span>
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/assets/${asset.id}/edit`)}
            className="border-slate-700 hover:bg-slate-800 text-slate-200"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Asset
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
            className="bg-red-600/90 hover:bg-red-600 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <AssetDetails asset={asset} />

      <DeleteAssetDialog 
        asset={asset} 
        open={isDeleteDialogOpen} 
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open)
          if (!open && !asset) {
            router.push('/assets')
          }
        }} 
      />
    </div>
  )
}

export default function AssetDetailsPage() {
  return (
    <QueryProvider>
      <PermissionProvider>
        <AssetDetailsPageContent />
      </PermissionProvider>
    </QueryProvider>
  )
}
