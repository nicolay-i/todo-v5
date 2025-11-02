import { makeAutoObservable, runInAction } from 'mobx'

export type NotificationType = 'success' | 'error' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
}

export class NotificationStore {
  notifications: Notification[] = []

  constructor() {
    makeAutoObservable(this)
  }

  /**
   * Показать уведомление
   * @param type - тип уведомления
   * @param message - текст сообщения
   * @param duration - длительность показа в мс (по умолчанию 3000)
   */
  show(type: NotificationType, message: string, duration = 3000) {
    const id = `notification_${Date.now()}_${Math.random()}`
    const notification: Notification = {
      id,
      type,
      message,
      duration,
    }

    runInAction(() => {
      this.notifications.push(notification)
    })

    // Автоматически удаляем уведомление через заданное время
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id)
      }, duration)
    }

    return id
  }

  /**
   * Скрыть конкретное уведомление
   * @param id - ID уведомления
   */
  dismiss(id: string) {
    runInAction(() => {
      this.notifications = this.notifications.filter((n) => n.id !== id)
    })
  }

  /**
   * Очистить все уведомления
   */
  clear() {
    runInAction(() => {
      this.notifications = []
    })
  }
}
