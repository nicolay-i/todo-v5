import { AsyncLocalStorage } from 'node:async_hooks'

interface UserContextState {
  userId: string
}

const storage = new AsyncLocalStorage<UserContextState>()

export async function runWithUserContext<T>(userId: string, callback: () => Promise<T>): Promise<T> {
  return await storage.run({ userId }, callback)
}

export function getUserIdOrThrow(): string {
  const store = storage.getStore()
  if (!store?.userId) {
    throw new Error('User context is not available')
  }
  return store.userId
}
