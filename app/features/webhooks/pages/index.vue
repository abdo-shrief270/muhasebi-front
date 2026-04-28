<template>
  <FeatureBoundary id="webhooks">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-webhook"
        :title="locale === 'ar' ? 'الويب هوكس' : 'Webhooks'"
        :subtitle="locale === 'ar' ? 'نقاط استقبال الأحداث الصادرة' : 'Outbound event endpoints'"
      />

      <Can :perm="PERMISSIONS.MANAGE_SETTINGS">
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

        <UiDataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          empty-icon="i-lucide-webhook"
          :empty-title="locale === 'ar' ? 'لا توجد ويب هوكس' : 'No webhooks yet'"
          :empty-description="locale === 'ar'
            ? 'اربط نظامك الخارجي ليستقبل أحداث الفواتير والمدفوعات تلقائياً.'
            : 'Hook your external systems up to receive invoice and payment events.'"
        >
          <template #cell-url="{ value }">
            <span class="font-mono text-xs text-neutral-700 dark:text-neutral-200 break-all" dir="ltr">{{ value }}</span>
          </template>

          <template #cell-events="{ row }">
            <UiBadge color="blue" size="sm">
              {{ (row.events ?? []).length }} {{ locale === 'ar' ? 'حدث' : 'events' }}
            </UiBadge>
          </template>

          <template #cell-status="{ row }">
            <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
              {{ row.is_active
                ? (locale === 'ar' ? 'نشط' : 'Active')
                : (locale === 'ar' ? 'معطل' : 'Disabled') }}
            </UiBadge>
          </template>

          <template #cell-created_at="{ value }">
            <span class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>
        </UiDataTable>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { webhooksService } from '~/features/webhooks/services/webhooksService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()

const rows = ref<any[]>([])
const loading = ref(true)

const columns = computed(() => [
  { key: 'url',        label: 'URL' },
  { key: 'events',     label: locale.value === 'ar' ? 'الأحداث' : 'Events' },
  { key: 'status',     label: locale.value === 'ar' ? 'الحالة' : 'Status' },
  { key: 'created_at', label: locale.value === 'ar' ? 'تاريخ الإنشاء' : 'Created' },
])

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
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
    const svc: any = webhooksService()
    const r = typeof svc.list === 'function' ? await svc.list() : { data: [] }
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
