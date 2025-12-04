'use client'

import { useEffect, useRef, useState } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import type { Editor as TinyMCEEditor } from 'tinymce'
import { FiX, FiCheck } from 'react-icons/fi'
import { useModal } from '@/lib/hooks/useModal'

interface TodoDescriptionEditorProps {
  value: string
  onSave: (description: string | null) => void
  onCancel: () => void
  todoTitle: string
  onAfterClose?: () => void
}

export function TodoDescriptionEditor({
  value,
  onSave,
  onCancel,
  todoTitle,
  onAfterClose,
}: TodoDescriptionEditorProps) {
  const [content, setContent] = useState(value)
  const [isMobile, setIsMobile] = useState(false)
  const editorRef = useRef<TinyMCEEditor | null>(null)
  const modal = useModal({ animationDuration: 200 })

  useEffect(() => {
    // Определяем мобильное устройство
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Анимация входа
  useEffect(() => {
    modal.open()
  }, [modal])

  const handleSaveClick = () => {
    // Получаем актуальное содержимое из редактора
    const currentContent = editorRef.current?.getContent() || content
    // Получаем текст без HTML тегов для проверки на пустоту
    const textContent = editorRef.current?.getContent({ format: 'text' }) || ''
    const trimmedText = textContent.trim()
    // Если текст пустой, сохраняем null, иначе сохраняем HTML контент
    onSave(trimmedText.length > 0 ? currentContent : null)
    onAfterClose?.()
  }

  const handleEditorInit = (evt: any, editor: TinyMCEEditor) => {
    editorRef.current = editor
    // Автофокус на редактор
    setTimeout(() => {
      editor.focus()
    }, 50)
  }

  // Desktop: правый Drawer (fixed panel)
  if (!isMobile) {
    return (
      <div ref={modal.modalRef} className="fixed right-0 top-0 bottom-0 w-[600px] bg-white dark:bg-slate-800 shadow-2xl z-50 flex flex-col animate-panel-slide-in-right">
        {/* Заголовок */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 truncate flex-1 mr-4">
            {todoTitle}
          </h2>
          <button
            onClick={onCancel}
            className="rounded-lg p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Закрыть"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Редактор */}
        <div className="flex-1 overflow-y-auto p-6">
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js" // локальный путь, отданный твоим веб-сервером
            value={content}
            onEditorChange={setContent}
            onInit={handleEditorInit}
            init={{
              skin_url: '/tinymce/skins/ui/oxide',
              content_css: '/tinymce/skins/content/default/content.css',
              height: '100%',
              menubar: false,
              plugins: [
                'lists',
                'link',
                'image',
                'charmap',
                'preview',
                'searchreplace',
                'code',
                'fullscreen',
              ],
              toolbar:
                'undo redo | formatselect | bold italic | ' +
                'alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist outdent indent | link image | code',
              content_style:
                'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; }',
              setup: (ed) => {
                ed.on('keydown', (e: any) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault()
                    handleSaveClick()
                  } else if (e.key === 'Escape') {
                    e.preventDefault()
                    onCancel()
                    onAfterClose?.()
                  }
                })
              },
            }}
          />
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Отмена (Esc)
          </button>
          <button
            onClick={handleSaveClick}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <FiCheck size={16} />
            Сохранить (Ctrl+Enter)
          </button>
        </div>
      </div>
    )
  }

  // Mobile: fullscreen modal
  return (
    <div ref={modal.modalRef} className="fixed inset-0 bg-white dark:bg-slate-800 z-50 flex flex-col animate-modal-fade-in">
      {/* Заголовок */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 truncate flex-1 mr-3">
          {todoTitle}
        </h2>
        <button
            onClick={() => { onCancel(); onAfterClose?.() }}
          className="rounded-lg p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          aria-label="Закрыть"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Редактор */}
      <div className="flex-1 overflow-y-auto p-4">
          <Editor
          apiKey="no-api-key"
          value={content}
          onEditorChange={setContent}
          onInit={handleEditorInit}
          init={{
            height: '100%',
            menubar: false,
            plugins: ['lists', 'link', 'charmap', 'code'],
            toolbar:
              'undo redo | formatselect | bold italic | ' +
              'bullist numlist | link | code',
            content_style:
              'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; }',
            setup: (ed) => {
              ed.on('keydown', (e: any) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  handleSaveClick()
                } else if (e.key === 'Escape') {
                  e.preventDefault()
                  onCancel()
                  onAfterClose?.()
                }
              })
            },
          }}
        />
      </div>

      {/* Кнопки действий */}
      <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <button
          onClick={() => { onCancel(); onAfterClose?.() }}
          className="px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
        >
          Отмена
        </button>
        <button
          onClick={handleSaveClick}
          className="px-3 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-500 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center gap-1"
        >
          <FiCheck size={16} />
          Сохранить
        </button>
      </div>
    </div>
  )
}
