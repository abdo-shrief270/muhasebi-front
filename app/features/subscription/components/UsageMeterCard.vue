<template>
  <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
    <!-- Header: icon + label + status pill -->
    <div class="flex items-start justify-between gap-2 mb-3">
      <div class="flex items-center gap-2 min-w-0">
        <div
          class="w-8 h-8 rounded-md inline-flex items-center justify-center flex-shrink-0"
          :class="iconBg"
        >
          <UIcon :name="icon" class="w-4 h-4" :class="iconColor" />
        </div>
        <div class="min-w-0">
          <p class="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate">{{ label }}</p>
          <p v-if="boostContribution > 0" class="text-[10px] text-primary-600 dark:text-primary-400 truncate">
            <UIcon name="i-lucide-plus-circle" class="w-2.5 h-2.5 inline" />
            +{{ formatNumber(boostContribution) }} {{ locale === 'ar' ? 'من الإضافات' : 'from add-ons' }}
          </p>
        </div>
      </div>
      <span
        v-if="statusPill"
        class="text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
        :class="statusPillClass"
      >
        {{ statusPill }}
      </span>
    </div>

    <!-- Current vs limit -->
    <div class="flex items-baseline gap-1.5 mb-2 tabular-nums" dir="ltr">
      <span class="text-2xl font-bold text-neutral-900 dark:text-neutral-0">{{ formatNumber(current) }}</span>
      <span class="text-xs text-neutral-400">
        / {{ isUnlimited ? '∞' : formatNumber(limit) }}
      </span>
      <span v-if="suffix" class="text-xs text-neutral-400">{{ suffix }}</span>
    </div>

    <!-- Progress bar -->
    <div class="bg-neutral-100 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden mb-2">
      <div
        class="rounded-full h-1.5 transition-all duration-700"
        :class="barClass"
        :style="{ width: barWidth + '%' }"
      />
    </div>

    <!-- Sparkline + projection -->
    <div class="flex items-center justify-between gap-2 text-[10px]">
      <svg
        v-if="sparklinePath"
        :viewBox="`0 0 ${sparklineWidth} ${sparklineHeight}`"
        class="h-5 w-16 flex-shrink-0"
        :class="sparklineColor"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path :d="sparklinePath" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span v-else class="h-5 w-16 flex-shrink-0" />
      <span
        v-if="projectionLabel"
        class="text-neutral-500 dark:text-neutral-400 truncate"
        :title="projectionLabel"
      >
        {{ projectionLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  current: number
  limit: number
  /** Pre-formatted current ("2.4 GB") — overrides numeric rendering. */
  currentDisplay?: string
  /** Pre-formatted limit ("5 GB") — overrides numeric rendering. */
  limitDisplay?: string
  suffix?: string
  percent: number
  exceeded: boolean
  boostContribution?: number
  /** ISO date when the metric is projected to hit the limit, or null. */
  projection?: string | null
  icon: string
  iconBg: string
  iconColor: string
  /** Trailing N daily samples (current values) — used for the sparkline. */
  history?: number[]
}>()

const { locale } = useI18n()

const isUnlimited = computed(() => props.limit === -1)

const barWidth = computed(() => {
  if (isUnlimited.value) return 6 // visual indicator only — never "full"
  return Math.min(100, Math.max(0, props.percent))
})

const barClass = computed(() => {
  if (isUnlimited.value) return 'bg-info-400/60'
  if (props.exceeded) return 'bg-danger-500'
  if (props.percent >= 80) return 'bg-warning-500'
  return 'bg-success-500'
})

const statusPill = computed(() => {
  if (isUnlimited.value) return locale.value === 'ar' ? '∞' : 'Unlimited'
  if (props.exceeded) return locale.value === 'ar' ? 'تجاوز' : 'Exceeded'
  if (props.percent >= 80) return locale.value === 'ar' ? 'قريب' : 'Near limit'
  return null
})

const statusPillClass = computed(() => {
  if (isUnlimited.value) return 'bg-info-50 dark:bg-info-500/15 text-info-700 dark:text-info-400'
  if (props.exceeded) return 'bg-danger-500/10 text-danger-700 dark:text-danger-400'
  return 'bg-warning-500/10 text-warning-700 dark:text-warning-500'
})

const sparklineColor = computed(() => {
  if (props.exceeded) return 'text-danger-500'
  if (props.percent >= 80) return 'text-warning-500'
  return 'text-success-500'
})

// SVG sparkline: scale `history` into a 60×20 box. Linear y-scale with a
// 1px floor so a perfectly flat zero line still draws something.
const sparklineWidth = 60
const sparklineHeight = 20

const sparklinePath = computed(() => {
  const h = props.history
  if (!h || h.length < 2) return ''
  const max = Math.max(...h, 1)
  const min = Math.min(...h, 0)
  const span = Math.max(1, max - min)
  const stepX = sparklineWidth / Math.max(1, h.length - 1)
  return h
    .map((v, i) => {
      const x = i * stepX
      const y = sparklineHeight - ((v - min) / span) * (sparklineHeight - 2) - 1
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
})

function formatNumber(n: number): string {
  if (props.currentDisplay && n === props.current) return props.currentDisplay
  if (props.limitDisplay && n === props.limit) return props.limitDisplay
  if (typeof n !== 'number' || !Number.isFinite(n)) return '0'
  return n.toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US')
}

const projectionLabel = computed(() => {
  if (!props.projection) return null
  const d = new Date(props.projection)
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  const days = Math.max(0, Math.round((d.getTime() - today.getTime()) / 86400000))
  if (days === 0) {
    return locale.value === 'ar' ? 'الحد اليوم' : 'Limit today'
  }
  return locale.value === 'ar'
    ? `الحد خلال ${days} يوم`
    : `Limit in ~${days} ${days === 1 ? 'day' : 'days'}`
})
</script>
