'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { DollarSign, MapPin, Phone, Mail, MoreHorizontal } from 'lucide-react'

const clients = [
  { id: 1, name: 'Acme Corporation', status: 'Active', revenue: '$45,000', location: 'San Francisco, CA' },
  { id: 2, name: 'TechVision Inc', status: 'Active', revenue: '$78,500', location: 'New York, NY' },
  { id: 3, name: 'Global Solutions Ltd', status: 'Prospective', revenue: '$0', location: 'London, UK' },
  { id: 4, name: 'Innovation Labs', status: 'Active', revenue: '$32,000', location: 'Austin, TX' },
  { id: 5, name: 'Future Systems', status: 'Inactive', revenue: '$15,000', location: 'Seattle, WA' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function ClientsPage() {
  return (
    <AppLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Clients</h1>
            <p className="mt-2 text-muted-foreground">Manage your client relationships</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg bg-primary/20 px-4 py-2.5 font-medium text-accent hover:bg-primary/30"
          >
            Add Client
          </motion.button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={containerVariants}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: 'Total Clients', value: '5' },
            { label: 'Active', value: '3' },
            { label: 'Revenue', value: '$170.5K' },
            { label: 'Avg Deal Size', value: '$34.1K' },
          ].map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants}>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Clients List */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Client List</CardTitle>
              <CardDescription>{clients.length} clients in your CRM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {clients.map((client, idx) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 p-4 hover:bg-card/60 transition-colors group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                          <span className="text-sm font-semibold text-accent">{client.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin size={14} />
                            {client.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant={
                          client.status === 'Active' ? 'success' :
                          client.status === 'Prospective' ? 'outline' :
                          'destructive'
                        }>
                          {client.status}
                        </Badge>
                        <p className="mt-2 text-sm font-medium">{client.revenue}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                      >
                        <MoreHorizontal size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}
