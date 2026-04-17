import type { Account } from '~/shared/types/accounting'
import { accountService, type AccountListParams } from '~/features/accounts/services/accountService'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'
import { generateRequestId } from '~/core/api/requestId'

export function useAccountsList(params: Ref<AccountListParams> | ComputedRef<AccountListParams>) {
  const svc = accountService()
  return useQuery(() => svc.list(unref(params)), {
    key: () => `accounts:list:${JSON.stringify(unref(params))}`,
    staleMs: 60_000,
  })
}

export function useAccountsTree() {
  const svc = accountService()
  return useQuery(() => svc.tree(), { key: 'accounts:tree', staleMs: 60_000 })
}

export function useAccountMutations() {
  const svc = accountService()
  const bust = () => invalidateQuery(/^accounts:/)

  return {
    create: useMutation(async (form: Partial<Account>) => {
      const r = await svc.create(form, generateRequestId())
      bust()
      return r
    }),
    update: useMutation(async ({ id, form }: { id: number; form: Partial<Account> }) => {
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

/** Legacy shim. */
export function useAccounts() {
  const svc = accountService()
  const accounts = ref<Account[]>([])
  const tree = ref<Account[]>([])
  const loading = ref(false)

  async function fetchTree() {
    loading.value = true
    try { tree.value = await svc.tree() }
    catch { tree.value = [] }
    finally { loading.value = false }
  }

  async function fetchAccounts(params: Record<string, any> = {}) {
    loading.value = true
    try {
      const data = await svc.list(params as AccountListParams)
      accounts.value = data.data
    } catch {
      accounts.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    accounts, tree, loading,
    fetchTree, fetchAccounts,
    createAccount: (f: Partial<Account>) => svc.create(f, generateRequestId()),
    updateAccount: (id: number, f: Partial<Account>) => svc.update(id, f),
    deleteAccount: (id: number) => svc.remove(id),
  }
}
