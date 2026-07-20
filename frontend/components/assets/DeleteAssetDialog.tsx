import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Asset } from '../../types/asset'
import { useDeleteAsset } from '../../hooks/useDeleteAsset'

interface Props {
  asset: Asset | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAssetDialog({ asset, open, onOpenChange }: Props) {
  const deleteMutation = useDeleteAsset()

  const handleDelete = async () => {
    if (!asset) return
    try {
      await deleteMutation.mutateAsync(asset.id)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete asset:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-red-400">Delete Asset</DialogTitle>
          <DialogDescription className="text-slate-400">
            Are you sure you want to delete <span className="font-semibold text-white">{asset?.name}</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-700 hover:bg-slate-800">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={deleteMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
