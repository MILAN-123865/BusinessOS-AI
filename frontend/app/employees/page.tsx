'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Search, Filter, MoreHorizontal, Mail, Phone } from 'lucide-react'
import { useState } from 'react'

const employees = [
  { id: 1, name: 'Sarah Anderson', role: 'Product Manager', status: 'Active', email: 'sarah@businessos.ai', phone: '+1 (555) 123-4567' },
  { id: 2, name: 'Alex Chen', role: 'Lead Developer', status: 'Active', email: 'alex@businessos.ai', phone: '+1 (555) 234-5678' },
  { id: 3, name: 'Jordan Williams', role: 'Designer', status: 'Active', email: 'jordan@businessos.ai', phone: '+1 (555) 345-6789' },
  { id: 4, name: 'Taylor Martinez', role: 'Sales Manager', status: 'Away', email: 'taylor@businessos.ai', phone: '+1 (555) 456-7890' },
  { id: 5, name: 'Casey Johnson', role: 'HR Specialist', status: 'Active', email: 'casey@businessos.ai', phone: '+1 (555) 567-8901' },
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

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h1 className="text-4xl font-bold tracking-tight">Employees</h1>
            <p className="mt-2 text-muted-foreground">Manage your team and employee information</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg bg-primary/20 px-4 py-2.5 font-medium text-accent hover:bg-primary/30"
          >
            Add Employee
          </motion.button>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="flex gap-3">
          <div className="flex-1 rounded-lg border border-border/40 bg-card/40 px-4 py-2.5 flex items-center gap-3">
            <Search size={18} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm placeholder-muted-foreground outline-none"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg border border-border/40 bg-card/40 px-4 py-2.5 flex items-center gap-2 hover:bg-card/60"
          >
            <Filter size={18} />
            Filter
          </motion.button>
        </motion.div>

        {/* Employees Table */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>{filteredEmployees.length} employees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredEmployees.map((emp, idx) => (
                  <motion.div
                    key={emp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 p-4 hover:bg-card/60 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                        <span className="text-sm font-semibold text-accent">{emp.name.charAt(0)}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{emp.name}</p>
                        <p className="text-sm text-muted-foreground">{emp.role}</p>
                      </div>
                      <Badge variant={emp.status === 'Active' ? 'success' : 'outline'}>
                        {emp.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                      <motion.button whileHover={{ scale: 1.05 }} className="text-muted-foreground hover:text-foreground">
                        <Mail size={18} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.05 }} className="text-muted-foreground hover:text-foreground">
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
