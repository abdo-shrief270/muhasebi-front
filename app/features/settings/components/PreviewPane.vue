<template>
  <div
    ref="paneRef"
    class="rounded-lg border overflow-hidden font-sans-latin"
    :class="scheme === 'dark' ? 'dark bg-neutral-950' : 'bg-neutral-0'"
    :style="paneStyle"
  >
    <!-- Title bar -->
    <div class="flex items-center justify-between px-3 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full bg-danger-500" />
        <span class="w-2 h-2 rounded-full bg-warning-500" />
        <span class="w-2 h-2 rounded-full bg-success-500" />
      </div>
      <span class="text-[10px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {{ scheme }}
      </span>
    </div>

    <div class="p-4 space-y-4 text-sm">
      <!-- KPI card sample -->
      <div class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 p-3 shadow-sm">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
          Outstanding Balance
        </p>
        <p class="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">
          ₪ 142,580
        </p>
        <div class="flex items-center gap-1.5 mt-1.5 text-[11px] text-success-600 dark:text-success-400 font-medium">
          <UIcon name="i-lucide-trending-up" class="w-3 h-3" />
          12.4% vs last month
        </div>
      </div>

      <!-- Buttons row -->
      <div class="flex items-center gap-2 flex-wrap">
        <button class="h-8 px-3 rounded-md bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold shadow-sm">
          Save changes
        </button>
        <button class="h-8 px-3 rounded-md bg-secondary-500 hover:bg-secondary-600 text-white text-xs font-semibold shadow-sm">
          Secondary
        </button>
        <button class="h-8 px-3 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-medium hover:bg-neutral-50 dark:hover:bg-neutral-800">
          Cancel
        </button>
        <button class="h-8 px-3 rounded-md bg-danger-500 hover:bg-danger-600 text-white text-xs font-semibold shadow-sm">
          Delete
        </button>
      </div>

      <!-- Status badges -->
      <div class="flex items-center gap-1.5 flex-wrap">
        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-300">
          <span class="w-1.5 h-1.5 rounded-full bg-success-500" /> Paid
        </span>
        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-warning-50 dark:bg-warning-500/15 text-warning-700 dark:text-warning-300">
          <span class="w-1.5 h-1.5 rounded-full bg-warning-500" /> Due soon
        </span>
        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-danger-50 dark:bg-danger-500/15 text-danger-700 dark:text-danger-300">
          <span class="w-1.5 h-1.5 rounded-full bg-danger-500" /> Overdue
        </span>
        <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-info-50 dark:bg-info-500/15 text-info-700 dark:text-info-300">
          <span class="w-1.5 h-1.5 rounded-full bg-info-500" /> Draft
        </span>
      </div>

      <!-- Input + table row -->
      <div>
        <label class="block text-[11px] font-medium text-neutral-600 dark:text-neutral-300 mb-1">
          Invoice number
        </label>
        <input
          type="text"
          value="INV-2026-0042"
          class="w-full h-8 px-2.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 text-xs font-mono text-neutral-900 dark:text-neutral-0 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div class="rounded-md border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <div class="grid grid-cols-3 px-2 py-1.5 bg-neutral-50 dark:bg-neutral-900 text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          <span>Client</span>
          <span class="text-end">Amount</span>
          <span class="text-end">Status</span>
        </div>
        <div
          v-for="(row, i) in sampleRows"
          :key="i"
          class="grid grid-cols-3 px-2 py-1.5 text-[11px] items-center border-t border-neutral-100 dark:border-neutral-800/60"
          :class="i % 2 === 0 ? 'bg-neutral-0 dark:bg-neutral-900' : 'bg-neutral-50/50 dark:bg-neutral-900/40'"
        >
          <span class="text-neutral-800 dark:text-neutral-100 truncate">{{ row.client }}</span>
          <span class="font-mono tabular-nums text-end text-neutral-900 dark:text-neutral-0">{{ row.amount }}</span>
          <span class="text-end">
            <span
              class="inline-flex px-1.5 py-0.5 rounded text-[9px] font-semibold"
              :class="badgeClass(row.status)"
            >{{ row.status }}</span>
          </span>
        </div>
      </div>

      <!-- Typography sample -->
      <div class="space-y-1 pt-1 border-t border-neutral-100 dark:border-neutral-800">
        <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">Typography</p>
        <p class="text-lg font-bold text-neutral-900 dark:text-neutral-0" :style="{ fontFamily: 'var(--font-sans-latin)' }">
          The quick brown fox 0123
        </p>
        <p
          class="text-base font-semibold text-neutral-700 dark:text-neutral-200"
          :style="{ fontFamily: 'var(--font-sans-arabic)' }"
          dir="rtl"
        >
          محاسبي للمحاسبة الإلكترونية ١٢٣٤
        </p>
        <p class="text-xs font-mono text-neutral-600 dark:text-neutral-300" :style="{ fontFamily: 'var(--font-mono)' }">
          INV-2026-0042 · ₪ 12,584.99
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { applyBranding } from '~/core/theme/applyBranding'
import type { Branding } from '~/core/theme/types'

/**
 * Self-contained preview pane. Branding is applied via inline CSS variables
 * scoped to this element's root, so changes don't leak to the rest of the
 * page. The .dark class on the root toggles which Tailwind dark: variants
 * resolve, keeping the same scoping property as the global theme switcher.
 *
 * Reactive: changing the `branding` prop re-applies inside this subtree.
 */

const props = defineProps<{
  scheme: 'light' | 'dark'
  branding: Branding
}>()

const paneRef = ref<HTMLElement | null>(null)

// Compute inline CSS variables off the branding payload — same logic as
// applyBranding but written to inline style so it scopes to this element.
// We use applyBranding(target) to keep one source of truth.
const paneStyle = ref<Record<string, string>>({
  // Border on the root frame so it's visible regardless of scheme.
  borderColor: 'var(--color-neutral-200)',
})

watch(
  () => [props.branding, paneRef.value] as const,
  () => {
    if (paneRef.value) {
      applyBranding(props.branding, paneRef.value)
    }
  },
  { immediate: true, deep: true },
)

const sampleRows = [
  { client: 'Acme Trading Co.', amount: '₪ 12,580',  status: 'Paid'    },
  { client: 'Banque du Nil',    amount: '₪  4,920',  status: 'Pending' },
  { client: 'Cairo Logistics',  amount: '₪ 18,400',  status: 'Overdue' },
]

function badgeClass(status: string) {
  switch (status) {
    case 'Paid':    return 'bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-300'
    case 'Pending': return 'bg-warning-50 dark:bg-warning-500/15 text-warning-700 dark:text-warning-300'
    case 'Overdue': return 'bg-danger-50 dark:bg-danger-500/15 text-danger-700 dark:text-danger-300'
    default:        return 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
  }
}
</script>
