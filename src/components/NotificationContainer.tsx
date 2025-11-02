'use client'

import { observer } from 'mobx-react-lite'
import type { NotificationType } from '@/stores/NotificationStore'
import { useTodoStore } from '@/stores/TodoStoreContext'

const getNotificationStyles = (type: NotificationType): string => {
  switch (type) {
    case 'success':
      return 'bg-green-500 text-white'
    case 'error':
      return 'bg-red-500 text-white'
    case 'info':
      return 'bg-blue-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'info':
      return 'ℹ'
    default:
      return ''
  }
}

export const NotificationContainer = observer(() => {
  const store = useTodoStore()
  const notifications = store.notifications.notifications

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(
            notification.type
          )} px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 animate-slideIn`}
        >
          <span className="text-xl font-bold flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </span>
          <p className="flex-1 text-sm">{notification.message}</p>
          <button
            onClick={() => store.notifications.dismiss(notification.id)}
            className="text-white hover:text-gray-200 flex-shrink-0 ml-2"
            aria-label="Закрыть уведомление"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
})

NotificationContainer.displayName = 'NotificationContainer'


NotificationContainer.displayName = 'NotificationContainer'
