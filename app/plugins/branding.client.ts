import { applyBranding } from '~/core/theme/applyBranding'
import { BRANDING_DEFAULTS } from '~/core/theme/brandingDefaults'
import { useBranding } from '~/core/theme/useBranding'
import { brandingService } from '~/features/settings/services/brandingService'
import type { Branding } from '~/core/theme/types'

/**
 * Per-tenant runtime theming.
 *
 *  1. Apply the cached branding from localStorage (or platform defaults)
 *     on first paint to avoid a flash of unbranded content.
 *  2. After auth hydrate, fetch /v1/branding for the freshest payload and
 *     re-apply if it differs from cache.
 *  3. Watch authStore for tenant changes (impersonation, logout) and
 *     re-fetch.
 *
 * The cache is keyed by tenant ID so impersonation doesn't bleed brand
 * colors across tenants. Defaults apply pre-login.
 */

const CACHE_KEY = (tenantId: number | null | undefined) =>
  tenantId ? `muhasebi:branding:${tenantId}` : 'muhasebi:branding:default'

export default defineNuxtPlugin({
  name: 'muhasebi:branding',
  dependsOn: ['muhasebi:session'],
  async setup() {
    // 1. Paint cached or default ASAP — runs on every page load.
    const auth = useAuthStore()
    const branding = useBranding()
    const tenantId = auth.tenant?.id ?? null
    const cached = readCache(tenantId) ?? BRANDING_DEFAULTS
    applyBranding(cached)
    branding.setBranding(cached)

    // 2. Refresh from API in the background. Skip if unauthenticated —
    //    pre-login users get platform defaults, which is what we want.
    if (!auth.isAuthenticated) return

    refreshFromServer().catch((e) => {
      // Don't break the app on a branding fetch failure — defaults stay applied.
      console.warn('[branding] failed to refresh, using cached/defaults:', e)
    })

    // 3. React to tenant swaps (impersonation, logout, login flow).
    watch(
      () => auth.tenant?.id,
      async (newId, oldId) => {
        if (newId === oldId) return
        if (!newId) {
          applyBranding(BRANDING_DEFAULTS)
          branding.resetToDefaults()
          return
        }
        const tenantCached = readCache(newId)
        if (tenantCached) {
          applyBranding(tenantCached)
          branding.setBranding(tenantCached)
        }
        await refreshFromServer().catch(() => {})
      },
    )
  },
})

async function refreshFromServer(): Promise<void> {
  const auth = useAuthStore()
  const branding = useBranding()
  const tenantId = auth.tenant?.id ?? null

  const res = await brandingService().get()
  const effective = res.data.effective as Branding
  applyBranding(effective)
  branding.setBranding(effective)
  writeCache(tenantId, effective)

  // Apply favicon if the tenant has uploaded one. We do this here rather
  // than in applyBranding() because the favicon URL lives outside the
  // `effective` payload — it's a separate path on the assets sub-object.
  applyFavicon(res.data.assets?.favicon_url ?? null)
}

/**
 * Replace the document's favicon <link>. Falls back to the default favicon
 * from /favicon.ico when null. Idempotent — same URL is a no-op.
 */
function applyFavicon(url: string | null): void {
  if (!import.meta.client) return
  const href = url || '/favicon.ico'
  let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  if (link.href.endsWith(href) || link.href === href) return
  link.href = href
}

function readCache(tenantId: number | null): Branding | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY(tenantId))
    return raw ? (JSON.parse(raw) as Branding) : null
  } catch {
    return null
  }
}

function writeCache(tenantId: number | null, branding: Branding): void {
  try {
    localStorage.setItem(CACHE_KEY(tenantId), JSON.stringify(branding))
  } catch {
    // Quota exceeded or private mode — silently fall through; the next
    // page load will just hit the API again.
  }
}
