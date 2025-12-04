import { TelegramLoginButton } from './TelegramLoginButton'

interface LoginScreenProps {
  errorCode?: string
}

const ERROR_MESSAGES: Record<string, string> = {
  state: 'Не удалось подтвердить запрос авторизации. Попробуйте снова.',
  signature: 'Не удалось проверить данные от Telegram. Обновите страницу и войдите ещё раз.',
  expired: 'Сессия авторизации истекла. Пожалуйста, попробуйте снова.',
  default: 'Не удалось выполнить вход через Telegram. Попробуйте ещё раз.',
}

export function LoginScreen({ errorCode }: LoginScreenProps) {
  const message = errorCode ? ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.default : null

  return (
    <main className="min-h-screen bg-canvas-light dark:bg-canvas-dark px-4 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl bg-white/70 dark:bg-slate-800/70 p-8 text-center shadow-xl ring-1 ring-white/40 dark:ring-slate-700/40">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Вход через Telegram</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Авторизуйтесь с помощью Telegram, чтобы сохранять свои задачи и закреплённые списки. Каждый пользователь видит только
          собственные данные.
        </p>
        {message && (
          <div className="mt-4 w-full rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/30 px-4 py-3 text-sm text-rose-700 dark:text-rose-300">
            {message}
          </div>
        )}
        <div className="mt-6">
          <TelegramLoginButton />
        </div>
        <p className="mt-6 text-xs text-slate-400 dark:text-slate-500">
          Мы используем официальную авторизацию Telegram. После входа вы сможете управлять задачами и закреплёнными списками.
        </p>
      </div>
    </main>
  )
}
