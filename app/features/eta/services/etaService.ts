import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

// ---- settings ----
export type EtaEnvironment = 'preprod' | 'prod'

export interface EtaSettings {
  tax_number: string
  legal_name: string
  activity_type: string
  branch_id: string
  environment: EtaEnvironment
  client_id_configured: boolean
  certificate_installed: boolean
  last_token_refresh: string | null
  auto_submit: boolean
}

export interface EtaSettingsForm {
  tax_number: string
  legal_name: string
  activity_type: string
  branch_id: string
  environment: EtaEnvironment
  client_id?: string
  client_secret?: string
  certificate?: string | File
  auto_submit?: boolean
}

// ---- documents ----
export type EtaDocumentStatus = 'prepared' | 'submitted' | 'valid' | 'rejected' | 'cancelled'

export interface EtaDocument {
  id: number
  invoice_id: number
  document_type: string
  internal_id: string
  submission_uuid: string | null
  status: EtaDocumentStatus
  status_label: string
  status_label_ar: string
  status_color: string
  government_timestamp: string | null
  response_code: number | null
  errors: Array<Record<string, unknown>>
  qr_code_data: string | null
  submitted_at: string | null
  created_at: string
  invoice?: Record<string, unknown>
}

export interface EtaPreparedDocument {
  document: Record<string, unknown>
  warnings: string[]
  errors: string[]
}

export interface EtaSubmissionResult {
  status: EtaDocumentStatus
  submission_uuid: string
  government_timestamp: string
  response_code: number
  errors: string[]
}

export interface EtaComplianceDashboard {
  success_rate: number
  total_submitted: number
  rejected_count: number
  unmapped_lines_count: number
  certificate_expires_at: string | null
  per_status: Record<EtaDocumentStatus, number>
}

export interface EtaDocumentListParams extends BaseListParams {
  status?: EtaDocumentStatus
  from_date?: string
  to_date?: string
  invoice_id?: number
}

// ---- item codes ----
export type EtaCodeType = 'GS1' | 'EGS'

export interface EtaItemCode {
  id: number
  code: string
  code_type: EtaCodeType
  description: string
  description_ar: string | null
  parent_code: string | null
  is_active: boolean
}

export type EtaItemCodeForm = Omit<EtaItemCode, 'id' | 'is_active' | 'description_ar'> & { description_ar?: string }

export interface EtaCodeMapping {
  id: number
  target_type: 'product' | 'account'
  target_id: number
  item_code_id: number
  item_code?: EtaItemCode
}

