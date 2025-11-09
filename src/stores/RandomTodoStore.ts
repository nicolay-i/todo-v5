import { makeAutoObservable, runInAction } from 'mobx'
import type { TodoNode } from '@/lib/types'
import { NotificationStore } from './NotificationStore'
import { ApiClient } from '@/lib/apiClient'

export class RandomTodoStore {
  randomChain: TodoNode[] = []
  isLoadingRandomChain = true
  notifications: NotificationStore

  constructor(notifications: NotificationStore) {
    makeAutoObservable(this, {}, { autoBind: true })
    this.notifications = notifications
  }

  async loadRandomChain(todoId?: string) {
    runInAction(() => {
      this.isLoadingRandomChain = true
    })
    try {
      const data = await ApiClient.getRandomChain(todoId)
      runInAction(() => {
        // Преобразуем Todo[] в TodoNode[] с пустыми children и сохраняем теги
        this.randomChain = (data.chain || []).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          updatedAt: new Date(todo.updatedAt),
          completedAt: todo.completedAt ? new Date(todo.completedAt) : null,
          children: [],
          tags: todo.tags || [],
        }))
        this.isLoadingRandomChain = false
      })
    } catch (error) {
      console.error('Failed to load random chain', error)
      runInAction(() => {
        this.randomChain = []
        this.isLoadingRandomChain = false
      })
    }
  }

  async extendRandomChainWithChild(
    parentId: string, 
    childTitle: string,
    onSuccess: (childId: string) => void
  ) {
    try {
      // Добавляем задачу через API
      const data = await ApiClient.addTodo(parentId, childTitle.trim())
      
      // Находим добавленную задачу в ответе
      const findNewChild = (nodes: TodoNode[], parentId: string): TodoNode | null => {
        for (const node of nodes) {
          if (node.id === parentId && node.children.length > 0) {
            // Берём первого ребёнка (на позиции 0)
            return node.children[0]
          }
          const found = findNewChild(node.children, parentId)
          if (found) return found
        }
        return null
      }

      const newChild = findNewChild(data.todos, parentId)
      
      if (newChild) {
        // Добавляем в конец текущей цепочки
        runInAction(() => {
          this.randomChain = [...this.randomChain, newChild]
        })
        onSuccess(newChild.id)
      }
    } catch (error) {
      console.error('Failed to extend random chain', error)
      this.notifications.show('error', 'Не удалось добавить задачу')
    }
  }

  async removeLastFromRandomChain(
    todoId: string,
    onSuccess: () => void
  ) {
    try {
      // Удаляем задачу из базы
      await ApiClient.deleteTodo(todoId)
      
      // Убираем последний элемент из цепочки
      runInAction(() => {
        if (this.randomChain.length > 0) {
          this.randomChain = this.randomChain.slice(0, -1)
        }
      })
      
      onSuccess()
    } catch (error) {
      console.error('Failed to remove from random chain', error)
      this.notifications.show('error', 'Не удалось удалить задачу')
    }
  }
}
