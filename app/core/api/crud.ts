import type { ItemResponse, ListResponse, BaseListParams } from '~/shared/types/common'

type Id = number | string

export interface CrudPaths {
  list: string
  one: (id: Id) => string
}

function toQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

/**
 * Build the five canonical CRUD operations (list/get/create/update/remove)
 * from a pair of URL paths. Each feature's service composes this with its
 * feature-specific endpoints (sub-actions, bulk, etc.).
 *
 * Example:
 *   const crud = createCrudService<Client, Partial<ClientForm>, ClientListParams>({
 *     list: ENDPOINTS.clients.list,
 *     one:  ENDPOINTS.clients.one,
 *   })
 *
 *   export function clientService() {
 *     const api = useApi()
 *     return {
 *       ...crud(),
 *       toggleActive: (id: number) =>
 *         api.patch<ItemResponse<Client>>(ENDPOINTS.clients.toggleActive(id)).then(r => r.data),
 *     }
 *   }
 */
export function createCrudService<
  T,
  Form = Partial<T>,
  ListParams extends BaseListParams = BaseListParams,
>(paths: CrudPaths) {
  return function crud() {
    const api = useApi()
    return {
      list(params: ListParams = {} as ListParams) {
        return api.get<ListResponse<T>>(`${paths.list}${toQuery(params)}`)
      },
      get(id: Id) {
        return api.get<ItemResponse<T>>(paths.one(id)).then(r => r.data)
      },
      create(form: Form, idempotencyKey?: string) {
        return api.post<ItemResponse<T>>(paths.list, form, { idempotencyKey }).then(r => r.data)
      },
      update(id: Id, form: Form) {
        return api.put<ItemResponse<T>>(paths.one(id), form).then(r => r.data)
      },
      remove(id: Id) {
        return api.delete<void>(paths.one(id))
      },
    }
  }
}

/** Exposed for feature services that need to build query strings for custom endpoints. */
export { toQuery }
