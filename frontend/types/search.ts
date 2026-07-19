export type SearchEntityType = 
  | 'project' 
  | 'task' 
  | 'employee' 
  | 'department' 
  | 'client' 
  | 'meeting' 
  | 'asset' 
  | 'document' 
  | 'chat' 
  | 'report'

export interface SearchResult {
  id: string
  type: SearchEntityType
  title: string
  subtitle?: string
  description?: string
  url: string
  metadata?: Record<string, any>
  score?: number
}

export interface SearchResponse {
  results: SearchResult[]
  total: number
  took_ms: number
}

export interface RecentSearch {
  id: string
  query: string
  timestamp: string
}
