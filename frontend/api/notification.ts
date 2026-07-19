import { api } from '../services/axios'
import { Notification, NotificationPreferences, NotificationsResponse } from '../types/notification'

export interface GetNotificationsParams {
  page?: number
  limit?: number
  is_read?: boolean
  type?: string
  search?: string
}

export const getNotificationsApi = async (params?: GetNotificationsParams): Promise<NotificationsResponse> => {
  const response = await api.get<{ success: boolean; data: NotificationsResponse }>('/notifications', { params })
  return response.data.data
}

export const markNotificationReadApi = async (id: string): Promise<Notification> => {
  const response = await api.post<{ success: boolean; data: Notification }>(`/notifications/${id}/read`)
  return response.data.data
}

export const markAllNotificationsReadApi = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>('/notifications/read-all')
  return response.data
}

export const deleteNotificationApi = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete<{ success: boolean; message: string }>(`/notifications/${id}`)
  return response.data
}

export const getNotificationPreferencesApi = async (): Promise<NotificationPreferences> => {
  const response = await api.get<{ success: boolean; data: NotificationPreferences }>('/notification-preferences')
  return response.data.data
}

export const updateNotificationPreferencesApi = async (payload: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
  const response = await api.patch<{ success: boolean; data: NotificationPreferences }>('/notification-preferences', payload)
  return response.data.data
}
