import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { AssetStatus, AssetCondition } from '../../types/asset'

interface Props {
  status: AssetStatus | 'All'
  setStatus: (status: AssetStatus | 'All') => void
  condition: AssetCondition | 'All'
  setCondition: (condition: AssetCondition | 'All') => void
}

export function AssetFilters({ status, setStatus, condition, setCondition }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Select value={status} onValueChange={(val) => setStatus(val as AssetStatus | 'All')}>
        <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-800 text-slate-200">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-800">
          <SelectItem value="All">All Statuses</SelectItem>
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
      
      <Select value={condition} onValueChange={(val) => setCondition(val as AssetCondition | 'All')}>
        <SelectTrigger className="w-[180px] bg-slate-900/50 border-slate-800 text-slate-200">
          <SelectValue placeholder="Condition" />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-800">
          <SelectItem value="All">All Conditions</SelectItem>
          <SelectItem value="Excellent">Excellent</SelectItem>
          <SelectItem value="Good">Good</SelectItem>
          <SelectItem value="Fair">Fair</SelectItem>
          <SelectItem value="Poor">Poor</SelectItem>
          <SelectItem value="Damaged">Damaged</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
