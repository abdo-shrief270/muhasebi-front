/**
 * Toast facade — §11.8 of docs/UI_UX_SPEC.md.
 *
 * Wraps Nuxt UI's useToast() with the spec's semantic helpers and
 * durations. Top-end corner stacking + RTL flip are handled by <UApp>.
 *
 *   const toast = useAppToast()
 *   toast.success('Invoice posted')
 *   toast.error('Couldn't post invoice', {
 *     description: err.message,
 *     actions: [{ label: 'Retry', onClick: retry }],
 *   })
 */
type ToastColor = 'success' | 'error' | 'warning' | 'info' | 'primary' | 'neutral'

interface ToastAction {
  label: string
  onClick?: () => void
  to?: string
}

interface ToastOptions {
  description?: string
  duration?: number
  actions?: ToastAction[]
}

const DURATION = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 6000,
} as const

export function useAppToast() {
  const ui = useToast()

  function emit(title: string, color: ToastColor, icon: string, opts: ToastOptions = {}) {
    const sticky = (opts.actions?.length ?? 0) > 0
    ui.add({
      title,
      description: opts.description,
      color,
      icon,
      duration: sticky ? 0 : (opts.duration ?? DURATION[color as keyof typeof DURATION] ?? 4000),
      actions: opts.actions?.map(a => ({
        label: a.label,
        color,
        variant: 'outline',
        onClick: () => a.onClick?.(),
        to: a.to,
      })),
    })
  }

  return {
    success(title: string, opts?: ToastOptions) {
      emit(title, 'success', 'i-lucide-check-circle', opts)
    },
    error(title: string, opts?: ToastOptions) {
      emit(title, 'error', 'i-lucide-alert-circle', opts)
    },
    warning(title: string, opts?: ToastOptions) {
      emit(title, 'warning', 'i-lucide-triangle-alert', opts)
    },
    info(title: string, opts?: ToastOptions) {
      emit(title, 'info', 'i-lucide-info', opts)
    },
    raw: ui,
  }
}
