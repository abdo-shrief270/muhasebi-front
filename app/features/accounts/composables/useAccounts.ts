import type { Account, PaginatedResponse } from '~/shared/types/accounting'

export function useAccounts() {
  const api = useApi()
  const accounts = ref<Account[]>([])
  const tree = ref<Account[]>([])
  const loading = ref(false)

  async function fetchTree() {
    loading.value = true
    try {
      const data = await api.get<{ data: Account[] }>('/accounts/tree')
      tree.value = data.data
    } catch {
      tree.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchAccounts(params: Record<string, any> = {}) {
    loading.value = true
    try {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => {
        if (v !== '' && v != null) query.set(k, String(v))
      })
      const data = await api.get<PaginatedResponse<Account>>(`/accounts?${query}`)
      accounts.value = data.data
    } catch {
      accounts.value = []
    } finally {
      loading.value = false
    }
  }

  async function createAccount(form: Partial<Account>): Promise<Account> {
    const data = await api.post<{ data: Account }>('/accounts', form)
    return data.data
  }

  async function updateAccount(id: number, form: Partial<Account>): Promise<Account> {
    const data = await api.put<{ data: Account }>(`/accounts/${id}`, form)
    return data.data
  }

  async function deleteAccount(id: number): Promise<void> {
    await api.delete(`/accounts/${id}`)
  }

  return { accounts, tree, loading, fetchTree, fetchAccounts, createAccount, updateAccount, deleteAccount }
}
