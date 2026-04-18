import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type BankReconStatus = 'open' | 'completed'

export interface BankReconciliation {
  id: number
  account_id: number
  statement_date: string
  statement_balance: number
  gl_balance: number
  variance: number
  status: BankReconStatus
  notes: string | null
  created_at: string
  completed_at: string | null
}

export interface BankReconciliationSummary {
  statement_balance: number
  gl_balance: number
  variance: number
  matched_lines: number
  unmatched_lines: number
  outstanding_deposits: number
  outstanding_checks: number
}

export interface BankStatementLine {
  id: number
  bank_reconciliation_id: number
  date: string
  description: string
  reference: string | null
  amount: number
  type: 'debit' | 'credit'
  matched: boolean
  excluded: boolean
  matched_transaction?: {
    type: 'journal_entry' | 'invoice' | 'bill' | 'payment'
    id: number
  }
}

export interface OpenReconPayload {
  account_id: number
  statement_date: string
  statement_balance: number
  notes?: string
}

export interface ImportLinesJsonPayload {
  lines: Array<{
    date: string
    description: string
    reference?: string
    amount: number
    type: 'debit' | 'credit'
  }>
}

export interface MatchLinePayload {
  transaction_type: 'journal_entry' | 'invoice' | 'bill' | 'payment'
  transaction_id: number
}

export interface LineSuggestion {
  id: string
  confidence: number
  reason: string
  candidate: {
    type: 'journal_entry' | 'invoice' | 'bill' | 'payment'
    id: number
    label: string
  }
}

export interface BankReconListParams extends BaseListParams {
  account_id?: number
  status?: BankReconStatus
  from_date?: string
  to_date?: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function bankReconciliationService() {
  const api = useApi()

  return {
    list: (params: BankReconListParams = {}) =>
      api.get<ListResponse<BankReconciliation>>(`${ENDPOINTS.bankReconciliation.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<BankReconciliation & { lines: BankStatementLine[] }>>(ENDPOINTS.bankReconciliation.one(id)).then(r => r.data),
    create: (form: OpenReconPayload, idempotencyKey?: string) =>
      api.post<ItemResponse<BankReconciliation>>(ENDPOINTS.bankReconciliation.list, form, { idempotencyKey }).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.bankReconciliation.one(id)),
    summary: (id: number) =>
      api.get<ItemResponse<BankReconciliationSummary>>(ENDPOINTS.bankReconciliation.summary(id)).then(r => r.data),

    importLinesJson: (id: number, payload: ImportLinesJsonPayload, idempotencyKey?: string) =>
      api.post<{ data: BankStatementLine[] }>(ENDPOINTS.bankReconciliation.import(id), payload, { idempotencyKey }),
    importLinesFile: (id: number, file: File, idempotencyKey?: string) => {
      const fd = new FormData()
      fd.append('file', file)
      const headers = api.getHeaders()
      delete (headers as any)['Content-Type']
      if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
      return api.raw<{ data: BankStatementLine[] }>(ENDPOINTS.bankReconciliation.import(id), {
        method: 'POST', body: fd, headers,
      })
    },

    autoMatch:  (id: number, idempotencyKey?: string) =>
      api.post<{ data: { matched: number } }>(ENDPOINTS.bankReconciliation.autoMatch(id), undefined, { idempotencyKey }),
    smartMatch: (id: number, idempotencyKey?: string) =>
      api.post<{ data: { matched: number; suggestions: LineSuggestion[] } }>(ENDPOINTS.bankReconciliation.smartMatch(id), undefined, { idempotencyKey }),
    autoPost:   (id: number, idempotencyKey?: string) =>
      api.post<{ data: { posted: number } }>(ENDPOINTS.bankReconciliation.autoPost(id), undefined, { idempotencyKey }),
    categorize: (id: number, idempotencyKey?: string) =>
      api.post<{ data: { categorized: number } }>(ENDPOINTS.bankReconciliation.categorize(id), undefined, { idempotencyKey }),
    complete:   (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<BankReconciliation>>(ENDPOINTS.bankReconciliation.complete(id), undefined, { idempotencyKey }).then(r => r.data),

    line: {
      match:           (lineId: number, payload: MatchLinePayload) =>
        api.post<ItemResponse<BankStatementLine>>(ENDPOINTS.bankStatementLines.match(lineId), payload).then(r => r.data),
      unmatch:         (lineId: number) =>
        api.post<ItemResponse<BankStatementLine>>(ENDPOINTS.bankStatementLines.unmatch(lineId)).then(r => r.data),
      exclude:         (lineId: number, reason: string) =>
        api.post<ItemResponse<BankStatementLine>>(ENDPOINTS.bankStatementLines.exclude(lineId), { reason }).then(r => r.data),
      matchInvoice:    (lineId: number, invoiceId: number) =>
        api.post<ItemResponse<BankStatementLine>>(ENDPOINTS.bankStatementLines.matchInvoice(lineId), { invoice_id: invoiceId }).then(r => r.data),
      matchBill:       (lineId: number, billId: number) =>
        api.post<ItemResponse<BankStatementLine>>(ENDPOINTS.bankStatementLines.matchBill(lineId), { bill_id: billId }).then(r => r.data),
      suggestions:     (lineId: number) =>
        api.get<{ data: LineSuggestion[] }>(ENDPOINTS.bankStatementLines.suggestions(lineId)).then(r => r.data),
      applySuggestion: (lineId: number, suggestionId: string) =>
        api.post<ItemResponse<BankStatementLine>>(ENDPOINTS.bankStatementLines.applySuggestion(lineId), { suggestion_id: suggestionId }).then(r => r.data),
      learn:           (lineId: number, payload: { account_id: number; apply_as_rule?: boolean }) =>
        api.post<{ message: string }>(ENDPOINTS.bankStatementLines.learn(lineId), payload),
    },
  }
}

// ------------------------------------------------------------- categorization rules

export interface BankCategorizationRule {
  id: number
  name: string
  pattern: string
  account_id: number
  cost_center_id: number | null
  tax_rate: number | null
  active: boolean
}

export type BankCategorizationRuleForm = Omit<BankCategorizationRule, 'id'>

export function bankCategorizationRulesService() {
  const api = useApi()

  return {
    list: () =>
      api.get<{ data: BankCategorizationRule[] }>(ENDPOINTS.bankCategorizationRules.list).then(r => r.data),
    create: (form: BankCategorizationRuleForm, idempotencyKey?: string) =>
      api.post<ItemResponse<BankCategorizationRule>>(ENDPOINTS.bankCategorizationRules.list, form, { idempotencyKey }).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.bankCategorizationRules.remove(id)),
  }
}
