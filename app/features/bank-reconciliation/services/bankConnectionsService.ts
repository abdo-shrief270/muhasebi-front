import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse, ListResponse } from '~/shared/types/common'

export type BankConnectionFormat = 'mt940' | 'ofx' | 'csv' | 'api'
export type BankSyncSchedule = 'manual' | 'daily' | 'hourly'

export interface BankConnection {
  id: number
  account_id: number
  bank_slug: string
  format: BankConnectionFormat
  schedule: BankSyncSchedule
  last_synced_at: string | null
  last_balance: number | null
  is_active: boolean
  created_at: string
}

export type BankConnectionForm = Omit<BankConnection, 'id' | 'last_synced_at' | 'last_balance' | 'is_active' | 'created_at'> & {
  credentials?: Record<string, string>
}

export interface BankConnectionsDashboard {
  total_connections: number
  last_sync_at: string | null
  errors_count: number
  unreconciled_count: number
  per_bank: Array<{ bank_slug: string; connections: number; last_sync_at: string | null }>
}

export interface SupportedBank {
  slug: string
  name: string
  name_ar: string
  formats: BankConnectionFormat[]
  notes?: string
}

export interface GenerateInstructionPayload {
  bank_slug: string
  account_id: number
}

export interface ImportStatementPayload {
  from_date: string
  to_date: string
}

export function bankConnectionsService() {
  const api = useApi()

  return {
    dashboard: () =>
      api.get<ItemResponse<BankConnectionsDashboard>>(ENDPOINTS.bankConnections.dashboard).then(r => r.data),
    supportedFormats: () =>
      api.get<{ data: SupportedBank[] }>(ENDPOINTS.bankConnections.supportedFormats).then(r => r.data),
    generateInstruction: (payload: GenerateInstructionPayload) =>
      api.post<ItemResponse<{ pdf_url: string }>>(ENDPOINTS.bankConnections.generateInstruction, payload).then(r => r.data),

    list: () =>
      api.get<ListResponse<BankConnection>>(ENDPOINTS.bankConnections.list),
    create: (form: BankConnectionForm, idempotencyKey?: string) =>
      api.post<ItemResponse<BankConnection>>(ENDPOINTS.bankConnections.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<BankConnectionForm>) =>
      api.put<ItemResponse<BankConnection>>(ENDPOINTS.bankConnections.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.bankConnections.one(id)),

    syncBalance: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<{ balance: number; synced_at: string }>>(
        ENDPOINTS.bankConnections.syncBalance(id), undefined, { idempotencyKey },
      ).then(r => r.data),
    importStatement: (id: number, payload: ImportStatementPayload, idempotencyKey?: string) =>
      api.post<{ data: { lines_imported: number } }>(
        ENDPOINTS.bankConnections.importStatement(id), payload, { idempotencyKey },
      ),
  }
}