export interface UnmappedLine {
  invoice_id: number
  invoice_number: string
  line_id: number
  description: string
  suggested_code_id: number | null
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function etaService() {
  const api = useApi()

  return {
    settings: {
      get: () =>
        api.get<ItemResponse<EtaSettings>>(ENDPOINTS.eta.settings).then(r => r.data),
      update: (payload: EtaSettingsForm) => {
        if (payload.certificate instanceof File) {
          const fd = new FormData()
          for (const [k, v] of Object.entries(payload)) {
            if (v == null) continue
            if (v instanceof File) fd.append(k, v)
            else fd.append(k, String(v))
          }
          const headers = api.getHeaders()
          delete (headers as any)['Content-Type']
          return api.raw<ItemResponse<EtaSettings>>(ENDPOINTS.eta.settings, {
            method: 'PUT', body: fd, headers,
          })
        }
        return api.put<ItemResponse<EtaSettings>>(ENDPOINTS.eta.settings, payload).then(r => r.data)
      },
    },

    documents: {
      list: (params: EtaDocumentListParams = {}) =>
        api.get<ListResponse<EtaDocument>>(`${ENDPOINTS.eta.documents}${toQuery(params)}`),
      get: (invoiceId: number) =>
        api.get<ItemResponse<EtaDocument>>(ENDPOINTS.eta.document(invoiceId)).then(r => r.data),
      prepare: (invoiceId: number, idempotencyKey?: string) =>
        api.post<ItemResponse<EtaPreparedDocument>>(ENDPOINTS.eta.prepare(invoiceId), undefined, { idempotencyKey }).then(r => r.data),
      submit: (invoiceId: number, idempotencyKey: string) =>
        api.post<ItemResponse<EtaSubmissionResult>>(ENDPOINTS.eta.submit(invoiceId), undefined, { idempotencyKey }).then(r => r.data),
      cancel: (invoiceId: number, reason: string, idempotencyKey?: string) =>
        api.post<ItemResponse<EtaDocument>>(ENDPOINTS.eta.cancel(invoiceId), { reason }, { idempotencyKey }).then(r => r.data),
      checkStatus: (invoiceId: number) =>
        api.post<ItemResponse<EtaDocument>>(ENDPOINTS.eta.checkStatus(invoiceId)).then(r => r.data),
    },

    reconcile: (payload: { from_date: string; to_date: string }, idempotencyKey?: string) =>
      api.post<ItemResponse<{ checked: number; mismatched: number }>>(
        ENDPOINTS.eta.reconcile, payload, { idempotencyKey },
      ).then(r => r.data),

    complianceDashboard: () =>
      api.get<ItemResponse<EtaComplianceDashboard>>(ENDPOINTS.eta.complianceDashboard).then(r => r.data),
    bulkRetry: (payload: { from_date?: string; to_date?: string } = {}, idempotencyKey?: string) =>
      api.post<{ data: { retried: number } }>(ENDPOINTS.eta.bulkRetry, payload, { idempotencyKey }),
    bulkStatusCheck: (idempotencyKey?: string) =>
      api.post<{ data: { checked: number } }>(ENDPOINTS.eta.bulkStatusCheck, undefined, { idempotencyKey }),

    itemCodes: {
      list: (params: BaseListParams & { code_type?: EtaCodeType } = {}) =>
        api.get<ListResponse<EtaItemCode>>(`${ENDPOINTS.eta.itemCodes.list}${toQuery(params)}`),
      get: (id: number) =>
        api.get<ItemResponse<EtaItemCode>>(ENDPOINTS.eta.itemCodes.one(id)).then(r => r.data),
      create: (form: EtaItemCodeForm, idempotencyKey?: string) =>
        api.post<ItemResponse<EtaItemCode>>(ENDPOINTS.eta.itemCodes.list, form, { idempotencyKey }).then(r => r.data),
      update: (id: number, form: Partial<EtaItemCodeForm>) =>
        api.put<ItemResponse<EtaItemCode>>(ENDPOINTS.eta.itemCodes.one(id), form).then(r => r.data),
      remove: (id: number) =>
        api.delete<void>(ENDPOINTS.eta.itemCodes.one(id)),

      bulkAssign: (payload: { item_code_id: number; target_type: 'product' | 'account'; target_ids: number[] }, idempotencyKey?: string) =>
        api.post<{ data: { assigned: number } }>(ENDPOINTS.eta.itemCodes.bulkAssign, payload, { idempotencyKey }),
      bulkImport: (file: File, idempotencyKey?: string) => {
        const fd = new FormData()
        fd.append('file', file)
        const headers = api.getHeaders()
        delete (headers as any)['Content-Type']
        if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
        return api.raw<{ data: { imported: number } }>(ENDPOINTS.eta.itemCodes.bulkImport, {
          method: 'POST', body: fd, headers,
        })
      },
      autoAssign: (idempotencyKey?: string) =>
        api.post<{ data: { auto_assigned: number } }>(ENDPOINTS.eta.itemCodes.autoAssign, undefined, { idempotencyKey }),

      usageReport: () =>
        api.get<{ data: Array<{ item_code_id: number; code: string; usage_count: number }> }>(
          ENDPOINTS.eta.itemCodes.usageReport,
        ).then(r => r.data),
      unmappedLines: (params: { invoice_id?: number; from_date?: string; to_date?: string } = {}) =>
        api.get<{ data: UnmappedLine[] }>(`${ENDPOINTS.eta.itemCodes.unmappedLines}${toQuery(params)}`).then(r => r.data),
      suggest: (description: string) =>
        api.get<{ data: Array<{ item_code_id: number; code: string; confidence: number }> }>(
          `${ENDPOINTS.eta.itemCodes.suggest}?description=${encodeURIComponent(description)}`,
        ).then(r => r.data),

      mappings: () =>
        api.get<{ data: EtaCodeMapping[] }>(ENDPOINTS.eta.itemCodes.mappings).then(r => r.data),
      createMapping: (payload: { target_type: 'product' | 'account'; target_id: number; item_code_id: number }) =>
        api.post<ItemResponse<EtaCodeMapping>>(ENDPOINTS.eta.itemCodes.mappings, payload).then(r => r.data),
      removeMapping: (id: number) =>
        api.delete<void>(ENDPOINTS.eta.itemCodes.mapping(id)),
    },
  }
}
