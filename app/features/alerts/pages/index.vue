<template>
  <FeatureBoundary id="alerts">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-bell-ring"
        :title="locale === 'ar' ? 'قواعد التنبيه' : 'Alert Rules'"
        :subtitle="locale === 'ar' ? 'تنبيهات آلية على أحداث مالية' : 'Automated alerts on financial events'"
      />

      <Can :perm="PERMISSIONS.MANAGE_ALERTS">
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
          empty-icon="i-lucide-bell-ring"
          :empty-title="locale === 'ar' ? 'لا توجد قواعد تنبيه' : 'No alert rules yet'"
          :empty-description="locale === 'ar'
            ? 'أنشئ قاعدة لتلقي إشعار تلقائي عند وقوع حدث مالي معيّن.'
            : 'Create a rule to get notified when a specific financial event happens.'"
        >
          <template #cell-status="{ row }">
            <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
              {{ row.is_active
                ? (locale === 'ar' ? 'مفعَّل' : 'Enabled')
                : (locale === 'ar' ? 'معطل' : 'Disabled') }}
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
import { alertRuleService } from '~/features/alerts/services/alertRuleService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()

const rows = ref<any[]>([])
const loading = ref(true)

const columns = computed(() => [
  { key: 'name',       label: locale.value === 'ar' ? 'الاسم' : 'Name' },
  { key: 'event_type', label: locale.value === 'ar' ? 'نوع الحدث' : 'Event' },
  { key: 'channel',    label: locale.value === 'ar' ? 'القناة' : 'Channel' },
  { key: 'status',     label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

async function load() {
  loading.value = true
  try {
    const svc: any = alertRuleService()
    const fn = svc.list ?? svc.rules ?? svc.get
    const r = typeof fn === 'function' ? await fn() : { data: [] }
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
