import { makeAutoObservable, runInAction } from 'mobx'
import type { Tag } from '@/lib/types'
import { NotificationStore } from './NotificationStore'
import { ApiClient } from '@/lib/apiClient'

export class TagStore {
  tags: Tag[] = []
  notifications: NotificationStore

  // Оптимистичные обновления
  private stateSnapshot: Tag[] | null = null
  pendingOperations = 0

  constructor(initialTags: Tag[], notifications: NotificationStore) {
    makeAutoObservable(this, {}, { autoBind: true })
    this.notifications = notifications
    this.tags = initialTags
  }

  /**
   * Обновляет список тегов из TodoState
   */
  updateTags(tags: Tag[]) {
    this.tags = tags
  }

  async addTag(name: string) {
    if (!name.trim()) return

    await this.optimisticMutate(
      // Оптимистичное обновление
      () => {
        const tempId = `temp_${Date.now()}_${Math.random()}`
        const now = new Date()
        const newTag: Tag = {
          id: tempId,
          name: name.trim(),
          position: this.tags.length,
          createdAt: now,
          updatedAt: now,
        }
        this.tags = [...this.tags, newTag]
      },
      // Запрос на сервер
      async () => {
        const response = await ApiClient.rpc('tag.add', { name })
        if (response.ok) {
          this.tags = response.data.state.tags ?? []
        } else {
          if (response.state?.tags) {
            this.tags = response.state.tags
          }
        }
      },
      'Не удалось добавить тег'
    )
  }

  async renameTag(id: string, name: string) {
    if (!name.trim()) return

    await this.optimisticMutate(
      // Оптимистичное обновление
      () => {
        const tag = this.tags.find((t) => t.id === id)
        if (tag) {
          tag.name = name.trim()
        }
      },
      // Запрос на сервер
      async () => {
        const response = await ApiClient.rpc('tag.rename', { id, name })
        if (response.ok) {
          this.tags = response.data.state.tags ?? []
        } else {
          if (response.state?.tags) {
            this.tags = response.state.tags
          }
        }
      },
      'Не удалось переименовать тег'
    )
  }

  async deleteTag(id: string) {
    await this.optimisticMutate(
      // Оптимистичное обновление
      () => {
        this.tags = this.tags.filter((t) => t.id !== id)
      },
      // Запрос на сервер
      async () => {
        const response = await ApiClient.rpc('tag.delete', { id })
        if (response.ok) {
          this.tags = response.data.state.tags ?? []
        } else {
          if (response.state?.tags) {
            this.tags = response.state.tags
          }
        }
      },
      'Не удалось удалить тег'
    )
  }

  async reorderTags(tagIds: string[]) {
    await this.optimisticMutate(
      // Оптимистичное обновление
      () => {
        const tagMap = new Map(this.tags.map((t) => [t.id, t]))
        this.tags = tagIds
          .map((id) => tagMap.get(id))
          .filter((t): t is Tag => t !== undefined)
          .map((t, index) => ({ ...t, position: index }))
      },
      // Запрос на сервер
      async () => {
        const response = await ApiClient.rpc('tag.reorder', { tagIds })
        if (response.ok) {
          this.tags = response.data.state.tags ?? []
        } else {
          if (response.state?.tags) {
            this.tags = response.state.tags
          }
        }
      },
      'Не удалось изменить порядок тегов'
    )
  }

  /**
   * Создает снэпшот текущего состояния перед оптимистичным обновлением
   */
  private createSnapshot() {
    this.stateSnapshot = JSON.parse(JSON.stringify(this.tags))
  }

  /**
   * Откатывает состояние к предыдущему снэпшоту
   */
  private rollbackToSnapshot() {
    if (this.stateSnapshot) {
      runInAction(() => {
        this.tags = this.stateSnapshot!
        this.stateSnapshot = null
      })
    }
  }

  /**
   * Очищает снэпшот после успешной операции
   */
  private clearSnapshot() {
    this.stateSnapshot = null
  }

  /**
   * Обертка для оптимистичных мутаций
   * @param optimisticUpdate - функция для немедленного обновления UI
   * @param serverUpdate - промис с запросом на сервер
   * @param errorMessage - сообщение об ошибке для пользователя
   */
  private async optimisticMutate(
    optimisticUpdate: () => void,
    serverUpdate: () => Promise<void>,
    errorMessage: string
  ) {
    this.createSnapshot()
    this.pendingOperations++

    try {
      // Немедленно обновляем UI
      runInAction(optimisticUpdate)

      // Отправляем запрос на сервер
      await serverUpdate()

      // Успех - очищаем снэпшот
      this.clearSnapshot()
    } catch (error) {
      // Ошибка - откатываем изменения
      this.rollbackToSnapshot()

      // Показываем уведомление
      this.notifications.show('error', errorMessage)

      console.error(errorMessage, error)
    } finally {
      runInAction(() => {
        this.pendingOperations--
      })
    }
  }
}
