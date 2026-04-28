import { vendorProductService, type VendorProductForm, type VendorProductListParams } from '~/features/vendors/services/vendorProductService'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'
import { generateIdempotencyKey } from '~/core/api/requestId'

export function useVendorProductsList(
  vendorId: Ref<number | null> | ComputedRef<number | null>,
  params: Ref<VendorProductListParams> | ComputedRef<VendorProductListParams>,
) {
  const svc = vendorProductService()
  return useQuery(
    () => {
      const id = unref(vendorId)
      if (id == null) return Promise.reject(new Error('missing vendor id'))
      return svc.list(id, unref(params))
    },
    {
      key: () => `vendor-products:list:${unref(vendorId) ?? ''}:${JSON.stringify(unref(params))}`,
      enabled: computed(() => unref(vendorId) != null),
      staleMs: 30_000,
    },
  )
}

export function useVendorProductMutations(vendorId: Ref<number> | ComputedRef<number>) {
  const svc = vendorProductService()
  // Bust the per-vendor product list AND the bills cache — a fresh product
  // affects what the bill create page's line picker sees, and an updated
  // unit_price/account flows through to future bills.
  const bust = () => {
    invalidateQuery(/^vendor-products:/)
    invalidateQuery(/^bills:/)
  }

  return {
    create: useMutation(async (form: VendorProductForm) => {
      const r = await svc.create(unref(vendorId), form, generateIdempotencyKey())
      bust()
      return r
    }),
    update: useMutation(async ({ id, form }: { id: number; form: Partial<VendorProductForm> }) => {
      const r = await svc.update(unref(vendorId), id, form)
      bust()
      return r
    }),
    remove: useMutation(async (id: number) => {
      await svc.remove(unref(vendorId), id)
      bust()
    }),
  }
}
