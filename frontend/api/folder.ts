import { api } from '../services/axios'
import { Folder, CreateFolderPayload, UpdateFolderPayload } from '../types/folder'

export const getFoldersApi = async (): Promise<Folder[]> => {
  const response = await api.get<{ success: boolean; data: Folder[] }>('/folders')
  return response.data.data
}

export const createFolderApi = async (payload: CreateFolderPayload): Promise<Folder> => {
  const response = await api.post<{ success: boolean; data: Folder }>('/folders', payload)
  return response.data.data
}

export const updateFolderApi = async (id: string, payload: UpdateFolderPayload): Promise<Folder> => {
  const response = await api.patch<{ success: boolean; data: Folder }>(`/folders/${id}`, payload)
  return response.data.data
}

export const deleteFolderApi = async (id: string): Promise<Folder> => {
  const response = await api.delete<{ success: boolean; data: Folder }>(`/folders/${id}`)
  return response.data.data
}
