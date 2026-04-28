import type { Branding } from './types'

/**
 * Frontend default branding — used as the fallback before the API responds
 * (or if the user is unauthenticated). Mirrors tokens.css and the backend
 * TenantBrandingService::defaults(). All three locations must stay in sync.
 */
export const BRANDING_DEFAULTS: Branding = {
  colors: {
    primary:      '#06B6D4',
    secondary:    '#22D3EE',
    success:      '#10B981',
    warning:      '#F59E0B',
    danger:       '#EF4444',
    info:         '#3B82F6',
    neutral_tone: 'cool',
  },
  typography: {
    font_latin:  'Inter',
    font_arabic: 'IBM Plex Sans Arabic',
    font_mono:   'JetBrains Mono',
    scale:       'default',
  },
  shape: {
    radius_scale: 'default',
    shadow_scale: 'default',
  },
  motion: {
    enabled: true,
  },
}
