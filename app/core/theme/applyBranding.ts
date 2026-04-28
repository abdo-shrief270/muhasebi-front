import { generateRamp, generateNeutralRamp, NEUTRAL_0 } from './generateRamp'
import type { Branding } from './types'

/**
 * Apply a branding payload to the live document. Writes CSS custom
 * properties on :root so every Tailwind utility (bg-primary-500,
 * dark:text-danger-400, border-neutral-200, …) picks up the new value
 * automatically — Tailwind v4's @theme block compiles classes to var()
 * lookups, which means we can override the values at runtime without
 * a rebuild.
 *
 * Idempotent: calling twice with the same payload is a no-op for the DOM.
 *
 * Server-side safe: every DOM write is guarded with import.meta.client so
 * Nuxt SSR doesn't choke.
 */

const FONT_LINK_ID = 'muhasebi-google-fonts'

const TYPE_SCALE_MULT: Record<Branding['typography']['scale'], number> = {
  compact:     0.92,
  default:     1.0,
  comfortable: 1.08,
}

const RADIUS_MULT: Record<Branding['shape']['radius_scale'], number> = {
  sharp:   0.5,
  default: 1.0,
  rounded: 1.6,
}

const SHADOW_MULT: Record<Branding['shape']['shadow_scale'], number> = {
  flat:    0.4,
  default: 1.0,
  heavy:   1.6,
}

/** Base type-scale tokens (rem) — multiplied by scale knob. */
const BASE_TYPE_SCALE = {
  '--text-xs':   0.75,
  '--text-sm':   0.875,
  '--text-base': 1.0,
  '--text-lg':   1.125,
  '--text-xl':   1.25,
  '--text-2xl':  1.5,
  '--text-3xl':  1.875,
  '--text-4xl':  2.25,
  '--text-5xl':  3.0,
}

/** Base radii (rem) — multiplied by radius knob. */
const BASE_RADIUS = {
  '--radius-sm':  0.25,
  '--radius-md':  0.375,
  '--radius-lg':  0.5,
  '--radius-xl':  0.75,
  '--radius-2xl': 1.0,
}

/**
 * Apply branding to a target element (defaults to :root). Pass an iframe's
 * documentElement here for the live-preview pane.
 */
export function applyBranding(branding: Branding, target?: HTMLElement): void {
  if (!import.meta.client && !target) return
  const root = target ?? document.documentElement

  applyColors(root, branding.colors)
  applyTypography(root, branding.typography)
  applyShape(root, branding.shape)
  applyMotion(root, branding.motion)
}

function applyColors(root: HTMLElement, colors: Branding['colors']): void {
  // Brand + semantic ramps (11 stops × 6 palettes = 66 vars).
  const ramps: Array<[string, string]> = [
    ['primary',   colors.primary],
    ['secondary', colors.secondary],
    ['success',   colors.success],
    ['warning',   colors.warning],
    ['danger',    colors.danger],
    ['info',      colors.info],
  ]
  for (const [name, hex] of ramps) {
    const ramp = generateRamp(hex)
    for (const stop of Object.keys(ramp) as Array<keyof typeof ramp>) {
      root.style.setProperty(`--color-${name}-${stop}`, ramp[stop])
    }
  }

  // Neutral ramp — driven by the tone knob, not a single hex. Anchor 0 and
  // 950 are forced for legibility.
  const neutral = generateNeutralRamp(colors.neutral_tone)
  root.style.setProperty('--color-neutral-0', NEUTRAL_0)
  for (const stop of Object.keys(neutral) as Array<keyof typeof neutral>) {
    if (stop === '50') continue // 0 above already covers
    root.style.setProperty(`--color-neutral-${stop}`, neutral[stop])
  }

  // Single-value aliases used by components that read --color-primary
  // directly (logo backgrounds, chart accents). We keep these for backward
  // compat with useTenantTheme.ts.
  root.style.setProperty('--color-primary',   colors.primary)
  root.style.setProperty('--color-secondary', colors.secondary)
}

