import type { PinnedList, Todo } from '@prisma/client'

export interface TodoTree extends Todo {
  children: TodoTree[]
}

export interface PinnedListView extends PinnedList {
  todos: Todo[]
}

export interface AppState {
  todos: TodoTree[]
  pinnedLists: PinnedListView[]
}
