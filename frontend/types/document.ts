import { User } from './auth'
import { Project } from './project'
import { Department } from './department'
import { Folder } from './folder'

export type DocumentVisibility = 'private' | 'department' | 'organization' | 'users'

export interface DocumentVersion {
  id: string
  document_id: string
  version: number
  size: number
  storage_path: string
  download_url: string
  created_by: string
  created_at: string
  creator?: User
}

export interface DocumentActivity {
  id: string
  document_id: string
  activity_type: 'upload' | 'download' | 'preview' | 'version_create' | 'version_restore' | 'rename' | 'move' | 'delete' | 'share' | 'permission_change'
  description: string
  user_id: string
  created_at: string
  user?: User
}

export interface DocumentShare {
  id: string
  document_id: string
  user_id?: string
  department_id?: string
  access_level: 'view' | 'edit'
  user?: User
  department?: Department
}

export interface Document {
  id: string
  name: string
  original_name: string
  extension: string
  mime_type: string
  size: number
  version: number
  folder_id?: string
  owner_id: string
  uploaded_by_id: string
  project_id?: string
  department_id?: string
  tags: string[]
  description?: string
  visibility: DocumentVisibility
  storage_path: string
  download_url: string
  preview_url?: string
  created_at: string
  updated_at: string
  // Optional associations
  folder?: Folder
  owner?: User
  uploader?: User
  project?: Project
  department?: Department
  versions?: DocumentVersion[]
  shares?: DocumentShare[]
  activities?: DocumentActivity[]
}

export interface CreateDocumentPayload {
  name: string
  folder_id?: string
  project_id?: string
  department_id?: string
  tags?: string[]
  description?: string
  visibility?: DocumentVisibility
  share_user_ids?: string[]
  share_department_ids?: string[]
}

export type UpdateDocumentPayload = Partial<CreateDocumentPayload> & {
  folder_id?: string | null
}
