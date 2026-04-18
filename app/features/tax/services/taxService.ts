import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

// ---- WHT ----
export type WhtCertificateStatus = 'draft' | 'issued' | 'submitted'
export type WhtCertificateType = 'service' | 'royalty' | 'professional_fee' | 'other'

export interface WhtCertificate {
  id: number
  certificate_number: string | null
  vendor_id: number
  bill_id: number | null
  payment_id: number | null
  amount: number
  wht_rate: number
  wht_amount: number
  certificate_type: WhtCertificateType
  date: string
  status: WhtCertificateStatus
  pdf_url: string | null
  qr_code: string | null
  submission_reference: string | null
  submission_date: string | null
  notes: string | null
  created_at: string
}

export interface WhtCertificateForm {
  vendor_id: number
  bill_id?: number
  payment_id?: number
  amount: number
  wht_rate: number
  certificate_type: WhtCertificateType
  date: string
  notes?: string
}

export interface WhtCertificateListParams extends BaseListParams {
  vendor_id?: number
  status?: WhtCertificateStatus
  from_date?: string
  to_date?: string
}

// ---- Tax Returns ----
export type TaxReturnKind = 'vat' | 'corporate' | 'wht'
export type TaxReturnStatus = 'draft' | 'filed' | 'paid'

export interface TaxReturn {
  id: number
  type: TaxReturnKind
  fiscal_year_id: number | null
  period_start: string | null
  period_end: string | null
  status: TaxReturnStatus
  calculated_amount: number
  filing_date: string | null
  filing_reference: string | null
  paid_at: string | null
  payload: Record<string, unknown>
  created_at: string
}

export interface VatReturnPayload {
  period_start: string
  period_end: string
  include_draft_invoices?: boolean
}

export interface CorporateTaxPayload {
  fiscal_year_id: number
  adjustments?: Array<{ description: string; amount: number; type: 'add_back' | 'deduction' | 'permanent_difference' | 'deferred_tax' }>
  corporate_tax_rate?: number
}

export interface FilePayload {
  filing_date: string
  filing_reference: string
  filer_name?: string
  attachment?: number
}

export interface TaxPaymentPayload {
  amount: number
  payment_date: string
  reference?: string
  bank_account_id: number
}

// ---- Tax Adjustments ----
export type TaxAdjustmentType = 'add_back' | 'deduction' | 'deferred_tax' | 'permanent_difference'

export interface TaxAdjustment {
  id: number
  fiscal_year_id: number
  description: string
  amount: number
  account_id: number | null
  adjustment_type: TaxAdjustmentType
  notes: string | null
  created_at: string
}

export interface TaxAdjustmentForm {
  fiscal_year_id: number
  description: string
  amount: number
  account_id?: number
  adjustment_type: TaxAdjustmentType
  notes?: string
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function whtCertificateService() {
  const api = useApi()

  return {
    list: (params: WhtCertificateListParams = {}) =>
      api.get<ListResponse<WhtCertificate>>(`${ENDPOINTS.whtCertificates.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<WhtCertificate>>(ENDPOINTS.whtCertificates.one(id)).then(r => r.data),
    generate: (form: WhtCertificateForm, idempotencyKey?: string) =>
      api.post<ItemResponse<WhtCertificate>>(ENDPOINTS.whtCertificates.generate, form, { idempotencyKey }).then(r => r.data),
    issue: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<WhtCertificate>>(ENDPOINTS.whtCertificates.issue(id), undefined, { idempotencyKey }).then(r => r.data),
    submit: (id: number, payload: { submission_reference?: string; submission_date: string }, idempotencyKey?: string) =>
      api.post<ItemResponse<WhtCertificate>>(ENDPOINTS.whtCertificates.submit(id), payload, { idempotencyKey }).then(r => r.data),
  }
}

export function taxReturnService() {
  const api = useApi()

  return {
    list: (params: BaseListParams & { type?: TaxReturnKind; fiscal_year_id?: number; status?: TaxReturnStatus } = {}) =>
      api.get<ListResponse<TaxReturn>>(`${ENDPOINTS.taxReturns.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<TaxReturn>>(ENDPOINTS.taxReturns.one(id)).then(r => r.data),

    calculateVat: (payload: VatReturnPayload, idempotencyKey?: string) =>
      api.post<ItemResponse<TaxReturn>>(ENDPOINTS.taxReturns.vat, payload, { idempotencyKey }).then(r => r.data),
    calculateCorporate: (payload: CorporateTaxPayload, idempotencyKey?: string) =>
      api.post<ItemResponse<TaxReturn>>(ENDPOINTS.taxReturns.corporate, payload, { idempotencyKey }).then(r => r.data),

    file: (id: number, payload: FilePayload, idempotencyKey?: string) =>
      api.post<ItemResponse<TaxReturn>>(ENDPOINTS.taxReturns.file(id), payload, { idempotencyKey }).then(r => r.data),
    recordPayment: (id: number, payload: TaxPaymentPayload, idempotencyKey: string) =>
      api.post<ItemResponse<TaxReturn>>(ENDPOINTS.taxReturns.payment(id), payload, { idempotencyKey }).then(r => r.data),
  }
}

export function taxAdjustmentService() {
  const api = useApi()

  return {
    listForYear: (fiscalYearId: number) =>
      api.get<{ data: TaxAdjustment[] }>(ENDPOINTS.taxAdjustments.forYear(fiscalYearId)).then(r => r.data),
    create: (form: TaxAdjustmentForm, idempotencyKey?: string) =>
      api.post<ItemResponse<TaxAdjustment>>(ENDPOINTS.taxAdjustments.create, form, { idempotencyKey }).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.taxAdjustments.remove(id)),
  }
}
