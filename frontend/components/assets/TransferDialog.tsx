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
import { Asset } from '../../types/asset'
import { useUpdateAsset } from '../../hooks/useUpdateAsset'

const schema = z.object({
  assigned_employee_id: z.string().optional(),
  assigned_department_id: z.string().optional(),
  assigned_project_id: z.string().optional(),
}).refine((data) => data.assigned_employee_id || data.assigned_department_id || data.assigned_project_id, {
  message: "At least one assignment target must be provided",
  path: ["assigned_employee_id"],
})

type FormValues = z.infer<typeof schema>

interface Props {
  asset: Asset
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TransferDialog({ asset, open, onOpenChange }: Props) {
  const updateMutation = useUpdateAsset()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      assigned_employee_id: asset.assigned_employee_id || '',
      assigned_department_id: asset.assigned_department_id || '',
      assigned_project_id: asset.assigned_project_id || '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: asset.id,
        payload: {
          ...data,
          status: 'Assigned',
        },
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to transfer asset:', error)
    }
  }

  const handleReturn = async () => {
    try {
      await updateMutation.mutateAsync({
        id: asset.id,
        payload: {
          assigned_employee_id: undefined,
          assigned_department_id: undefined,
          assigned_project_id: undefined,
          status: 'Available',
        },
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to return asset:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle>Transfer Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="assigned_employee_id">Employee ID</Label>
            <Input id="assigned_employee_id" {...form.register('assigned_employee_id')} className="bg-slate-950 border-slate-800" placeholder="UUID of employee" />
            {form.formState.errors.assigned_employee_id && <p className="text-sm text-red-400">{form.formState.errors.assigned_employee_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_department_id">Department ID</Label>
            <Input id="assigned_department_id" {...form.register('assigned_department_id')} className="bg-slate-950 border-slate-800" placeholder="UUID of department" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_project_id">Project ID</Label>
            <Input id="assigned_project_id" {...form.register('assigned_project_id')} className="bg-slate-950 border-slate-800" placeholder="UUID of project" />
          </div>

          <div className="flex flex-col sm:flex-row justify-between pt-4 border-t border-slate-800 gap-2">
            <Button type="button" variant="outline" onClick={handleReturn} className="border-slate-700 hover:bg-slate-800" disabled={updateMutation.isPending}>
              Unassign & Return
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400">
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90">
                Transfer
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
