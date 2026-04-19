import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type EcommercePlatform = 'shopify' | 'woocommerce' | 'salla' | 'zid' | 'custom'

export interface EcommerceChannel {
  id: number
  platform: EcommercePlatform
  name: string
  api_url: string | null
  is_active: boolean
  orders_count?: number
  last_sync_at: string | null
  settings: Record<string, unknown>
  created_at: string
}

export interface EcommerceChannelForm {
  platform: EcommercePlatform
  name: string
  api_url?: string
  api_key?: string
  api_secret?: string
  webhook_secret?: string
  is_active?: boolean
  settings?: Record<string, unknown>
}

export interface EcommerceOrder {
  id: number
  ecommerce_channel_id: number
  external_id: string
  order_number: string
  customer_name: string
  customer_email: string | null
  total: number
  currency: string
  status: 'pending' | 'converted' | 'failed' | 'skipped'
  invoice_id: number | null
  ordered_at: string
  payload: Record<string, unknown>
}

export interface EcommerceDashboard {
  channels: { total: number; active: number; by_platform: Record<string, number> }
  orders: { total: number; pending_conversion: number; converted: number; failed: number }
  revenue: { this_month: string; last_month: string; currency: string }
  last_sync_at: string | null
}

export interface BulkConvertResult {
  converted: number
  skipped: number
  failed: number
  invoice_ids: number[]
}

export interface ChannelListParams extends BaseListParams {
  platform?: EcommercePlatform
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

export function ecommerceService() {
  const api = useApi()

  return {
    dashboard: () =>
      api.get<ItemResponse<EcommerceDashboard>>(ENDPOINTS.ecommerce.dashboard).then(r => r.data),
    bulkConvert: (orderIds: number[], idempotencyKey: string) =>
      api.post<{ data: BulkConvertResult; message: string }>(
        ENDPOINTS.ecommerce.bulkConvert, { order_ids: orderIds }, { idempotencyKey },
      ),

    channels: {
      list: (params: ChannelListParams = {}) =>
        api.get<ListResponse<EcommerceChannel>>(`${ENDPOINTS.ecommerce.channels}${toQuery(params)}`),
      get: (id: number) =>
        api.get<ItemResponse<EcommerceChannel>>(ENDPOINTS.ecommerce.channel(id)).then(r => r.data),
      create: (form: EcommerceChannelForm, idempotencyKey?: string) =>
        api.post<ItemResponse<EcommerceChannel>>(ENDPOINTS.ecommerce.channels, form, { idempotencyKey }).then(r => r.data),
      update: (id: number, form: Partial<EcommerceChannelForm>) =>
        api.put<ItemResponse<EcommerceChannel>>(ENDPOINTS.ecommerce.channel(id), form).then(r => r.data),
      remove: (id: number) =>
        api.delete<void>(ENDPOINTS.ecommerce.channel(id)),
      sync: (id: number, idempotencyKey?: string) =>
        api.post<{ data: { orders_imported: number } }>(
          ENDPOINTS.ecommerce.syncChannel(id), undefined, { idempotencyKey },
        ),
    },

    convertOrder: (orderId: number, idempotencyKey: string) =>
      api.post<ItemResponse<{ invoice_id: number }>>(
        ENDPOINTS.ecommerce.convertOrder(orderId), undefined, { idempotencyKey },
      ).then(r => r.data),
  }
}
