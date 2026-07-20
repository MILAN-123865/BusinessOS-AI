import { User } from './auth'
import { Document } from './document'

export interface Folder {
  id: string
  name: string
  parent_id?: string
  organization_id: string
  created_by_id: string
  created_at: string
  updated_at: string
  // Optional relations
  parent?: Folder
  subfolders?: Folder[]
  documents?: Document[]
  creator?: User
}

export interface CreateFolderPayload {
  name: string
  parent_id?: string
}

export interface UpdateFolderPayload {
  name?: string
  parent_id?: string | null
}
