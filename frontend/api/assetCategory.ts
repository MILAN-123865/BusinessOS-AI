import { api } from '../services/axios'
import { AssetCategory } from '../types/assetCategory'

export const getAssetCategories = async (): Promise<AssetCategory[]> => {
  const response = await api.get('/asset-categories')
  return response.data
}

export const createAssetCategory = async (data: Partial<AssetCategory>): Promise<AssetCategory> => {
  const response = await api.post('/asset-categories', data)
  return response.data
}

export const updateAssetCategory = async (id: string, data: Partial<AssetCategory>): Promise<AssetCategory> => {
  const response = await api.patch(`/asset-categories/${id}`, data)
  return response.data
}

export const deleteAssetCategory = async (id: string): Promise<void> => {
  await api.delete(`/asset-categories/${id}`)
}
