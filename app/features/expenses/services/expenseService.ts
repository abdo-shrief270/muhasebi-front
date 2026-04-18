import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

// ----- categories -----
export interface ExpenseCategory {
  id: number
  name_ar: string
  name_en: string | null
  code: string | null
  description: string | null
  account_id: number | null
  color: string | null
}

export type ExpenseCategoryForm = Omit<ExpenseCategory, 'id'>

// ----- expenses -----
export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed'
export type ExpensePaymentMethod = 'cash' | 'bank_transfer' | 'company_card' | 'personal'

export interface Expense {
  id: number
  expense_category_id: number
  amount: number
  currency: string
  exchange_rate: number
  date: string
  vendor_name: string | null
  vendor_id: number | null
  description: string
  cost_center_id: number | null
  project_id: number | null
  payment_method: ExpensePaymentMethod
  vat_rate: number | null
  receipt_url: string | null
  notes: string | null
  status: ExpenseStatus
  submitted_at: string | null
  approved_at: string | null
  rejected_at: string | null
  reimbursed_at: string | null
  created_by_user?: { id: number; name: string }
  category?: ExpenseCategory
}

export interface ExpenseJsonForm {
  expense_category_id: number
  amount: number
  currency?: string
  exchange_rate?: number
  date: string
  vendor_name?: string
  vendor_id?: number
  description: string
  cost_center_id?: number
  project_id?: number
  payment_method: ExpensePaymentMethod
  vat_rate?: number
  notes?: string
}

export interface ExpenseListParams extends BaseListParams {
  status?: ExpenseStatus
  category_id?: number
  employee_id?: number
  from_date?: string
  to_date?: string
}

export interface ReimbursePayload {
  payment_date: string
  bank_account_id: number
  reference?: string
}

export interface ExpenseSummary {
  total: number
  by_category: Array<{ category_id: number; name: string; total: number }>
  by_employee: Array<{ user_id: number; name: string; total: number }>
  by_cost_center: Array<{ cost_center_id: number; name: string; total: number }>
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function expenseCategoryService() {
  const api = useApi()

  return {
    list: () =>
      api.get<{ data: ExpenseCategory[] }>(ENDPOINTS.expenseCategories.list).then(r => r.data),
    get: (id: number) =>
      api.get<ItemResponse<ExpenseCategory>>(ENDPOINTS.expenseCategories.one(id)).then(r => r.data),
    create: (form: ExpenseCategoryForm, idempotencyKey?: string) =>
      api.post<ItemResponse<ExpenseCategory>>(ENDPOINTS.expenseCategories.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<ExpenseCategoryForm>) =>
      api.put<ItemResponse<ExpenseCategory>>(ENDPOINTS.expenseCategories.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.expenseCategories.one(id)),
  }
}

export function expenseService() {
  const api = useApi()

  return {
    list: (params: ExpenseListParams = {}) =>
      api.get<ListResponse<Expense>>(`${ENDPOINTS.expenses.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<Expense>>(ENDPOINTS.expenses.one(id)).then(r => r.data),
    createJson: (form: ExpenseJsonForm, idempotencyKey?: string) =>
      api.post<ItemResponse<Expense>>(ENDPOINTS.expenses.list, form, { idempotencyKey }).then(r => r.data),
    createWithReceipt: (form: ExpenseJsonForm, receipt: File, idempotencyKey?: string) => {
      const fd = new FormData()
      for (const [k, v] of Object.entries(form)) {
        if (v != null && v !== '') fd.append(k, String(v))
      }
      fd.append('receipt', receipt)
      const headers = api.getHeaders()
      delete (headers as any)['Content-Type']
      if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey
      return api.raw<ItemResponse<Expense>>(ENDPOINTS.expenses.list, {
        method: 'POST', body: fd, headers,
      })
    },
    update: (id: number, form: Partial<ExpenseJsonForm>) =>
      api.put<ItemResponse<Expense>>(ENDPOINTS.expenses.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.expenses.one(id)),

    submit: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<Expense>>(ENDPOINTS.expenses.submit(id), undefined, { idempotencyKey }).then(r => r.data),
    approve: (id: number, payload: { notes?: string } = {}, idempotencyKey?: string) =>
      api.post<ItemResponse<Expense>>(ENDPOINTS.expenses.approve(id), payload, { idempotencyKey }).then(r => r.data),
    reject: (id: number, payload: { reason: string }, idempotencyKey?: string) =>
      api.post<ItemResponse<Expense>>(ENDPOINTS.expenses.reject(id), payload, { idempotencyKey }).then(r => r.data),
    reimburse: (id: number, payload: ReimbursePayload, idempotencyKey?: string) =>
      api.post<ItemResponse<Expense>>(ENDPOINTS.expenses.reimburse(id), payload, { idempotencyKey }).then(r => r.data),

    bulkSubmit: (expenseIds: number[], idempotencyKey?: string) =>
      api.post<{ data: { submitted: number } }>(ENDPOINTS.expenses.bulkSubmit, { expense_ids: expenseIds }, { idempotencyKey }),

    summary: (params: { from_date?: string; to_date?: string; group_by?: string } = {}) =>
      api.get<ItemResponse<ExpenseSummary>>(`${ENDPOINTS.expenses.summary}${toQuery(params)}`).then(r => r.data),
  }
}

// ----- expense reports -----
export type ExpenseReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'reimbursed'

export interface ExpenseReport {
  id: number
  title: string
  description: string | null
  period_from: string
  period_to: string
  status: ExpenseReportStatus
  total: number
  expenses_count: number
  notes: string | null
  created_by_user?: { id: number; name: string }
  expenses?: Expense[]
}

export interface ExpenseReportForm {
  title: string
  description?: string
  period_from: string
  period_to: string
  expense_ids: number[]
  notes?: string
}

export function expenseReportService() {
  const api = useApi()

  return {
    list: (params: BaseListParams = {}) =>
      api.get<ListResponse<ExpenseReport>>(`${ENDPOINTS.expenseReports.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<ExpenseReport>>(ENDPOINTS.expenseReports.one(id)).then(r => r.data),
    create: (form: ExpenseReportForm, idempotencyKey?: string) =>
      api.post<ItemResponse<ExpenseReport>>(ENDPOINTS.expenseReports.list, form, { idempotencyKey }).then(r => r.data),

    addExpenses: (id: number, expenseIds: number[]) =>
      api.post<ItemResponse<ExpenseReport>>(ENDPOINTS.expenseReports.expenses(id), { expense_ids: expenseIds }).then(r => r.data),
    submit: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<ExpenseReport>>(ENDPOINTS.expenseReports.submit(id), undefined, { idempotencyKey }).then(r => r.data),
    approve: (id: number, payload: { notes?: string } = {}, idempotencyKey?: string) =>
      api.post<ItemResponse<ExpenseReport>>(ENDPOINTS.expenseReports.approve(id), payload, { idempotencyKey }).then(r => r.data),
    reject: (id: number, payload: { reason: string }, idempotencyKey?: string) =>
      api.post<ItemResponse<ExpenseReport>>(ENDPOINTS.expenseReports.reject(id), payload, { idempotencyKey }).then(r => r.data),
  }
}
