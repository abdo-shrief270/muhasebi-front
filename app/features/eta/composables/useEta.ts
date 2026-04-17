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
  errors: any
  qr_code_data: string | null
  submitted_at: string | null
  created_at: string
  invoice?: any
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

export function useEta() {
  const api = useApi()

  async function getSettings(): Promise<EtaSettings> {
    const data = await api.get<{ data: EtaSettings }>('/eta/settings')
    return data.data
  }

  async function updateSettings(form: Partial<EtaSettings>): Promise<EtaSettings> {
    const data = await api.put<{ data: EtaSettings }>('/eta/settings', form)
    return data.data
  }

  async function getDocuments(params: Record<string, any> = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v !== '' && v != null) query.set(k, String(v)) })
    return api.get<{ data: EtaDocument[]; meta: any }>(`/eta/documents?${query}`)
  }

  async function prepareDocument(invoiceId: number): Promise<EtaDocument> {
    const data = await api.post<{ data: EtaDocument }>(`/eta/documents/${invoiceId}/prepare`)
    return data.data
  }

  async function submitDocument(invoiceId: number): Promise<EtaDocument> {
    const data = await api.post<{ data: EtaDocument }>(`/eta/documents/${invoiceId}/submit`)
    return data.data
  }

  async function checkStatus(invoiceId: number): Promise<EtaDocument> {
    const data = await api.post<{ data: EtaDocument }>(`/eta/documents/${invoiceId}/check-status`)
    return data.data
  }

  async function cancelDocument(invoiceId: number, reason: string): Promise<EtaDocument> {
    const data = await api.post<{ data: EtaDocument }>(`/eta/documents/${invoiceId}/cancel`, { reason })
    return data.data
  }

  async function getItemCodes(params: Record<string, any> = {}) {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v !== '' && v != null) query.set(k, String(v)) })
    return api.get<{ data: EtaItemCode[]; meta: any }>(`/eta/item-codes?${query}`)
  }

  async function createItemCode(form: Partial<EtaItemCode>): Promise<EtaItemCode> {
    const data = await api.post<{ data: EtaItemCode }>('/eta/item-codes', form)
    return data.data
  }

  async function updateItemCode(id: number, form: Partial<EtaItemCode>): Promise<EtaItemCode> {
    const data = await api.put<{ data: EtaItemCode }>(`/eta/item-codes/${id}`, form)
    return data.data
  }

  async function deleteItemCode(id: number): Promise<void> {
    await api.delete(`/eta/item-codes/${id}`)
  }

  return {
    getSettings, updateSettings,
    getDocuments, prepareDocument, submitDocument, checkStatus, cancelDocument,
    getItemCodes, createItemCode, updateItemCode, deleteItemCode,
  }
}
