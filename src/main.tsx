import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { TodoStore } from './store/TodoStore';
import { TodoStoreProvider } from './store/TodoStoreProvider';

const todoStore = new TodoStore();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TodoStoreProvider store={todoStore}>
      <App />
    </TodoStoreProvider>
  </StrictMode>,
);
