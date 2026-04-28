import { useBranding } from '~/core/theme/useBranding'

/**
 * Tenant theme — name, logo, and the single-value brand colors that some
 * inline styles need (sidebar logo tile, dashboard accents).
 *
 * Color values come from the runtime branding store (populated by
 * `plugins/branding.client.ts`); name and logo come from authStore.
 *
 * `applyTheme()` is a no-op shim kept for backward compat — the branding
 * plugin is the authoritative writer of CSS variables. Old call sites
 * that imported `applyTheme` will keep working but produce no extra work.
 */
export function useTenantTheme() {
  const authStore = useAuthStore()
  const branding = useBranding()

  const tenantName = computed(() => authStore.tenant?.name || '')
  const tenantLogo = computed(() => authStore.tenant?.logo_path || '')

  function applyTheme() {
    // Intentionally empty — branding plugin owns CSS-var writes.
  }

  return {
    primaryColor:   branding.primaryColor,
    secondaryColor: branding.secondaryColor,
    tenantName,
    tenantLogo,
    applyTheme,
  }
}
