<template>
  <FeatureBoundary id="bank-accounts">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-landmark"
        :title="locale === 'ar' ? 'الحسابات البنكية' : 'Bank Accounts'"
        :subtitle="totalLabel"
      >
        <template #actions>
          <UiAppButton variant="primary" icon="i-lucide-plus" @click="openCreate">
            {{ locale === 'ar' ? 'حساب جديد' : 'New Account' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <Can :perm="PERMISSIONS.MANAGE_ACCOUNTS">
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
          :exportable="true"
          :current-page="currentPage"
          :total-pages="lastPage"
          :total="total"
          :per-page="perPage"
          empty-icon="i-lucide-landmark"
          :empty-title="locale === 'ar' ? 'لا توجد حسابات بنكية' : 'No bank accounts yet'"
          :empty-description="locale === 'ar' ? 'أضف أول حساب بنكي للشركة.' : 'Add your first company bank account.'"
          @row-click="(row: any) => openEdit(row)"
          @page-change="(p: number) => { page = p }"
          @per-page-change="(pp: number) => { perPage = pp; page = 1 }"
        >
          <template #header>
            <div class="flex items-center gap-2 flex-1 flex-wrap min-w-0">
              <UiSearchInput
                v-model="searchInput"
                class="flex-1 min-w-[200px] max-w-xs"
                :placeholder="locale === 'ar' ? 'بحث بالاسم أو IBAN...' : 'Search by name or IBAN...'"
              />
              <UiFilterDropdown
                v-model="activeFilter"
                :options="activeOptions"
                :all-label="locale === 'ar' ? 'الكل' : 'All'"
              />
            </div>
          </template>

          <template #cell-account_name="{ row }">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-7 h-7 rounded-md bg-info-500/10 text-info-700 dark:text-info-300 inline-flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-landmark" class="w-3.5 h-3.5" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ row.account_name }}</p>
                <p v-if="row.branch" class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{{ row.branch }}</p>
              </div>
            </div>
          </template>

          <template #cell-bank_name="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ value || '—' }}</span>
          </template>

          <template #cell-account_number="{ value }">
            <span class="font-mono text-xs text-neutral-600 dark:text-neutral-400" dir="ltr">{{ value || '—' }}</span>
          </template>

          <template #cell-iban="{ value }">
            <span class="font-mono text-xs text-neutral-600 dark:text-neutral-400 break-all" dir="ltr">{{ value || '—' }}</span>
          </template>

          <template #cell-currency="{ value }">
            <span class="font-mono text-xs text-neutral-700 dark:text-neutral-200">{{ value }}</span>
          </template>

          <template #cell-gl_account="{ row }">
            <span v-if="row.gl_account" class="font-mono text-xs text-neutral-700 dark:text-neutral-200" dir="ltr">
              {{ row.gl_account.code }}
            </span>
            <span v-else class="text-xs text-neutral-400">—</span>
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
                class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-primary-600 hover:bg-primary-500/10 dark:hover:text-primary-400 transition-colors"
                :title="$t('common.edit')"
                @click="openEdit(row)"
              >
                <UIcon name="i-lucide-pencil" class="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-danger-600 hover:bg-danger-500/10 transition-colors"
                :title="$t('common.delete')"
                @click="confirmDelete(row)"
              >
                <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
              </button>
            </div>
          </template>
        </UiDataTable>
      </Can>

      <!-- Create / edit slideover -->
      <UiSlideOver
        v-model="formOpen"
        :title="editing
          ? (locale === 'ar' ? 'تعديل الحساب البنكي' : 'Edit Bank Account')
          : (locale === 'ar' ? 'حساب بنكي جديد' : 'New Bank Account')"
      >
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div class="md:col-span-2">
              <label class="ba-label">
                {{ locale === 'ar' ? 'اسم الحساب' : 'Account Name' }}
                <span class="text-danger-500">*</span>
              </label>
              <input
                v-model="values.account_name"
                type="text"
                class="ba-input"
                :class="{ 'ba-input--error': errors.account_name }"
                :placeholder="locale === 'ar' ? 'مثال: الحساب الجاري الرئيسي' : 'e.g. Main operating account'"
                required
              />
              <p v-if="errors.account_name" class="ba-error">{{ errors.account_name }}</p>
            </div>

            <div>
              <label class="ba-label">
                {{ locale === 'ar' ? 'البنك' : 'Bank' }}
                <span class="text-danger-500">*</span>
              </label>
              <input
                v-model="values.bank_name"
                type="text"
                class="ba-input"
                :class="{ 'ba-input--error': errors.bank_name }"
                :placeholder="locale === 'ar' ? 'مثال: البنك الأهلي' : 'e.g. National Bank of Egypt'"
                required
              />
              <p v-if="errors.bank_name" class="ba-error">{{ errors.bank_name }}</p>
            </div>

            <div>
              <label class="ba-label">{{ locale === 'ar' ? 'الفرع' : 'Branch' }}</label>
              <input v-model="values.branch" type="text" class="ba-input" />
            </div>

            <div>
              <label class="ba-label">{{ locale === 'ar' ? 'رقم الحساب' : 'Account Number' }}</label>
              <input v-model="values.account_number" type="text" class="ba-input font-mono" dir="ltr" />
            </div>

            <div>
              <label class="ba-label">{{ locale === 'ar' ? 'العملة' : 'Currency' }}</label>
              <div class="relative">
                <select v-model="values.currency" class="ba-input">
                  <option value="EGP">EGP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="SAR">SAR</option>
                  <option value="AED">AED</option>
                </select>
                <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div class="md:col-span-2">
              <label class="ba-label">IBAN</label>
              <input
                v-model="values.iban"
                type="text"
                class="ba-input font-mono uppercase"
                :class="{ 'ba-input--error': errors.iban }"
                dir="ltr"
                maxlength="34"
                :placeholder="locale === 'ar' ? 'مثال: EG820019...' : 'e.g. EG820019...'"
              />
              <p v-if="errors.iban" class="ba-error">{{ errors.iban }}</p>
            </div>

            <div>
              <label class="ba-label">SWIFT / BIC</label>
              <input
                v-model="values.swift_code"
                type="text"
                class="ba-input font-mono uppercase"
                dir="ltr"
                maxlength="11"
              />
            </div>

            <div>
              <label class="ba-label">{{ locale === 'ar' ? 'الرصيد الافتتاحي' : 'Opening Balance' }}</label>
              <input
                v-model.number="values.opening_balance"
                type="number"
                step="0.01"
                class="ba-input font-mono text-end"
                dir="ltr"
              />
            </div>

            <div class="md:col-span-2">
              <label class="ba-label">
                {{ locale === 'ar' ? 'الحساب المحاسبي (دفتر الأستاذ)' : 'GL Cash Account' }}
              </label>
              <div class="relative">
                <select v-model.number="values.gl_account_id" class="ba-input">
                  <option :value="null">
                    {{ locale === 'ar' ? '— لم يُحدد —' : '— Not linked —' }}
                  </option>
                  <option v-for="a in glAccountOptions" :key="a.id" :value="a.id">
                    {{ a.label }}
                  </option>
                </select>
                <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              </div>
              <p class="text-[11px] text-neutral-400 mt-1">
                {{ locale === 'ar'
                  ? 'الحساب الذي تُرحَّل إليه المعاملات في دفتر الأستاذ.'
                  : 'The ledger account this bank account posts to.' }}
              </p>
            </div>

            <div class="md:col-span-2">
              <label class="ba-label">{{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}</label>
              <textarea v-model="values.notes" rows="2" class="ba-input resize-none" />
            </div>

            <label class="md:col-span-2 flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200 cursor-pointer">
              <input v-model="values.is_active" type="checkbox" class="rounded" />
              {{ locale === 'ar' ? 'نشط' : 'Active' }}
            </label>
          </div>

          <div class="flex items-center gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="button" variant="outline" class="flex-1" @click="formOpen = false">
              {{ $t('common.cancel') }}
            </UiAppButton>
            <UiAppButton
              type="submit"
              variant="primary"
              :icon="editing ? 'i-lucide-save' : 'i-lucide-plus'"
              :loading="mutations.create.loading.value || mutations.update.loading.value"
              class="flex-1"
            >
              {{ editing ? $t('common.save') : $t('common.create') }}
            </UiAppButton>
          </div>
        </form>
      </UiSlideOver>

      <UiConfirmModal
        v-model="deleteConfirmOpen"
        :title="locale === 'ar' ? 'حذف الحساب البنكي' : 'Delete Bank Account'"
        :description="locale === 'ar'
          ? 'لن تتمكن من تسجيل دفعات على هذا الحساب بعد الحذف.'
          : 'You will no longer be able to record payments against this account.'"
        icon="i-lucide-trash-2"
        variant="danger"
        :confirm-label="$t('common.delete')"
        :loading="mutations.remove.loading.value"
        @confirm="handleDelete"
      />
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import type { BankAccount, BankAccountForm, BankAccountListParams } from '~/features/bank-accounts/services/bankAccountService'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()
const mutations = useBankAccountMutations()

const searchInput = ref('')
const search = refDebounced(searchInput, 400)
const activeFilter = ref('')
const page = ref(1)
const perPage = ref(25)

watch([search, activeFilter], () => { page.value = 1 })

const params = computed<BankAccountListParams>(() => ({
  search: search.value || undefined,
  is_active: activeFilter.value === '' ? undefined : activeFilter.value === 'true',
  sort_by: 'account_name',
  sort_dir: 'asc',
  page: page.value,
  per_page: perPage.value,
}))

const { data, loading } = useBankAccountsList(params)

const rows = computed<BankAccount[]>(() => data.value?.data ?? [])
const total = computed(() => data.value?.meta?.total ?? 0)
const currentPage = computed(() => data.value?.meta?.current_page ?? 1)
const lastPage = computed(() => data.value?.meta?.last_page ?? 1)

const totalLabel = computed(() => {
  const n = total.value.toLocaleString()
  if (locale.value === 'ar') return `${n} حساب`
  return `${n} ${total.value === 1 ? 'account' : 'accounts'}`
})

const columns = computed(() => [
  { key: 'account_name',   label: locale.value === 'ar' ? 'اسم الحساب' : 'Account' },
  { key: 'bank_name',      label: locale.value === 'ar' ? 'البنك' : 'Bank' },
  { key: 'account_number', label: locale.value === 'ar' ? 'رقم الحساب' : 'Account #' },
  { key: 'iban',           label: 'IBAN' },
  { key: 'currency',       label: locale.value === 'ar' ? 'العملة' : 'Currency' },
  { key: 'gl_account',     label: locale.value === 'ar' ? 'حساب الأستاذ' : 'GL Account' },
  { key: 'is_active',      label: locale.value === 'ar' ? 'الحالة' : 'Status' },
  { key: 'actions',        label: '', class: 'w-16' },
])

const activeOptions = computed(() => [
  { value: 'true',  label: locale.value === 'ar' ? 'نشط' : 'Active' },
  { value: 'false', label: locale.value === 'ar' ? 'غير نشط' : 'Inactive' },
])

// GL account picker — only post-able cash accounts. There's no "is bank
// account" flag on the chart of accounts, so surface all leaf accounts
// and let the operator pick the right one (typically a 1100/1101-style
// cash-and-equivalents leaf).
const accountParams = computed(() => ({ per_page: 500, is_group: false, is_active: true } as any))
const { data: accountsData } = useAccountsList(accountParams as any)
const glAccountOptions = computed(() => {
  return (accountsData.value?.data ?? []).map(a => ({
    id: a.id,
    label: `${a.code} — ${locale.value === 'ar' ? (a.name_ar || a.name_en) : (a.name_en || a.name_ar)}`,
  }))
})

// --- Form state ---
const formOpen = ref(false)
const deleteConfirmOpen = ref(false)
const editing = ref<BankAccount | null>(null)
const deleting = ref<BankAccount | null>(null)
const errors = ref<Record<string, string>>({})

const values = reactive<BankAccountForm & { is_active: boolean; opening_balance: number }>({
  account_name: '',
  bank_name: '',
  branch: '',
  account_number: '',
  iban: '',
  swift_code: '',
  currency: 'EGP',
  gl_account_id: null,
  opening_balance: 0,
  is_active: true,
  notes: '',
})

function resetForm() {
  values.account_name = ''
  values.bank_name = ''
  values.branch = ''
  values.account_number = ''
  values.iban = ''
  values.swift_code = ''
  values.currency = 'EGP'
  values.gl_account_id = null
  values.opening_balance = 0
  values.is_active = true
  values.notes = ''
  errors.value = {}
}

function openCreate() {
  editing.value = null
  resetForm()
  formOpen.value = true
}

function openEdit(b: BankAccount) {
  editing.value = b
  values.account_name = b.account_name
  values.bank_name = b.bank_name
  values.branch = b.branch ?? ''
  values.account_number = b.account_number ?? ''
  values.iban = b.iban ?? ''
  values.swift_code = b.swift_code ?? ''
  values.currency = b.currency
  values.gl_account_id = b.gl_account_id
  values.opening_balance = Number(b.opening_balance ?? 0)
  values.is_active = b.is_active
  values.notes = b.notes ?? ''
  errors.value = {}
  formOpen.value = true
}

function confirmDelete(b: BankAccount) {
  deleting.value = b
  deleteConfirmOpen.value = true
}

async function submitForm() {
  errors.value = {}
  // Normalize empty strings to null so the backend's `nullable` rules
  // pass cleanly (an empty string would otherwise hit max-length checks
  // unnecessarily). IBAN + SWIFT also uppercased per banking conventions.
  const payload: BankAccountForm = {
    account_name: values.account_name.trim(),
    bank_name: values.bank_name.trim(),
    branch: values.branch?.trim() || null,
    account_number: values.account_number?.trim() || null,
    iban: values.iban?.trim().toUpperCase() || null,
    swift_code: values.swift_code?.trim().toUpperCase() || null,
    currency: values.currency,
    gl_account_id: values.gl_account_id ?? null,
    opening_balance: Number(values.opening_balance ?? 0),
    is_active: values.is_active,
    notes: values.notes?.trim() || null,
  }

  try {
    if (editing.value) {
      await mutations.update.mutate({ id: editing.value.id, form: payload })
      toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Bank account updated')
    } else {
      await mutations.create.mutate(payload)
      toastStore.success(locale.value === 'ar' ? 'تم الإضافة' : 'Bank account created')
    }
    formOpen.value = false
  } catch (e) {
    const err = e as ApiError
    if (err?.code === 'validation' && err.fieldErrors) {
      for (const [field, msgs] of Object.entries(err.fieldErrors)) {
        errors.value[field] = Array.isArray(msgs) ? msgs[0] : String(msgs)
      }
    }
    toastStore.error(err?.message || (locale.value === 'ar' ? 'تعذر الحفظ' : 'Save failed'))
  }
}

async function handleDelete() {
  if (!deleting.value) return
  try {
    await mutations.remove.mutate(deleting.value.id)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
  } catch (e: any) {
    toastStore.error(e?.message || 'Error')
  } finally {
    deleteConfirmOpen.value = false
    deleting.value = null
  }
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.ba-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.ba-error { @apply mt-1 text-xs text-danger-600 dark:text-danger-500; }

.ba-input {
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
.ba-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
textarea.ba-input { height: auto; padding-block: 0.5rem; }
.ba-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }

:global(html.dark) .ba-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
