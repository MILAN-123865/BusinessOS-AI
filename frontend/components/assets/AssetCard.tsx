import React from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Asset } from '../../types/asset'
import { AssetStatusBadge } from './AssetStatusBadge'
import { AssetCategoryBadge } from './AssetCategoryBadge'
import { Button } from '../ui/button'
import { Eye, Edit, Trash2, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'

interface Props {
  asset: Asset
  onDelete: (asset: Asset) => void
}

export function AssetCard({ asset, onDelete }: Props) {
  const router = useRouter()

  return (
    <Card className="bg-slate-900/50 border-slate-800 flex flex-col">
      <CardHeader className="pb-3 flex-row justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-slate-200 line-clamp-1">{asset.name}</h3>
          <p className="text-sm text-slate-400">{asset.asset_code}</p>
        </div>
        <AssetStatusBadge status={asset.status} />
      </CardHeader>
      <CardContent className="flex-1 pb-3 text-sm text-slate-300 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Category</span>
          <AssetCategoryBadge category={asset.category?.name || 'Unknown'} />
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1 text-slate-500"><User className="h-3 w-3"/> Assigned</span>
          <span className="truncate max-w-[120px]">
            {asset.assigned_employee?.first_name 
              ? `${asset.assigned_employee.first_name} ${asset.assigned_employee.last_name}`
              : asset.assigned_department?.name || 'Unassigned'}
          </span>
        </div>
        {asset.purchase_date && (
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-slate-500"><Calendar className="h-3 w-3"/> Purchased</span>
            <span>{format(new Date(asset.purchase_date), 'MMM d, yyyy')}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 border-t border-slate-800 flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/assets/${asset.id}`)}
          className="text-slate-400 hover:text-white"
        >
          <Eye className="h-4 w-4 mr-1" /> View
        </Button>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/assets/${asset.id}/edit`)}
            className="text-slate-400 hover:text-white h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(asset)}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
