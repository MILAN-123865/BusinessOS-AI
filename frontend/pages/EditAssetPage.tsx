'use client'

import React from 'react'
import { useRouter } from 'next/router'
import { QueryProvider } from '@/components/providers/query-provider'
import { PermissionProvider } from '@/components/providers/permission-provider'
import { AssetForm, AssetFormValues } from '@/components/assets/AssetForm'
import { useUpdateAsset } from '@/hooks/useUpdateAsset'
import { useAsset } from '@/hooks/useAsset'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

function EditAssetPageContent() {
  const router = useRouter()
  const { id } = router.query as { id: string }
  
  const { data: asset, isLoading: isLoadingAsset } = useAsset(id)
  const updateMutation = useUpdateAsset()

  const handleSubmit = async (data: AssetFormValues) => {
    try {
      await updateMutation.mutateAsync({ id, payload: data })
      router.push('/assets')
    } catch (error) {
      console.error('Failed to update asset:', error)
    }
  }

  if (isLoadingAsset) {
    return <div className="p-6 text-center text-slate-400">Loading asset details...</div>
  }

  if (!asset) {
    return <div className="p-6 text-center text-slate-400">Asset not found.</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-4 text-slate-400 hover:text-white"
        onClick={() => router.push('/assets')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Assets
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Edit Asset</h1>
        <p className="text-slate-400 mt-1">Update details for {asset.name} ({asset.asset_code}).</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <AssetForm 
          initialData={asset} 
          onSubmit={handleSubmit} 
          isLoading={updateMutation.isPending} 
        />
      </div>
    </div>
  )
}

export default function EditAssetPage() {
  return (
    <QueryProvider>
      <PermissionProvider>
        <EditAssetPageContent />
      </PermissionProvider>
    </QueryProvider>
  )
}
