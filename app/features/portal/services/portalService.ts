import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type PaymentGatewaySlug = 'paymob' | 'fawry'

export interface PortalDashboard {
  tenant: { name: string; logo_url: string | null }
  client: { id: number; name: string; balance: number }
  summary: {
    total_due: number
    overdue_count: number
    paid_last_30d: number
  }
  recent_invoices: Array<{ id: number; number: string; total: number; balance_due: number; status: string; due_date: string }>
  unread_messages: number
}

export interface PortalProfile {
  id: number
  name: string
  email: string
  phone: string | null
  locale: 'ar' | 'en'
  client: { id: number; name: string; tax_id: string | null }
}

export interface PortalInvoice {
  id: number
  number: string
  date: string
  due_date: string
  status: 'sent' | 'partial' | 'paid' | 'overdue'
  total: number
  amount_paid: number
  balance_due: number
  currency: string
  pdf_url: string
}

export interface PortalInvoiceListParams extends BaseListParams {
  status?: PortalInvoice['status']
  from_date?: string
  to_date?: string
}

export interface PaymentInitPayload {
  gateway: PaymentGatewaySlug
  return_url?: string
}

export interface PaymentInitResult {
  redirect_url: string
  reference: string
}

export interface PaymentGateway {
  slug: PaymentGatewaySlug
  name: string
  logo_url: string | null
  active: boolean
}

export interface PortalDocument {
  id: number
  title: string
  description: string | null
  category: string | null
  size_bytes: number
  mime_type: string
  created_at: string
}

export interface PortalMessage {
  id: number
  thread_id: number
  direction: 'outbound' | 'inbound'
  content: string
  sender: { id: number; name: string } | null
  attachments: number[]
  read_at: string | null
  created_at: string
}

export interface PortalNotification {
  id: string
  type: string
  data: Record<string, unknown>
  read_at: string | null
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

export function portalService() {
  const api = useApi()
  const config = useRuntimeConfig()

  return {
    dashboard: () =>
      api.get<ItemResponse<PortalDashboard>>(ENDPOINTS.portal.dashboard).then(r => r.data),
    profile: () =>
      api.get<ItemResponse<PortalProfile>>(ENDPOINTS.portal.profile).then(r => r.data),

    invoices: {
      list: (params: PortalInvoiceListParams = {}) =>
        api.get<ListResponse<PortalInvoice>>(`${ENDPOINTS.portal.invoices}${toQuery(params)}`),
      get: (id: number) =>
        api.get<ItemResponse<PortalInvoice>>(ENDPOINTS.portal.invoice(id)).then(r => r.data),
      pay: (id: number, payload: PaymentInitPayload, idempotencyKey: string) =>
        api.post<ItemResponse<PaymentInitResult>>(ENDPOINTS.portal.pay(id), payload, { idempotencyKey }).then(r => r.data),
      pdfUrl: (id: number) => `${config.public.apiBase}${ENDPOINTS.portal.invoicePdf(id)}`,
    },

    paymentGateways: () =>
      api.get<{ data: PaymentGateway[] }>(ENDPOINTS.portal.paymentGateways).then(r => r.data),

    documents: {
      list: (params: BaseListParams & { category?: string } = {}) =>
        api.get<ListResponse<PortalDocument>>(`${ENDPOINTS.portal.documents}${toQuery(params)}`),
      upload: (file: File, meta: { title?: string; description?: string } = {}, idempotencyKey?: string) => {
        const fd = new FormData()
        fd.append('file', file)
        if (meta.title) fd.append('title', meta.title)
        if (meta.description) fd.append('description', meta.description)
        const headers = api.getHeaders()
        delete (headers as any)['Content-Type']
        if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
        return api.raw<ItemResponse<PortalDocument>>(ENDPOINTS.portal.documents, {
          method: 'POST', body: fd, headers,
        })
      },
      downloadUrl: (id: number) => {
        const token = import.meta.client ? localStorage.getItem('auth_token') : ''
        return `${config.public.apiBase}${ENDPOINTS.portal.documentDownload(id)}?token=${token ?? ''}`
      },
    },

    messages: {
      list: (params: BaseListParams = {}) =>
        api.get<ListResponse<PortalMessage>>(`${ENDPOINTS.portal.messages}${toQuery(params)}`),
      get: (id: number) =>
        api.get<ItemResponse<PortalMessage>>(ENDPOINTS.portal.message(id)).then(r => r.data),
      send: (payload: { content: string; attachments?: number[] }, idempotencyKey?: string) =>
        api.post<ItemResponse<PortalMessage>>(ENDPOINTS.portal.messages, payload, { idempotencyKey }).then(r => r.data),
      markRead: (id: number) =>
        api.post<{ message: string }>(ENDPOINTS.portal.markMessageRead(id)),
    },

    notifications: {
      list: (params: BaseListParams & { read?: boolean } = {}) =>
        api.get<ListResponse<PortalNotification>>(`${ENDPOINTS.portal.notifications}${toQuery(params)}`),
      markRead: (id: string) =>
        api.post<{ message: string }>(ENDPOINTS.portal.markNotifRead(id)),
      markAllRead: () =>
        api.post<{ message: string }>(ENDPOINTS.portal.markAllNotifRead),
    },
  }
}
