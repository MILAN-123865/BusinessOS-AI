import { api } from '../services/axios'
import { Asset, AssetHistory, MaintenanceRecord } from '../types/asset'

export const getAssets = async (params?: any): Promise<Asset[]> => {
  const response = await api.get('/assets', { params })
  return response.data
}

export const getAsset = async (id: string): Promise<Asset> => {
  const response = await api.get(`/assets/${id}`)
  return response.data
}

export const createAsset = async (data: Partial<Asset>): Promise<Asset> => {
  const response = await api.post('/assets', data)
  return response.data
}

export const updateAsset = async (id: string, data: Partial<Asset>): Promise<Asset> => {
  const response = await api.patch(`/assets/${id}`, data)
  return response.data
}

export const deleteAsset = async (id: string): Promise<void> => {
  await api.delete(`/assets/${id}`)
}

export const getAssetHistory = async (id: string): Promise<AssetHistory[]> => {
  const response = await api.get(`/assets/${id}/history`)
  return response.data
}

export const getAssetMaintenance = async (id: string): Promise<MaintenanceRecord[]> => {
  const response = await api.get(`/assets/${id}/maintenance`)
  return response.data
}

export const createMaintenance = async (assetId: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
  const response = await api.post(`/assets/${assetId}/maintenance`, data)
  return response.data
}

export const updateMaintenance = async (assetId: string, maintenanceId: string, data: Partial<MaintenanceRecord>): Promise<MaintenanceRecord> => {
  const response = await api.patch(`/assets/${assetId}/maintenance/${maintenanceId}`, data)
  return response.data
}

export const deleteMaintenance = async (assetId: string, maintenanceId: string): Promise<void> => {
  await api.delete(`/assets/${assetId}/maintenance/${maintenanceId}`)
}
