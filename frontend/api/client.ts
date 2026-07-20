import { api } from '../services/axios'
import { Client, Contact } from '../types/client'

export const getClientsApi = async (): Promise<Client[]> => {
  const response = await api.get<{ success: boolean; data: Client[] }>('/clients')
  return response.data.data
}

export const getClientApi = async (id: string): Promise<Client> => {
  const response = await api.get<{ success: boolean; data: Client }>(`/clients/${id}`)
  return response.data.data
}

export const createClientApi = async (payload: Partial<Client>): Promise<Client> => {
  const response = await api.post<{ success: boolean; data: Client }>('/clients', payload)
  return response.data.data
}

export const updateClientApi = async (id: string, payload: Partial<Client>): Promise<Client> => {
  const response = await api.patch<{ success: boolean; data: Client }>(`/clients/${id}`, payload)
  return response.data.data
}

export const deleteClientApi = async (id: string): Promise<Client> => {
  const response = await api.delete<{ success: boolean; data: Client }>(`/clients/${id}`)
  return response.data.data
}

// Contacts API
export const getClientContactsApi = async (clientId: string): Promise<Contact[]> => {
  const response = await api.get<{ success: boolean; data: Contact[] }>(`/clients/${clientId}/contacts`)
  return response.data.data
}

export const createClientContactApi = async (clientId: string, payload: Partial<Contact>): Promise<Contact> => {
  const response = await api.post<{ success: boolean; data: Contact }>(`/clients/${clientId}/contacts`, payload)
  return response.data.data
}

export const updateClientContactApi = async (
  clientId: string,
  contactId: string,
  payload: Partial<Contact>
): Promise<Contact> => {
  const response = await api.patch<{ success: boolean; data: Contact }>(
    `/clients/${clientId}/contacts/${contactId}`,
    payload
  )
  return response.data.data
}

export const deleteClientContactApi = async (clientId: string, contactId: string): Promise<Contact> => {
  const response = await api.delete<{ success: boolean; data: Contact }>(
    `/clients/${clientId}/contacts/${contactId}`
  )
  return response.data.data
}
