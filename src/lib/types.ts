export interface Tag {
  id: string
  name: string
  position: number
  isSystem?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TodoRecord {
  id: string
  title: string
  completed: boolean
  completedAt: Date | null
  pinned: boolean
  position: number
  parentId: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface TodoNode extends TodoRecord {
  children: TodoNode[]
  tags?: Tag[]
}

export interface PinnedListState {
  id: string
  title: string
  order: string[]
  isPrimary: boolean
  position: number
  isActive?: boolean
}

export interface TodoState {
  todos: TodoNode[]
  pinnedLists: PinnedListState[]
  tags?: Tag[]
}

export interface SessionUser {
  id: string
  firstName: string
  lastName?: string | null
  username?: string | null
  photoUrl?: string | null
}
