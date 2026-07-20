import React, { useState } from 'react'
import { useAssetMaintenance } from '../../hooks/useMaintenance'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import { format } from 'date-fns'
import { Button } from '../ui/button'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { Badge } from '../ui/badge'
import { MaintenanceDialog } from './MaintenanceDialog'

interface Props {
  assetId: string
}

export function MaintenanceHistory({ assetId }: Props) {
  const { data: records = [], isLoading } = useAssetMaintenance(assetId)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)

  const handleEdit = (record: any) => {
    setEditingRecord(record)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingRecord(null)
    setIsDialogOpen(true)
  }

  if (isLoading) {
    return <div className="text-center py-10 text-slate-400">Loading maintenance records...</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success'
      case 'In Progress': return 'info'
      case 'Scheduled': return 'warning'
      case 'Cancelled': return 'destructive'
      default: return 'default'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-200">Maintenance Records</h3>
        <Button onClick={handleCreate} size="sm" className="bg-primary">
          <Plus className="h-4 w-4 mr-2" />
          Schedule Maintenance
        </Button>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-10 text-slate-400 bg-slate-900/50 rounded-lg border border-slate-800">
          No maintenance records found.
        </div>
      ) : (
        <div className="rounded-md border border-slate-800">
          <Table>
            <TableHeader className="bg-slate-900/50">
              <TableRow className="border-slate-800">
                <TableHead className="text-slate-400">Type</TableHead>
                <TableHead className="text-slate-400">Status</TableHead>
                <TableHead className="text-slate-400">Start Date</TableHead>
                <TableHead className="text-slate-400">End Date</TableHead>
                <TableHead className="text-slate-400">Cost</TableHead>
                <TableHead className="text-slate-400">Vendor</TableHead>
                <TableHead className="text-right text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id} className="border-slate-800 hover:bg-slate-900/50">
                  <TableCell className="font-medium text-slate-200">{record.type}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(record.status) as any}>{record.status}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {record.start_date ? format(new Date(record.start_date), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {record.end_date ? format(new Date(record.end_date), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {record.cost ? `$${record.cost.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-slate-300">{record.vendor || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(record)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isDialogOpen && (
        <MaintenanceDialog
          assetId={assetId}
          record={editingRecord}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </div>
  )
}
