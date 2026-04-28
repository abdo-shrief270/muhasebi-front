import {
  expenseService,
  expenseCategoryService,
  type ExpenseJsonForm,
  type ExpenseListParams,
  type ReimbursePayload,
} from '~/features/expenses/services/expenseService'
import { invalidateQuery, useMutation, useQuery } from '~/core/api/query'
import { generateIdempotencyKey } from '~/core/api/requestId'

export function useExpensesList(params: Ref<ExpenseListParams> | ComputedRef<ExpenseListParams>) {
  const svc = expenseService()
  return useQuery(() => svc.list(unref(params)), {
    key: () => `expenses:list:${JSON.stringify(unref(params))}`,
    staleMs: 20_000,
  })
}

export function useExpense(id: Ref<number | null> | ComputedRef<number | null>) {
  const svc = expenseService()
  return useQuery(
    () => {
      const v = unref(id)
      if (v == null) return Promise.reject(new Error('missing id'))
      return svc.get(v)
    },
    {
      key: () => `expenses:one:${unref(id) ?? ''}`,
      enabled: computed(() => unref(id) != null),
    },
  )
}

export function useExpenseMutations() {
  const svc = expenseService()
  const bust = () => invalidateQuery(/^expenses:/)

  return {
    create: useMutation(async (form: ExpenseJsonForm) => {
      const r = await svc.createJson(form, generateIdempotencyKey())
      bust()
      return r
    }),
    /**
     * Multipart create when the user attached a receipt. The service
     * builds a FormData with all the JSON keys plus the file. Backend
     * stores the file and returns the created Expense with `receipt_url`.
     */
    createWithReceipt: useMutation(async ({ form, receipt }: { form: ExpenseJsonForm; receipt: File }) => {
      const r = await svc.createWithReceipt(form, receipt, generateIdempotencyKey())
      bust()
      return r
    }),
    update: useMutation(async ({ id, form }: { id: number; form: Partial<ExpenseJsonForm> }) => {
      const r = await svc.update(id, form)
      bust()
      return r
    }),
    remove: useMutation(async (id: number) => {
      await svc.remove(id)
      bust()
    }),
    submit: useMutation(async (id: number) => {
      const r = await svc.submit(id, generateIdempotencyKey())
      bust()
      return r
    }),
    approve: useMutation(async (id: number) => {
      const r = await svc.approve(id, {}, generateIdempotencyKey())
      bust()
      return r
    }),
    reject: useMutation(async ({ id, reason }: { id: number; reason: string }) => {
      const r = await svc.reject(id, { reason }, generateIdempotencyKey())
      bust()
      return r
    }),
    reimburse: useMutation(async ({ id, payload }: { id: number; payload: ReimbursePayload }) => {
      const r = await svc.reimburse(id, payload, generateIdempotencyKey())
      bust()
      return r
    }),
  }
}

/**
 * Categories are mostly static — refetched on a 5-minute stale window.
 * Used by the create form's category picker and the list page's filter.
 */
export function useExpenseCategoriesList() {
  const svc = expenseCategoryService()
  return useQuery(() => svc.list(), {
    key: 'expense-categories:list',
    staleMs: 300_000,
  })
}
