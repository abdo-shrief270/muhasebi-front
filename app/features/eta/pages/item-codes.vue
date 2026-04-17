<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="locale === 'ar' ? 'أكواد الأصناف' : 'Item Codes'">
        <template #actions>
          <UiAppButton variant="primary" @click="openCreate">
            {{ locale === 'ar' ? '+ إضافة كود' : '+ Add Code' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="codes"
        :loading="loading"
        :current-page="meta.current_page"
        :total-pages="meta.last_page"
        :empty-title="locale === 'ar' ? 'لا توجد أكواد' : 'No item codes'"
        @page-change="(p) => { page = p; load() }"
      >
        <template #header>
          <UiSearchInput v-model="search" class="flex-1 min-w-[200px]" @update:model-value="debouncedLoad" />
        </template>

        <template #cell-item_code="{ value }">
          <span class="font-mono text-xs text-primary-500 font-semibold" dir="ltr">{{ value }}</span>
        </template>

        <template #cell-code_type="{ value }">
          <UiBadge :color="value === 'GS1' ? 'blue' : 'emerald'">{{ value }}</UiBadge>
        </template>

        <template #cell-is_active="{ row }">
          <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
            {{ row.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
          </UiBadge>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1" @click.stop>
            <button @click="openEdit(row)" class="p-1.5 rounded-lg text-gray-400 hover:text-primary-500 hover:bg-primary-50 transition">&#9998;</button>
            <button @click="handleDelete(row.id)" class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition">&#10005;</button>
          </div>
        </template>
      </UiDataTable>

      <!-- Create/Edit SlideOver -->
      <UiSlideOver v-model="formOpen" :title="editing ? (locale === 'ar' ? 'تعديل كود' : 'Edit Code') : (locale === 'ar' ? 'إضافة كود' : 'Add Code')">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'نوع الكود' : 'Code Type' }} *</label>
              <select v-model="form.code_type" required class="input-field">
                <option value="EGS">EGS</option>
                <option value="GS1">GS1</option>
              </select>
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'الكود' : 'Item Code' }} *</label>
              <input v-model="form.item_code" type="text" required class="input-field" dir="ltr" />
            </div>
          </div>
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'الوصف' : 'Description' }} *</label>
            <input v-model="form.description" type="text" required class="input-field" />
          </div>
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'الوصف بالعربية' : 'Arabic Description' }}</label>
            <input v-model="form.description_ar" type="text" class="input-field" />
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'وحدة القياس' : 'Unit Type' }}</label>
              <input v-model="form.unit_type" type="text" class="input-field" dir="ltr" placeholder="EA" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'نوع الضريبة' : 'Tax Type' }}</label>
              <input v-model="form.default_tax_type" type="text" class="input-field" dir="ltr" placeholder="T1" />
            </div>
            <div>
              <label class="form-label">{{ locale === 'ar' ? 'نوع فرعي' : 'Subtype' }}</label>
              <input v-model="form.default_tax_subtype" type="text" class="input-field" dir="ltr" placeholder="V009" />
            </div>
          </div>
          <div class="flex gap-3 pt-4 border-t border-gray-100">
            <UiAppButton type="submit" variant="primary" :loading="formLoading">
              {{ editing ? $t('common.save') : $t('common.create') }}
            </UiAppButton>
            <UiAppButton variant="outline" @click="formOpen = false">{{ $t('common.cancel') }}</UiAppButton>
          </div>
        </form>
      </UiSlideOver>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { EtaItemCode } from '~/features/eta/composables/useEta'

definePageMeta({ layout: false })
const { locale } = useI18n()
const { getItemCodes, createItemCode, updateItemCode, deleteItemCode } = useEta()
const toastStore = useToastStore()

const codes = ref<EtaItemCode[]>([])
const loading = ref(true)
const meta = ref({ current_page: 1, last_page: 1 })
const search = ref('')
const page = ref(1)
const formOpen = ref(false)
const formLoading = ref(false)
const editing = ref<EtaItemCode | null>(null)

const form = reactive({
  code_type: 'EGS', item_code: '', description: '', description_ar: '',
  unit_type: 'EA', default_tax_type: 'T1', default_tax_subtype: 'V009',
})

const columns = computed(() => [
  { key: 'item_code', label: locale.value === 'ar' ? 'الكود' : 'Code' },
  { key: 'code_type', label: locale.value === 'ar' ? 'النوع' : 'Type' },
  { key: 'description', label: locale.value === 'ar' ? 'الوصف' : 'Description' },
  { key: 'unit_type', label: locale.value === 'ar' ? 'الوحدة' : 'Unit' },
  { key: 'is_active', label: locale.value === 'ar' ? 'الحالة' : 'Status' },
  { key: 'actions', label: '', class: 'w-20' },
])

async function load() {
  loading.value = true
  try {
    const data = await getItemCodes({ search: search.value, page: page.value })
    codes.value = data.data
    meta.value = data.meta || { current_page: 1, last_page: 1 }
  } catch { codes.value = [] }
  finally { loading.value = false }
}

const debouncedLoad = useDebounceFn(() => { page.value = 1; load() }, 400)

function openCreate() {
  editing.value = null
  Object.assign(form, { code_type: 'EGS', item_code: '', description: '', description_ar: '', unit_type: 'EA', default_tax_type: 'T1', default_tax_subtype: 'V009' })
  formOpen.value = true
}

function openEdit(code: EtaItemCode) {
  editing.value = code
  Object.assign(form, { code_type: code.code_type, item_code: code.item_code, description: code.description, description_ar: code.description_ar || '', unit_type: code.unit_type, default_tax_type: 'T1', default_tax_subtype: 'V009' })
  formOpen.value = true
}

async function handleSubmit() {
  formLoading.value = true
  try {
    if (editing.value) {
      await updateItemCode(editing.value.id, { ...form })
      toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Updated')
    } else {
      await createItemCode({ ...form })
      toastStore.success(locale.value === 'ar' ? 'تم الإنشاء' : 'Created')
    }
    formOpen.value = false
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { formLoading.value = false }
}

async function handleDelete(id: number) {
  try {
    await deleteItemCode(id)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
}

onMounted(load)
</script>

<style scoped>
.input-field { @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50; }
.form-label { @apply block text-sm font-medium text-gray-600 mb-1; }
</style>
