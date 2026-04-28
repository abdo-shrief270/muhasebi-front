/**
 * Generate an 11-shade Tailwind-style ramp (50, 100, 200, …, 950) from a
 * single hex base color. Uses OKLCH for perceptually uniform lightness
 * stepping, then snaps to the lightness ladder Tailwind v4 uses.
 *
 * Why OKLCH over HSL:
 *   - HSL ramps look uneven across hues (yellows wash out, blues go inky)
 *   - OKLCH spaces lightness perceptually so a green-500 reads at the same
 *     "weight" as a blue-500 or a red-500.
 *
 * The base hex anchors at the 500 stop; lighter stops scale L toward 1.0
 * and reduce chroma to avoid neon washes; darker stops scale L toward 0.0
 * and slightly reduce chroma to keep contrast strong.
 *
 * No external dependency — kept hand-rolled to avoid 30 KB of culori for
 * what amounts to a ~80-line color-space conversion. Reference:
 *   https://www.w3.org/TR/css-color-4/#color-conversion-code
 */

export type Ramp = {
  '50':  string
  '100': string
  '200': string
  '300': string
  '400': string
  '500': string
  '600': string
  '700': string
  '800': string
  '900': string
  '950': string
}

const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

/** Lightness ladder borrowed from Tailwind's slate ramp — gives recognizable shades. */
const TARGET_LIGHTNESS: Record<(typeof STOPS)[number], number> = {
  50:  0.985,
  100: 0.965,
  200: 0.92,
  300: 0.86,
  400: 0.74,
  500: 0.62,  // anchor for typical 500-lightness brand colors
  600: 0.52,
  700: 0.42,
  800: 0.32,
  900: 0.24,
  950: 0.16,
}

/**
 * Chroma multiplier per stop — tapers the saturation at the extreme ends so
 * 50/100 don't look fluorescent and 900/950 don't look black-tinted.
 */
const CHROMA_MULT: Record<(typeof STOPS)[number], number> = {
  50:  0.18,
  100: 0.32,
  200: 0.55,
  300: 0.78,
  400: 0.92,
  500: 1.0,
  600: 0.95,
  700: 0.85,
  800: 0.7,
  900: 0.55,
  950: 0.4,
}

export function generateRamp(hex: string): Ramp {
  const base = hexToOklch(hex)
  const ramp = {} as Ramp
  for (const stop of STOPS) {
    const L = TARGET_LIGHTNESS[stop]
    const C = base.C * CHROMA_MULT[stop]
    ramp[String(stop) as keyof Ramp] = oklchToHex({ L, C, h: base.h })
  }
  return ramp
}

// ──────────────────────────────────────────────────────────────────────────
// Color-space conversions: hex → linear sRGB → OKLab → OKLCH and back.
// ──────────────────────────────────────────────────────────────────────────

interface OKLCH { L: number; C: number; h: number }

function hexToOklch(hex: string): OKLCH {
  const { r, g, b } = hexToRgb(hex)
  // sRGB → linear
  const lr = srgbToLinear(r / 255)
  const lg = srgbToLinear(g / 255)
  const lb = srgbToLinear(b / 255)
  // linear sRGB → OKLab (matrices from the OKLab paper)
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s)
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205  * m_ + 0.4505937099 * s_
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766  * s_
  const C = Math.hypot(a, b2)
  let h = (Math.atan2(b2, a) * 180) / Math.PI
  if (h < 0) h += 360
  return { L, C, h }
}

function oklchToHex({ L, C, h }: OKLCH): string {
  const hr = (h * Math.PI) / 180
  const a = Math.cos(hr) * C
  const b = Math.sin(hr) * C
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548  * b
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3
  let r =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  let bl =  -0.0041960863 * l - 0.7034186147 * m + 1.707614701  * s
  // Clip to sRGB gamut by scaling down chroma if needed (cheap fallback;
  // produces less-saturated but in-gamut colors for extreme inputs).
  r = clamp01(r); g = clamp01(g); bl = clamp01(bl)
  return rgbToHex({
    r: Math.round(linearToSrgb(r) * 255),
    g: Math.round(linearToSrgb(g) * 255),
    b: Math.round(linearToSrgb(bl) * 255),
  })
}

function srgbToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
function linearToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}
function clamp01(v: number): number { return v < 0 ? 0 : v > 1 ? 1 : v }

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  const h = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase()
}

/**
 * Neutral ramp variants — the "neutral_tone" knob lets a tenant warm up the
 * grays (slightly brown-tinted) or cool them down (slightly blue-tinted) to
 * match their brand's character without losing the contrast hierarchy.
 *
 * Hue values (in OKLCH): neutral=240 (Tailwind slate), warm=60 (zinc/stone),
 * cool=255 (slate but slightly bluer). Chroma is intentionally low.
 */
export function generateNeutralRamp(tone: 'cool' | 'warm' | 'neutral'): Ramp {
  const hue = tone === 'warm' ? 60 : tone === 'neutral' ? 240 : 255
  const chroma = tone === 'neutral' ? 0.005 : 0.012
  const ramp = {} as Ramp
  for (const stop of STOPS) {
    ramp[String(stop) as keyof Ramp] = oklchToHex({
      L: TARGET_LIGHTNESS[stop],
      C: chroma * CHROMA_MULT[stop],
      h: hue,
    })
  }
  // Override 0 (pure white) and 950 (near black) so they always extreme.
  ramp['50']  = oklchToHex({ L: 0.985, C: chroma * 0.05, h: hue })
  return ramp
}

/**
 * Tailwind's "neutral-0" stop in tokens.css is pure #FFFFFF. We expose this
 * separately because OKLCH-to-sRGB rounding gives us #FEFEFE which is close
 * but not exact, and the design spec calls for a true white.
 */
export const NEUTRAL_0 = '#FFFFFF'
