import type { TodoState } from './types'

/**
 * Клиент для работы с API приложения
 * Централизует все запросы к серверу
 */
export class ApiClient {
  /**
   * Базовый метод для выполнения запросов к API
   */
  private static async request<T = TodoState>(
    url: string,
    init?: RequestInit
  ): Promise<T> {
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    })

    if (response.status === 401) {
      window.location.href = '/'
      throw new Error('Unauthorized')
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Request failed: ${response.status}`)
    }

    return (await response.json()) as T
  }

  // ===== State =====

  static async getState(): Promise<TodoState> {
    return this.request('/api/state', { cache: 'no-store' })
  }

  // ===== Todos =====

  static async addTodo(
    parentId: string | null,
    title: string,
    tagIds?: string[]
  ): Promise<TodoState> {
    const payload: any = { parentId, title: title.trim() }
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      payload.tagIds = Array.from(new Set(tagIds))
    }

    return this.request('/api/todos', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  static async updateTodoDetails(
    id: string,
    details: { title?: string; alias?: string | null }
  ): Promise<TodoState> {
    const payload: Record<string, unknown> = { action: 'updateDetails' }

    if (typeof details.title === 'string') {
      payload.title = details.title.trim()
    }

    if (Object.prototype.hasOwnProperty.call(details, 'alias')) {
      payload.alias = details.alias
    }

    return this.request(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })
  }

  static async toggleTodoCompleted(id: string): Promise<TodoState> {
    return this.request(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'toggleCompleted' }),
    })
  }

  static async moveTodo(
    id: string,
    targetParentId: string | null,
    targetIndex: number
  ): Promise<TodoState> {
    return this.request(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'move', targetParentId, targetIndex }),
    })
  }

  static async toggleTodoPinned(id: string): Promise<TodoState> {
    return this.request(`/api/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'togglePinned' }),
    })
  }

  static async deleteTodo(id: string): Promise<TodoState> {
    return this.request(`/api/todos/${id}`, {
      method: 'DELETE',
    })
  }

  // ===== Random Todo =====

  static async getRandomChain(todoId?: string): Promise<{ chain: any[] }> {
    const url = todoId
      ? `/api/todos/random?id=${encodeURIComponent(todoId)}`
      : '/api/todos/random'
    return this.request(url, { cache: 'no-store' })
  }

  // ===== Pinned Lists =====

  static async addPinnedList(title: string): Promise<TodoState> {
    return this.request('/api/pinned-lists', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
  }

  static async renamePinnedList(id: string, title: string): Promise<TodoState> {
    return this.request(`/api/pinned-lists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title }),
    })
  }

  static async deletePinnedList(id: string): Promise<TodoState> {
    return this.request(`/api/pinned-lists/${id}`, {
      method: 'DELETE',
    })
  }

  static async setActivePinnedList(id: string): Promise<TodoState> {
    return this.request(`/api/pinned-lists/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'setActive' }),
    })
  }

  static async movePinnedTodo(
    todoId: string,
    targetListId: string,
    targetIndex: number
  ): Promise<TodoState> {
    return this.request('/api/pinned-lists/move', {
      method: 'POST',
      body: JSON.stringify({ todoId, targetListId, targetIndex }),
    })
  }

  // ===== Tags =====

  static async addTag(name: string): Promise<TodoState> {
    return this.request('/api/tags', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  static async renameTag(id: string, name: string): Promise<TodoState> {
    return this.request('/api/tags', {
      method: 'PATCH',
      body: JSON.stringify({ id, name }),
    })
  }

  static async deleteTag(id: string): Promise<TodoState> {
    return this.request('/api/tags', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    })
  }

  static async reorderTags(tagIds: string[]): Promise<TodoState> {
    return this.request('/api/tags', {
      method: 'PUT',
      body: JSON.stringify({ tagIds }),
    })
  }

  static async attachTag(todoId: string, tagId: string): Promise<TodoState> {
    return this.request(`/api/todos/${todoId}/tags`, {
      method: 'POST',
      body: JSON.stringify({ tagId }),
    })
  }

  static async detachTag(todoId: string, tagId: string): Promise<TodoState> {
    return this.request(`/api/todos/${todoId}/tags`, {
      method: 'DELETE',
      body: JSON.stringify({ tagId }),
    })
  }
}
