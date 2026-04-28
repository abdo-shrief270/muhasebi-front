<template>
  <FeatureBoundary id="collections">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-clock-alert"
        :title="locale === 'ar' ? 'التحصيل' : 'Collections'"
        :subtitle="locale === 'ar' ? 'متابعة تحصيل الفواتير المتأخرة' : 'Track and chase overdue invoices'"
      />

      <Can :perm="PERMISSIONS.MANAGE_COLLECTIONS">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
          </div>
        </template>

        <!-- Summary cards -->
        <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div v-for="i in 4" :key="i" class="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>
        <div v-else-if="overview" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div
            v-for="card in summaryCards"
            :key="card.key"
            class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
          >
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full" :class="card.tint" aria-hidden="true" />
            <div class="flex items-start justify-between mb-1">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">{{ card.label }}</p>
              <UIcon :name="card.icon" class="w-4 h-4" :class="card.iconColor" />
            </div>
            <p class="font-mono text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ card.value }}</p>
          </div>
        </div>

        <!-- Top overdue clients -->
        <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
              {{ locale === 'ar' ? 'أعلى عملاء متأخرين' : 'Top overdue clients' }}
            </h3>
          </div>

          <UiDataTable
            :columns="columns"
            :rows="overdueRows"
            :loading="loading"
            empty-icon="i-lucide-check-circle-2"
            :empty-title="locale === 'ar' ? 'لا توجد متأخرات' : 'Nothing overdue'"
            :empty-description="locale === 'ar' ? 'كل الفواتير ضمن المهلة. وقت ممتاز.' : 'All invoices are within terms. Quiet day.'"
            @row-click="(row: any) => row.client_id && navigateTo(`/clients/${row.client_id}`)"
          >
            <template #cell-client_name="{ row }">
              <NuxtLink
                v-if="row.client_id"
                :to="`/clients/${row.client_id}`"
                class="text-sm text-neutral-900 dark:text-neutral-0 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate"
                @click.stop
              >
                {{ row.client_name }}
              </NuxtLink>
              <span v-else class="text-sm text-neutral-700 dark:text-neutral-200">{{ row.client_name }}</span>
            </template>

            <template #cell-overdue_amount="{ value }">
              <span class="font-mono text-sm font-semibold text-danger-700 dark:text-danger-400 tabular-nums" dir="ltr">
                {{ formatMoney(value) }}
              </span>
            </template>

            <template #cell-days_overdue="{ value }">
              <UiBadge :color="bucketColor(value)">{{ value ?? 0 }} {{ locale === 'ar' ? 'يوم' : 'd' }}</UiBadge>
            </template>
          </UiDataTable>
        </div>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { collectionsService } from '~/features/collections/services/collectionsService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()

const loading = ref(true)
const overview = ref<any>(null)

const overdueRows = computed(() => overview.value?.top_overdue_clients ?? [])

const columns = computed(() => [
  { key: 'client_name',    label: locale.value === 'ar' ? 'العميل' : 'Client' },
  { key: 'overdue_amount', label: locale.value === 'ar' ? 'المبلغ المتأخر' : 'Overdue', class: 'text-end' },
  { key: 'days_overdue',   label: locale.value === 'ar' ? 'أيام التأخر' : 'Days overdue' },
])

const summaryCards = computed(() => [
  {
    key: 'total_overdue',
    label: locale.value === 'ar' ? 'إجمالي المتأخر' : 'Total overdue',
    value: formatMoney(overview.value?.total_overdue ?? 0),
    icon: 'i-lucide-banknote',
    iconColor: 'text-danger-500',
    tint: 'bg-danger-500',
  },
  {
    key: 'invoices',
    label: locale.value === 'ar' ? 'الفواتير المتأخرة' : 'Overdue invoices',
    value: String(overview.value?.total_overdue_invoices ?? 0),
    icon: 'i-lucide-file-warning',
    iconColor: 'text-warning-500',
    tint: 'bg-warning-500',
  },
  {
    key: 'avg_days',
    label: locale.value === 'ar' ? 'متوسط التأخر' : 'Avg days late',
    value: String(overview.value?.avg_days_overdue ?? 0),
    icon: 'i-lucide-clock',
    iconColor: 'text-info-500',
    tint: 'bg-info-500',
  },
  {
    key: 'clients',
    label: locale.value === 'ar' ? 'العملاء المتأخرون' : 'Overdue clients',
    value: String(overview.value?.overdue_clients_count ?? 0),
    icon: 'i-lucide-users',
    iconColor: 'text-orange-500',
    tint: 'bg-orange-500',
  },
])

/**
 * Day-bucket coloring matches the aging report's bucket scheme — green
 * for current/recent, red for 90+. The accountant's eye learns the same
 * legend across both pages.
 */
function bucketColor(days: number | null | undefined) {
  const d = Number(days ?? 0)
  if (d <= 30) return 'green'
  if (d <= 60) return 'blue'
  if (d <= 90) return 'orange'
  return 'red'
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

async function load() {
  loading.value = true
  try {
    overview.value = await collectionsService().overview?.() ?? null
  } catch (e: any) {
    overview.value = null
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل البيانات' : 'Failed to load collections data'))
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
