<template>
  <div>
    <NuxtLayout name="dashboard">
      <FeatureBoundary id="clients">
      <!-- Loading -->
      <template v-if="loading">
        <UiLoadingSkeleton :lines="6" :height="24" />
      </template>

      <template v-else-if="client">
        <!-- Header -->
        <div
          v-motion
          :initial="{ opacity: 0, y: -10 }"
          :enter="{ opacity: 1, y: 0 }"
          class="flex items-start justify-between mb-8"
        >
          <div class="flex items-center gap-4">
            <button @click="navigateTo('/clients')" class="text-gray-300 hover:text-gray-500 transition">
              &#8592;
            </button>
            <div>
              <div class="flex items-center gap-3">
                <h1 class="text-2xl font-bold text-gray-800">{{ client.name }}</h1>
                <UiBadge :color="client.is_active ? 'green' : 'gray'" dot>
                  {{ client.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
                </UiBadge>
              </div>
              <p v-if="client.trade_name" class="text-sm text-gray-400 mt-0.5">{{ client.trade_name }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UiAppButton variant="outline" size="sm" @click="handleToggleActive">
              {{ client.is_active ? (locale === 'ar' ? 'تعطيل' : 'Deactivate') : (locale === 'ar' ? 'تفعيل' : 'Activate') }}
            </UiAppButton>
            <UiAppButton variant="primary" size="sm" @click="editOpen = true">
              {{ $t('common.edit') }}
            </UiAppButton>
            <UiAppButton variant="danger" size="sm" @click="deleteConfirmOpen = true">
              {{ $t('common.delete') }}
            </UiAppButton>
          </div>
        </div>

        <!-- Info cards -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 15 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
          class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8"
        >
          <!-- Contact -->
          <div class="bg-white rounded-2xl border border-gray-100/80 p-5">
            <h4 class="text-xs font-semibold text-gray-400 uppercase mb-3">{{ locale === 'ar' ? 'التواصل' : 'Contact' }}</h4>
            <div class="space-y-2 text-sm">
              <p v-if="client.email"><span class="text-gray-400 me-2">@</span> <span dir="ltr">{{ client.email }}</span></p>
              <p v-if="client.phone"><span class="text-gray-400 me-2">&#9742;</span> <span dir="ltr">{{ client.phone }}</span></p>
              <p v-if="client.contact_person"><span class="text-gray-400 me-2">&#9787;</span> {{ client.contact_person }}</p>
              <p v-if="!client.email && !client.phone" class="text-gray-300">-</p>
            </div>
          </div>

          <!-- Legal -->
          <div class="bg-white rounded-2xl border border-gray-100/80 p-5">
            <h4 class="text-xs font-semibold text-gray-400 uppercase mb-3">{{ locale === 'ar' ? 'قانوني' : 'Legal' }}</h4>
            <div class="space-y-2 text-sm">
              <p v-if="client.tax_id">
                <span class="text-gray-400 me-2">{{ locale === 'ar' ? 'ضريبي' : 'TIN' }}:</span>
                <span class="font-mono" dir="ltr">{{ client.tax_id }}</span>
              </p>
              <p v-if="client.commercial_register">
                <span class="text-gray-400 me-2">{{ locale === 'ar' ? 'سجل' : 'CR' }}:</span>
                <span class="font-mono" dir="ltr">{{ client.commercial_register }}</span>
              </p>
              <p v-if="!client.tax_id && !client.commercial_register" class="text-gray-300">-</p>
            </div>
          </div>

          <!-- Address -->
          <div class="bg-white rounded-2xl border border-gray-100/80 p-5">
            <h4 class="text-xs font-semibold text-gray-400 uppercase mb-3">{{ locale === 'ar' ? 'العنوان' : 'Address' }}</h4>
            <div class="text-sm text-gray-600">
              <p v-if="client.address">{{ client.address }}</p>
              <p v-if="client.city">{{ client.city }}</p>
              <p v-if="!client.address && !client.city" class="text-gray-300">-</p>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <UiTabs v-model="activeTab" :tabs="tabs">
          <Transition name="fade-slide" mode="out-in">
            <div :key="activeTab">
              <!-- Invoices tab -->
              <div v-if="activeTab === 'invoices'" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
                <div class="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                  <span class="text-sm text-gray-500">{{ clientInvoices.length }} {{ locale === 'ar' ? 'فاتورة' : 'invoices' }}</span>
                  <UiAppButton variant="primary" size="sm" @click="navigateTo(`/invoices/create?client_id=${client.id}`)">
                    {{ locale === 'ar' ? '+ فاتورة جديدة' : '+ New Invoice' }}
                  </UiAppButton>
                </div>
                <div v-if="clientInvoices.length > 0" class="divide-y divide-gray-50">
                  <div
                    v-for="inv in clientInvoices"
                    :key="inv.id"
                    @click="navigateTo(`/invoices/${inv.id}`)"
                    class="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50 transition-colors cursor-pointer"
                  >
                    <div>
                      <span class="font-mono text-xs text-primary-500 font-semibold me-2">{{ inv.invoice_number }}</span>
                      <span class="text-sm text-gray-500">{{ inv.date }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="font-mono text-sm font-medium" dir="ltr">{{ Number(inv.total).toLocaleString() }}</span>
                      <UiBadge :color="({ draft: 'gray', sent: 'blue', paid: 'green', partially_paid: 'orange', overdue: 'red', cancelled: 'gray' } as any)[inv.status]" dot>
                        {{ inv.status }}
                      </UiBadge>
                    </div>
                  </div>
                </div>
                <div v-else class="p-8">
                  <UiEmptyState icon="📄" :title="locale === 'ar' ? 'لا توجد فواتير' : 'No invoices'" />
                </div>
              </div>

              <!-- Documents tab -->
              <div v-if="activeTab === 'documents'" class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden">
                <div class="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                  <span class="text-sm text-gray-500">{{ clientDocuments.length }} {{ locale === 'ar' ? 'مستند' : 'documents' }}</span>
                  <UiAppButton variant="primary" size="sm" @click="navigateTo(`/documents?client_id=${client.id}`)">
                    {{ locale === 'ar' ? 'إدارة المستندات' : 'Manage Documents' }}
                  </UiAppButton>
                </div>
                <div v-if="clientDocuments.length > 0" class="divide-y divide-gray-50">
                  <div v-for="doc in clientDocuments" :key="doc.id" class="px-5 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400">
                        {{ doc.mime_type?.includes('pdf') ? 'PDF' : 'FILE' }}
                      </div>
                      <div>
                        <p class="text-sm font-medium text-gray-700">{{ doc.name }}</p>
                        <p class="text-xs text-gray-400">{{ new Date(doc.created_at).toLocaleDateString() }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="p-8">
                  <UiEmptyState icon="📁" :title="locale === 'ar' ? 'لا توجد مستندات' : 'No documents'" />
                </div>
              </div>

              <!-- Notes tab -->
              <div v-if="activeTab === 'notes'" class="bg-white rounded-2xl border border-gray-100/80 p-6">
                <p v-if="client.notes" class="text-gray-600 whitespace-pre-line">{{ client.notes }}</p>
                <UiEmptyState v-else icon="📝" :title="locale === 'ar' ? 'لا توجد ملاحظات' : 'No notes'" />
              </div>
            </div>
          </Transition>
        </UiTabs>
      </template>

      <!-- Edit SlideOver -->
      <UiSlideOver v-model="editOpen" :title="locale === 'ar' ? 'تعديل العميل' : 'Edit Client'">
        <ClientForm
          :client="client"
          :loading="editLoading"
          @submit="handleEdit"
          @cancel="editOpen = false"
        />
      </UiSlideOver>

      <!-- Delete Confirm -->
      <UiConfirmModal
        v-model="deleteConfirmOpen"
        :title="locale === 'ar' ? 'حذف العميل' : 'Delete Client'"
        :description="locale === 'ar' ? 'هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع.' : 'Are you sure you want to delete this client? This cannot be undone.'"
        icon="&#9888;"
        variant="danger"
        :confirm-label="$t('common.delete')"
        :loading="deleteLoading"
        @confirm="handleDelete"
      />
      </FeatureBoundary>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { Client } from '~/shared/types/client'

definePageMeta({ layout: false })

const { locale } = useI18n()
const route = useRoute()
const { getClient, updateClient, deleteClient, toggleActive } = useClients()
const toastStore = useToastStore()

const client = ref<Client | null>(null)
const loading = ref(true)
const activeTab = ref('invoices')
const editOpen = ref(false)
const editLoading = ref(false)
const deleteConfirmOpen = ref(false)
const deleteLoading = ref(false)

const clientInvoices = ref<any[]>([])
const clientDocuments = ref<any[]>([])
const api = useApi()

const tabs = computed(() => [
  { key: 'invoices', label: locale.value === 'ar' ? 'الفواتير' : 'Invoices', count: clientInvoices.value.length },
  { key: 'documents', label: locale.value === 'ar' ? 'المستندات' : 'Documents', count: clientDocuments.value.length },
  { key: 'notes', label: locale.value === 'ar' ? 'ملاحظات' : 'Notes' },
])

async function loadClient() {
  loading.value = true
  try {
    client.value = await getClient(Number(route.params.id))
    // Fetch client invoices and documents in parallel
    const [invRes, docRes] = await Promise.all([
      api.get<{ data: any[] }>(`/invoices?client_id=${route.params.id}&per_page=50`).catch(() => ({ data: [] })),
      api.get<{ data: any[] }>(`/documents?client_id=${route.params.id}&per_page=50`).catch(() => ({ data: [] })),
    ])
    clientInvoices.value = invRes.data || []
    clientDocuments.value = docRes.data || []
  } catch {
    toastStore.error('Client not found')
    navigateTo('/clients')
  } finally {
    loading.value = false
  }
}

async function handleEdit(form: any) {
  editLoading.value = true
  try {
    client.value = await updateClient(client.value!.id, form)
    editOpen.value = false
    toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Updated')
  } catch (e: any) {
    toastStore.error(e.data?.message || 'Error')
  } finally {
    editLoading.value = false
  }
}

async function handleToggleActive() {
  try {
    client.value = await toggleActive(client.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Updated')
  } catch (e: any) {
    toastStore.error(e.data?.message || 'Error')
  }
}

async function handleDelete() {
  deleteLoading.value = true
  try {
    await deleteClient(client.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
    navigateTo('/clients')
  } catch (e: any) {
    toastStore.error(e.data?.message || 'Error')
  } finally {
    deleteLoading.value = false
    deleteConfirmOpen.value = false
  }
}

onMounted(loadClient)
</script>
