import React from 'react'
import { useRouter } from 'next/router'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { Asset } from '../../types/asset'
import { AssetStatusBadge } from './AssetStatusBadge'
import { AssetCategoryBadge } from './AssetCategoryBadge'
import { Button } from '../ui/button'
import { Eye, Edit, Trash2 } from 'lucide-react'

interface Props {
  assets: Asset[]
  isLoading: boolean
  onDelete: (asset: Asset) => void
}

export function AssetTable({ assets, isLoading, onDelete }: Props) {
  const router = useRouter()

  if (isLoading) {
    return <div className="text-center py-10 text-slate-400">Loading assets...</div>
  }

  if (assets.length === 0) {
    return <div className="text-center py-10 text-slate-400">No assets found.</div>
  }

  return (
    <div className="rounded-md border border-slate-800">
      <Table>
        <TableHeader className="bg-slate-900/50">
          <TableRow className="border-slate-800">
            <TableHead className="text-slate-400">Code</TableHead>
            <TableHead className="text-slate-400">Name</TableHead>
            <TableHead className="text-slate-400">Category</TableHead>
            <TableHead className="text-slate-400">Status</TableHead>
            <TableHead className="text-slate-400">Assigned To</TableHead>
            <TableHead className="text-right text-slate-400">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id} className="border-slate-800 hover:bg-slate-900/50">
              <TableCell className="font-medium text-slate-200">{asset.asset_code}</TableCell>
              <TableCell className="text-slate-300">{asset.name}</TableCell>
              <TableCell>
                <AssetCategoryBadge category={asset.category?.name || 'Uncategorized'} />
              </TableCell>
              <TableCell>
                <AssetStatusBadge status={asset.status} />
              </TableCell>
              <TableCell className="text-slate-400">
                {asset.assigned_employee?.first_name 
                  ? `${asset.assigned_employee.first_name} ${asset.assigned_employee.last_name}`
                  : asset.assigned_department?.name || 'Unassigned'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/assets/${asset.id}`)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push(`/assets/${asset.id}/edit`)}
                    className="text-slate-400 hover:text-white"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(asset)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
