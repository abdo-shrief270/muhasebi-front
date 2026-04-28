<template>
  <FeatureBoundary id="bank-connections">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-link"
        :title="locale === 'ar' ? 'ربط البنوك' : 'Bank Connections'"
        :subtitle="locale === 'ar' ? 'ربط حساباتك لسحب الحركات تلقائياً' : 'Link your bank accounts to sync transactions automatically'"
      >
        <template #actions>
          <UiAppButton
            variant="primary"
            size="sm"
            icon="i-lucide-plus"
            disabled
            :title="locale === 'ar' ? 'قريباً' : 'Coming soon'"
          >
            {{ locale === 'ar' ? 'ربط بنك' : 'Connect Bank' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <Can :perm="PERMISSIONS.MANAGE_ACCOUNTS">
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
        <div v-if="!loading && rows.length > 0" class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'متصلة' : 'Connected' }}
            </p>
            <p class="font-mono text-2xl font-bold tabular-nums text-success-700 dark:text-success-400">{{ activeCount }}</p>
          </div>
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-neutral-300 dark:bg-neutral-700" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'غير متصلة' : 'Disconnected' }}
            </p>
            <p class="font-mono text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">{{ inactiveCount }}</p>
          </div>
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-3">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-info-500" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'آخر مزامنة' : 'Last sync' }}
            </p>
            <p class="text-sm font-bold text-neutral-900 dark:text-neutral-0">{{ lastSyncRelative }}</p>
          </div>
        </div>

        <UiDataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          empty-icon="i-lucide-link"
          :empty-title="locale === 'ar' ? 'لا توجد بنوك مربوطة' : 'No connected banks yet'"
          :empty-description="locale === 'ar'
            ? 'ربط البنوك يسحب الحركات تلقائياً لإجراء التسويات بسرعة. ميزة قادمة.'
            : 'Connect a bank to pull statement lines automatically and reconcile faster. Coming soon.'"
        >
          <template #cell-provider="{ value }">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-7 h-7 rounded-md bg-info-500/10 text-info-700 dark:text-info-300 inline-flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-link-2" class="w-3.5 h-3.5" />
              </div>
              <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">
                {{ providerLabel(value) }}
              </span>
            </div>
          </template>

          <template #cell-bank_name="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ value || '—' }}</span>
          </template>

          <template #cell-last_sync="{ value }">
            <span class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">{{ formatRelative(value) }}</span>
          </template>

          <template #cell-status="{ row }">
            <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
              {{ row.is_active
                ? (locale === 'ar' ? 'متصل' : 'Connected')
                : (locale === 'ar' ? 'غير متصل' : 'Disconnected') }}
            </UiBadge>
          </template>
        </UiDataTable>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const rows = ref<any[]>([])
const loading = ref(true)

const activeCount = computed(() => rows.value.filter(r => r.is_active).length)
const inactiveCount = computed(() => rows.value.length - activeCount.value)

const lastSyncRelative = computed(() => {
  // Most-recent last_sync timestamp across all connections.
  const stamps = rows.value
    .map(r => r.last_sync ? new Date(r.last_sync).getTime() : 0)
    .filter(t => t > 0)
  if (stamps.length === 0) return locale.value === 'ar' ? 'لم تتم' : 'never'
  return formatRelative(new Date(Math.max(...stamps)).toISOString())
})

const columns = computed(() => [
  { key: 'provider',  label: locale.value === 'ar' ? 'المزوِّد' : 'Provider' },
  { key: 'bank_name', label: locale.value === 'ar' ? 'البنك' : 'Bank' },
  { key: 'last_sync', label: locale.value === 'ar' ? 'آخر مزامنة' : 'Last sync' },
  { key: 'status',    label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

const PROVIDER_LABELS: Record<string, string> = {
  plaid: 'Plaid', truelayer: 'TrueLayer', tink: 'Tink', salt_edge: 'Salt Edge', manual: 'Manual',
}
function providerLabel(p: string | null | undefined) {
  if (!p) return '—'
  if (locale.value === 'ar' && p === 'manual') return 'يدوي'
  return PROVIDER_LABELS[p] ?? p
}

function formatRelative(d: string | null | undefined) {
  if (!d) return locale.value === 'ar' ? 'لم تتم' : 'never'
  const minutes = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (minutes < 1) return locale.value === 'ar' ? 'الآن' : 'just now'
  if (minutes < 60) return locale.value === 'ar' ? `منذ ${minutes} دقيقة` : `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return locale.value === 'ar' ? `منذ ${hours} ساعة` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return locale.value === 'ar' ? `منذ ${days} يوم` : `${days}d ago`
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return d
  }
}

async function load() {
  loading.value = true
  try {
    const r: any = await api.get('/bank-connections')
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch (e: any) {
    rows.value = []
    // Backend may not be wired yet — silently fall back to the empty
    // state rather than nag the user. Surface other errors normally.
    if (e?.status && e.status !== 404) {
      toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تحميل البنوك' : 'Failed to load connections'))
    }
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