function applyTypography(root: HTMLElement, typography: Branding['typography']): void {
  // Inject Google Fonts <link> for whichever families are configured.
  // Skipped on SSR; runs once on first apply, replaced on subsequent.
  if (import.meta.client) {
    loadGoogleFonts([typography.font_latin, typography.font_arabic, typography.font_mono])
  }

  // CSS family tokens — quote families that contain spaces.
  const q = (f: string) => f.includes(' ') ? `"${f}"` : f
  root.style.setProperty('--font-sans-latin',  `${q(typography.font_latin)}, "ui-sans-serif", system-ui, sans-serif`)
  root.style.setProperty('--font-sans-arabic', `${q(typography.font_arabic)}, "Segoe UI Arabic", "Tahoma", sans-serif`)
  root.style.setProperty('--font-mono',        `${q(typography.font_mono)}, "ui-monospace", monospace`)

  // Type scale multiplier.
  const mult = TYPE_SCALE_MULT[typography.scale]
  for (const [varName, baseRem] of Object.entries(BASE_TYPE_SCALE)) {
    root.style.setProperty(varName, `${(baseRem * mult).toFixed(4)}rem`)
  }
}

function applyShape(root: HTMLElement, shape: Branding['shape']): void {
  // Radius scale.
  const rmult = RADIUS_MULT[shape.radius_scale]
  for (const [varName, baseRem] of Object.entries(BASE_RADIUS)) {
    root.style.setProperty(varName, `${(baseRem * rmult).toFixed(4)}rem`)
  }
  root.style.setProperty('--radius-full', '9999px') // never scales

  // Shadow scale — multiply alpha components in the existing token shadows.
  const smult = SHADOW_MULT[shape.shadow_scale]
  root.style.setProperty('--shadow-xs',      `0 1px 1px rgba(15,23,42,${(0.04 * smult).toFixed(3)})`)
  root.style.setProperty('--shadow-sm',      `0 1px 2px rgba(15,23,42,${(0.06 * smult).toFixed(3)}), 0 1px 1px rgba(15,23,42,${(0.04 * smult).toFixed(3)})`)
  root.style.setProperty('--shadow-md',      `0 4px 6px -1px rgba(15,23,42,${(0.08 * smult).toFixed(3)}), 0 2px 4px -2px rgba(15,23,42,${(0.06 * smult).toFixed(3)})`)
  root.style.setProperty('--shadow-lg',      `0 10px 15px -3px rgba(15,23,42,${(0.10 * smult).toFixed(3)}), 0 4px 6px -4px rgba(15,23,42,${(0.06 * smult).toFixed(3)})`)
  root.style.setProperty('--shadow-overlay', `0 20px 40px -12px rgba(15,23,42,${(0.25 * smult).toFixed(3)})`)
}

function applyMotion(root: HTMLElement, motion: Branding['motion']): void {
  if (motion.enabled) {
    root.style.removeProperty('--duration-instant')
    root.style.removeProperty('--duration-fast')
    root.style.removeProperty('--duration-normal')
    root.style.removeProperty('--duration-slow')
  } else {
    // Collapse all transitions to 1 ms — keeps event handlers ordered without
    // visible animation. Honors users who prefer reduced motion at the
    // tenant level (e.g. dense data-entry workflows).
    root.style.setProperty('--duration-instant', '1ms')
    root.style.setProperty('--duration-fast',    '1ms')
    root.style.setProperty('--duration-normal',  '1ms')
    root.style.setProperty('--duration-slow',    '1ms')
  }
}

/**
 * Inject (or replace) a Google Fonts <link> with the given families. The
 * link tag is reused on subsequent calls so font resources are deduped by
 * the browser cache.
 *
 * Free-form: we accept any string, URL-encode it, and let Google's API
 * 404 silently if the family doesn't exist. Tailwind's @font-family stack
 * provides graceful fallback.
 */
function loadGoogleFonts(families: string[]): void {
  const unique = Array.from(new Set(families.filter(Boolean)))
  if (unique.length === 0) return

  // Drop families that are likely system fonts (no need to fetch from Google).
  const SYSTEM_FONTS = new Set(['system-ui', 'sans-serif', 'serif', 'monospace', 'ui-monospace', 'ui-sans-serif'])
  const remote = unique.filter(f => !SYSTEM_FONTS.has(f.toLowerCase()))
  if (remote.length === 0) return

  const familyParam = remote
    .map(f => `family=${encodeURIComponent(f.replace(/\s+/g, '+'))}:wght@400;500;600;700`)
    .join('&')
  const href = `https://fonts.googleapis.com/css2?${familyParam}&display=swap`

  let link = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = FONT_LINK_ID
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}
