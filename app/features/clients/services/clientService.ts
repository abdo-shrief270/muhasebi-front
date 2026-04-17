import type { Client, ClientForm, PaginatedResponse } from '~/shared/types/client'

export interface ClientListParams {
  page?: number
  search?: string
  is_active?: boolean
  [key: string]: string | number | boolean | undefined
}

function toQuery(params: ClientListParams): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function clientService() {
  const api = useApi()

  return {
    list(params: ClientListParams = {}) {
      return api.get<PaginatedResponse<Client>>(`/clients${toQuery(params)}`)
    },
    get(id: number) {
      return api.get<{ data: Client }>(`/clients/${id}`).then(r => r.data)
    },
    create(form: Partial<ClientForm>, idempotencyKey?: string) {
      return api.post<{ data: Client }>('/clients', form, { idempotencyKey }).then(r => r.data)
    },
    update(id: number, form: Partial<ClientForm>) {
      return api.put<{ data: Client }>(`/clients/${id}`, form).then(r => r.data)
    },
    remove(id: number) {
      return api.delete<void>(`/clients/${id}`)
    },
    toggleActive(id: number) {
      return api.patch<{ data: Client }>(`/clients/${id}/toggle-active`).then(r => r.data)
    },
  }
}
