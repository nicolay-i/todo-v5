import type { PinnedList, Todo } from '@prisma/client'

export interface Tag {
  id: string
  name: string
  position: number
  isSystem?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface TodoNode extends Todo {
  children: TodoNode[]
  tags?: Tag[]
}

export interface PinnedListState {
  id: PinnedList['id']
  title: PinnedList['title']
  order: string[]
  isPrimary: PinnedList['isPrimary']
  position: PinnedList['position']
  isActive?: boolean
}

export interface TodoUser {
  id: string
  firstName: string
  lastName?: string | null
  username?: string | null
  photoUrl?: string | null
}

export interface TodoState {
  todos: TodoNode[]
  pinnedLists: PinnedListState[]
  tags?: Tag[]
  user: TodoUser | null
}
