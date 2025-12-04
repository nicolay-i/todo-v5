'use client'

export const GuideTab = () => {
  return (
    <div className="space-y-6">
      {/* Слоты */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3">Слоты</h3>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Слоты — это закреплённые списки задач, которые помогают организовать работу на день или определённый период.
            Вы можете создать несколько слотов для разных целей или временных интервалов.
          </p>
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-200 mb-2">Основные возможности:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Создание слотов как промежутки работы (например с 9 до 11 буду делать таску "Проверить баг добавления в список", а после этого с 12 до 14 буду делать таску "Проверить баг удаления из списка")</li>
              <li>Перетаскивание задач между слотами</li>
              <li>Сворачивание и разворачивание слотов (состояние сохраняется)</li>
              <li>Переключение между слотами с помощью Alt + ↑ / Alt + ↓</li>
              <li>Просмотр слотов в текстовом формате (можно скопировать и отправить кому то выполненые задачи)</li>
            </ul>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Число рядом с названием слота показывает количество задач в нём. Состояние свёрнутости сохраняется локально
            и восстанавливается при перезагрузке страницы.
          </p>
        </div>
      </div>

      {/* Список задач */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3">Список задач</h3>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Основной раздел для управления всеми задачами. Поддерживает вложенность до трёх уровней глубины, что
            позволяет создавать проекты, подзадачи и подподзадачи.
          </p>
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-200 mb-2">Основные возможности:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Древовидная структура задач с поддержкой до 3 уровней вложенности</li>
              <li>Drag-and-drop для перетаскивания задач между уровнями и изменения порядка</li>
              <li>Поиск задач по названию и описанию</li>
              <li>Фильтрация задач по времени: только активные, активные сегодня, за день, за два дня, за неделю</li>
              <li>Сворачивание и разворачивание проектов (всех сразу или по отдельности)</li>
              <li>Выделение первого todo на максимальной глубине (как способ найти крайнюю задачу в проекте, за котороую можно взяться)</li>
              <li>Добавление описаний к задачам с поддержкой форматирования</li>
              <li>Управление тегами для категоризации задач</li>
              <li>В проект можно добавить alias и он будет отображаться в дочерних задачах как фиксированный тег</li>
            </ul>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Перетаскивание реализовано на чистом HTML5 drag-and-drop. Доступные точки сброса отображаются только во
            время перетаскивания и учитывают ограничения по глубине вложенности.
          </p>
        </div>
      </div>

      {/* Случайное */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3">Случайное</h3>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>
            Раздел для работы со случайной задачей. Система выбирает случайную незавершённую задачу и показывает всю
            цепочку задач от корня до выбранной задачи, помогая понять контекст и начать работу.
          </p>
          <div>
            <p className="font-medium text-slate-700 dark:text-slate-200 mb-2">Основные возможности:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Автоматический выбор случайной незавершённой задачи</li>
              <li>Отображение полной цепочки задач от корня до выбранной задачи</li>
              <li>Сохранение ссылки на текущую случайную задачу в URL</li>
              <li>Возможность загрузить другую случайную задачу</li>
            </ul>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Цепочка задач всегда развёрнута для удобного просмотра. Вы можете работать с задачей прямо из этого
            раздела.
          </p>
        </div>
      </div>

      {/* Настройки */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3">Настройки</h3>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>Раздел для управления профилем, тегами и данными приложения.</p>
          <div>
            <p className="font-medium text-slate-700 mb-2">Управление профилем:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Просмотр информации о профиле Telegram</li>
              <li>Выход из аккаунта</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-700 mb-2 mt-3">Управление тегами:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Создание новых тегов</li>
              <li>Редактирование названий тегов</li>
              <li>Удаление тегов</li>
              <li>Изменение порядка тегов перетаскиванием</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-700 mb-2 mt-3">Экспорт и импорт данных:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Экспорт всех данных (задачи, слоты, теги) в формате JSON</li>
              <li>Импорт данных из JSON файла</li>
              <li>Полная замена текущих данных при импорте</li>
            </ul>
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-3">
            ⚠️ Внимание: импорт данных полностью заменяет существующие задачи и списки. Перед импортом рекомендуется
            сохранить резервную копию.
          </p>
        </div>
      </div>

      {/* Шорткаты */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 p-5 shadow-sm">
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-3">Клавиатурные сокращения</h3>
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div>
            <p className="font-medium text-slate-700 mb-2">Глобальные шорткаты (работают, когда фокус не внутри поля ввода):</p>
            <ul className="space-y-1">
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">N</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Н</kbd>{' '}
                — открыть модал добавления новой задачи (вкладка «Список задач»)
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Alt + ←</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Alt + →</kbd>{' '}
                — переключить вкладки
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Alt + ↑</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Alt + ↓</kbd>{' '}
                — шаг по закреплённым спискам (на вкладке «Слоты»)
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">↑</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">↓</kbd>{' '}
                — перейти к предыдущей/следующей задаче (когда фокус на пустой странице)
              </li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-slate-700 mb-2">На карточке задачи (когда карточка в фокусе):</p>
            <ul className="space-y-1">
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">↑</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">↓</kbd>{' '}
                — вверх/вниз по списку задач
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Home</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">End</kbd>{' '}
                — к первому/последнему элементу в текущем scope (list или pinned)
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">←</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">→</kbd>{' '}
                — свернуть/развернуть узел (если есть дети)
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Пробел</kbd>{' '}
                — отметить/снять отметку выполнения
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Delete</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Backspace</kbd>{' '}
                — удалить задачу
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">E</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">У</kbd>{' '}
                — войти в режим редактирования названия
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">O</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Щ</kbd>{' '}
                — открыть редактор описания
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">A</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Ф</kbd>{' '}
                — открыть/закрыть форму добавления подзадачи
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">T</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Е</kbd>{' '}
                — открыть/закрыть меню тегов
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Shift + T</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Shift + Е</kbd>{' '}
                — быстро прикрепить/открепить тег
              </li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-slate-700 mb-2">В меню тегов:</p>
            <ul className="space-y-1">
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">↑</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">↓</kbd>,{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Home</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">End</kbd>{' '}
                — навигация по элементам
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">1..9</kbd>{' '}
                — выбрать тег по позиции
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Esc</kbd>{' '}
                — закрыть меню и вернуть фокус на карточку
              </li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-slate-700 mb-2">Редактирование и формы:</p>
            <ul className="space-y-1">
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Esc</kbd>{' '}
                — отменить редактирование или закрыть модал/форму
              </li>
              <li>
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Enter</kbd> /{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Ctrl+Enter</kbd> (или{' '}
                <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded text-xs font-mono text-slate-900 dark:text-slate-100">Meta+Enter</kbd>){' '}
                — сохранить изменения (в многострочном вводе использовать Ctrl/Meta+Enter для сохранения)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

GuideTab.displayName = 'GuideTab'

export default GuideTab

