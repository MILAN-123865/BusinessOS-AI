import { User } from './auth'
import { Department } from './department'
import { Project } from './project'
import { AssetCategory } from './assetCategory'

export type AssetStatus = 'Available' | 'Assigned' | 'Maintenance' | 'Repair' | 'Reserved' | 'Lost' | 'Disposed' | 'Retired'
export type AssetCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged'

export interface AssetHistory {
  id: string
  asset_id: string
  action: string // e.g., 'Assigned', 'Status Changed', 'Maintained'
  description?: string
  performed_by_id: string
  performed_by?: User
  created_at?: string
  updated_at?: string
}

export interface MaintenanceRecord {
  id: string
  asset_id: string
  type: string
  description?: string
  cost?: number
  vendor?: string
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'
  start_date: string
  end_date?: string
  performed_by_id?: string
  performed_by?: User
  created_at?: string
  updated_at?: string
}

export interface Asset {
  id: string
  asset_code: string
  name: string
  description?: string
  category_id: string
  category?: AssetCategory
  brand?: string
  model?: string
  serial_number?: string
  purchase_date?: string
  purchase_price?: number
  vendor?: string
  status: AssetStatus
  condition: AssetCondition
  assigned_employee_id?: string
  assigned_employee?: User
  assigned_department_id?: string
  assigned_department?: Department
  assigned_project_id?: string
  assigned_project?: Project
  location?: string
  warranty_start?: string
  warranty_end?: string
  next_maintenance?: string
  last_maintenance?: string
  barcode?: string
  qr_code?: string
  notes?: string
  attachments?: string[]
  created_at?: string
  updated_at?: string
}
