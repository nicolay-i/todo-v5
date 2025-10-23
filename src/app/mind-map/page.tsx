import Link from 'next/link'
import MindMapViewer from '@/components/mindmap/MindMapViewer'
import type { MindMapDetail, MindMapSummary } from '@/components/mindmap/types'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const API_FALLBACK_URL = 'http://localhost:8000'

async function fetchSummaries(baseUrl: string): Promise<MindMapSummary[]> {
  try {
    const response = await fetch(`${baseUrl}/mindmaps`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!response.ok) {
      console.warn('Mind map API responded with status', response.status)
      return []
    }
    return (await response.json()) as MindMapSummary[]
  } catch (error) {
    console.warn('Failed to fetch mind maps', error)
    return []
  }
}

async function fetchInitialDetail(baseUrl: string, mindMapId: string): Promise<MindMapDetail | null> {
  try {
    const response = await fetch(`${baseUrl}/mindmaps/${mindMapId}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!response.ok) return null
    return (await response.json()) as MindMapDetail
  } catch (error) {
    console.warn('Failed to fetch mind map detail', error)
    return null
  }
}

export default async function MindMapPage() {
  const apiBaseUrl = process.env.MINDMAP_API_URL ?? API_FALLBACK_URL
  const summaries = await fetchSummaries(apiBaseUrl)
  const firstId = summaries[0]?.id
  const initialDetail = firstId ? await fetchInitialDetail(apiBaseUrl, firstId) : null

  return (
    <main className="min-h-screen bg-canvas-light">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Визуализация</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">Mind Map из PostgreSQL</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Страница использует FastAPI-сервис, который хранит структуру майнд-карты и логи в PostgreSQL с расширением pgvector.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Назад к задачам
          </Link>
        </div>

        <MindMapViewer initialSummaries={summaries} apiBaseUrl={apiBaseUrl} initialDetail={initialDetail} />
      </div>
    </main>
  )
}
