import { clientProductService, type ClientProductListParams } from '~/features/clients/services/clientProductService'
import { useQuery } from '~/core/api/query'

/**
 * Reactive list of a client's products. The query key includes the clientId
 * so switching clients on the invoice form refetches automatically. Disabled
 * (returns null) when no client is selected — keeps the line picker quiet on
 * brand-new invoices.
 */
export function useClientProducts(
  clientId: Ref<number | null> | ComputedRef<number | null>,
  params: Ref<ClientProductListParams> | ComputedRef<ClientProductListParams> = ref({}),
) {
  const svc = clientProductService()
  return useQuery(
    () => {
      const id = unref(clientId)
      if (!id) return Promise.reject(new Error('no client'))
      return svc.list(id, { ...unref(params), per_page: 100, is_active: true })
    },
    {
      key: () => `client-products:${unref(clientId) ?? 'none'}:${JSON.stringify(unref(params))}`,
      enabled: computed(() => !!unref(clientId)),
      staleMs: 30_000,
    },
  )
}
