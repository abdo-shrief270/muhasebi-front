import type { Invoice, InvoiceForm, Payment, PaymentForm } from '~/shared/types/invoice'
import { invoiceService, type InvoiceListParams } from '~/features/invoices/services/invoiceService'
import { invalidateQuery, useQuery, useMutation } from '~/core/api/query'
import { generateIdempotencyKey } from '~/core/api/requestId'

export function useInvoicesList(params: Ref<InvoiceListParams> | ComputedRef<InvoiceListParams>) {
  const svc = invoiceService()
  return useQuery(() => svc.list(unref(params)), {
    key: () => `invoices:list:${JSON.stringify(unref(params))}`,
    staleMs: 15_000,
  })
}

export function useInvoice(id: Ref<number | null> | ComputedRef<number | null>) {
  const svc = invoiceService()
  return useQuery(
    () => {
      const v = unref(id)
      if (v == null) return Promise.reject(new Error('missing id'))
      return svc.get(v)
    },
    {
      key: () => `invoices:one:${unref(id) ?? ''}`,
      enabled: computed(() => unref(id) != null),
    },
  )
}

export function useInvoiceMutations() {
  const svc = invoiceService()
  const bust = () => invalidateQuery(/^invoices:/)

  const create = useMutation(async (form: Partial<InvoiceForm>) => {
    const res = await svc.create(form, generateIdempotencyKey())
    bust()
    return res
  })

  const update = useMutation(async ({ id, form }: { id: number; form: Partial<InvoiceForm> }) => {
    const res = await svc.update(id, form)
    bust()
    return res
  })

  const remove = useMutation(async (id: number) => {
    await svc.remove(id)
    bust()
  })

  const send = useMutation(async (id: number) => {
    const res = await svc.send(id, generateIdempotencyKey())
    bust()
    return res
  })

  const cancel = useMutation(async (id: number) => {
    const res = await svc.cancel(id)
    bust()
    return res
  })

  const postToGL = useMutation(async (id: number) => {
    const res = await svc.postToGL(id)
    bust()
    return res
  })

  const creditNote = useMutation(async ({ id, lines }: { id: number; lines: unknown[] }) => {
    const res = await svc.createCreditNote(id, lines)
    bust()
    return res
  })

  const recordPayment = useMutation(async (form: PaymentForm) => {
    const res = await svc.recordPayment(form, generateIdempotencyKey())
    bust()
    return res
  })

  return { create, update, remove, send, cancel, postToGL, creditNote, recordPayment }
}

/**
 * Legacy shim — keeps existing pages compiling until each one is migrated
 * to useInvoicesList / useInvoice / useInvoiceMutations.
 */
export function useInvoices() {
  const svc = invoiceService()
  const invoices = ref<Invoice[]>([])
  const loading = ref(false)
  const meta = ref({ current_page: 1, last_page: 1, total: 0 })

  async function fetchInvoices(params: Record<string, any> = {}) {
    loading.value = true
    try {
      const data = await svc.list(params as InvoiceListParams)
      invoices.value = data.data
      meta.value = {
        current_page: data.meta.current_page,
        last_page: data.meta.last_page,
        total: data.meta.total,
      }
    } catch {
      invoices.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    invoices, loading, meta,
    fetchInvoices,
    getInvoice:       (id: number) => svc.get(id),
    createInvoice:    (f: Partial<InvoiceForm>) => svc.create(f, generateIdempotencyKey()),
    updateInvoice:    (id: number, f: Partial<InvoiceForm>) => svc.update(id, f),
    deleteInvoice:    (id: number) => svc.remove(id),
    sendInvoice:      (id: number) => svc.send(id, generateIdempotencyKey()),
    cancelInvoice:    (id: number) => svc.cancel(id),
    postToGL:         (id: number) => svc.postToGL(id),
    createCreditNote: (id: number, lines: any[]) => svc.createCreditNote(id, lines),
    recordPayment:    (f: PaymentForm) => svc.recordPayment(f, generateIdempotencyKey()),
  }
}
