<template>
  <FeatureBoundary id="engagement-working-papers">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-file-text"
        :title="locale === 'ar' ? 'أوراق العمل' : 'Working Papers'"
        :subtitle="locale === 'ar' ? 'وثائق المراجعة والمسودات المرفقة بالارتباطات' : 'Audit and review documents linked to engagements'"
      />

      <Can :perm="PERMISSIONS.MANAGE_ENGAGEMENTS">
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
          empty-icon="i-lucide-file-text"
          :empty-title="locale === 'ar' ? 'لا توجد أوراق عمل' : 'No working papers yet'"
          :empty-description="locale === 'ar' ? 'تظهر هنا مسودات المراجعة والوثائق المرفقة بالارتباطات.' : 'Audit drafts and documents attached to engagements show up here.'"
          @page-change="onPage"
        >
          <template #cell-engagement_ref="{ value }">
            <span class="font-mono text-xs text-primary-700 dark:text-primary-400">{{ value }}</span>
          </template>

          <template #cell-title="{ value }">
            <span class="text-sm text-neutral-900 dark:text-neutral-0">{{ value || '—' }}</span>
          </template>

          <template #cell-type="{ value }">
            <UiBadge color="blue" size="sm">{{ value || '—' }}</UiBadge>
          </template>

          <template #cell-author="{ value }">
            <span class="text-xs text-neutral-600 dark:text-neutral-400">{{ value }}</span>
          </template>

          <template #cell-updated_at="{ value }">
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

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const rows = ref<any[]>([])
const loading = ref(true)
const page = ref(1)
const totalPages = ref(1)

const columns = computed(() => [
  { key: 'engagement_ref', label: locale.value === 'ar' ? 'الارتباط' : 'Engagement' },
  { key: 'title',          label: locale.value === 'ar' ? 'العنوان' : 'Title' },
  { key: 'type',           label: locale.value === 'ar' ? 'النوع' : 'Type' },
  { key: 'author',         label: locale.value === 'ar' ? 'المعِد' : 'Author' },
  { key: 'updated_at',     label: locale.value === 'ar' ? 'آخر تحديث' : 'Updated' },
])

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return d
  }
}

async function load() {
  loading.value = true
  try {
    const r: any = await api.get(`/engagements/working-papers?page=${page.value}&per_page=25`).catch(() => ({ data: [], meta: { last_page: 1 } }))
    rows.value = (r.data ?? []).map((w: any) => ({
      ...w,
      engagement_ref: w.engagement?.reference ?? '—',
      author: w.author?.name ?? '—',
    }))
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
