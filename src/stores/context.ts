import { createContext } from 'react'
import { todoStore, type TodoStore } from './todoStore'

export const TodoStoreContext = createContext<TodoStore>(todoStore)
