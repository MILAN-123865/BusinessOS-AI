import { api } from '../services/axios'
import {
  Document,
  DocumentVersion,
  DocumentActivity,
  DocumentShare,
  CreateDocumentPayload,
  UpdateDocumentPayload,
} from '../types/document'

export interface GetDocumentsParams {
  folder_id?: string
  project_id?: string
  department_id?: string
  search?: string
  tags?: string[]
  mime_type?: string
  owner_id?: string
}

export const getDocumentsApi = async (params?: GetDocumentsParams): Promise<Document[]> => {
  const response = await api.get<{ success: boolean; data: Document[] }>('/documents', { params })
  return response.data.data
}

export const getDocumentApi = async (id: string): Promise<Document> => {
  const response = await api.get<{ success: boolean; data: Document }>(`/documents/${id}`)
  return response.data.data
}

export const createDocumentApi = async (payload: CreateDocumentPayload): Promise<Document> => {
  const response = await api.post<{ success: boolean; data: Document }>('/documents', payload)
  return response.data.data
}

export const updateDocumentApi = async (id: string, payload: UpdateDocumentPayload): Promise<Document> => {
  const response = await api.patch<{ success: boolean; data: Document }>(`/documents/${id}`, payload)
  return response.data.data
}

export const deleteDocumentApi = async (id: string): Promise<Document> => {
  const response = await api.delete<{ success: boolean; data: Document }>(`/documents/${id}`)
  return response.data.data
}

// Upload file
export const uploadDocumentApi = async (
  file: File,
  metadata?: CreateDocumentPayload,
  onUploadProgress?: (progressEvent: any) => void
): Promise<Document> => {
  const formData = new FormData()
  formData.append('file', file)
  if (metadata) {
    formData.append('metadata', JSON.stringify(metadata))
  }

  const response = await api.post<{ success: boolean; data: Document }>('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  })
  return response.data.data
}

// Download file (returns blob or link)
export const getDocumentDownloadUrlApi = (id: string): string => {
  return `${api.defaults.baseURL}/documents/${id}/download`
}

// Preview file
export const getDocumentPreviewApi = async (id: string): Promise<{ previewUrl: string; mimeType: string }> => {
  const response = await api.get<{ success: boolean; data: { previewUrl: string; mimeType: string } }>(
    `/documents/${id}/preview`
  )
  return response.data.data
}

// Version History
export const getDocumentVersionsApi = async (id: string): Promise<DocumentVersion[]> => {
  const response = await api.get<{ success: boolean; data: DocumentVersion[] }>(`/documents/${id}/versions`)
  return response.data.data
}

export const uploadDocumentVersionApi = async (
  id: string,
  file: File,
  onUploadProgress?: (progressEvent: any) => void
): Promise<DocumentVersion> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post<{ success: boolean; data: DocumentVersion }>(
    `/documents/${id}/versions`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    }
  )
  return response.data.data
}

// Share permissions
export const shareDocumentApi = async (
  id: string,
  payload: { user_ids?: string[]; department_ids?: string[]; visibility?: string }
): Promise<DocumentShare[]> => {
  const response = await api.post<{ success: boolean; data: DocumentShare[] }>(
    `/documents/${id}/share`,
    payload
  )
  return response.data.data
}

// Activity History
export const getDocumentActivityApi = async (id: string): Promise<DocumentActivity[]> => {
  const response = await api.get<{ success: boolean; data: DocumentActivity[] }>(`/documents/${id}/activity`)
  return response.data.data
}
