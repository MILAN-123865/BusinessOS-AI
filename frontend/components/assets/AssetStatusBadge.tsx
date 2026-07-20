import React from 'react'
import { Badge } from '../ui/badge'
import { AssetStatus } from '../../types/asset'

interface Props {
  status: AssetStatus
}

export function AssetStatusBadge({ status }: Props) {
  const getVariant = (status: AssetStatus) => {
    switch (status) {
      case 'Available':
        return 'success'
      case 'Assigned':
        return 'info'
      case 'Maintenance':
      case 'Repair':
        return 'warning'
      case 'Reserved':
        return 'secondary'
      case 'Lost':
      case 'Disposed':
      case 'Retired':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return <Badge variant={getVariant(status)}>{status}</Badge>
}
