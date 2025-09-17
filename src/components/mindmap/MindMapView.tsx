import { Fragment, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { useTodoStore } from '../../stores/TodoStoreContext'
import { MindMapDropZone } from './MindMapDropZone'
import { MindMapNode } from './MindMapNode'
import { buildMindMapBranches } from './tree'

const MindMapViewComponent = () => {
  const store = useTodoStore()
  const [hideCompleted, setHideCompleted] = useState(false)

  const branches = buildMindMapBranches(store.todos, hideCompleted)
  const hasTodos = branches.length > 0

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200/70">
        <p className="font-medium text-slate-700">Mind map</p>
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            checked={hideCompleted}
            onChange={(event) => setHideCompleted(event.target.checked)}
          />
          <span>Скрывать выполненные подпункты</span>
        </label>
      </div>

      <div className="relative flex-1 overflow-auto rounded-3xl bg-gradient-to-br from-white/90 via-white to-slate-100/70 p-6 shadow-inner ring-1 ring-white/60">
        <div className="mx-auto flex min-h-[320px] w-full max-w-full flex-col items-center gap-6">
          <div className="flex flex-wrap justify-center gap-6">
            <MindMapDropZone parentId={null} depth={0} index={0} />
            {branches.map((branch, index) => (
              <Fragment key={branch.node.id}>
                <MindMapNode branch={branch} depth={0} />
                <MindMapDropZone parentId={null} depth={0} index={index + 1} />
              </Fragment>
            ))}
          </div>

          {!hasTodos && (
            <div className="mt-8 max-w-xl rounded-2xl border border-dashed border-slate-300/80 bg-white/80 px-6 py-8 text-center text-sm text-slate-500">
              {hideCompleted
                ? 'Все завершенные ветки скрыты. Отключите фильтр, чтобы увидеть выполненные задачи.'
                : 'Добавьте задачи и подзадачи — мы построим mind map автоматически.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const MindMapView = observer(MindMapViewComponent)
