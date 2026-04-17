import type { Invoice, InvoiceForm, Payment, PaymentForm } from '~/shared/types/invoice'
import type { PaginatedResponse } from '~/shared/types/client'

export function useInvoices() {
  const api = useApi()
  const invoices = ref<Invoice[]>([])
  const loading = ref(false)
  const meta = ref({ current_page: 1, last_page: 1, total: 0 })

  async function fetchInvoices(params: Record<string, any> = {}) {
    loading.value = true
    try {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v != null) query.set(k, String(v))
      })
      const data = await api.get<PaginatedResponse<Invoice>>(`/invoices?${query}`)
      invoices.value = data.data
      meta.value = { current_page: data.meta.current_page, last_page: data.meta.last_page, total: data.meta.total }
    } catch {
      invoices.value = []
    } finally {
      loading.value = false
    }
  }

  async function getInvoice(id: number): Promise<Invoice> {
    const data = await api.get<{ data: Invoice }>(`/invoices/${id}`)
    return data.data
  }

  async function createInvoice(form: Partial<InvoiceForm>): Promise<Invoice> {
    const data = await api.post<{ data: Invoice }>('/invoices', form)
    return data.data
  }

  async function updateInvoice(id: number, form: Partial<InvoiceForm>): Promise<Invoice> {
    const data = await api.put<{ data: Invoice }>(`/invoices/${id}`, form)
    return data.data
  }

  async function deleteInvoice(id: number): Promise<void> {
    await api.delete(`/invoices/${id}`)
  }

  async function sendInvoice(id: number): Promise<Invoice> {
    const data = await api.post<{ data: Invoice }>(`/invoices/${id}/send`)
    return data.data
  }

  async function cancelInvoice(id: number): Promise<Invoice> {
    const data = await api.post<{ data: Invoice }>(`/invoices/${id}/cancel`)
    return data.data
  }

  async function postToGL(id: number): Promise<Invoice> {
    const data = await api.post<{ data: Invoice }>(`/invoices/${id}/post-to-gl`)
    return data.data
  }

  async function createCreditNote(id: number, lines: any[]): Promise<Invoice> {
    const data = await api.post<{ data: Invoice }>(`/invoices/${id}/credit-note`, { lines })
    return data.data
  }

  async function recordPayment(form: PaymentForm): Promise<Payment> {
    const data = await api.post<{ data: Payment }>('/payments', form)
    return data.data
  }

  return {
    invoices, loading, meta,
    fetchInvoices, getInvoice, createInvoice, updateInvoice, deleteInvoice,
    sendInvoice, cancelInvoice, postToGL, createCreditNote, recordPayment,
  }
}
