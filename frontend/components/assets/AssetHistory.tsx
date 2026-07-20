import React from 'react'
import { useAssetHistory } from '../../hooks/useAssetHistory'
import { format } from 'date-fns'

interface Props {
  assetId: string
}

export function AssetHistory({ assetId }: Props) {
  const { data: history = [], isLoading } = useAssetHistory(assetId)

  if (isLoading) {
    return <div className="text-center py-10 text-slate-400">Loading history...</div>
  }

  if (history.length === 0) {
    return <div className="text-center py-10 text-slate-400">No history found for this asset.</div>
  }

  return (
    <div className="space-y-6">
      <div className="relative border-l border-slate-800 ml-4 space-y-8">
        {history.map((record) => (
          <div key={record.id} className="relative pl-6">
            <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-slate-950" />
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
              <h4 className="font-semibold text-slate-200">{record.action}</h4>
              <span className="text-sm text-slate-500">
                {record.created_at ? format(new Date(record.created_at), 'MMM d, yyyy h:mm a') : 'Unknown time'}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{record.description}</p>
            {record.performed_by && (
              <p className="text-slate-500 text-xs mt-2">
                By {record.performed_by.first_name} {record.performed_by.last_name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
