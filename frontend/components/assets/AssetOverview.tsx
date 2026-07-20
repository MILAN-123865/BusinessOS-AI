import React from 'react'
import { Asset } from '../../types/asset'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { format } from 'date-fns'

interface Props {
  asset: Asset
}

export function AssetOverview({ asset }: Props) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">Hardware Specifications</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Brand</p>
            <p className="font-medium text-slate-200">{asset.brand || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Model</p>
            <p className="font-medium text-slate-200">{asset.model || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Serial Number</p>
            <p className="font-medium text-slate-200">{asset.serial_number || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Location</p>
            <p className="font-medium text-slate-200">{asset.location || 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-200">Purchase & Warranty</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-500">Vendor</p>
            <p className="font-medium text-slate-200">{asset.vendor || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Purchase Price</p>
            <p className="font-medium text-slate-200">
              {asset.purchase_price ? `$${asset.purchase_price.toLocaleString()}` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Purchase Date</p>
            <p className="font-medium text-slate-200">
              {asset.purchase_date ? format(new Date(asset.purchase_date), 'MMM d, yyyy') : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Warranty Range</p>
            <p className="font-medium text-slate-200">
              {asset.warranty_start && asset.warranty_end 
                ? `${format(new Date(asset.warranty_start), 'MMM d, yyyy')} - ${format(new Date(asset.warranty_end), 'MMM d, yyyy')}`
                : 'N/A'}
            </p>
          </div>
        </CardContent>
      </Card>

      {asset.description && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 whitespace-pre-wrap">{asset.description}</p>
          </CardContent>
        </Card>
      )}

      {asset.notes && (
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 whitespace-pre-wrap">{asset.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
