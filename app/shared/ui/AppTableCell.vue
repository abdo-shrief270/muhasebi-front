<template>
  <span v-if="value == null || value === ''" class="text-neutral-300">—</span>

  <span v-else-if="renderer === 'money'" class="tabular-nums font-medium">
    {{ formatMoney(value as string | number, column.money) }}
  </span>

  <span v-else-if="renderer === 'percent'" class="tabular-nums">
    {{ formatPercent(value as number) }}
  </span>

  <span v-else-if="renderer === 'date'" class="tabular-nums">
    {{ formatDate(value as string | Date) }}
  </span>

  <span v-else-if="renderer === 'datetime'" class="tabular-nums">
    {{ formatDateTime(value as string | Date) }}
  </span>

  <span v-else-if="renderer === 'bool'" class="inline-flex items-center gap-1">
    <UIcon
      :name="value ? 'i-lucide-check' : 'i-lucide-x'"
      class="w-3.5 h-3.5"
      :class="value ? 'text-success-500' : 'text-neutral-300'"
    />
    <span v-if="column.bool?.trueLabel || column.bool?.falseLabel" class="text-xs">
      {{ value ? column.bool?.trueLabel : column.bool?.falseLabel }}
    </span>
  </span>

  <UiAppStatusChip
    v-else-if="renderer === 'status'"
    :value="value as string"
    :kind="column.status?.kind"
  />

  <UBadge
    v-else-if="renderer === 'badge'"
    color="neutral"
    variant="subtle"
    size="sm"
  >
    {{ String(value) }}
  </UBadge>

  <NuxtLink
    v-else-if="renderer === 'entityLink' && entityLink"
    :to="entityLink.to"
    class="text-primary-600 hover:underline"
    @click.stop
  >
    {{ entityLink.label }}
  </NuxtLink>

  <span v-else-if="renderer === 'tabular'" class="tabular-nums font-mono text-xs">
    {{ String(value) }}
  </span>

  <span v-else class="truncate">{{ String(value) }}</span>
</template>

<script setup lang="ts">
import type { ColumnDef, CellValue } from '~/shared/ui/table-types'

const props = defineProps<{
  value: CellValue
  column: ColumnDef
  row?: Record<string, unknown>
}>()

const { locale } = useI18n()

const renderer = computed(() => props.column.render ?? 'text')

const entityLink = computed(() => {
  if (renderer.value !== 'entityLink' || !props.column.entity || !props.row) return null
  return props.column.entity.resolve(props.row)
})

function formatMoney(v: string | number, opts?: ColumnDef['money']): string {
  const num = typeof v === 'string' ? parseFloat(v) : v
  if (!Number.isFinite(num)) return String(v)
  const currency = opts?.currency ?? 'EGP'
  try {
    const formatted = new Intl.NumberFormat(locale.value === 'ar' ? 'ar-EG' : 'en-EG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
    if (opts?.signed && num > 0) return '+' + formatted
    return formatted
  } catch {
    return `${num.toFixed(2)} ${currency}`
  }
}

function formatPercent(v: number): string {
  if (!Number.isFinite(v)) return '—'
  return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(v / 100)
}

function formatDate(v: string | Date): string {
  const d = v instanceof Date ? v : new Date(v)
  if (isNaN(d.getTime())) return String(v)
  return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

function formatDateTime(v: string | Date): string {
  const d = v instanceof Date ? v : new Date(v)
  if (isNaN(d.getTime())) return String(v)
  return new Intl.DateTimeFormat(locale.value === 'ar' ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}
</script>
