<template>
  <FeatureBoundary id="cost-centers">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-target"
        :title="locale === 'ar' ? 'مراكز التكلفة' : 'Cost Centers'"
        :subtitle="locale === 'ar' ? 'تخصيص النفقات على وحدات الأعمال' : 'Allocate expenses across business units'"
      />

      <Can :perm="PERMISSIONS.MANAGE_COST_CENTERS">
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
          :current-page="page"
          :total-pages="totalPages"
          empty-icon="i-lucide-target"
          :empty-title="locale === 'ar' ? 'لا توجد مراكز تكلفة' : 'No cost centers yet'"
          :empty-description="locale === 'ar'
            ? 'أنشئ مركز تكلفة لتقسيم المصروفات على الأقسام أو المشاريع.'
            : 'Create a cost center to track expenses by department or project.'"
          @page-change="onPage"
        >
          <template #cell-code="{ value }">
            <span class="font-mono text-xs font-semibold text-primary-700 dark:text-primary-400" dir="ltr">{{ value }}</span>
          </template>

          <template #cell-name="{ value }">
            <span class="text-sm text-neutral-900 dark:text-neutral-0">{{ value || '—' }}</span>
          </template>

          <template #cell-parent_name="{ value }">
            <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ value || '—' }}</span>
          </template>
        </UiDataTable>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { costCenterService } from '~/features/cost-centers/services/costCenterService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()

const rows = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)

const columns = computed(() => [
  { key: 'code',        label: locale.value === 'ar' ? 'الكود' : 'Code' },
  { key: 'name',        label: locale.value === 'ar' ? 'الاسم' : 'Name' },
  { key: 'parent_name', label: locale.value === 'ar' ? 'المركز الرئيسي' : 'Parent' },
])

async function load() {
  loading.value = true
  try {
    const svc: any = costCenterService()
    const r = typeof svc.list === 'function' ? await svc.list({ page: page.value, per_page: 25 }) : { data: [], meta: { last_page: 1 } }
    rows.value = (r.data ?? []).map((c: any) => ({ ...c, parent_name: c.parent?.name ?? '—' }))
    totalPages.value = r.meta?.last_page ?? 1
  } catch {
    rows.value = []
  } finally {
    loading.value = false
  }
}

function onPage(p: number) {
  page.value = p
  load()
}

onMounted(load)
</script>
