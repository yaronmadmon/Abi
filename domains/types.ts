/**
 * Domain Types - Unified data model for all domains
 */

export interface DomainItem {
  id: string
  title: string
  note?: string
  tags?: string[]
  createdAt: number
}

export interface DomainData {
  items: DomainItem[]
  metadata?: Record<string, any>
}
