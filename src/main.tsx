import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TodoStore } from './stores/TodoStore'
import { TodoStoreProvider } from './stores/TodoStoreProvider'

const todoStore = new TodoStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TodoStoreProvider store={todoStore}>
      <App />
    </TodoStoreProvider>
  </StrictMode>,
)
