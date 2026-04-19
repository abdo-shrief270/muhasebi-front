import { dashboardService, type DashboardKpis } from '~/features/dashboard/services/dashboardService'
import { useQuery } from '~/core/api/query'

export function useDashboardKpis() {
  const svc = dashboardService()
  return useQuery(() => svc.kpis(), {
    key: 'dashboard:kpis',
    staleMs: 60_000,
  })
}

/** Legacy shim — matches the prior API (data/loading/error/fetch). */
export function useDashboard() {
  const svc = dashboardService()
  const data = ref<DashboardKpis | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      data.value = await svc.kpis()
    } catch (e: any) {
      error.value = e?.message || 'Failed to load dashboard'
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetch }
}
