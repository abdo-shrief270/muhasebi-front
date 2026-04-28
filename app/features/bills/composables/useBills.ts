import { billService, type BillForm, type BillListParams, type BillPaymentForm } from '~/features/bills/services/billService'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'
import { generateIdempotencyKey } from '~/core/api/requestId'

export function useBillsList(params: Ref<BillListParams> | ComputedRef<BillListParams>) {
  const svc = billService()
  return useQuery(() => svc.list(unref(params)), {
    key: () => `bills:list:${JSON.stringify(unref(params))}`,
    staleMs: 20_000,
  })
}

export function useBill(id: Ref<number | null> | ComputedRef<number | null>) {
  const svc = billService()
  return useQuery(
    () => {
      const v = unref(id)
      if (v == null) return Promise.reject(new Error('missing id'))
      return svc.get(v)
    },
    {
      key: () => `bills:one:${unref(id) ?? ''}`,
      enabled: computed(() => unref(id) != null),
    },
  )
}

export function useBillMutations() {
  const svc = billService()
  // Bills bust both their own cache and the related vendor summary so the
  // detail page's balance / aging numbers refresh after approval/payment.
  const bust = () => {
    invalidateQuery(/^bills:/)
    invalidateQuery(/^vendors:one:/)
  }

  return {
    create: useMutation(async (form: BillForm) => {
      const r = await svc.create(form, generateIdempotencyKey())
      bust()
      return r
    }),
    update: useMutation(async ({ id, form }: { id: number; form: Partial<BillForm> }) => {
      const r = await svc.update(id, form)
      bust()
      return r
    }),
    remove: useMutation(async (id: number) => {
      await svc.remove(id)
      bust()
    }),
    approve: useMutation(async (id: number) => {
      const r = await svc.approve(id, generateIdempotencyKey())
      bust()
      return r
    }),
    cancel: useMutation(async (id: number) => {
      const r = await svc.cancel(id, generateIdempotencyKey())
      bust()
      return r
    }),
    addPayment: useMutation(async ({ id, form }: { id: number; form: BillPaymentForm }) => {
      const r = await svc.createPayment(id, form, generateIdempotencyKey())
      bust()
      return r
    }),
    voidPayment: useMutation(async (paymentId: number) => {
      await svc.voidPayment(paymentId)
      bust()
    }),
  }
}
