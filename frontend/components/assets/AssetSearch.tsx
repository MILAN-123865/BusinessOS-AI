import React from 'react'
import { Search } from 'lucide-react'
import { Input } from '../ui/input'

interface Props {
  value: string
  onChange: (value: string) => void
}

export function AssetSearch({ value, onChange }: Props) {
  return (
    <div className="relative w-full sm:w-[300px]">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        placeholder="Search assets..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 bg-slate-900/50 border-slate-800 text-slate-200"
      />
    </div>
  )
}
