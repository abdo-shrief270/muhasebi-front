import { defineStore } from 'pinia'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration: number
}

let nextId = 0

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function show(message: string, type: Toast['type'] = 'success', duration = 4000) {
    const id = ++nextId
    toasts.value.push({ id, message, type, duration })

    setTimeout(() => {
      remove(id)
    }, duration)
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  function success(message: string) { show(message, 'success') }
  function error(message: string) { show(message, 'error', 6000) }
  function info(message: string) { show(message, 'info') }
  function warning(message: string) { show(message, 'warning', 5000) }

  return { toasts, show, remove, success, error, info, warning }
})
