import { clientProductService, type ClientProductForm } from '~/features/clients/services/clientProductService'
import { invalidateQuery, useMutation } from '~/core/api/query'
import { generateIdempotencyKey } from '~/core/api/requestId'

/**
 * CRUD mutations for client products. Invalidates the cached
 * `client-products:*` queries on success so any open LineItemsEditor / catalog
 * page immediately re-fetches and shows the change.
 */
export function useClientProductMutations() {
  const svc = clientProductService()
  const bust = () => invalidateQuery(/^client-products:|^catalog:/)

  return {
    create: useMutation(async ({ clientId, form }: { clientId: number; form: ClientProductForm }) => {
      const r = await svc.create(clientId, form, generateIdempotencyKey())
      bust()
      return r
    }),
    update: useMutation(async ({ clientId, productId, form }: { clientId: number; productId: number; form: Partial<ClientProductForm> }) => {
      const r = await svc.update(clientId, productId, form)
      bust()
      return r
    }),
    remove: useMutation(async ({ clientId, productId }: { clientId: number; productId: number }) => {
      await svc.remove(clientId, productId)
      bust()
    }),
  }
}
