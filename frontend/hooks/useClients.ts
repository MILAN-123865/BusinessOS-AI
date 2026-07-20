import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getClientsApi,
  getClientApi,
  createClientApi,
  updateClientApi,
  deleteClientApi,
  getClientContactsApi,
  createClientContactApi,
  updateClientContactApi,
  deleteClientContactApi,
} from '../api/client'
import { Client, Contact } from '../types/client'

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: getClientsApi,
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => getClientApi(id),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<Client>) => createClientApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Client> }) =>
      updateClientApi(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteClientApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useClientContacts(clientId: string) {
  return useQuery({
    queryKey: ['clientContacts', clientId],
    queryFn: () => getClientContactsApi(clientId),
    enabled: !!clientId,
  })
}

export function useCreateClientContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, payload }: { clientId: string; payload: Partial<Contact> }) =>
      createClientContactApi(clientId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] })
      queryClient.invalidateQueries({ queryKey: ['clientContacts', variables.clientId] })
    },
  })
}

export function useUpdateClientContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      clientId,
      contactId,
      payload,
    }: {
      clientId: string;
      contactId: string;
      payload: Partial<Contact>;
    }) => updateClientContactApi(clientId, contactId, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] })
      queryClient.invalidateQueries({ queryKey: ['clientContacts', variables.clientId] })
    },
  })
}

export function useDeleteClientContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ clientId, contactId }: { clientId: string; contactId: string }) =>
      deleteClientContactApi(clientId, contactId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['client', variables.clientId] })
      queryClient.invalidateQueries({ queryKey: ['clientContacts', variables.clientId] })
    },
  })
}
