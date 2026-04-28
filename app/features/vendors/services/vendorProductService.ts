import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export interface VendorProductDefaultAccount {
  id: number
  code: string | null
  name_ar: string | null
  name_en: string | null
}

/**
 * Per-vendor billable item — backend `vendor_products` table.
 *
 * `default_account` mirrors the loaded `defaultAccount` relation; its
 * presence is what lets the bill-line picker auto-fill the GL account
 * when the user picks a saved product. `default_vat_rate` of `null`
 * means "inherit the tenant default at bill time".
 */
export interface VendorProduct {
  id: number
  vendor_id: number
  name: string
  description: string | null
  unit_price: number | string
  default_vat_rate: number | string | null
  default_account_id: number | null
  default_account: VendorProductDefaultAccount | null
  is_active: boolean
  last_used_at: string | null
  created_at: string
  updated_at: string
}

export interface VendorProductForm {
  name: string
  description?: string | null
  unit_price: number
  default_vat_rate?: number | null
  default_account_id?: number | null
  is_active?: boolean
}

export interface VendorProductListParams extends BaseListParams {
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

export function vendorProductService() {
  const api = useApi()

  return {
    /** Per-vendor list — used by the bill-line picker and Products tab. */
    list: (vendorId: number, params: VendorProductListParams = {}) =>
      api.get<ListResponse<VendorProduct>>(`${ENDPOINTS.vendors.products(vendorId)}${toQuery(params)}`),

    get: (vendorId: number, productId: number) =>
      api.get<ItemResponse<VendorProduct>>(ENDPOINTS.vendors.productsOne(vendorId, productId)).then(r => r.data),

    create: (vendorId: number, form: VendorProductForm, idempotencyKey?: string) =>
      api.post<ItemResponse<VendorProduct>>(ENDPOINTS.vendors.products(vendorId), form, { idempotencyKey }).then(r => r.data),

    update: (vendorId: number, productId: number, form: Partial<VendorProductForm>) =>
      api.put<ItemResponse<VendorProduct>>(ENDPOINTS.vendors.productsOne(vendorId, productId), form).then(r => r.data),

    remove: (vendorId: number, productId: number) =>
      api.delete<void>(ENDPOINTS.vendors.productsOne(vendorId, productId)),
  }
}
