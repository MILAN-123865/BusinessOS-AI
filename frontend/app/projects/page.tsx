'use client'

import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Calendar, Users, CheckCircle2, AlertCircle } from 'lucide-react'

const projects = [
  { id: 1, name: 'Q3 Marketing Campaign', status: 'In Progress', progress: 65, dueDate: 'Jun 30, 2024', team: 4 },
  { id: 2, name: 'Mobile App Redesign', status: 'In Progress', progress: 42, dueDate: 'Jul 15, 2024', team: 6 },
  { id: 3, name: 'API Integration', status: 'Completed', progress: 100, dueDate: 'Jun 20, 2024', team: 3 },
  { id: 4, name: 'Analytics Dashboard', status: 'In Progress', progress: 85, dueDate: 'Jul 1, 2024', team: 5 },
  { id: 5, name: 'Security Audit', status: 'At Risk', progress: 30, dueDate: 'Jun 25, 2024', team: 2 },
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

export default function ProjectsPage() {
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
            <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
            <p className="mt-2 text-muted-foreground">Manage and track your projects</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg bg-primary/20 px-4 py-2.5 font-medium text-accent hover:bg-primary/30"
          >
            New Project
          </motion.button>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          variants={containerVariants}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project, idx) => (
            <motion.div key={project.id} variants={itemVariants}>
              <Card className="group hover:shadow-lg transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="group-hover:text-primary transition-colors">{project.name}</CardTitle>
                      <CardDescription className="mt-2">{project.dueDate}</CardDescription>
                    </div>
                    <Badge variant={
                      project.status === 'Completed' ? 'success' :
                      project.status === 'At Risk' ? 'destructive' :
                      'outline'
                    }>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-card/40 overflow-hidden">
                      <motion.div
                        className="h-full bg-primary/50 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ delay: 0.3, duration: 1 }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users size={16} />
                      {project.team} members
                    </div>
                    <Calendar size={16} className="text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </AppLayout>
  )
}
