import { vendorService, type VendorListParams, type VendorForm } from '~/features/vendors/services/vendorService'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'
import { generateIdempotencyKey } from '~/core/api/requestId'

export function useVendorsList(params: Ref<VendorListParams> | ComputedRef<VendorListParams>) {
  const svc = vendorService()
  return useQuery(() => svc.list(unref(params)), {
    key: () => `vendors:list:${JSON.stringify(unref(params))}`,
    staleMs: 20_000,
  })
}

export function useVendor(id: Ref<number | null> | ComputedRef<number | null>) {
  const svc = vendorService()
  return useQuery(
    () => {
      const v = unref(id)
      if (v == null) return Promise.reject(new Error('missing id'))
      return svc.get(v)
    },
    {
      key: () => `vendors:one:${unref(id) ?? ''}`,
      enabled: computed(() => unref(id) != null),
    },
  )
}

export function useVendorMutations() {
  const svc = vendorService()
  const bust = () => invalidateQuery(/^vendors:/)

  return {
    create: useMutation(async (form: VendorForm) => {
      const r = await svc.create(form, generateIdempotencyKey())
      bust()
      return r
    }),
    update: useMutation(async ({ id, form }: { id: number; form: VendorForm }) => {
      const r = await svc.update(id, form)
      bust()
      return r
    }),
    remove: useMutation(async (id: number) => {
      await svc.remove(id)
      bust()
    }),
  }
}
