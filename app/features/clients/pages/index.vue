<template>
  <div>
      <FeatureBoundary id="clients">
      <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-users"
        :title="$t('nav.clients')"
        :subtitle="locale === 'ar' ? `${total} عميل` : `${total.toLocaleString()} clients`"
      >
        <template #actions>
          <UiAppButton variant="primary" icon="i-lucide-plus" @click="openCreate">
            {{ locale === 'ar' ? 'إضافة عميل' : 'Add Client' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="rows"
        :loading="loading"
        :exportable="true"
        :current-page="currentPage"
        :total-pages="lastPage"
        :total="total"
        :per-page="perPage"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        empty-icon="i-lucide-users"
        :empty-title="locale === 'ar' ? 'لا يوجد عملاء' : 'No clients yet'"
        :empty-description="locale === 'ar' ? 'أضف أول عميل لك' : 'Add your first client'"
        @row-click="(row: any) => navigateTo(`/clients/${row.id}`)"
        @page-change="(p: number) => { page = p }"
        @per-page-change="(pp: number) => { perPage = pp; page = 1 }"
        @sort="handleSort"
      >
        <template #header>
          <div class="flex items-center gap-3 flex-1 flex-wrap">
            <UiSearchInput v-model="searchInput" class="flex-1 min-w-[200px]" />
            <UiFilterDropdown
              v-model="statusFilter"
              :options="statusOptions"
              :all-label="$t('common.all')"
            />
          </div>
        </template>

        <template #cell-name="{ row }">
          <div class="flex items-center gap-2.5 min-w-0">
            <div
              class="w-7 h-7 rounded-md bg-primary-500/10 text-primary-700 dark:text-primary-300 inline-flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
            >
              {{ row.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ row.name }}</p>
              <p v-if="row.trade_name" class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{{ row.trade_name }}</p>
            </div>
          </div>
        </template>

        <template #cell-tax_id="{ value }">
          <span class="font-mono text-xs text-neutral-600 dark:text-neutral-400" dir="ltr">{{ value || '—' }}</span>
        </template>

        <template #cell-city="{ value }">
          <span class="text-neutral-600 dark:text-neutral-400">{{ value || '—' }}</span>
        </template>

        <template #cell-is_active="{ row }">
          <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
            {{ row.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
          </UiBadge>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center justify-end gap-0.5" @click.stop>
            <button
              type="button"
              @click="openEdit(row)"
              class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-primary-600 hover:bg-primary-500/10 dark:hover:text-primary-400 transition-colors"
              :title="$t('common.edit')"
            >
              <UIcon name="i-lucide-pencil" class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </UiDataTable>
      </div>

      <UiSlideOver v-model="formOpen" :title="editingClient ? (locale === 'ar' ? 'تعديل العميل' : 'Edit Client') : (locale === 'ar' ? 'إضافة عميل' : 'Add Client')">
        <ClientForm
          ref="formRef"
          :client="editingClient"
          :loading="createMutation.loading.value || updateMutation.loading.value"
          @submit="handleSubmit"
          @cancel="formOpen = false"
        />
      </UiSlideOver>
      </FeatureBoundary>
  </div>
</template>

<script setup lang="ts">
import type { Client, ClientForm as ClientFormType } from '~/shared/types/client'
import type { ApiError } from '~/core/api/errors'
import type { ClientListParams } from '~/features/clients/services/clientService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()
const route = useRoute()
const router = useRouter()

const searchInput = ref('')
const search = refDebounced(searchInput, 400)
const statusFilter = ref('')
const sortBy = ref('name')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)
const perPage = ref(25)

watch([search, statusFilter], () => { page.value = 1 })

const params = computed<ClientListParams>(() => ({
  search: search.value || undefined,
  is_active: statusFilter.value === '' ? undefined : statusFilter.value === 'true',
  sort_by: sortBy.value,
  sort_dir: sortDir.value,
  page: page.value,
  per_page: perPage.value,
}))

const { data, loading } = useClientsList(params)
const { create: createMutation, update: updateMutation } = useClientMutations()

const rows = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta.total ?? 0)
const currentPage = computed(() => data.value?.meta.current_page ?? 1)
const lastPage = computed(() => data.value?.meta.last_page ?? 1)

const formOpen = ref(false)
const editingClient = ref<Client | null>(null)
const formRef = ref<{ applyApiErrors: (e: ApiError) => void; reset: () => void } | null>(null)

const columns = computed(() => [
  { key: 'name', label: locale.value === 'ar' ? 'الاسم' : 'Name', sortable: true },
  { key: 'tax_id', label: locale.value === 'ar' ? 'الرقم الضريبي' : 'Tax ID' },
  { key: 'city', label: locale.value === 'ar' ? 'المدينة' : 'City', sortable: true },
  { key: 'is_active', label: $t('common.status') },
  { key: 'actions', label: '', class: 'w-16' },
])

const statusOptions = computed(() => [
  { value: 'true', label: locale.value === 'ar' ? 'نشط' : 'Active' },
  { value: 'false', label: locale.value === 'ar' ? 'غير نشط' : 'Inactive' },
])

function handleSort(key: string, dir: 'asc' | 'desc') {
  sortBy.value = key
  sortDir.value = dir
}

function openCreate() {
  editingClient.value = null
  formOpen.value = true
}

// Open the create slideover automatically when arriving with `?new=1` (e.g.
// from the topbar's Quick-create menu). We strip the query param afterwards
// so a refresh / back-nav doesn't keep retriggering the modal.
onMounted(() => {
  if (route.query.new === '1') {
    openCreate()
    router.replace({ query: { ...route.query, new: undefined } })
  }
})

function openEdit(client: Client) {
  editingClient.value = client
  formOpen.value = true
}

async function handleSubmit(form: Partial<ClientFormType>) {
  try {
    if (editingClient.value) {
      await updateMutation.mutate({ id: editingClient.value.id, form })
      toastStore.success(locale.value === 'ar' ? 'تم تحديث العميل' : 'Client updated')
    } else {
      await createMutation.mutate(form)
      toastStore.success(locale.value === 'ar' ? 'تم إضافة العميل' : 'Client created')
    }
    formOpen.value = false
  } catch (e) {
    const err = e as ApiError
    formRef.value?.applyApiErrors(err)
    toastStore.error(err.message || 'Error')
  }
}
</script>
