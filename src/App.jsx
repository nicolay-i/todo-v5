import { useState } from 'react';
import { Plus } from 'lucide-react';
import TodoTree from './components/TodoTree.jsx';
import { MAX_DEPTH, todoStore } from './stores/TodoStore.js';

function App() {
  const [addingFor, setAddingFor] = useState(null);

  const handleRequestAdd = (parentId) => {
    setAddingFor({ parentId: parentId ?? null });
  };

  const handleAddSubmit = (parentId, title) => {
    todoStore.addTodo(parentId ?? null, title);
    setAddingFor(null);
  };

  const handleAddCancel = () => {
    setAddingFor(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-16">
      <div className="mx-auto max-w-4xl px-6 pt-12">
        <div className="rounded-3xl bg-white px-8 py-10 shadow-2xl shadow-slate-200/50 ring-1 ring-slate-100">
          <header className="mb-10 flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold text-slate-900">Дерево задач</h1>
              <p className="max-w-xl text-sm leading-6 text-slate-500">
                Фиксируйте дела, объединяйте их в группы и управляйте порядком перетаскиванием. Глубина вложенности ограничена тремя уровнями.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => handleRequestAdd(null)}
                className="rounded-full border border-slate-200 bg-slate-50 p-3 text-slate-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
                aria-label="Добавить задачу верхнего уровня"
              >
                <Plus className="h-5 w-5" />
              </button>
              <span className="text-xs uppercase tracking-wide text-slate-400">Добавить</span>
            </div>
          </header>
          <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
              до {MAX_DEPTH} уровней
            </span>
            <span>Перетаскивайте элементы, чтобы изменять порядок и уровень.</span>
          </div>
          <TodoTree
            store={todoStore}
            addingFor={addingFor}
            onRequestAdd={handleRequestAdd}
            onAddSubmit={handleAddSubmit}
            onAddCancel={handleAddCancel}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
