import {
  bankAccountService,
  type BankAccountForm,
  type BankAccountListParams,
} from '~/features/bank-accounts/services/bankAccountService'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'
import { generateIdempotencyKey } from '~/core/api/requestId'

export function useBankAccountsList(params: Ref<BankAccountListParams> | ComputedRef<BankAccountListParams>) {
  const svc = bankAccountService()
  return useQuery(() => svc.list(unref(params)), {
    key: () => `bank-accounts:list:${JSON.stringify(unref(params))}`,
    staleMs: 60_000,
  })
}

export function useBankAccount(id: Ref<number | null> | ComputedRef<number | null>) {
  const svc = bankAccountService()
  return useQuery(
    () => {
      const v = unref(id)
      if (v == null) return Promise.reject(new Error('missing id'))
      return svc.get(v)
    },
    {
      key: () => `bank-accounts:one:${unref(id) ?? ''}`,
      enabled: computed(() => unref(id) != null),
    },
  )
}

export function useBankAccountMutations() {
  const svc = bankAccountService()
  const bust = () => invalidateQuery(/^bank-accounts:/)

  return {
    create: useMutation(async (form: BankAccountForm) => {
      const r = await svc.create(form, generateIdempotencyKey())
      bust()
      return r
    }),
    update: useMutation(async ({ id, form }: { id: number; form: Partial<BankAccountForm> }) => {
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
