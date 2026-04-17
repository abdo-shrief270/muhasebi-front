export function useTenantId(): string {
  const config = useRuntimeConfig()
  const envId = config.public.tenantId as string
  if (envId) return envId

  const cookie = useCookie('tenant_id')
  if (cookie.value) return cookie.value

  if (import.meta.client) {
    const stored = localStorage.getItem('tenant_id')
    if (stored) return stored
  }
  return ''
}

export const useTenantSlug = useTenantId
