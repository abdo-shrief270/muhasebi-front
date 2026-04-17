/**
 * Design configuration for the tenant frontend.
 * These values can be overridden via .env or nuxt.config.ts runtimeConfig.
 *
 * Colors: set in .env as NUXT_PUBLIC_PRIMARY_COLOR, NUXT_PUBLIC_SECONDARY_COLOR
 * If not set, uses these defaults.
 */
export const designDefaults = {
  primaryColor: '#2c3e50',
  secondaryColor: '#3498db',
  sidebarStyle: 'gradient' as 'gradient' | 'solid',
  borderRadius: '0.75rem',
  fontFamily: 'Cairo, sans-serif',
}
