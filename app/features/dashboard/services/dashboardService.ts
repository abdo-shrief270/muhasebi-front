import { ENDPOINTS } from '~/core/api/endpoints'
import type { ItemResponse } from '~/shared/types/common'

export type DashboardPeriod = 'today' | 'this_week' | 'this_month' | 'this_quarter' | 'ytd'

export interface DashboardMetrics {
  revenue: number
  expenses: number
  profit: number
  cash_on_hand: number
  outstanding_ar: number
  outstanding_ap: number
}

export interface RevenueTrendPoint { date: string; value: number }
export interface TopClientEntry { client_id: number; name: string; amount: number }

export interface DashboardSnapshot {
  metrics: DashboardMetrics
  charts: {
    revenue_trend: RevenueTrendPoint[]
    top_clients: TopClientEntry[]
  }
  alerts: Array<{ type: string; count: number }>
}

export interface DashboardQuery {
  period?: DashboardPeriod
  currency?: string
}

/** Legacy shape used by the existing tenant dashboard page — kept for back-compat. */
export interface DashboardKpis {
  clients: { total: number; added_this_month: number }
  invoices: {
    total: number
    outstanding: number
    outstanding_amount: number
    overdue: number
    overdue_amount: number
    paid_this_month: number
    revenue_this_month: number
  }
  payments: { received_this_month: number; count_this_month: number }
  journal_entries: { total: number; this_month: number }
  subscription: { plan_name: string | null; status: string | null; trial_days_remaining: number | null }
  onboarding: { completed: boolean; percent: number }
}

function toQuery(p: Record<string, unknown>): string {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v === '' || v == null) continue
    q.set(k, String(v))
  }
  return q.toString() ? `?${q}` : ''
}

export function dashboardService() {
  const api = useApi()

  return {
    snapshot: (query: DashboardQuery = {}) =>
      api.get<ItemResponse<DashboardSnapshot>>(`${ENDPOINTS.dashboard.root}${toQuery(query)}`).then(r => r.data),
    kpis: () =>
      api.get<ItemResponse<DashboardKpis>>(ENDPOINTS.dashboard.root).then(r => r.data),
  }
}
