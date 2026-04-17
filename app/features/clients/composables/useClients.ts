import type { Client, ClientForm } from '~/shared/types/client'
import { clientService, type ClientListParams } from '~/features/clients/services/clientService'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'
import { generateRequestId } from '~/core/api/requestId'

export function useClientsList(params: Ref<ClientListParams> | ComputedRef<ClientListParams>) {
  const svc = clientService()
  return useQuery(() => svc.list(unref(params)), {
    key: () => `clients:list:${JSON.stringify(unref(params))}`,
    staleMs: 20_000,
  })
}

export function useClient(id: Ref<number | null> | ComputedRef<number | null>) {
  const svc = clientService()
  return useQuery(
    () => {
      const v = unref(id)
      if (v == null) return Promise.reject(new Error('missing id'))
      return svc.get(v)
    },
    {
      key: () => `clients:one:${unref(id) ?? ''}`,
      enabled: computed(() => unref(id) != null),
    },
  )
}

export function useClientMutations() {
  const svc = clientService()
  const bust = () => invalidateQuery(/^clients:/)

  return {
    create: useMutation(async (form: Partial<ClientForm>) => {
      const r = await svc.create(form, generateRequestId())
      bust()
      return r
    }),
    update: useMutation(async ({ id, form }: { id: number; form: Partial<ClientForm> }) => {
      const r = await svc.update(id, form)
      bust()
      return r
    }),
    remove: useMutation(async (id: number) => {
      await svc.remove(id)
      bust()
    }),
    toggleActive: useMutation(async (id: number) => {
      const r = await svc.toggleActive(id)
      bust()
      return r
    }),
  }
}

/** Legacy shim — keeps existing pages compiling until each is migrated. */
export function useClients() {
  const svc = clientService()
  const clients = ref<Client[]>([])
  const loading = ref(false)
  const meta = ref({ current_page: 1, last_page: 1, total: 0 })

  async function fetchClients(params: Record<string, any> = {}) {
    loading.value = true
    try {
      const data = await svc.list(params as ClientListParams)
      clients.value = data.data
      meta.value = {
        current_page: data.meta.current_page,
        last_page: data.meta.last_page,
        total: data.meta.total,
      }
    } catch {
      clients.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    clients, loading, meta,
    fetchClients,
    getClient:    (id: number) => svc.get(id),
    createClient: (f: Partial<ClientForm>) => svc.create(f, generateRequestId()),
    updateClient: (id: number, f: Partial<ClientForm>) => svc.update(id, f),
    deleteClient: (id: number) => svc.remove(id),
    toggleActive: (id: number) => svc.toggleActive(id),
  }
}
