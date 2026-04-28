import { useQuery } from '~/core/api/query'
import { catalogService, type ClientCatalogParams, type VendorCatalogParams } from '~/features/catalog/services/catalogService'

export function useClientCatalogList(params: Ref<ClientCatalogParams> | ComputedRef<ClientCatalogParams>) {
  const svc = catalogService()
  return useQuery(() => svc.listClientCatalog(unref(params)), {
    key: () => `catalog:clients:${JSON.stringify(unref(params))}`,
    staleMs: 30_000,
  })
}

export function useVendorCatalogList(params: Ref<VendorCatalogParams> | ComputedRef<VendorCatalogParams>) {
  const svc = catalogService()
  return useQuery(() => svc.listVendorCatalog(unref(params)), {
    key: () => `catalog:vendors:${JSON.stringify(unref(params))}`,
    staleMs: 30_000,
  })
}
