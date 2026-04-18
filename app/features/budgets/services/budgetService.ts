import { ENDPOINTS } from '~/core/api/endpoints'
import type { BaseListParams, ItemResponse, ListResponse } from '~/shared/types/common'

export type BudgetPeriod = 'month' | 'quarter' | 'year'
export type BudgetScope = 'tenant' | 'cost_center'
export type BudgetStatus = 'draft' | 'approved' | 'closed'

export interface Budget {
  id: number
  name: string
  fiscal_year_id: number
  budget_period: BudgetPeriod
  scope: BudgetScope
  cost_center_id: number | null
  notes: string | null
  status: BudgetStatus
  approved_at: string | null
  created_at: string
  lines?: BudgetLine[]
}

export interface BudgetLine {
  id?: number
  budget_id?: number
  account_id: number
  cost_center_id: number | null
  period: string
  amount: number
}

export interface BudgetForm {
  name: string
  fiscal_year_id: number
  budget_period: BudgetPeriod
  scope?: BudgetScope
  cost_center_id?: number
  notes?: string
}

export interface BudgetVariance {
  total_budget: number
  total_actual: number
  variance: number
  variance_percent: number
  lines: Array<{
    account?: string
    period?: string
    cost_center?: string
    budget: number
    actual: number
    variance: number
    variance_pct: number
  }>
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function budgetService() {
  const api = useApi()

  return {
    list: (params: BaseListParams = {}) =>
      api.get<ListResponse<Budget>>(`${ENDPOINTS.budgets.list}${toQuery(params)}`),
    get: (id: number) =>
      api.get<ItemResponse<Budget>>(ENDPOINTS.budgets.one(id)).then(r => r.data),
    create: (form: BudgetForm, idempotencyKey?: string) =>
      api.post<ItemResponse<Budget>>(ENDPOINTS.budgets.list, form, { idempotencyKey }).then(r => r.data),
    update: (id: number, form: Partial<BudgetForm>) =>
      api.put<ItemResponse<Budget>>(ENDPOINTS.budgets.one(id), form).then(r => r.data),
    remove: (id: number) =>
      api.delete<void>(ENDPOINTS.budgets.one(id)),

    setLines: (id: number, lines: BudgetLine[], idempotencyKey?: string) =>
      api.post<ItemResponse<Budget>>(ENDPOINTS.budgets.lines(id), { lines }, { idempotencyKey }).then(r => r.data),
    approve: (id: number, idempotencyKey?: string) =>
      api.post<ItemResponse<Budget>>(ENDPOINTS.budgets.approve(id), undefined, { idempotencyKey }).then(r => r.data),
    variance: (id: number, params: { as_of_date?: string; group_by?: 'account' | 'period' | 'cost_center' } = {}) =>
      api.get<ItemResponse<BudgetVariance>>(`${ENDPOINTS.budgets.variance(id)}${toQuery(params)}`).then(r => r.data),
  }
}
