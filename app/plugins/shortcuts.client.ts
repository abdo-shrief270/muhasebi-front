/**
 * Global keyboard shortcuts.
 * Only runs on client side (.client.ts suffix).
 */
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return

  document.addEventListener('keydown', (e) => {
    // Ctrl+N — new invoice
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault()
      navigateTo('/invoices/create')
    }

    // Ctrl+Shift+C — new client
    if ((e.ctrlKey || e.metaCmd) && e.shiftKey && e.key === 'C') {
      e.preventDefault()
      navigateTo('/clients')
    }
  })
})
