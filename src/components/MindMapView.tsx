import { Fragment, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { MindMapNode } from './MindMapNode'
import { MindMapDropZone } from './MindMapDropZone'
import { useTodoStore } from '../stores/TodoStoreContext'
import { isTodoSubtreeComplete } from '../utils/todoTree'

const MindMapViewComponent = () => {
  const store = useTodoStore()
  const [hideCompleted, setHideCompleted] = useState(false)

  const visibleTodos = hideCompleted
    ? store.todos.filter((todo) => !isTodoSubtreeComplete(todo))
    : store.todos

  const handleToggleHideCompleted: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setHideCompleted(event.target.checked)
  }

  const hasVisibleTodos = visibleTodos.length > 0

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-white/80 p-4 shadow-sm ring-1 ring-slate-200 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-700">Mind map</h2>
          <p className="mt-1 text-xs text-slate-500">Стройте визуальную карту задач и управляйте иерархией drag-and-drop.</p>
        </div>
        <label className="inline-flex items-center gap-2 rounded-xl bg-slate-100/60 px-3 py-2 text-sm font-medium text-slate-600 shadow-inner">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={handleToggleHideCompleted}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
          />
          <span className="flex items-center gap-2">
            {hideCompleted ? <FiEyeOff className="text-slate-500" /> : <FiEye className="text-slate-500" />}
            Скрыть выполненные подпункты
          </span>
        </label>
      </div>

      <div className="relative flex-1 overflow-auto rounded-3xl border border-slate-100 bg-slate-50/60 p-6">
        <div className="flex flex-wrap justify-center">
          <MindMapDropZone parentId={null} depth={0} index={0} size="lg" />
          {visibleTodos.map((todo, index) => (
            <Fragment key={todo.id}>
              <MindMapNode todo={todo} depth={0} hideCompleted={hideCompleted} />
              <MindMapDropZone parentId={null} depth={0} index={index + 1} size="lg" />
            </Fragment>
          ))}
        </div>

        {!hasVisibleTodos && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-sm text-slate-500">
            <p>Все задачи, видимые в дереве, отмечены как выполненные.</p>
            <p>Добавьте новые элементы или отключите фильтр, чтобы показать завершённые ветки.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export const MindMapView = observer(MindMapViewComponent)
