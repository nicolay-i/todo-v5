import { makeAutoObservable, runInAction } from 'mobx'
import type { TodoNode } from '@/lib/types'
import { NotificationStore } from './NotificationStore'

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
      const url = todoId 
        ? `/api/todos/random?id=${encodeURIComponent(todoId)}`
        : '/api/todos/random'
      const response = await fetch(url, { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Failed to load random chain')
      }
      const data = await response.json()
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
      const payload = { parentId, title: childTitle.trim() }
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to add todo')
      }

      const data = await response.json()
      
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
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete todo')
      }
      
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
