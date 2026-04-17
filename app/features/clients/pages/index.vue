<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="$t('nav.clients')" :subtitle="locale === 'ar' ? `${meta.total} عميل` : `${meta.total} clients`">
        <template #actions>
          <UiAppButton variant="primary" @click="openCreate">
            {{ locale === 'ar' ? '+ إضافة عميل' : '+ Add Client' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="clients"
        :loading="loading"
        :exportable="true"
        :current-page="meta.current_page"
        :total-pages="meta.last_page"
        :sort-by="sortBy"
        :sort-dir="sortDir"
        :empty-title="locale === 'ar' ? 'لا يوجد عملاء' : 'No clients yet'"
        :empty-description="locale === 'ar' ? 'أضف أول عميل لك' : 'Add your first client'"
        @row-click="(row) => navigateTo(`/clients/${row.id}`)"
        @page-change="(p) => { page = p; load() }"
        @sort="handleSort"
      >
        <template #header>
          <div class="flex items-center gap-3 flex-1 flex-wrap">
            <UiSearchInput v-model="search" class="flex-1 min-w-[200px]" @update:model-value="debouncedLoad" />
            <UiFilterDropdown
              v-model="statusFilter"
              :options="statusOptions"
              :all-label="$t('common.all')"
              @update:model-value="load"
            />
          </div>
        </template>

        <template #cell-name="{ row }">
          <div>
            <p class="font-medium text-gray-800">{{ row.name }}</p>
            <p v-if="row.trade_name" class="text-xs text-gray-400">{{ row.trade_name }}</p>
          </div>
        </template>

        <template #cell-tax_id="{ value }">
          <span class="font-mono text-xs text-gray-500" dir="ltr">{{ value || '-' }}</span>
        </template>

        <template #cell-city="{ value }">
          <span class="text-gray-500">{{ value || '-' }}</span>
        </template>

        <template #cell-is_active="{ row }">
          <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
            {{ row.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
          </UiBadge>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1" @click.stop>
            <button
              @click="openEdit(row)"
              class="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition"
              :title="$t('common.edit')"
            >
              &#9998;
            </button>
          </div>
        </template>
      </UiDataTable>

      <!-- Create/Edit SlideOver -->
      <UiSlideOver v-model="formOpen" :title="editingClient ? (locale === 'ar' ? 'تعديل العميل' : 'Edit Client') : (locale === 'ar' ? 'إضافة عميل' : 'Add Client')">
        <ClientForm
          :client="editingClient"
          :loading="formLoading"
          @submit="handleSubmit"
          @cancel="formOpen = false"
        />
      </UiSlideOver>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { Client, ClientForm as ClientFormType } from '~/shared/types/client'

definePageMeta({ layout: false })

const { locale } = useI18n()
const { clients, loading, meta, fetchClients, createClient, updateClient } = useClients()
const toastStore = useToastStore()

const search = ref('')
const statusFilter = ref('')
const sortBy = ref('name')
const sortDir = ref<'asc' | 'desc'>('asc')
const page = ref(1)

const formOpen = ref(false)
const formLoading = ref(false)
const editingClient = ref<Client | null>(null)

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

function load() {
  fetchClients({
    search: search.value,
    is_active: statusFilter.value || undefined,
    sort_by: sortBy.value,
    sort_dir: sortDir.value,
    page: page.value,
  })
}

const debouncedLoad = useDebounceFn(() => {
  page.value = 1
  load()
}, 400)

function handleSort(key: string, dir: 'asc' | 'desc') {
  sortBy.value = key
  sortDir.value = dir
  load()
}

function openCreate() {
  editingClient.value = null
  formOpen.value = true
}

function openEdit(client: Client) {
  editingClient.value = client
  formOpen.value = true
}

async function handleSubmit(form: Partial<ClientFormType>) {
  formLoading.value = true
  try {
    if (editingClient.value) {
      await updateClient(editingClient.value.id, form)
      toastStore.success(locale.value === 'ar' ? 'تم تحديث العميل' : 'Client updated')
    } else {
      await createClient(form)
      toastStore.success(locale.value === 'ar' ? 'تم إضافة العميل' : 'Client created')
    }
    formOpen.value = false
    load()
  } catch (e: any) {
    toastStore.error(e.data?.message || 'Error')
  } finally {
    formLoading.value = false
  }
}

onMounted(load)
</script>
