<template>
  <span
    class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold"
    :class="badgeClass"
    :title="`${ratio.toFixed(2)}:1 — ${labelLong}`"
  >
    <UIcon :name="icon" class="w-3 h-3" />
    {{ labelShort }}
  </span>
</template>

<script setup lang="ts">
/**
 * WCAG contrast badge. Computes the contrast ratio between fg and bg
 * (both hex), then renders AA/AAA/Fail per the WCAG 2.1 thresholds for
 * normal text:
 *
 *   - Fail < 4.5
 *   - AA   ≥ 4.5
 *   - AAA  ≥ 7.0
 *
 * For large text the thresholds are looser (3.0/4.5) but in a brand-color
 * context the conservative normal-text thresholds are what matters since
 * primary buttons usually carry small labels.
 */

const props = defineProps<{
  fg: string
  bg: string
}>()

const ratio = computed(() => contrastRatio(props.fg, props.bg))

const level = computed<'AAA' | 'AA' | 'fail'>(() => {
  const r = ratio.value
  if (r >= 7) return 'AAA'
  if (r >= 4.5) return 'AA'
  return 'fail'
})

const labelShort = computed(() => level.value === 'fail' ? 'Fail' : level.value)
const labelLong = computed(() => {
  switch (level.value) {
    case 'AAA':  return 'WCAG AAA — excellent'
    case 'AA':   return 'WCAG AA — passes for normal text'
    case 'fail': return 'Fails WCAG AA — text may be hard to read'
  }
})

const badgeClass = computed(() => {
  switch (level.value) {
    case 'AAA':  return 'bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-300'
    case 'AA':   return 'bg-success-50/60 dark:bg-success-500/10 text-success-700 dark:text-success-400'
    case 'fail': return 'bg-danger-50 dark:bg-danger-500/15 text-danger-700 dark:text-danger-400'
  }
})

const icon = computed(() => level.value === 'fail' ? 'i-lucide-alert-triangle' : 'i-lucide-check')

/**
 * WCAG 2.1 relative luminance + contrast formula. Returns a number ≥ 1.
 */
function contrastRatio(fg: string, bg: string): number {
  const lf = relLuminance(fg)
  const lb = relLuminance(bg)
  const lighter = Math.max(lf, lb)
  const darker  = Math.min(lf, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

function relLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const f = (c: number) => {
    const v = c / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
</script>
