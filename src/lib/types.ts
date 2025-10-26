import type { PinnedList, Todo } from '@prisma/client'

export interface TodoNode extends Todo {
  children: TodoNode[]
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
}
