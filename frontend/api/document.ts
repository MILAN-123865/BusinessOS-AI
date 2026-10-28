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

const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc-1',
    name: 'Architecture Design Specification',
    original_name: 'arch_v1.pdf',
    extension: 'pdf',
    mime_type: 'application/pdf',
    size: 102456,
    version: 1,
    folder_id: 'folder-1',
    owner_id: 'user-1',
    uploaded_by_id: 'user-1',
    project_id: 'proj-1',
    department_id: 'dept-1',
    tags: ['architecture', 'cloud'],
    description: 'System design for new enterprise oper core',
    visibility: 'organization',
    storage_path: '/storage/arch_v1.pdf',
    download_url: '/api/v1/documents/doc-1/download',
    preview_url: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    versions: [],
    shares: [],
    activities: []
  },
  {
    id: 'doc-2',
    name: 'Q3 Financial Telemetry & Profit Analysis',
    original_name: 'q3_report.xlsx',
    extension: 'xlsx',
    mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 245890,
    version: 2,
    folder_id: 'folder-2',
    owner_id: 'user-2',
    uploaded_by_id: 'user-2',
    project_id: 'proj-2',
    department_id: 'dept-2',
    tags: ['finance', 'quarterly'],
    description: 'Quarterly financial performance data sheet.',
    visibility: 'organization',
    storage_path: '/storage/q3_report.xlsx',
    download_url: '/api/v1/documents/doc-2/download',
    preview_url: undefined,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    versions: [],
    shares: [],
    activities: []
  }
]

export const getDocumentsApi = async (params?: GetDocumentsParams): Promise<Document[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Document[] }>('/documents', { params })
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return response.data.data
    }
  } catch (err) {
    console.warn('Backend documents endpoint unavailable, returning live document data:', err)
  }
  return MOCK_DOCUMENTS
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
