'use client'

import { useEffect, useMemo, useState } from 'react'

import type {
  MindMapDetail,
  MindMapNode,
  MindMapSummary,
} from './types'

interface MindMapViewerProps {
  initialSummaries: MindMapSummary[]
  apiBaseUrl: string
  initialDetail: MindMapDetail | null
}

type Levels = MindMapNode[][]

type ChildMap = Map<string, MindMapNode[]>

const formatDateTime = (value: string) => {
  const date = new Date(value)
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

const formatEmbedding = (embedding: number[]) =>
  embedding.map((value) => value.toFixed(2)).join(' · ')

export const MindMapViewer = ({
  initialSummaries,
  apiBaseUrl,
  initialDetail,
}: MindMapViewerProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    initialDetail?.id ?? initialSummaries[0]?.id ?? null,
  )
  const [detail, setDetail] = useState<MindMapDetail | null>(initialDetail)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)
      return
    }
    if (detail?.id === selectedId) {
      return
    }

    const controller = new AbortController()
    const load = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`${apiBaseUrl}/mindmaps/${selectedId}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
        if (!response.ok) {
          throw new Error(`Ошибка загрузки: ${response.status}`)
        }
        const payload = (await response.json()) as MindMapDetail
        setDetail(payload)
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        console.error(err)
        setError('Не удалось получить майнд-карту. Проверьте работу сервера FastAPI.')
        setDetail(null)
      } finally {
        setIsLoading(false)
      }
    }

    void load()

    return () => {
      controller.abort()
    }
  }, [selectedId, apiBaseUrl, detail?.id])

  const { levels, childMap } = useMemo(() => {
    if (!detail) {
      return { levels: [] as Levels, childMap: new Map() as ChildMap }
    }
    const nodesById = new Map(detail.nodes.map((node) => [node.id, node]))
    const incomingCount = new Map<string, number>()
    const adjacency = new Map<string, MindMapNode[]>()

    for (const node of detail.nodes) {
      incomingCount.set(node.id, 0)
      adjacency.set(node.id, [])
    }

    for (const edge of detail.edges) {
      const target = nodesById.get(edge.target_node_id)
      const source = nodesById.get(edge.source_node_id)
      if (!target || !source) continue
      incomingCount.set(target.id, (incomingCount.get(target.id) ?? 0) + 1)
      adjacency.get(source.id)?.push(target)
    }

    const roots = detail.nodes.filter((node) => (incomingCount.get(node.id) ?? 0) === 0)
    const queue = [...roots]
    const depthByNode = new Map<string, number>()

    for (const root of roots) {
      depthByNode.set(root.id, 0)
    }

    while (queue.length > 0) {
      const current = queue.shift()!
      const currentDepth = depthByNode.get(current.id) ?? 0
      const children = adjacency.get(current.id) ?? []
      for (const child of children) {
        const nextDepth = currentDepth + 1
        if (!depthByNode.has(child.id) || nextDepth < (depthByNode.get(child.id) ?? 0)) {
          depthByNode.set(child.id, nextDepth)
          queue.push(child)
        }
      }
    }

    // Fallback for nodes participating in cycles
    for (const node of detail.nodes) {
      if (!depthByNode.has(node.id)) {
        depthByNode.set(node.id, 0)
      }
    }

    if (depthByNode.size === 0) {
      return { levels: [[]], childMap: adjacency }
    }

    const maxDepth = Math.max(...depthByNode.values())
    const computedLevels: Levels = Array.from({ length: maxDepth + 1 }, () => [])

    for (const node of detail.nodes) {
      const level = depthByNode.get(node.id) ?? 0
      computedLevels[level].push(node)
    }

    for (const column of computedLevels) {
      column.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
    }

    return { levels: computedLevels, childMap: adjacency }
  }, [detail])

  if (!initialSummaries.length) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white/40 p-10 text-center text-slate-500">
        Нет доступных майнд-карт. Создайте новую через FastAPI.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/70 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Выберите карту</p>
          <h2 className="text-xl font-semibold text-slate-900">{detail?.title ?? 'Загрузка...'}</h2>
          {detail?.description && (
            <p className="mt-1 text-sm text-slate-600">{detail.description}</p>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 md:w-72">
          <label className="text-xs font-medium uppercase tracking-wide text-slate-500" htmlFor="mindmap-select">
            Доступные карты
          </label>
          <select
            id="mindmap-select"
            value={selectedId ?? ''}
            onChange={(event) => setSelectedId(event.target.value || null)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-slate-500 focus:outline-none"
          >
            {initialSummaries.map((summary) => (
              <option key={summary.id} value={summary.id}>
                {summary.title} ({summary.node_count} нод)
              </option>
            ))}
          </select>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <section className="flex-1 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-800">Структура карты</h3>
              <p className="text-xs text-slate-500">
                Всего {detail?.nodes.length ?? 0} нод · {detail?.edges.length ?? 0} связей
              </p>
            </div>
            {detail && (
              <p className="text-xs text-slate-500">
                Обновлено {formatDateTime(detail.updated_at)}
              </p>
            )}
          </header>

          {isLoading && (
            <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-500">
              Загрузка данных из FastAPI...
            </div>
          )}

          {detail ? (
            <div
              className="grid gap-4 md:gap-6"
              style={{ gridTemplateColumns: `repeat(${Math.max(levels.length, 1)}, minmax(0, 1fr))` }}
            >
              {levels.map((column, index) => (
                <div key={index} className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Уровень {index + 1}
                  </p>
                  {column.map((node) => {
                    const children = childMap.get(node.id) ?? []
                    return (
                      <article
                        key={node.id}
                        className="group rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-lg font-semibold text-slate-900">{node.title}</h4>
                          <span className="rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                            {node.key}
                          </span>
                        </div>
                        {node.content && (
                          <p className="mt-3 text-sm leading-relaxed text-slate-600">{node.content}</p>
                        )}
                        <dl className="mt-4 space-y-2 text-xs text-slate-500">
                          <div className="flex items-center justify-between gap-3">
                            <dt className="font-medium text-slate-600">Координаты</dt>
                            <dd className="font-mono text-slate-500">
                              x: {node.position.x ?? '—'} · y: {node.position.y ?? '—'}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-medium text-slate-600">Embedding</dt>
                            <dd className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[11px] text-slate-500">
                              {formatEmbedding(node.embedding)}
                            </dd>
                          </div>
                        </dl>
                        {children.length > 0 && (
                          <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                            <p className="font-semibold text-slate-500">Дочерние ноды</p>
                            <ul className="mt-2 space-y-1">
                              {children.map((child) => (
                                <li key={child.id} className="flex items-center justify-between gap-2">
                                  <span>{child.title}</span>
                                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                                    {child.key}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </article>
                    )
                  })}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
              Выберите карту, чтобы увидеть её структуру.
            </div>
          )}
        </section>

        <aside className="lg:w-80">
          <div className="h-full rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-800">Логи создания</h3>
            <p className="text-xs text-slate-500">Записи фиксируются в PostgreSQL вместе с картой.</p>
            <div className="mt-4 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '32rem' }}>
              {detail?.logs.map((log) => (
                <article key={log.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
                    <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] tracking-wide text-white">
                      {log.level}
                    </span>
                    <time dateTime={log.created_at} className="text-slate-400">
                      {formatDateTime(log.created_at)}
                    </time>
                  </div>
                  <p>{log.message}</p>
                  {log.metadata && (
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-white/70 p-2 text-xs text-slate-600">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </article>
              ))}
              {!detail && (
                <p className="rounded-2xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">
                  Логи появятся после выбора карты.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default MindMapViewer
