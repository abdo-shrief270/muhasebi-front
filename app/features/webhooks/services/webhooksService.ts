import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export interface WebhookEventType {
  event: string
  description: string
}

export interface WebhookEndpoint {
  id: number
  url: string
  events: string[]
  active: boolean
  description: string | null
  /** Secret is returned only on create. Empty on subsequent reads. */
  secret?: string
  last_success_at: string | null
  last_failure_at: string | null
  created_at: string
}

export interface WebhookForm {
  url: string
  events: string[]
  active?: boolean
  description?: string
}

export interface WebhookDelivery {
  id: number
  webhook_endpoint_id: number
  event: string
  payload: Record<string, unknown>
  status: 'success' | 'failed' | 'pending'
  attempts: number
  response_code: number | null
  response_body: string | null
  duration_ms: number
  delivered_at: string | null
  next_retry_at: string | null
  created_at: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function webhooksService() {
  const api = useApi()

  return {
    events: () =>
      api.get<{ data: WebhookEventType[] }>(ENDPOINTS.webhooks.events).then(r => r.data),

    list: () =>
      api.get<{ data: WebhookEndpoint[] }>(ENDPOINTS.webhooks.list).then(r => r.data),
    create: (form: WebhookForm, idempotencyKey?: string) =>
      api.post<ItemResponse<WebhookEndpoint>>(ENDPOINTS.webhooks.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<WebhookForm>) =>
      api.put<ItemResponse<WebhookEndpoint>>(ENDPOINTS.webhooks.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.webhooks.one(id)),

    deliveries: (id: number, params: BaseListParams & { status?: 'success' | 'failed' | 'pending'; from_date?: string; to_date?: string } = {}) =>
      api.get<ListResponse<WebhookDelivery>>(`${ENDPOINTS.webhooks.deliveries(id)}${toQuery(params)}`),
  }
}
