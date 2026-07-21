'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Folder, Share2, MoreHorizontal, Clock, UploadCloud, Search, FileImage, FileSpreadsheet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const INITIAL_DOCS = [
  { id: 1, name: 'Q3 Strategy Document.pdf', type: 'PDF', size: '2.4 MB', modified: '2 hours ago', shared: true, icon: FileText },
  { id: 2, name: 'Product Roadmap.xlsx', type: 'Spreadsheet', size: '1.1 MB', modified: '1 day ago', shared: true, icon: FileSpreadsheet },
  { id: 3, name: 'Design Guidelines.pdf', type: 'PDF', size: '5.2 MB', modified: '3 days ago', shared: false, icon: FileText },
  { id: 4, name: 'Brand Assets.png', type: 'Image', size: '0.8 MB', modified: '5 days ago', shared: true, icon: FileImage },
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
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(INITIAL_DOCS)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const filteredDocs = documents.filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsUploading(false)
            setDocuments([{
              id: Date.now(),
              name: file.name,
              type: file.type.includes('image') ? 'Image' : file.type.includes('pdf') ? 'PDF' : 'Document',
              size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
              modified: 'Just now',
              shared: false,
              icon: file.type.includes('image') ? FileImage : FileText
            }, ...documents])
            toast.success(`${file.name} uploaded successfully`)
          }, 500)
          return 100
        }
        return prev + 25
      })
    }, 500)
  }

  return (
    <>
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Documents</h1>
            <p className="mt-2 text-muted-foreground">Organize and share your documents securely.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-card/40 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div className="relative">
              <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isUploading}
                className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-medium text-white hover:bg-accent/90 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                Upload
              </motion.button>
            </div>
          </div>
        </motion.div>

        {isUploading && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <Card className="bg-accent/10 border-accent/20">
              <CardContent className="p-4 flex items-center gap-4">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-accent">Uploading document...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-accent transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Documents Table */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Your Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {filteredDocs.length > 0 ? (
                    filteredDocs.map((doc, idx) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center justify-between rounded-lg border border-border/40 bg-card/40 p-4 hover:bg-card/60 transition-colors group cursor-pointer"
                        onClick={() => toast.info(`Previewing ${doc.name}`)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                            <doc.icon size={20} className="text-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium hover:text-accent transition-colors">{doc.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Clock size={12} />
                              {doc.modified}
                              {' • '}
                              {doc.size}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="hidden sm:inline-flex">{doc.type}</Badge>
                          {doc.shared && (
                            <div title="Shared" className="text-accent bg-accent/10 p-1.5 rounded-md">
                              <Share2 size={16} />
                            </div>
                          )}
                          <button className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-card rounded-md">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center">
                      <Folder className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground font-medium">No documents found</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or upload a new file.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  )
}
