import React from 'react'
import { Badge } from '../ui/badge'

interface Props {
  category: string
}

export function AssetCategoryBadge({ category }: Props) {
  return <Badge variant="outline" className="bg-slate-800/50">{category}</Badge>
}
