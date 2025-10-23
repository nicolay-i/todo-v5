export interface MindMapSummary {
  id: string
  title: string
  description?: string | null
  node_count: number
  edge_count: number
  created_at: string
  updated_at: string
}

export interface MindMapNode {
  id: string
  key: string
  title: string
  content?: string | null
  position: {
    x: number | null
    y: number | null
  }
  embedding: number[]
  created_at: string
}

export interface MindMapEdge {
  id: string
  source_node_id: string
  target_node_id: string
  relationship?: string | null
}

export interface MindMapLog {
  id: string
  level: string
  message: string
  metadata?: Record<string, unknown> | null
  created_at: string
}

export interface MindMapDetail {
  id: string
  title: string
  description?: string | null
  created_at: string
  updated_at: string
  nodes: MindMapNode[]
  edges: MindMapEdge[]
  logs: MindMapLog[]
}
