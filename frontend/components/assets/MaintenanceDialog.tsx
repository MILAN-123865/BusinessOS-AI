import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { useCreateMaintenance, useUpdateMaintenance, useDeleteMaintenance } from '../../hooks/useMaintenance'
import { MaintenanceRecord } from '../../types/asset'
import { Trash2 } from 'lucide-react'

const schema = z.object({
  type: z.string().min(1, 'Type is required'),
  description: z.string().optional(),
  cost: z.coerce.number().optional(),
  vendor: z.string().optional(),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled']),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  assetId: string
  record: MaintenanceRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MaintenanceDialog({ assetId, record, open, onOpenChange }: Props) {
  const createMutation = useCreateMaintenance()
  const updateMutation = useUpdateMaintenance()
  const deleteMutation = useDeleteMaintenance()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      type: record?.type || '',
      description: record?.description || '',
      cost: record?.cost || 0,
      vendor: record?.vendor || '',
      status: record?.status || 'Scheduled',
      start_date: record?.start_date || '',
      end_date: record?.end_date || '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      if (record) {
        await updateMutation.mutateAsync({ assetId, maintenanceId: record.id, payload: data })
      } else {
        await createMutation.mutateAsync({ assetId, payload: data })
      }
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save maintenance record:', error)
    }
  }

  const handleDelete = async () => {
    if (!record) return
    try {
      await deleteMutation.mutateAsync({ assetId, maintenanceId: record.id })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete maintenance record:', error)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit Maintenance Record' : 'Schedule Maintenance'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Input id="type" {...form.register('type')} className="bg-slate-950 border-slate-800" placeholder="e.g., Routine Checkup" />
              {form.formState.errors.type && <p className="text-sm text-red-400">{form.formState.errors.type.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select defaultValue={form.getValues('status')} onValueChange={(val) => form.setValue('status', val as any)}>
                <SelectTrigger className="bg-slate-950 border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register('description')} className="bg-slate-950 border-slate-800" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input type="date" id="start_date" {...form.register('start_date')} className="bg-slate-950 border-slate-800" />
              {form.formState.errors.start_date && <p className="text-sm text-red-400">{form.formState.errors.start_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input type="date" id="end_date" {...form.register('end_date')} className="bg-slate-950 border-slate-800" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input type="number" id="cost" {...form.register('cost')} className="bg-slate-950 border-slate-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor</Label>
              <Input id="vendor" {...form.register('vendor')} className="bg-slate-950 border-slate-800" />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            {record ? (
              <Button type="button" variant="ghost" onClick={handleDelete} className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            ) : <div></div>}
            
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-700 hover:bg-slate-800">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-primary hover:bg-primary/90">
                {isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
