<template>
  <!--
    Generic financial-statement section: a colored heading, a list of
    accounts (code + name → balance), and a subtotal row. Used by the
    income statement (Revenue, Expenses) and the balance sheet (Assets,
    Liabilities, Equity). Tone drives the heading + total color so the
    same component renders in green for revenue, red for expenses, etc.
  -->
  <div class="p-4">
    <h3 class="text-sm font-semibold mb-3" :class="toneTextClass">
      {{ title }}
    </h3>

    <div v-if="items.length > 0" class="space-y-1">
      <NuxtLink
        v-for="item in items"
        :key="item.code ?? item.account_id ?? item.id"
        :to="rowLink(item)"
        class="flex items-baseline justify-between py-1.5 px-2 rounded-sm text-sm hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors -mx-2 group"
      >
        <span class="text-neutral-700 dark:text-neutral-200 truncate">
          <span class="font-mono text-[11px] text-neutral-400 me-2 group-hover:text-primary-500 transition-colors" dir="ltr">
            {{ item.code }}
          </span>
          {{ rowName(item) }}
        </span>
        <span class="font-mono tabular-nums text-neutral-900 dark:text-neutral-0 flex-shrink-0 ms-3" dir="ltr">
          {{ formatMoney(item.balance) }}
        </span>
      </NuxtLink>
    </div>

    <p v-else class="text-xs text-neutral-400 italic px-2 py-1">
      {{ locale === 'ar' ? 'لا توجد حسابات' : 'No accounts' }}
    </p>

    <!-- Subtotal -->
    <div
      class="flex items-baseline justify-between pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-800"
    >
      <span class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
        {{ locale === 'ar' ? `إجمالي ${title}` : `Total ${title}` }}
      </span>
      <span class="font-mono text-sm font-bold tabular-nums" :class="toneTextClass" dir="ltr">
        {{ formatMoney(total) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
type Tone = 'success' | 'danger' | 'info' | 'warning' | 'primary' | 'purple'

interface SectionItem {
  code?: string | number | null
  account_id?: number
  id?: number
  name_ar?: string | null
  name_en?: string | null
  balance: number | string
}

const props = defineProps<{
  title: string
  tone: Tone
  total: number | string
  items: SectionItem[]
  locale: string
}>()

const TONE_TEXT: Record<Tone, string> = {
  success: 'text-success-700 dark:text-success-400',
  danger: 'text-danger-700 dark:text-danger-400',
  info: 'text-info-700 dark:text-info-400',
  warning: 'text-warning-700 dark:text-warning-500',
  primary: 'text-primary-700 dark:text-primary-400',
  purple: 'text-purple-700 dark:text-purple-400',
}
const toneTextClass = computed(() => TONE_TEXT[props.tone] ?? TONE_TEXT.primary)

function rowName(item: SectionItem) {
  if (props.locale === 'ar') return item.name_ar || item.name_en || '—'
  return item.name_en || item.name_ar || '—'
}

/**
 * Each row drills into the account ledger filtered to that account so the
 * user can audit the balance with one click. Falls back to plain `#` when
 * the row doesn't carry an account_id (rare, but keeps NuxtLink valid).
 */
function rowLink(item: SectionItem) {
  const id = item.account_id ?? item.id
  return id ? `/reports/ledger?account_id=${id}` : '#'
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
</script>
