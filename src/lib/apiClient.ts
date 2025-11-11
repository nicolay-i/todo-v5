/**
 * Клиент для работы с API приложения
 * Все запросы идут через единый RPC endpoint
 */
export class ApiClient {
  /**
   * Единая точка вызова RPC методов
   * Все операции проходят через /api/rpc endpoint
   * 
   * @example
   * const response = await ApiClient.rpc('todo.add', {
   *   parentId: null,
   *   title: 'Новая задача'
   * })
   * 
   * if (response.ok) {
   *   console.log('Success:', response.data.state)
   * } else {
   *   console.error('Error:', response.error)
   * }
   */
  static async rpc<M extends import('./rpcTypes').RpcMethod>(
    method: M,
    params: import('./rpcTypes').RpcParamsMap[M]
  ): Promise<import('./rpcTypes').RpcResponse<M>> {
    try {
      const response = await fetch('/api/rpc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method, params }),
      })

      if (response.status === 401) {
        window.location.href = '/'
        throw new Error('Unauthorized')
      }

      return (await response.json()) as import('./rpcTypes').RpcResponse<M>
    } catch (error) {
      // В случае сетевой ошибки возвращаем структуру RpcError
      return {
        ok: false,
        error: error instanceof Error ? error.message : 'Network error',
      } as import('./rpcTypes').RpcResponse<M>
    }
  }
}
