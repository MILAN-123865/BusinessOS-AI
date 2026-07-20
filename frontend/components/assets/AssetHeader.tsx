import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { useRouter } from 'next/router'

export function AssetHeader() {
  const router = useRouter()

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Asset Management</h1>
        <p className="text-slate-400 mt-1">Manage and track company assets across their lifecycle.</p>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={() => router.push('/assets/create')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" />
          Add Asset
        </Button>
      </div>
    </div>
  )
}
