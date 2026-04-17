interface DashboardKpis {
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

export function useDashboard() {
  const api = useApi()
  const data = ref<DashboardKpis | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get<{ data: DashboardKpis }>('/dashboard')
      data.value = response.data
    } catch (e: any) {
      error.value = e.data?.message || 'Failed to load dashboard'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetch }
}
