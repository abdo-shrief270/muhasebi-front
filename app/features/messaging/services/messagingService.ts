import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type MessagingChannel = 'whatsapp' | 'sms'

export interface WhatsAppPayload {
  phone: string
  message: string
  template_name?: string
  template_params?: Record<string, string>
}

export interface SmsPayload {
  phone: string
  message: string
}

export interface SendResult {
  message: string
  data?: { message_id: string }
  error?: 'not_configured' | 'send_failed' | string
}

export interface MessagingTemplate {
  name: string
  language: string
  status: 'approved' | 'pending' | 'rejected'
  body: string
  parameters: string[]
}

export interface Conversation {
  id: number
  client_id: number | null
  phone: string
  channel: MessagingChannel
  last_message_at: string
  unread_count: number
  last_message_preview: string
  client?: { id: number; name: string }
}

export interface ConversationMessage {
  id: number
  conversation_id: number
  direction: 'outbound' | 'inbound'
  channel: MessagingChannel
  body: string
  sender: { id: number; name: string } | null
  sent_at: string
  delivered_at: string | null
  read_at: string | null
  provider_message_id: string | null
}

export interface ReplyPayload {
  message: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function messagingService() {
  const api = useApi()

  return {
    sendWhatsApp: (payload: WhatsAppPayload, idempotencyKey: string) =>
      api.post<SendResult>(ENDPOINTS.messaging.whatsapp, payload, { idempotencyKey }),
    sendSms: (payload: SmsPayload, idempotencyKey: string) =>
      api.post<SendResult>(ENDPOINTS.messaging.sms, payload, { idempotencyKey }),

    templates: () =>
      api.get<{ data: MessagingTemplate[] }>(ENDPOINTS.messaging.templates).then(r => r.data),

    conversations: (params: BaseListParams & { channel?: MessagingChannel; client_id?: number } = {}) =>
      api.get<ListResponse<Conversation>>(`${ENDPOINTS.messaging.conversations}${toQuery(params)}`),
    getConversation: (id: number) =>
      api.get<ItemResponse<Conversation & { messages: ConversationMessage[] }>>(
        ENDPOINTS.messaging.conversation(id),
      ).then(r => r.data),
    reply: (id: number, payload: ReplyPayload, idempotencyKey: string) =>
      api.post<ItemResponse<ConversationMessage>>(ENDPOINTS.messaging.reply(id), payload, { idempotencyKey }).then(r => r.data),
  }
}
