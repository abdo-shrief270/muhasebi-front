/**
 * Tenant theme — reads colors from:
 * 1. .env (NUXT_PUBLIC_PRIMARY_COLOR) — set per deployment
 * 2. Backend tenant data — overrides env if tenant has custom colors
 * 3. Defaults (#2c3e50 / #3498db)
 */
export function useTenantTheme() {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const envPrimary = (config.public.primaryColor as string) || '#2c3e50'
  const envSecondary = (config.public.secondaryColor as string) || '#3498db'

  // Backend tenant colors override env if they have custom (non-default) colors
  const primaryColor = computed(() => {
    const tenantColor = authStore.user?.tenant?.primary_color
    if (tenantColor && tenantColor !== '#2c3e50') return tenantColor
    return envPrimary
  })

  const secondaryColor = computed(() => {
    const tenantColor = authStore.user?.tenant?.secondary_color
    if (tenantColor && tenantColor !== '#3498db') return tenantColor
    return envSecondary
  })

  const tenantName = computed(() => authStore.user?.tenant?.name || '')
  const tenantLogo = computed(() => authStore.user?.tenant?.logo_path || '')

  function applyTheme() {
    if (!import.meta.client) return
    document.documentElement.style.setProperty('--color-primary', primaryColor.value)
    document.documentElement.style.setProperty('--color-secondary', secondaryColor.value)

    const tenant = authStore.user?.tenant
    if (tenant) {
      localStorage.setItem('tenant_info', JSON.stringify(tenant))
    }
  }

  watch([primaryColor, secondaryColor], applyTheme, { immediate: true })

  return { primaryColor, secondaryColor, tenantName, tenantLogo, applyTheme }
}
