import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ListResponse } from '~/shared/types/common'
import type { ClientProduct } from '~/features/clients/services/clientProductService'
import type { VendorProduct } from '~/features/vendors/services/vendorProductService'

/**
 * Tenant-wide catalog rollup. Two endpoints, mirrored shapes:
 *   /catalog          → ClientProduct[] (revenue items per client)
 *   /vendor-catalog   → VendorProduct[] (expense items per vendor)
 *
 * Both eager-load the owning party (client / vendor) and `default_account`
 * so each row can render without N+1.
 */

export interface ClientCatalogParams extends BaseListParams {
  client_id?: number
  is_active?: boolean
}

export interface VendorCatalogParams extends BaseListParams {
  vendor_id?: number
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

export function catalogService() {
  const api = useApi()

  return {
    listClientCatalog: (params: ClientCatalogParams = {}) =>
      api.get<ListResponse<ClientProduct>>(`${ENDPOINTS.catalog.clients}${toQuery(params)}`),
    listVendorCatalog: (params: VendorCatalogParams = {}) =>
      api.get<ListResponse<VendorProduct>>(`${ENDPOINTS.catalog.vendors}${toQuery(params)}`),
  }
}
