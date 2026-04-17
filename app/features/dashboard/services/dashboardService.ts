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

export function dashboardService() {
  const api = useApi()
  return {
    kpis() {
      return api.get<{ data: DashboardKpis }>('/dashboard').then(r => r.data)
    },
  }
}
