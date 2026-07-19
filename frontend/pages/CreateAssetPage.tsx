'use client'

import React from 'react'
import { useRouter } from 'next/router'
import { QueryProvider } from '@/components/providers/query-provider'
import { PermissionProvider } from '@/components/providers/permission-provider'
import { AssetForm, AssetFormValues } from '@/components/assets/AssetForm'
import { useCreateAsset } from '@/hooks/useCreateAsset'

function CreateAssetPageContent() {
  const router = useRouter()
  const createMutation = useCreateAsset()

  const handleSubmit = async (data: AssetFormValues) => {
    try {
      await createMutation.mutateAsync(data)
      router.push('/assets')
    } catch (error) {
      console.error('Failed to create asset:', error)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">Create Asset</h1>
        <p className="text-slate-400 mt-1">Add a new asset to your organization's inventory.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6">
        <AssetForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
      </div>
    </div>
  )
}

export default function CreateAssetPage() {
  return (
    <QueryProvider>
      <PermissionProvider>
        <CreateAssetPageContent />
      </PermissionProvider>
    </QueryProvider>
  )
}
