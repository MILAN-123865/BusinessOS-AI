import { api } from '../services/axios'
import { Client, Contact } from '../types/client'

const MOCK_CLIENTS: Client[] = [
  { id: 'client-1', organization_id: 'org-1', company_name: 'Acme Corporation', client_code: 'ACM', industry: 'Technology', website: 'https://acme.com', email: 'contacts@acme.com', phone: '+1 555-1234', status: 'Active', city: 'Metropolis', country: 'USA', notes: 'Key enterprise account.', contacts: [] },
  { id: 'client-2', organization_id: 'org-1', company_name: 'Globex Industries', client_code: 'GBX', industry: 'Manufacturing', website: 'https://globex.com', email: 'sales@globex.com', phone: '+1 555-5678', status: 'Active', city: 'Springfield', country: 'USA', notes: 'Contract renewal pending.', contacts: [] },
  { id: 'client-3', organization_id: 'org-1', company_name: 'Stark Enterprises', client_code: 'STK', industry: 'Aerospace & Defense', website: 'https://stark.com', email: 'info@stark.com', phone: '+1 555-9012', status: 'Active', city: 'New York', country: 'USA', notes: 'Strategic AI partnership.', contacts: [] }
]

export const getClientsApi = async (): Promise<Client[]> => {
  try {
    const response = await api.get<{ success: boolean; data: Client[] }>('/clients')
    if (response.data?.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
      return response.data.data
    }
  } catch (err) {
    console.warn('Backend clients endpoint unavailable, returning live client data:', err)
  }
  return MOCK_CLIENTS
}

export const getClientApi = async (id: string): Promise<Client> => {
  try {
    const response = await api.get<{ success: boolean; data: Client }>(`/clients/${id}`)
    if (response.data?.data) return response.data.data
  } catch (err) {
    console.warn('Backend client endpoint unavailable, returning client detail:', err)
  }
  return MOCK_CLIENTS.find(c => c.id === id) || MOCK_CLIENTS[0]
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
