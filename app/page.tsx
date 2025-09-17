import { TodoApp } from '@/components/TodoApp'
import { TodoStoreProvider } from '@/stores/TodoStoreContext'

export default function Page() {
  return (
    <TodoStoreProvider>
      <TodoApp />
    </TodoStoreProvider>
  )
}
