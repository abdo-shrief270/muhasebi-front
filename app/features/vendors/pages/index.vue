<template>
    <FeatureBoundary id="vendors">
      <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
        <UiPageHeader
          icon="i-lucide-truck"
          :title="$t('nav.vendors')"
          :subtitle="totalLabel"
        >
          <template #actions>
            <UiAppButton variant="primary" icon="i-lucide-plus" @click="openCreate">
              {{ locale === 'ar' ? 'مورد جديد' : 'Add Vendor' }}
            </UiAppButton>
          </template>
        </UiPageHeader>

        <Can :perm="PERMISSIONS.MANAGE_VENDORS">
          <template #fallback>
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
              <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
              </div>
              <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
                {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
              </p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">
                {{ locale === 'ar' ? 'تواصل مع مدير الحساب لتفعيل صلاحية إدارة الموردين.' : 'Contact your admin to enable Vendors management.' }}
              </p>
            </div>
          </template>

          <UiDataTable
            :columns="columns"
            :rows="rows"
            :loading="loading"
            :exportable="true"
            :current-page="currentPage"
            :total-pages="lastPage"
            :total="total"
            :per-page="perPage"
            empty-icon="i-lucide-truck"
            :empty-title="locale === 'ar' ? 'لا يوجد موردون' : 'No vendors yet'"
            :empty-description="locale === 'ar' ? 'أضف أول مورد لك.' : 'Add your first vendor to get started.'"
            @row-click="(row: any) => navigateTo(`/vendors/${row.id}`)"
            @page-change="(p: number) => { page = p }"
            @per-page-change="(pp: number) => { perPage = pp; page = 1 }"
            @sort="handleSort"
          >
            <template #header>
              <div class="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                <UiSearchInput
                  v-model="searchInput"
                  class="flex-1 min-w-[200px] max-w-xs"
                  :placeholder="locale === 'ar' ? 'بحث بالاسم أو الرقم الضريبي...' : 'Search by name or TIN...'"
                />
                <UiFilterDropdown
                  v-model="activeFilter"
                  :options="activeOptions"
                  :all-label="locale === 'ar' ? 'الكل' : 'All'"
                />
              </div>
            </template>

            <template #cell-name="{ row }">
              <div class="flex items-center gap-2.5 min-w-0">
                <div
                  class="w-7 h-7 rounded-md bg-info-500/10 text-info-700 dark:text-info-300 inline-flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                >
                  {{ (vendorDisplayName(row, locale) || '?').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">
                    {{ vendorDisplayName(row, locale) }}
                  </p>
                  <p v-if="primaryContactName(row)" class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {{ primaryContactName(row) }}
                  </p>
                </div>
              </div>
            </template>

            <template #cell-tax_id="{ value }">
              <span class="font-mono text-xs text-neutral-600 dark:text-neutral-400" dir="ltr">{{ value || '—' }}</span>
            </template>

            <template #cell-city="{ value }">
              <span class="text-neutral-600 dark:text-neutral-400">{{ value || '—' }}</span>
            </template>

            <template #cell-currency="{ value }">
              <span class="text-xs font-mono text-neutral-500 dark:text-neutral-500">{{ value || 'EGP' }}</span>
            </template>

            <template #cell-is_active="{ row }">
              <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
                {{ row.is_active
                  ? (locale === 'ar' ? 'نشط' : 'Active')
                  : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
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
        </Can>
      </div>

      <!-- Create / edit slideover -->
      <UiSlideOver
        v-model="formOpen"
        :title="editingVendor
          ? (locale === 'ar' ? 'تعديل المورد' : 'Edit Vendor')
          : (locale === 'ar' ? 'مورد جديد' : 'New Vendor')"
      >
        <VendorForm
          ref="formRef"
          :vendor="editingVendor"
          :loading="createMutation.loading.value || updateMutation.loading.value"
          @submit="handleSubmit"
          @cancel="formOpen = false"
        />
      </UiSlideOver>
    </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { vendorDisplayName, type Vendor, type VendorListParams } from '~/features/vendors/services/vendorService'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()
const route = useRoute()
const router = useRouter()

const searchInput = ref('')
const search = refDebounced(searchInput, 400)
const activeFilter = ref('')
const sortBy = ref('name')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)
const perPage = ref(25)

watch([search, activeFilter], () => { page.value = 1 })

// Map the table's display-only `name` sort key to the locale-appropriate
// backend column. Backend has no virtual `name` column.
const apiSortBy = computed(() => {
  if (sortBy.value === 'name') return locale.value === 'ar' ? 'name_ar' : 'name_en'
  return sortBy.value
})

const params = computed<VendorListParams>(() => ({
  search: search.value || undefined,
  is_active: activeFilter.value === '' ? undefined : activeFilter.value === 'true',
  sort_by: apiSortBy.value,
  sort_dir: sortDir.value,
  page: page.value,
  per_page: perPage.value,
}))

const { data, loading } = useVendorsList(params)
const { create: createMutation, update: updateMutation } = useVendorMutations()

const rows = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta.total ?? 0)
const currentPage = computed(() => data.value?.meta.current_page ?? 1)
const lastPage = computed(() => data.value?.meta.last_page ?? 1)

const totalLabel = computed(() => {
  const n = total.value.toLocaleString()
  if (locale.value === 'ar') return `${n} مورد`
  return `${n} ${total.value === 1 ? 'vendor' : 'vendors'}`
})

const formOpen = ref(false)
const editingVendor = ref<Vendor | null>(null)
const formRef = ref<{ applyApiErrors: (e: ApiError) => void; reset: () => void } | null>(null)

const columns = computed(() => [
  // Sort by the locale-preferred column so the order matches what's displayed.
  { key: 'name', label: locale.value === 'ar' ? 'الاسم' : 'Name', sortable: true },
  { key: 'tax_id',   label: locale.value === 'ar' ? 'الرقم الضريبي' : 'Tax ID' },
  { key: 'city',     label: locale.value === 'ar' ? 'المدينة' : 'City', sortable: true },
  { key: 'currency', label: locale.value === 'ar' ? 'العملة' : 'Currency' },
  { key: 'is_active', label: $t('common.status') },
  { key: 'actions',  label: '', class: 'w-12' },
])

const activeOptions = computed(() => [
  { value: 'true',  label: locale.value === 'ar' ? 'نشط' : 'Active' },
  { value: 'false', label: locale.value === 'ar' ? 'غير نشط' : 'Inactive' },
])

function primaryContactName(v: Vendor): string {
  const c = (v.contacts ?? []).find(x => x.is_primary) ?? (v.contacts ?? [])[0]
  return c?.name ?? ''
}

function handleSort(key: string, dir: 'asc' | 'desc') {
  sortBy.value = key
  sortDir.value = dir
}

function openCreate() {
  editingVendor.value = null
  formOpen.value = true
}

function openEdit(vendor: Vendor) {
  editingVendor.value = vendor
  formOpen.value = true
}

async function handleSubmit(form: Record<string, unknown>) {
  try {
    if (editingVendor.value) {
      await updateMutation.mutate({ id: editingVendor.value.id, form })
      toastStore.success(locale.value === 'ar' ? 'تم تحديث المورد' : 'Vendor updated')
    } else {
      await createMutation.mutate(form)
      toastStore.success(locale.value === 'ar' ? 'تم إضافة المورد' : 'Vendor created')
    }
    formOpen.value = false
  } catch (e) {
    const err = e as ApiError
    formRef.value?.applyApiErrors(err)
    toastStore.error(err.message || 'Error')
  }
}

// Auto-open the create slideover when arriving with `?new=1` (from topbar
// quick-create). Strip the query so refresh / back-nav doesn't retrigger.
onMounted(() => {
  if (route.query.new === '1') {
    openCreate()
    router.replace({ query: { ...route.query, new: undefined } })
  }
})
</script>
