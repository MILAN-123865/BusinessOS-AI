import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/router'
import { Asset, AssetStatus, AssetCondition } from '../../types/asset'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Textarea } from '../ui/textarea'

const assetSchema = z.object({
  asset_code: z.string().min(1, 'Asset code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category_id: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_price: z.coerce.number().optional(),
  vendor: z.string().optional(),
  status: z.enum(['Available', 'Assigned', 'Maintenance', 'Repair', 'Reserved', 'Lost', 'Disposed', 'Retired']),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Poor', 'Damaged']),
  location: z.string().optional(),
  warranty_start: z.string().optional(),
  warranty_end: z.string().optional(),
  notes: z.string().optional(),
})

export type AssetFormValues = z.infer<typeof assetSchema>

interface Props {
  initialData?: Asset
  onSubmit: (data: AssetFormValues) => void
  isLoading?: boolean
}

export function AssetForm({ initialData, onSubmit, isLoading }: Props) {
  const router = useRouter()
  
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema) as any,
    defaultValues: {
      asset_code: initialData?.asset_code || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      category_id: initialData?.category_id || '',
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      serial_number: initialData?.serial_number || '',
      purchase_date: initialData?.purchase_date || '',
      purchase_price: initialData?.purchase_price || 0,
      vendor: initialData?.vendor || '',
      status: initialData?.status || 'Available',
      condition: initialData?.condition || 'Good',
      location: initialData?.location || '',
      warranty_start: initialData?.warranty_start || '',
      warranty_end: initialData?.warranty_end || '',
      notes: initialData?.notes || '',
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-200 border-b border-slate-800 pb-2">Basic Information</h3>
          
          <div className="space-y-2">
            <Label htmlFor="asset_code">Asset Code *</Label>
            <Input id="asset_code" {...form.register('asset_code')} className="bg-slate-900 border-slate-800" />
            {form.formState.errors.asset_code && <p className="text-sm text-red-400">{form.formState.errors.asset_code.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Asset Name *</Label>
            <Input id="name" {...form.register('name')} className="bg-slate-900 border-slate-800" />
            {form.formState.errors.name && <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Category ID *</Label>
            <Input id="category_id" {...form.register('category_id')} className="bg-slate-900 border-slate-800" placeholder="UUID of category" />
            {form.formState.errors.category_id && <p className="text-sm text-red-400">{form.formState.errors.category_id.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register('description')} className="bg-slate-900 border-slate-800" />
          </div>
        </div>

        {/* Details & Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-200 border-b border-slate-800 pb-2">Details & Status</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status *</Label>
              <Select 
                defaultValue={form.getValues('status')} 
                onValueChange={(val) => form.setValue('status', val as any)}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Assigned">Assigned</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                  <SelectItem value="Reserved">Reserved</SelectItem>
                  <SelectItem value="Lost">Lost</SelectItem>
                  <SelectItem value="Disposed">Disposed</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Condition *</Label>
              <Select 
                defaultValue={form.getValues('condition')} 
                onValueChange={(val) => form.setValue('condition', val as any)}
              >
                <SelectTrigger className="bg-slate-900 border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                  <SelectItem value="Damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" {...form.register('brand')} className="bg-slate-900 border-slate-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" {...form.register('model')} className="bg-slate-900 border-slate-800" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serial_number">Serial Number</Label>
            <Input id="serial_number" {...form.register('serial_number')} className="bg-slate-900 border-slate-800" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...form.register('location')} className="bg-slate-900 border-slate-800" />
          </div>
        </div>

        {/* Purchase & Warranty Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-200 border-b border-slate-800 pb-2">Purchase & Warranty</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input type="date" id="purchase_date" {...form.register('purchase_date')} className="bg-slate-900 border-slate-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <Input type="number" id="purchase_price" {...form.register('purchase_price')} className="bg-slate-900 border-slate-800" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Vendor</Label>
            <Input id="vendor" {...form.register('vendor')} className="bg-slate-900 border-slate-800" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="warranty_start">Warranty Start</Label>
              <Input type="date" id="warranty_start" {...form.register('warranty_start')} className="bg-slate-900 border-slate-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty_end">Warranty End</Label>
              <Input type="date" id="warranty_end" {...form.register('warranty_end')} className="bg-slate-900 border-slate-800" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-200 border-b border-slate-800 pb-2">Additional Info</h3>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register('notes')} className="bg-slate-900 border-slate-800 h-[125px]" />
          </div>
        </div>

      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-slate-800">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          className="border-slate-700 hover:bg-slate-800"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Asset' : 'Create Asset'}
        </Button>
      </div>
    </form>
  )
}
