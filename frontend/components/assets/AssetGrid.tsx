import React from 'react'
import { Asset } from '../../types/asset'
import { AssetCard } from './AssetCard'

interface Props {
  assets: Asset[]
  isLoading: boolean
  onDelete: (asset: Asset) => void
}

export function AssetGrid({ assets, isLoading, onDelete }: Props) {
  if (isLoading) {
    return <div className="text-center py-10 text-slate-400">Loading assets...</div>
  }

  if (assets.length === 0) {
    return <div className="text-center py-10 text-slate-400">No assets found.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {assets.map((asset) => (
        <AssetCard key={asset.id} asset={asset} onDelete={onDelete} />
      ))}
    </div>
  )
}
