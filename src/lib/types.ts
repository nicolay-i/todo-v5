import type { PinnedList, Todo } from '@prisma/client'

export interface Tag {
  id: string
  name: string
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
}

export interface TodoState {
  todos: TodoNode[]
  pinnedLists: PinnedListState[]
  tags?: Tag[]
}
