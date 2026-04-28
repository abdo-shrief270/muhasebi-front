import { BRANDING_DEFAULTS } from './brandingDefaults'
import type { Branding } from './types'

/**
 * Single source of truth for the live tenant branding payload. The
 * `branding.client.ts` plugin writes here whenever it loads or refreshes;
 * consumers (sidebar logo tile, topbar accents, dashboard widgets) read
 * the individual color values without having to know about the broader
 * theme machinery.
 *
 * Pre-login or pre-fetch this returns BRANDING_DEFAULTS so layouts always
 * have a non-null primary/secondary to inline-style with.
 */

const _branding = ref<Branding>(JSON.parse(JSON.stringify(BRANDING_DEFAULTS)))

export function useBranding() {
  return {
    branding: readonly(_branding),
    primaryColor:   computed(() => _branding.value.colors.primary),
    secondaryColor: computed(() => _branding.value.colors.secondary),
    setBranding(next: Branding) {
      _branding.value = next
    },
    resetToDefaults() {
      _branding.value = JSON.parse(JSON.stringify(BRANDING_DEFAULTS))
    },
  }
}
