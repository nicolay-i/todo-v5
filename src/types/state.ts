import type { Prisma } from '@prisma/client'

export type TaskRecord = Prisma.TaskGetPayload<{
  select: { id: true; title: true; completed: true; pinned: true; order: true; parentId: true }
}>

export interface TaskNode extends TaskRecord {
  children: TaskNode[]
}

export type PinnedListRecord = Prisma.PinnedListGetPayload<{
  select: { id: true; title: true; position: true }
}>

export interface PinnedListView extends PinnedListRecord {
  todos: TaskNode[]
}

export interface AppState {
  todos: TaskNode[]
  pinnedLists: PinnedListView[]
}

export type ActionRequest =
  | { type: 'addTodo'; parentId: string | null; title: string }
  | { type: 'updateTitle'; id: string; title: string }
  | { type: 'toggleTodo'; id: string }
  | { type: 'deleteTodo'; id: string }
  | { type: 'moveTodo'; id: string; targetParentId: string | null; targetIndex: number }
  | { type: 'togglePinned'; id: string }
  | { type: 'movePinnedTodo'; id: string; targetListId: string; targetIndex: number }
  | { type: 'addPinnedList'; title: string }
  | { type: 'renamePinnedList'; id: string; title: string }
  | { type: 'deletePinnedList'; id: string }
