import type { Client, ClientForm, PaginatedResponse } from '~/shared/types/client'

export function useClients() {
  const api = useApi()
  const clients = ref<Client[]>([])
  const loading = ref(false)
  const meta = ref<{ current_page: number; last_page: number; total: number }>({
    current_page: 1,
    last_page: 1,
    total: 0,
  })

  async function fetchClients(params: Record<string, any> = {}) {
    loading.value = true
    try {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) query.set(k, String(v))
      })
      const data = await api.get<PaginatedResponse<Client>>(`/clients?${query}`)
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

  async function getClient(id: number): Promise<Client> {
    const data = await api.get<{ data: Client }>(`/clients/${id}`)
    return data.data
  }

  async function createClient(form: Partial<ClientForm>): Promise<Client> {
    const data = await api.post<{ data: Client }>('/clients', form)
    return data.data
  }

  async function updateClient(id: number, form: Partial<ClientForm>): Promise<Client> {
    const data = await api.put<{ data: Client }>(`/clients/${id}`, form)
    return data.data
  }

  async function deleteClient(id: number): Promise<void> {
    await api.delete(`/clients/${id}`)
  }

  async function toggleActive(id: number): Promise<Client> {
    const data = await api.patch<{ data: Client }>(`/clients/${id}/toggle-active`)
    return data.data
  }

  return { clients, loading, meta, fetchClients, getClient, createClient, updateClient, deleteClient, toggleActive }
}
