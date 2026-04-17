/**
 * Composable for invoice creation pre-checks.
 * Validates credit limits, duplicate detection, and fiscal period locks
 * before the user submits a new invoice.
 *
 * Usage:
 *   const { warnings, canProceed, checkInvoice, isChecking } = useInvoiceGuard()
 *   await checkInvoice(clientId, total, date)
 *   if (!canProceed.value) { show warnings }
 */
export function useInvoiceGuard() {
  const api = useApi()

  const warnings = ref<InvoiceWarning[]>([])
  const canProceed = ref(true)
  const isChecking = ref(false)

  async function checkInvoice(clientId: number, total: number, date?: string) {
    isChecking.value = true
    warnings.value = []
    canProceed.value = true

    try {
      const res = await api.post<{ data: { warnings: InvoiceWarning[]; can_proceed: boolean } }>('/invoices/pre-check', {
        client_id: clientId,
        total,
        date,
      })

      warnings.value = res.data.warnings || []
      canProceed.value = res.data.can_proceed
    } catch {
      // If pre-check fails, allow proceeding (fail-open)
      canProceed.value = true
    } finally {
      isChecking.value = false
    }
  }

  function clearWarnings() {
    warnings.value = []
    canProceed.value = true
  }

  return { warnings, canProceed, isChecking, checkInvoice, clearWarnings }
}

export interface InvoiceWarning {
  type: string // 'credit_limit_exceeded' | 'possible_duplicate' | 'fiscal_period_locked'
  severity: 'error' | 'warning'
  message_ar: string
  message_en: string
  data?: Record<string, any>
}
