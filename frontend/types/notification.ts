export type NotificationType = 
  | 'Task Assigned' 
  | 'Task Updated' 
  | 'Task Completed' 
  | 'Project Updated' 
  | 'Meeting Reminder' 
  | 'Document Shared' 
  | 'Asset Assigned' 
  | 'Leave Approved' 
  | 'Leave Rejected' 
  | 'Comment Added' 
  | 'Client Activity' 
  | 'System Alerts' 
  | 'Security Alerts'
  | 'Broadcast'

export type NotificationPriority = 'Low' | 'Normal' | 'High' | 'Critical'

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  is_read: boolean
  link_url?: string
  metadata?: Record<string, any>
  created_at: string
  read_at?: string
}

export interface NotificationPreferences {
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  in_app_notifications: boolean
  muted_types: NotificationType[]
  digest_frequency: 'Immediate' | 'Daily' | 'Weekly' | 'Never'
}

export interface NotificationsResponse {
  notifications: Notification[]
  unread_count: number
  total: number
  page: number
  limit: number
}
