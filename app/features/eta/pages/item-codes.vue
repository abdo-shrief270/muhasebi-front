<template>
  <FeatureBoundary id="eta">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-barcode"
        :title="locale === 'ar' ? 'أكواد الأصناف' : 'Item Codes'"
        :subtitle="locale === 'ar' ? 'أكواد GS1/EGS المُعتمدة من مصلحة الضرائب' : 'GS1/EGS codes registered with ETA'"
      >
        <template #actions>
          <UiAppButton variant="primary" size="sm" icon="i-lucide-plus" @click="openCreate">
            {{ locale === 'ar' ? 'إضافة كود' : 'Add Code' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <UiDataTable
        :columns="columns"
        :rows="codes"
        :loading="loading"
        :current-page="meta.current_page"
        :total-pages="meta.last_page"
        empty-icon="i-lucide-barcode"
        :empty-title="locale === 'ar' ? 'لا توجد أكواد' : 'No item codes yet'"
        :empty-description="locale === 'ar'
          ? 'أكواد الأصناف الموحّدة (EGS أو GS1) المطلوبة لإرسال الفواتير لمصلحة الضرائب.'
          : 'Standardized item codes (EGS or GS1) required for ETA invoice submission.'"
        @page-change="(p: number) => { page = p; load() }"
      >
        <template #header>
          <UiSearchInput v-model="search" class="flex-1 min-w-[200px]" @update:model-value="debouncedLoad" />
        </template>

        <template #cell-item_code="{ value }">
          <span class="font-mono text-xs font-semibold text-primary-700 dark:text-primary-400" dir="ltr">{{ value }}</span>
        </template>

        <template #cell-code_type="{ value }">
          <UiBadge :color="value === 'GS1' ? 'blue' : 'green'">{{ value }}</UiBadge>
        </template>

        <template #cell-description="{ value }">
          <span class="text-sm text-neutral-900 dark:text-neutral-0">{{ value }}</span>
        </template>

        <template #cell-unit_type="{ value }">
          <span class="font-mono text-xs text-neutral-500 dark:text-neutral-400" dir="ltr">{{ value || '—' }}</span>
        </template>

        <template #cell-is_active="{ row }">
          <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
            {{ row.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
          </UiBadge>
        </template>

        <template #cell-actions="{ row }">
          <div class="flex items-center gap-1" @click.stop>
            <button
              type="button"
              class="ic-action ic-action-edit"
              :aria-label="locale === 'ar' ? 'تعديل' : 'Edit'"
              @click="openEdit(row)"
            >
              <UIcon name="i-lucide-pencil" class="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              class="ic-action ic-action-delete"
              :aria-label="locale === 'ar' ? 'حذف' : 'Delete'"
              @click="handleDelete(row.id)"
            >
              <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
            </button>
          </div>
        </template>
      </UiDataTable>

      <!-- Create/Edit SlideOver -->
      <UiSlideOver
        v-model="formOpen"
        :title="editing ? (locale === 'ar' ? 'تعديل كود' : 'Edit Code') : (locale === 'ar' ? 'إضافة كود' : 'Add Code')"
      >
        <form @submit.prevent="handleSubmit" class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="ic-label">{{ locale === 'ar' ? 'نوع الكود' : 'Code Type' }} <span class="text-danger-500">*</span></label>
              <div class="relative">
                <select v-model="form.code_type" required class="ic-input">
                  <option value="EGS">EGS</option>
                  <option value="GS1">GS1</option>
                </select>
                <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label class="ic-label">{{ locale === 'ar' ? 'الكود' : 'Item Code' }} <span class="text-danger-500">*</span></label>
              <input v-model="form.item_code" type="text" required class="ic-input font-mono" dir="ltr" />
            </div>
          </div>
          <div>
            <label class="ic-label">{{ locale === 'ar' ? 'الوصف' : 'Description' }} <span class="text-danger-500">*</span></label>
            <input v-model="form.description" type="text" required class="ic-input" />
          </div>
          <div>
            <label class="ic-label">{{ locale === 'ar' ? 'الوصف بالعربية' : 'Arabic Description' }}</label>
            <input v-model="form.description_ar" type="text" class="ic-input" />
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="ic-label">{{ locale === 'ar' ? 'وحدة القياس' : 'Unit Type' }}</label>
              <input v-model="form.unit_type" type="text" class="ic-input font-mono" dir="ltr" placeholder="EA" />
            </div>
            <div>
              <label class="ic-label">{{ locale === 'ar' ? 'نوع الضريبة' : 'Tax Type' }}</label>
              <input v-model="form.default_tax_type" type="text" class="ic-input font-mono" dir="ltr" placeholder="T1" />
            </div>
            <div>
              <label class="ic-label">{{ locale === 'ar' ? 'نوع فرعي' : 'Subtype' }}</label>
              <input v-model="form.default_tax_subtype" type="text" class="ic-input font-mono" dir="ltr" placeholder="V009" />
            </div>
          </div>
          <div class="flex gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="submit" variant="primary" icon="i-lucide-save" :loading="formLoading">
              {{ editing ? $t('common.save') : $t('common.create') }}
            </UiAppButton>
            <UiAppButton variant="outline" @click="formOpen = false">{{ $t('common.cancel') }}</UiAppButton>
          </div>
        </form>
      </UiSlideOver>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import type { EtaItemCode } from '~/features/eta/composables/useEta'

definePageMeta({ layout: 'dashboard' })
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
@reference "~/assets/css/tokens.css";

.ic-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.ic-input {
  width: 100%;
  padding-inline: 0.75rem;
  height: 2.25rem;
  font-size: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard);
  appearance: none;
}
.ic-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .ic-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}

.ic-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--radius-sm);
  color: var(--color-neutral-400);
  transition: color 150ms var(--ease-standard), background-color 150ms var(--ease-standard);
}
.ic-action-edit:hover {
  color: var(--color-primary-600);
  background-color: color-mix(in oklab, var(--color-primary-500) 12%, transparent);
}
.ic-action-delete:hover {
  color: var(--color-danger-600);
  background-color: color-mix(in oklab, var(--color-danger-500) 12%, transparent);
}
</style>
