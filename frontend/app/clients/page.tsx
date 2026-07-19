'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout/app-layout'
import { useAuthStore } from '@/store/authStore'
import {
  useClients,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
  useCreateClientContact,
  useUpdateClientContact,
  useDeleteClientContact,
} from '@/hooks/useClients'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Plus,
  Trash2,
  Edit2,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Globe,
  Users,
  UserCheck,
  Award,
  ChevronDown,
  Trash,
  UserPlus,
  Info,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const clientSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(255),
  client_code: z.string().max(100).optional().or(z.literal('')),
  industry: z.string().max(100).optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(50).optional().or(z.literal('')),
  status: z.string().default('Active'),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().max(100).optional().or(z.literal('')),
  country: z.string().max(100).optional().or(z.literal('')),
  postal_code: z.string().max(20).optional().or(z.literal('')),
  tax_number: z.string().max(100).optional().or(z.literal('')),
  registration_number: z.string().max(100).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
})

type ClientFormValues = z.infer<typeof clientSchema>

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  designation: z.string().max(100).optional().or(z.literal('')),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(50).optional().or(z.literal('')),
  is_primary: z.boolean().default(false),
})

type ContactFormValues = z.infer<typeof contactSchema>

export default function ClientsPage() {
  const user = useAuthStore((state) => state.user)

  // React Query queries and mutations
  const { data: clients = [], isLoading: clientsLoading, isError: clientsError } = useClients()
  const createClientMutation = useCreateClient()
  const updateClientMutation = useUpdateClient()
  const deleteClientMutation = useDeleteClient()

  const createContactMutation = useCreateContact()
  const updateContactMutation = useUpdateContact()
  const deleteContactMutation = useDeleteContact()

  // Helper bindings for nested contacts
  function useCreateContact() { return useCreateClientContact() }
  function useUpdateContact() { return useUpdateClientContact() }
  function useDeleteContact() { return useDeleteClientContact() }

  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedIndustry, setSelectedIndustry] = useState('All')

  // Modals States
  const [isClientOpen, setIsClientOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<any | null>(null)
  const [activeContactsClient, setActiveContactsClient] = useState<any | null>(null)

  // Client Form Configuration
  const {
    register: registerClient,
    handleSubmit: handleClientSubmit,
    reset: resetClient,
    formState: { errors: clientErrors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company_name: '',
      client_code: '',
      industry: '',
      website: '',
      email: '',
      phone: '',
      status: 'Active',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      tax_number: '',
      registration_number: '',
      notes: '',
    },
  })

  // Contact Form Configuration
  const {
    register: registerContact,
    handleSubmit: handleContactSubmit,
    reset: resetContact,
    formState: { errors: contactErrors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      designation: '',
      email: '',
      phone: '',
      is_primary: false,
    },
  })

  const onClientFormSubmit = async (data: ClientFormValues) => {
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      if (editingClient) {
        await updateClientMutation.mutateAsync({
          id: editingClient.id,
          payload: { ...data },
        })
        setSuccessMsg(`Client '${data.company_name}' updated successfully.`)
        setEditingClient(null)
      } else {
        await createClientMutation.mutateAsync({
          ...data,
          organization_id: user?.organization_id || '',
        })
        setSuccessMsg(`Client '${data.company_name}' created successfully.`)
        setIsClientOpen(false)
      }
      resetClient()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Client save failed.')
    }
  }

  const handleDeleteClient = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete client '${name}'?`)) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await deleteClientMutation.mutateAsync(id)
      setSuccessMsg(`Client '${name}' deleted successfully.`)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Client deletion failed.')
    }
  }

  const handleOpenEditClient = (client: any) => {
    setEditingClient(client)
    setIsClientOpen(false)
    resetClient({
      company_name: client.company_name,
      client_code: client.client_code || '',
      industry: client.industry || '',
      website: client.website || '',
      email: client.email || '',
      phone: client.phone || '',
      status: client.status,
      address: client.address || '',
      city: client.city || '',
      state: client.state || '',
      country: client.country || '',
      postal_code: client.postal_code || '',
      tax_number: client.tax_number || '',
      registration_number: client.registration_number || '',
      notes: client.notes || '',
    })
  }

  // Nested Contacts Handlers
  const onContactFormSubmit = async (data: ContactFormValues) => {
    if (!activeContactsClient) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await createContactMutation.mutateAsync({
        clientId: activeContactsClient.id,
        payload: {
          name: data.name,
          designation: data.designation || undefined,
          email: data.email,
          phone: data.phone || undefined,
          is_primary: data.is_primary,
        },
      })
      setSuccessMsg(`Contact '${data.name}' added successfully.`)
      resetContact()
      // Reload active client details to reflect new contact
      const updatedClient = clients.find((c) => c.id === activeContactsClient.id)
      if (updatedClient) setActiveContactsClient(updatedClient)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Contact save failed.')
    }
  }

  const handleDeleteContact = async (contactId: string, name: string) => {
    if (!activeContactsClient) return
    if (!confirm(`Delete contact '${name}'?`)) return
    setSuccessMsg(null)
    setErrorMsg(null)
    try {
      await deleteContactMutation.mutateAsync({
        clientId: activeContactsClient.id,
        contactId,
      })
      setSuccessMsg(`Contact '${name}' deleted successfully.`)
      const updatedClient = clients.find((c) => c.id === activeContactsClient.id)
      if (updatedClient) setActiveContactsClient(updatedClient)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Contact deletion failed.')
    }
  }

  // Unique list of industries for filter list
  const uniqueIndustries = Array.from(new Set(clients.map((c) => c.industry).filter(Boolean)))

  // Filters logic
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.client_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.industry || '').toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus
    const matchesIndustry = selectedIndustry === 'All' || c.industry === selectedIndustry

    return matchesSearch && matchesStatus && matchesIndustry
  })

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Client CRM</h1>
            <p className="mt-2 text-muted-foreground">Manage organizational accounts, primary contact points, and leads pipeline.</p>
          </div>
          {!clientsLoading && !clientsError && (
            <button
              onClick={() => {
                setIsClientOpen(true)
                setEditingClient(null)
                resetClient({
                  company_name: '',
                  client_code: '',
                  industry: '',
                  website: '',
                  email: '',
                  phone: '',
                  status: 'Active',
                  address: '',
                  city: '',
                  state: '',
                  country: '',
                  postal_code: '',
                  tax_number: '',
                  registration_number: '',
                  notes: '',
                })
              }}
              className="flex items-center gap-2 rounded-xl bg-primary/20 px-4 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all self-start"
            >
              <Plus size={16} />
              <span>Add Client</span>
            </button>
          )}
        </div>

        {/* Success/Error Alerts */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400"
          >
            <CheckCircle size={20} />
            <span className="text-sm font-medium">{successMsg}</span>
          </motion.div>
        )}

        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive-foreground"
          >
            <AlertCircle size={20} className="text-destructive" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </motion.div>
        )}

        {clientsLoading ? (
          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-xl bg-card/40 animate-pulse border border-border/40" />
              ))}
            </div>
            <div className="h-96 rounded-xl bg-card/40 animate-pulse border border-border/40" />
          </div>
        ) : clientsError ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle size={48} className="text-destructive animate-bounce" />
            <h3 className="text-xl font-bold text-foreground">API Connection Error</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Failed to connect to the client CRM database. Ensure microservices are running.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid gap-6 sm:grid-cols-3">
              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                    <p className="text-3xl font-bold">{clients.length}</p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <Building2 size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Active Relationships</p>
                    <p className="text-3xl font-bold">
                      {clients.filter((c) => c.status === 'Active').length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <UserCheck size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Leads & Prospects</p>
                    <p className="text-3xl font-bold">
                      {clients.filter((c) => c.status === 'Lead' || c.status === 'Prospect').length}
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/20 p-3">
                    <Award size={24} className="text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border/40 bg-card/20 p-4 backdrop-blur-md">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search by company name, industry, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-border/40 bg-background/50 py-2 pl-10 pr-4 text-sm text-foreground outline-none focus:border-accent"
                />
              </div>
              <div className="flex gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Lead">Lead</option>
                  <option value="Prospect">Prospect</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <select
                  value={selectedIndustry}
                  onChange={(e) => setSelectedIndustry(e.target.value)}
                  className="rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-xs text-foreground outline-none focus:border-accent"
                >
                  <option value="All">All Industries</option>
                  {uniqueIndustries.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clients Table */}
            <div className="overflow-x-auto rounded-2xl border border-border/40 bg-card/20 backdrop-blur-md">
              <table className="w-full border-collapse text-left text-sm text-foreground">
                <thead className="bg-card/50 text-xs font-semibold uppercase text-muted-foreground border-b border-border/40">
                  <tr>
                    <th className="px-6 py-4">Company</th>
                    <th className="px-6 py-4">Details</th>
                    <th className="px-6 py-4">Industry</th>
                    <th className="px-6 py-4">Contacts</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {filteredClients.map((client) => {
                    const initials = client.company_name.substring(0, 2).toUpperCase()
                    const primaryContact = client.contacts?.find((ct) => ct.is_primary)

                    return (
                      <tr key={client.id} className="hover:bg-card/15 transition-all">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/30 font-semibold text-accent">
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{client.company_name}</p>
                            {client.client_code && (
                              <p className="text-[10px] text-muted-foreground font-mono">{client.client_code}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs space-y-1 text-muted-foreground">
                          {client.email && (
                            <p className="flex items-center gap-1.5">
                              <Mail size={11} />
                              <span>{client.email}</span>
                            </p>
                          )}
                          {client.website && (
                            <p className="flex items-center gap-1.5">
                              <Globe size={11} />
                              <span>{client.website}</span>
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="border-border/40 capitalize text-xs">
                            {client.industry || 'General'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {primaryContact ? (
                            <div className="space-y-0.5">
                              <p className="text-xs font-semibold text-foreground">{primaryContact.name}</p>
                              <p className="text-[10px] text-muted-foreground italic">{primaryContact.designation || 'Primary'}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">No primary point</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`border-0 text-xs font-semibold uppercase ${
                              client.status === 'Active'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : client.status === 'Lead' || client.status === 'Prospect'
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : 'bg-muted/15 text-muted-foreground'
                            }`}
                          >
                            {client.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-3 text-xs font-semibold">
                            <button
                              onClick={() => handleOpenEditClient(client)}
                              className="text-accent hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setActiveContactsClient(client)
                                resetContact()
                              }}
                              className="text-accent hover:underline"
                            >
                              Contacts ({client.contacts?.length || 0})
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.id, client.company_name)}
                              className="text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Interactive Client Dialog Modal */}
            <AnimatePresence>
              {(isClientOpen || editingClient) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl rounded-2xl border border-border/40 bg-card/90 p-6 backdrop-blur-md space-y-6 my-8"
                  >
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {editingClient ? 'Modify CRM Account' : 'Add Client Account'}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Configure organizational tags and fiscal identification details.
                      </p>
                    </div>

                    <form onSubmit={handleClientSubmit(onClientFormSubmit)} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Company Name</label>
                          <input
                            type="text"
                            required
                            {...registerClient('company_name')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Client Code (Internal)</label>
                          <input
                            type="text"
                            {...registerClient('client_code')}
                            placeholder="e.g. CLT-009"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Industry</label>
                          <input
                            type="text"
                            {...registerClient('industry')}
                            placeholder="e.g. Fintech"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Website</label>
                          <input
                            type="text"
                            {...registerClient('website')}
                            placeholder="https://client.com"
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Status</label>
                          <select
                            {...registerClient('status')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          >
                            <option value="Active">Active</option>
                            <option value="Lead">Lead</option>
                            <option value="Prospect">Prospect</option>
                            <option value="On Hold">On Hold</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Corporate Email</label>
                          <input
                            type="email"
                            {...registerClient('email')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                          <input
                            type="text"
                            {...registerClient('phone')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Tax Number / VAT</label>
                          <input
                            type="text"
                            {...registerClient('tax_number')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Country</label>
                          <input
                            type="text"
                            {...registerClient('country')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-muted-foreground">Postal Code</label>
                          <input
                            type="text"
                            {...registerClient('postal_code')}
                            className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Notes</label>
                        <textarea
                          rows={3}
                          {...registerClient('notes')}
                          className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-4 border-t border-border/20">
                        <button
                          type="submit"
                          disabled={createClientMutation.isPending || updateClientMutation.isPending}
                          className="flex justify-center items-center gap-2 rounded-xl bg-primary/20 px-6 py-2.5 text-sm font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50"
                        >
                          {(createClientMutation.isPending || updateClientMutation.isPending) && (
                            <Loader2 size={16} className="animate-spin" />
                          )}
                          <span>{editingClient ? 'Confirm Edit' : 'Add Account'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsClientOpen(false)
                            setEditingClient(null)
                          }}
                          className="rounded-xl border border-border/40 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}

              {/* Contacts Manager Nested Modal */}
              {activeContactsClient && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl rounded-2xl border border-border/40 bg-card/90 p-6 backdrop-blur-md space-y-6 my-8"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {activeContactsClient.company_name} Contacts
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Configure key representatives and select primary points of contact.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveContactsClient(null)}
                        className="rounded-xl border border-border/40 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Close
                      </button>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Contacts List */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Active Directory</h4>
                        <div className="space-y-3 max-h-[300px] overflow-y-auto rounded-xl border border-border/20 p-3 bg-background/25">
                          {activeContactsClient.contacts && activeContactsClient.contacts.length > 0 ? (
                            activeContactsClient.contacts.map((contact: any) => (
                              <div
                                key={contact.id}
                                className="flex justify-between items-start rounded-xl border border-border/30 bg-card/45 p-3 hover:bg-card/65 transition-colors"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-foreground text-sm">{contact.name}</span>
                                    {contact.is_primary && (
                                      <Badge className="bg-emerald-500/10 text-emerald-400 border-0 text-[8px]">
                                        Primary
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground font-medium">{contact.designation || 'Representative'}</p>
                                  <p className="text-[10px] text-muted-foreground/75 font-mono">{contact.email}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContact(contact.id, contact.name)}
                                  className="text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                              <Info size={24} className="opacity-45" />
                              <p className="text-xs">No corporate contacts registered yet.</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Add Contact Form */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase text-muted-foreground">Register Representative</h4>
                        <form onSubmit={handleContactSubmit(onContactFormSubmit)} className="space-y-3 p-4 rounded-xl border border-border/20 bg-background/25">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground">Representative Name</label>
                            <input
                              type="text"
                              required
                              {...registerContact('name')}
                              placeholder="e.g. Alice Cooper"
                              className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground">Designation</label>
                            <input
                              type="text"
                              {...registerContact('designation')}
                              placeholder="e.g. VP of Product"
                              className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground">Email</label>
                            <input
                              type="email"
                              required
                              {...registerContact('email')}
                              placeholder="name@client.com"
                              className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-muted-foreground">Phone</label>
                            <input
                              type="text"
                              {...registerContact('phone')}
                              className="w-full rounded-xl border border-border/40 bg-background/50 px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent"
                            />
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              {...registerContact('is_primary')}
                              className="rounded border-border/40 text-accent focus:ring-accent"
                            />
                            <span className="text-[10px] font-semibold text-muted-foreground">Set as Primary point of contact</span>
                          </label>

                          <button
                            type="submit"
                            disabled={createContactMutation.isPending}
                            className="w-full flex justify-center items-center gap-2 rounded-xl bg-primary/20 py-2 text-xs font-semibold text-accent hover:bg-primary/30 border border-accent/20 transition-all disabled:opacity-50 mt-4"
                          >
                            {createContactMutation.isPending && <Loader2 size={12} className="animate-spin" />}
                            <span>Register Contact</span>
                          </button>
                        </form>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </AppLayout>
  )
}
