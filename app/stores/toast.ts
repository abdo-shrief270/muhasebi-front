import { defineStore } from 'pinia'

/**
 * Legacy toast store — retained as a thin delegator over `useAppToast()`
 * so existing call sites keep working while new code uses the composable
 * directly. Both paths render through <UApp>'s UToaster (§11.8).
 *
 * New code: prefer `useAppToast()` — the semantic API matches the spec.
 */
export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration: number
}

export const useToastStore = defineStore('toast', () => {
  function show(message: string, type: Toast['type'] = 'success') {
    const t = useAppToast()
    t[type](message)
  }

  function success(message: string) { show(message, 'success') }
  function error(message: string)   { show(message, 'error') }
  function info(message: string)    { show(message, 'info') }
  function warning(message: string) { show(message, 'warning') }

  return {
    toasts: ref<Toast[]>([]),
    show,
    remove: (_id: number) => {},
    success, error, info, warning,
  }
})
