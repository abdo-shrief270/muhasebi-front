export interface EtaSettings {
  id: number
  is_enabled: boolean
  environment: string
  client_id: string | null
  has_client_secret: boolean
  branch_id: string
  branch_address_governate: string | null
  branch_address_region_city: string | null
  branch_address_street: string | null
  branch_address_building_number: string | null
  activity_code: string | null
  company_trade_name: string | null
  token_valid: boolean
}

export interface EtaDocument {
  id: number
  invoice_id: number
  document_type: string
  internal_id: string
  eta_uuid: string | null
  status: string
  status_label: string
  status_label_ar: string
  status_color: string
  errors: unknown
  qr_code_data: string | null
  submitted_at: string | null
  created_at: string
  invoice?: unknown
}

export interface EtaItemCode {
  id: number
  code_type: string
  item_code: string
  description: string
  description_ar: string | null
  unit_type: string
  is_active: boolean
}

export interface EtaListParams {
  page?: number
  search?: string
  status?: string
  [key: string]: string | number | undefined
}

function toQuery(params: EtaListParams): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  const s = q.toString()
  return s ? `?${s}` : ''
}

export function etaService() {
  const api = useApi()

  return {
    getSettings() {
      return api.get<{ data: EtaSettings }>('/eta/settings').then(r => r.data)
    },
    updateSettings(form: Partial<EtaSettings>) {
      return api.put<{ data: EtaSettings }>('/eta/settings', form).then(r => r.data)
    },
    listDocuments(params: EtaListParams = {}) {
      return api.get<{ data: EtaDocument[]; meta: any }>(`/eta/documents${toQuery(params)}`)
    },
    prepareDocument(invoiceId: number, idempotencyKey?: string) {
      return api.post<{ data: EtaDocument }>(`/eta/documents/${invoiceId}/prepare`, undefined, { idempotencyKey }).then(r => r.data)
    },
    submitDocument(invoiceId: number, idempotencyKey?: string) {
      return api.post<{ data: EtaDocument }>(`/eta/documents/${invoiceId}/submit`, undefined, { idempotencyKey }).then(r => r.data)
    },
    checkStatus(invoiceId: number) {
      return api.post<{ data: EtaDocument }>(`/eta/documents/${invoiceId}/check-status`).then(r => r.data)
    },
    cancelDocument(invoiceId: number, reason: string) {
      return api.post<{ data: EtaDocument }>(`/eta/documents/${invoiceId}/cancel`, { reason }).then(r => r.data)
    },
    listItemCodes(params: EtaListParams = {}) {
      return api.get<{ data: EtaItemCode[]; meta: any }>(`/eta/item-codes${toQuery(params)}`)
    },
    createItemCode(form: Partial<EtaItemCode>, idempotencyKey?: string) {
      return api.post<{ data: EtaItemCode }>('/eta/item-codes', form, { idempotencyKey }).then(r => r.data)
    },
    updateItemCode(id: number, form: Partial<EtaItemCode>) {
      return api.put<{ data: EtaItemCode }>(`/eta/item-codes/${id}`, form).then(r => r.data)
    },
    removeItemCode(id: number) {
      return api.delete<void>(`/eta/item-codes/${id}`)
    },
  }
}
