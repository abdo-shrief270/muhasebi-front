import type { Account, PaginatedResponse } from '~/shared/types/accounting'

export interface AccountListParams {
  page?: number
  search?: string
  type?: string
  [key: string]: string | number | undefined
}

function toQuery(params: AccountListParams): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function accountService() {
  const api = useApi()

  return {
    list(params: AccountListParams = {}) {
      return api.get<PaginatedResponse<Account>>(`/accounts${toQuery(params)}`)
    },
    tree() {
      return api.get<{ data: Account[] }>('/accounts/tree').then(r => r.data)
    },
    get(id: number) {
      return api.get<{ data: Account }>(`/accounts/${id}`).then(r => r.data)
    },
    create(form: Partial<Account>, idempotencyKey?: string) {
      return api.post<{ data: Account }>('/accounts', form, { idempotencyKey }).then(r => r.data)
    },
    update(id: number, form: Partial<Account>) {
      return api.put<{ data: Account }>(`/accounts/${id}`, form).then(r => r.data)
    },
    remove(id: number) {
      return api.delete<void>(`/accounts/${id}`)
    },
  }
}
