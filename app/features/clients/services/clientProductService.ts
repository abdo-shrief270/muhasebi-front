import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export interface ClientProductDefaultAccount {
  id: number
  code: string | null
  name_ar: string | null
  name_en: string | null
}

export interface ClientProduct {
  id: number
  client_id: number
  client?: { id: number; name: string }
  name: string
  description: string | null
  unit_price: number
  default_vat_rate: number | null
  /**
   * Preferred GL revenue account. When set, the invoice line picker fills
   * the line's `account_id` so the user doesn't pick it on every invoice
   * for the same recurring item.
   */
  default_account_id: number | null
  default_account: ClientProductDefaultAccount | null
  is_active: boolean
  last_used_at: string | null
  created_at: string
  updated_at: string
}

export interface ClientProductForm {
  name: string
  description?: string | null
  unit_price: number
  default_vat_rate?: number | null
  default_account_id?: number | null
  is_active?: boolean
}

export interface ClientProductListParams extends BaseListParams {
  is_active?: boolean
}

export interface CatalogListParams extends BaseListParams {
  client_id?: number
  is_active?: boolean
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function clientProductService() {
  const api = useApi()

  return {
    /** Per-client list — used by the line picker on the invoice form. */
    list: (clientId: number, params: ClientProductListParams = {}) =>
      api.get<ListResponse<ClientProduct>>(`${ENDPOINTS.clients.products(clientId)}${toQuery(params)}`),

    get: (clientId: number, productId: number) =>
      api.get<ItemResponse<ClientProduct>>(ENDPOINTS.clients.productsOne(clientId, productId)).then(r => r.data),

    create: (clientId: number, form: ClientProductForm, idempotencyKey?: string) =>
      api.post<ItemResponse<ClientProduct>>(ENDPOINTS.clients.products(clientId), form, { idempotencyKey }).then(r => r.data),

    update: (clientId: number, productId: number, form: Partial<ClientProductForm>) =>
      api.put<ItemResponse<ClientProduct>>(ENDPOINTS.clients.productsOne(clientId, productId), form).then(r => r.data),

    remove: (clientId: number, productId: number) =>
      api.delete<void>(ENDPOINTS.clients.productsOne(clientId, productId)),

    /** Tenant-wide rollup — used by the catalog page. */
    catalog: (params: CatalogListParams = {}) =>
      api.get<ListResponse<ClientProduct>>(`${ENDPOINTS.catalog.list}${toQuery(params)}`),
  }
}
