import type { Client, ClientForm } from '~/shared/types/client'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'
import { ENDPOINTS } from '~/core/api/endpoints'

export type ClientStatus = 'active' | 'inactive' | 'archived'

export interface ClientListParams extends BaseListParams {
  status?: ClientStatus
  city?: string
  industry?: string
}

export interface ClientAgingBuckets {
  '0_30': number
  '31_60': number
  '61_90': number
  '90_plus': number
}

export interface ClientDetail extends Client {
  balance: number
  currency: string
  credit_limit: number | null
  status: ClientStatus
  contacts?: Array<Record<string, unknown>>
  addresses?: Array<Record<string, unknown>>
  recent_invoices?: Array<{ id: number; number: string; total: number; balance_due: number; status: string }>
  open_invoices_count?: number
  aging_buckets?: ClientAgingBuckets
}

export interface ClientMessage {
  id: number
  client_id: number
  user_id: number | null
  /** outbound = firm → client, inbound = client → firm. */
  direction: 'outbound' | 'inbound'
  subject: string
  body: string
  is_read: boolean
  read_at: string | null
  created_at: string
  sender?: { id: number; name: string }
}

export interface SendMessagePayload {
  subject: string
  body: string
}

export interface PortalInvitePayload {
  email: string
  name: string
  send_email?: boolean
}

export interface PortalUser {
  id: number
  name: string
  email: string
  /** active = has logged in OR no pending invite; pending = invite sent but not yet redeemed. */
  status: 'active' | 'pending'
  last_login_at: string | null
  /** ISO timestamp; only set for pending users with a live magic-link. */
  invite_expires_at: string | null
  created_at: string | null
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function clientService() {
  const api = useApi()

  return {
    list: (params: ClientListParams = {}) =>
      api.get<ListResponse<Client>>(`${ENDPOINTS.clients.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<ClientDetail>>(ENDPOINTS.clients.one(id)).then(r => r.data),
    create: (form: Partial<ClientForm>, idempotencyKey?: string) =>
      api.post<ItemResponse<Client>>(ENDPOINTS.clients.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<ClientForm>) =>
      api.put<ItemResponse<Client>>(ENDPOINTS.clients.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.clients.one(id)),
    restore: (id: number) =>
      api.post<ItemResponse<Client>>(ENDPOINTS.clients.restore(id)).then(r => r.data),
    toggleActive: (id: number) =>
      api.patch<ItemResponse<Client>>(ENDPOINTS.clients.toggleActive(id)).then(r => r.data),

    messages: (id: number, params: BaseListParams = {}) =>
      api.get<ListResponse<ClientMessage>>(`${ENDPOINTS.clients.messages(id)}${toQuery(params)}`),
    sendMessage: (id: number, payload: SendMessagePayload, idempotencyKey?: string) =>
      api.post<ItemResponse<ClientMessage>>(ENDPOINTS.clients.messages(id), payload, { idempotencyKey }).then(r => r.data),

    invitePortal: (id: number, payload: PortalInvitePayload, idempotencyKey?: string) =>
      api.post<{ message: string }>(ENDPOINTS.clients.invitePortal(id), payload, { idempotencyKey }),

    /** List portal users + pending invites for a client. */
    portalUsers: (id: number) =>
      api.get<{ data: PortalUser[] }>(ENDPOINTS.clients.portalUsers(id)).then(r => r.data ?? []),

    /** Revoke a portal user (soft-delete + token burn). */
    revokePortalUser: (clientId: number, userId: number) =>
      api.delete<{ message: string }>(ENDPOINTS.clients.portalUserRevoke(clientId, userId)),

    /** Resend the magic-link invite email; only works for pending users. */
    resendPortalInvite: (clientId: number, userId: number, idempotencyKey?: string) =>
      api.post<{ message: string; invite_url: string }>(
        ENDPOINTS.clients.portalUserResend(clientId, userId),
        {},
        { idempotencyKey },
      ),

    /** Bulk import — returns an ImportJobResource; poll /import/{jobId}. */
    importCsv: (file: File, idempotencyKey?: string) => {
      const fd = new FormData()
      fd.append('file', file)
      const headers = api.getHeaders()
      delete (headers as any)['Content-Type']
      if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
      return api.raw<{ data: { id: number; status: string } }>(ENDPOINTS.imports.clients, {
        method: 'POST', body: fd, headers,
      })
    },
  }
}
