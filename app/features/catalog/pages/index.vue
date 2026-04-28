<template>
  <FeatureBoundary id="catalog">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-package"
        :title="locale === 'ar' ? 'الكتالوج' : 'Catalog'"
        :subtitle="locale === 'ar'
          ? 'بنود الفواتير المحفوظة لكل عميل ومورد.'
          : 'Saved billable items across clients and vendors.'"
      />

      <!-- Tabs: clients / vendors -->
      <div class="border-b border-neutral-200 dark:border-neutral-800 mb-4">
        <nav class="-mb-px flex gap-4" :aria-label="locale === 'ar' ? 'تبويب الكتالوج' : 'Catalog tabs'">
          <button
            type="button"
            class="catalog-tab"
            :class="activeTab === 'clients' && 'catalog-tab--active'"
            @click="activeTab = 'clients'"
          >
            <UIcon name="i-lucide-users" class="w-3.5 h-3.5" />
            {{ locale === 'ar' ? 'بنود العملاء' : 'Client Items' }}
            <span v-if="clientTotal" class="catalog-tab-count">{{ clientTotal }}</span>
          </button>
          <button
            type="button"
            class="catalog-tab"
            :class="activeTab === 'vendors' && 'catalog-tab--active'"
            @click="activeTab = 'vendors'"
          >
            <UIcon name="i-lucide-truck" class="w-3.5 h-3.5" />
            {{ locale === 'ar' ? 'بنود الموردين' : 'Vendor Items' }}
            <span v-if="vendorTotal" class="catalog-tab-count">{{ vendorTotal }}</span>
          </button>
        </nav>
      </div>

      <!-- Client items tab -->
      <div v-show="activeTab === 'clients'">
        <Can :perm="PERMISSIONS.MANAGE_CLIENTS">
          <template #fallback>
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
              <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
              </div>
              <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
                {{ locale === 'ar' ? 'لا تملك صلاحية إدارة العملاء' : 'No client management access' }}
              </p>
            </div>
          </template>
          <UiDataTable
            :columns="clientColumns"
            :rows="clientRows"
            :loading="clientLoading"
            :exportable="true"
            :current-page="clientCurrentPage"
            :total-pages="clientLastPage"
            :total="clientTotal"
            :per-page="clientPerPage"
            empty-icon="i-lucide-package"
            :empty-title="locale === 'ar' ? 'لا توجد بنود محفوظة' : 'No saved items yet'"
            :empty-description="locale === 'ar'
              ? 'افتح أي عميل وأضف بنود متكررة لتسريع إنشاء الفواتير.'
              : 'Open a client and save recurring items to speed up invoice entry.'"
            @row-click="(row: any) => row.client?.id && navigateTo(`/clients/${row.client.id}`)"
            @page-change="(p: number) => { clientPage = p }"
            @per-page-change="(pp: number) => { clientPerPage = pp; clientPage = 1 }"
          >
            <template #header>
              <div class="flex items-center gap-2 flex-1 flex-wrap min-w-0">
                <UiSearchInput
                  v-model="clientSearchInput"
                  class="flex-1 min-w-[200px] max-w-xs"
                  :placeholder="locale === 'ar' ? 'بحث بالاسم أو الوصف...' : 'Search by name or description...'"
                />
                <UiFilterDropdown
                  v-model="clientActiveFilter"
                  :options="activeOptions"
                  :all-label="locale === 'ar' ? 'الكل' : 'All'"
                />
              </div>
            </template>

            <template #cell-name="{ row }">
              <div class="flex items-start gap-2.5 min-w-0">
                <UIcon name="i-lucide-package" class="w-4 h-4 mt-0.5 flex-shrink-0" :class="row.is_active ? 'text-info-500' : 'text-neutral-400'" />
                <div class="min-w-0">
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ row.name }}</p>
                  <p v-if="row.description" class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{{ row.description }}</p>
                </div>
              </div>
            </template>

            <template #cell-client="{ row }">
              <NuxtLink
                v-if="row.client"
                :to="`/clients/${row.client.id}`"
                class="text-sm text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 truncate"
                @click.stop
              >
                {{ row.client.name }}
              </NuxtLink>
              <span v-else class="text-sm text-neutral-400">—</span>
            </template>

            <template #cell-unit_price="{ value }">
              <span class="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-0 tabular-nums" dir="ltr">
                {{ formatMoney(value) }}
              </span>
            </template>

            <template #cell-default_vat_rate="{ value }">
              <span v-if="value != null" class="font-mono text-xs text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">
                {{ Number(value).toFixed(0) }}%
              </span>
              <span v-else class="text-xs text-neutral-400">—</span>
            </template>

            <template #cell-default_account="{ row }">
              <span v-if="row.default_account" class="font-mono text-xs text-neutral-700 dark:text-neutral-200" dir="ltr">
                {{ row.default_account.code }}
              </span>
              <span v-else class="text-xs text-neutral-400">—</span>
            </template>

            <template #cell-last_used_at="{ value }">
              <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ formatRelative(value) }}</span>
            </template>

            <template #cell-is_active="{ value }">
              <UiBadge :color="value ? 'green' : 'gray'" dot>
                {{ value
                  ? (locale === 'ar' ? 'نشط' : 'Active')
                  : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
              </UiBadge>
            </template>
          </UiDataTable>
        </Can>
      </div>

      <!-- Vendor items tab -->
      <div v-show="activeTab === 'vendors'">
        <Can :perm="PERMISSIONS.MANAGE_VENDORS">
          <template #fallback>
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
              <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
              </div>
              <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
                {{ locale === 'ar' ? 'لا تملك صلاحية إدارة الموردين' : 'No vendor management access' }}
              </p>
            </div>
          </template>
          <UiDataTable
            :columns="vendorColumns"
            :rows="vendorRows"
            :loading="vendorLoading"
            :exportable="true"
            :current-page="vendorCurrentPage"
            :total-pages="vendorLastPage"
            :total="vendorTotal"
            :per-page="vendorPerPage"
            empty-icon="i-lucide-package"
            :empty-title="locale === 'ar' ? 'لا توجد بنود محفوظة' : 'No saved items yet'"
            :empty-description="locale === 'ar'
              ? 'افتح أي مورد وأضف بنود متكررة لتسريع إدخال الفواتير.'
              : 'Open a vendor and save recurring items to speed up bill entry.'"
            @row-click="(row: any) => row.vendor?.id && navigateTo(`/vendors/${row.vendor.id}`)"
            @page-change="(p: number) => { vendorPage = p }"
            @per-page-change="(pp: number) => { vendorPerPage = pp; vendorPage = 1 }"
          >
            <template #header>
              <div class="flex items-center gap-2 flex-1 flex-wrap min-w-0">
                <UiSearchInput
                  v-model="vendorSearchInput"
                  class="flex-1 min-w-[200px] max-w-xs"
                  :placeholder="locale === 'ar' ? 'بحث بالاسم أو الوصف...' : 'Search by name or description...'"
                />
                <UiFilterDropdown
                  v-model="vendorActiveFilter"
                  :options="activeOptions"
                  :all-label="locale === 'ar' ? 'الكل' : 'All'"
                />
              </div>
            </template>

            <template #cell-name="{ row }">
              <div class="flex items-start gap-2.5 min-w-0">
                <UIcon name="i-lucide-package" class="w-4 h-4 mt-0.5 flex-shrink-0" :class="row.is_active ? 'text-info-500' : 'text-neutral-400'" />
                <div class="min-w-0">
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ row.name }}</p>
                  <p v-if="row.description" class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{{ row.description }}</p>
                </div>
              </div>
            </template>

            <template #cell-vendor="{ row }">
              <NuxtLink
                v-if="row.vendor"
                :to="`/vendors/${row.vendor.id}`"
                class="text-sm text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 truncate"
                @click.stop
              >
                {{ vendorRowName(row.vendor) }}
              </NuxtLink>
              <span v-else class="text-sm text-neutral-400">—</span>
            </template>

            <template #cell-unit_price="{ row }">
              <span class="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-0 tabular-nums" dir="ltr">
                {{ formatMoney(row.unit_price) }}
                <span class="text-[11px] font-normal text-neutral-500 dark:text-neutral-400 ms-1">
                  {{ row.vendor?.currency || 'EGP' }}
                </span>
              </span>
            </template>

            <template #cell-default_vat_rate="{ value }">
              <span v-if="value != null" class="font-mono text-xs text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">
                {{ Number(value).toFixed(0) }}%
              </span>
              <span v-else class="text-xs text-neutral-400">—</span>
            </template>

            <template #cell-default_account="{ row }">
              <span v-if="row.default_account" class="font-mono text-xs text-neutral-700 dark:text-neutral-200" dir="ltr">
                {{ row.default_account.code }}
              </span>
              <span v-else class="text-xs text-neutral-400">—</span>
            </template>

            <template #cell-last_used_at="{ value }">
              <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ formatRelative(value) }}</span>
            </template>

            <template #cell-is_active="{ value }">
              <UiBadge :color="value ? 'green' : 'gray'" dot>
                {{ value
                  ? (locale === 'ar' ? 'نشط' : 'Active')
                  : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
              </UiBadge>
            </template>
          </UiDataTable>
        </Can>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import type { ClientCatalogParams, VendorCatalogParams } from '~/features/catalog/services/catalogService'
import { vendorDisplayName } from '~/features/vendors/services/vendorService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const route = useRoute()
const router = useRouter()

// Persist the active tab in the query string so a refresh / share-link
// keeps the user where they were. Default to clients (most-used side).
const initialTab = route.query.tab === 'vendors' ? 'vendors' : 'clients'
const activeTab = ref<'clients' | 'vendors'>(initialTab)
watch(activeTab, (t) => {
  router.replace({ query: { ...route.query, tab: t === 'clients' ? undefined : t } })
})

// --- Client catalog state ---
const clientSearchInput = ref('')
const clientSearch = refDebounced(clientSearchInput, 400)
const clientActiveFilter = ref('')
const clientPage = ref(1)
const clientPerPage = ref(25)

watch([clientSearch, clientActiveFilter], () => { clientPage.value = 1 })

const clientParams = computed<ClientCatalogParams>(() => ({
  search: clientSearch.value || undefined,
  is_active: clientActiveFilter.value === '' ? undefined : clientActiveFilter.value === 'true',
  page: clientPage.value,
  per_page: clientPerPage.value,
}))

const { data: clientData, loading: clientLoading } = useClientCatalogList(clientParams)
const clientRows = computed(() => clientData.value?.data ?? [])
const clientTotal = computed(() => clientData.value?.meta?.total ?? 0)
const clientCurrentPage = computed(() => clientData.value?.meta?.current_page ?? 1)
const clientLastPage = computed(() => clientData.value?.meta?.last_page ?? 1)

// --- Vendor catalog state ---
const vendorSearchInput = ref('')
const vendorSearch = refDebounced(vendorSearchInput, 400)
const vendorActiveFilter = ref('')
const vendorPage = ref(1)
const vendorPerPage = ref(25)

watch([vendorSearch, vendorActiveFilter], () => { vendorPage.value = 1 })

const vendorParams = computed<VendorCatalogParams>(() => ({
  search: vendorSearch.value || undefined,
  is_active: vendorActiveFilter.value === '' ? undefined : vendorActiveFilter.value === 'true',
  page: vendorPage.value,
  per_page: vendorPerPage.value,
}))

const { data: vendorData, loading: vendorLoading } = useVendorCatalogList(vendorParams)
const vendorRows = computed(() => vendorData.value?.data ?? [])
const vendorTotal = computed(() => vendorData.value?.meta?.total ?? 0)
const vendorCurrentPage = computed(() => vendorData.value?.meta?.current_page ?? 1)
const vendorLastPage = computed(() => vendorData.value?.meta?.last_page ?? 1)

// --- Columns + helpers ---
const activeOptions = computed(() => [
  { value: 'true',  label: locale.value === 'ar' ? 'نشط' : 'Active' },
  { value: 'false', label: locale.value === 'ar' ? 'غير نشط' : 'Inactive' },
])

const clientColumns = computed(() => [
  { key: 'name',             label: locale.value === 'ar' ? 'البند' : 'Item' },
  { key: 'client',           label: locale.value === 'ar' ? 'العميل' : 'Client' },
  { key: 'unit_price',       label: locale.value === 'ar' ? 'السعر' : 'Price', class: 'text-end' },
  { key: 'default_vat_rate', label: 'VAT', class: 'text-end' },
  { key: 'default_account',  label: locale.value === 'ar' ? 'حساب' : 'Account' },
  { key: 'last_used_at',     label: locale.value === 'ar' ? 'آخر استخدام' : 'Last used' },
  { key: 'is_active',        label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

const vendorColumns = computed(() => [
  { key: 'name',             label: locale.value === 'ar' ? 'البند' : 'Item' },
  { key: 'vendor',           label: locale.value === 'ar' ? 'المورد' : 'Vendor' },
  { key: 'unit_price',       label: locale.value === 'ar' ? 'السعر' : 'Price', class: 'text-end' },
  { key: 'default_vat_rate', label: 'VAT', class: 'text-end' },
  { key: 'default_account',  label: locale.value === 'ar' ? 'حساب' : 'Account' },
  { key: 'last_used_at',     label: locale.value === 'ar' ? 'آخر استخدام' : 'Last used' },
  { key: 'is_active',        label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

function vendorRowName(v: { name_ar: string | null; name_en: string | null }): string {
  return vendorDisplayName(v as any, locale.value)
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * "Last used" column — backend stores an ISO timestamp; absence is "never"
 * (the recency-tracking observer hasn't been wired to bill/invoice line
 * inserts yet, so most rows will show this until that lands).
 */
function formatRelative(d: string | null | undefined) {
  if (!d) return locale.value === 'ar' ? '—' : 'never'
  const days = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24))
  if (days < 1) return locale.value === 'ar' ? 'اليوم' : 'today'
  if (days === 1) return locale.value === 'ar' ? 'أمس' : 'yesterday'
  if (days < 30) return locale.value === 'ar' ? `منذ ${days} يوم` : `${days}d ago`
  if (days < 365) return locale.value === 'ar' ? `منذ ${Math.floor(days / 30)} شهر` : `${Math.floor(days / 30)}mo ago`
  return locale.value === 'ar' ? `منذ ${Math.floor(days / 365)} سنة` : `${Math.floor(days / 365)}y ago`
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.catalog-tab {
  @apply inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-0 transition-colors;
}
.catalog-tab--active {
  @apply text-primary-700 dark:text-primary-400 border-primary-500;
}
.catalog-tab-count {
  @apply text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300;
}
</style>
