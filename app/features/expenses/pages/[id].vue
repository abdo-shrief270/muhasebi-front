<template>
  <FeatureBoundary id="expenses">
    <div class="px-4 lg:px-6 py-5 max-w-3xl mx-auto">
      <template v-if="loading">
        <div class="space-y-3">
          <div class="h-8 w-48 rounded bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          <div class="h-32 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          <div class="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>
      </template>

      <template v-else-if="expense">
        <!-- Header -->
        <div class="mb-5">
          <NuxtLink
            to="/expenses"
            class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-0 transition-colors mb-3"
          >
            <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5 rtl:rotate-180" />
            {{ locale === 'ar' ? 'المصروفات' : 'Expenses' }}
          </NuxtLink>

          <div class="flex items-start sm:items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div
                class="w-12 h-12 rounded-lg bg-primary-500/10 text-primary-700 dark:text-primary-300 inline-flex items-center justify-center flex-shrink-0"
              >
                <UIcon name="i-lucide-credit-card" class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="text-lg font-bold text-neutral-900 dark:text-neutral-0 tracking-tight truncate">
                    {{ expense.description }}
                  </h1>
                  <UiBadge :color="STATUS_BADGE_COLOR[expense.status as ExpenseStatus] ?? 'gray'" dot>
                    {{ statusLabel(expense.status) }}
                  </UiBadge>
                </div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {{ formatDate(expense.date) }}
                  <span v-if="expense.category"> · {{ categoryName(expense.category) }}</span>
                </p>
              </div>
            </div>

            <div class="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
              <UiAppButton
                v-if="canSubmit"
                variant="primary"
                size="sm"
                icon="i-lucide-send"
                :loading="mutations.submit.loading.value"
                @click="handleSubmitForApproval"
              >
                {{ locale === 'ar' ? 'تقديم' : 'Submit' }}
              </UiAppButton>
              <UiAppButton
                v-if="canApprove"
                variant="primary"
                size="sm"
                icon="i-lucide-check-circle-2"
                :loading="mutations.approve.loading.value"
                @click="handleApprove"
              >
                {{ locale === 'ar' ? 'اعتماد' : 'Approve' }}
              </UiAppButton>
              <UiAppButton
                v-if="canReject"
                variant="outline"
                size="sm"
                icon="i-lucide-x-circle"
                @click="rejectModalOpen = true"
              >
                {{ locale === 'ar' ? 'رفض' : 'Reject' }}
              </UiAppButton>
              <UiAppButton
                v-if="canReimburse"
                variant="primary"
                size="sm"
                icon="i-lucide-banknote"
                @click="reimburseModalOpen = true"
              >
                {{ locale === 'ar' ? 'تسديد' : 'Reimburse' }}
              </UiAppButton>
              <UiAppButton
                v-if="canEdit"
                variant="outline"
                size="sm"
                icon="i-lucide-pencil"
                @click="navigateTo(`/expenses/${expense.id}/edit`)"
                :disabled="true"
                :title="locale === 'ar' ? 'قريباً' : 'Coming soon'"
              >
                {{ $t('common.edit') }}
              </UiAppButton>
              <UiAppButton
                v-if="canEdit"
                variant="danger"
                size="sm"
                icon="i-lucide-trash-2"
                @click="deleteConfirmOpen = true"
              >
                {{ $t('common.delete') }}
              </UiAppButton>
            </div>
          </div>
        </div>

        <!-- Summary cards -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-primary-500" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'المبلغ' : 'Amount' }}
            </p>
            <p class="font-mono text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
              {{ formatMoney(expense.amount) }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{{ expense.currency || 'EGP' }}</p>
          </div>

          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-info-500" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              VAT
            </p>
            <p class="font-mono text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
              {{ formatMoney(expense.vat_amount ?? 0) }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {{ Number(expense.vat_rate ?? 0).toFixed(0) }}% rate
            </p>
          </div>

          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <span class="absolute top-0 start-3 right-3 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
            <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
              {{ locale === 'ar' ? 'طريقة الدفع' : 'Method' }}
            </p>
            <p class="text-base font-bold text-neutral-900 dark:text-neutral-0">
              {{ paymentMethodLabel(expense.payment_method) }}
            </p>
            <p v-if="expense.payment_method === 'personal'" class="text-xs text-warning-600 dark:text-warning-500 mt-1">
              {{ locale === 'ar' ? 'يحتاج تسديد' : 'Needs reimbursement' }}
            </p>
          </div>
        </div>

        <!-- Detail rows -->
        <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-5">
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3">
            {{ locale === 'ar' ? 'تفاصيل' : 'Details' }}
          </h3>
          <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div class="flex items-center justify-between">
              <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'التاريخ' : 'Date' }}</dt>
              <dd class="text-neutral-900 dark:text-neutral-0">{{ formatDate(expense.date) }}</dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'الفئة' : 'Category' }}</dt>
              <dd class="text-neutral-900 dark:text-neutral-0">{{ categoryName(expense.category) }}</dd>
            </div>
            <div v-if="expense.vendor_name || vendorRef" class="flex items-center justify-between md:col-span-2">
              <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'المورد' : 'Vendor' }}</dt>
              <dd class="text-neutral-900 dark:text-neutral-0 truncate">
                <NuxtLink
                  v-if="vendorRef"
                  :to="`/vendors/${vendorRef.id}`"
                  class="text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
                >
                  {{ vendorDisplayName(vendorRef as any, locale) }}
                </NuxtLink>
                <span v-else>{{ expense.vendor_name }}</span>
              </dd>
            </div>
            <div v-if="expense.created_by_user" class="flex items-center justify-between">
              <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'بواسطة' : 'Created by' }}</dt>
              <dd class="text-neutral-900 dark:text-neutral-0">{{ expense.created_by_user.name }}</dd>
            </div>
            <div v-if="expense.approved_at" class="flex items-center justify-between">
              <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'اعتُمد في' : 'Approved at' }}</dt>
              <dd class="text-neutral-900 dark:text-neutral-0">{{ formatDateTime(expense.approved_at) }}</dd>
            </div>
            <div v-if="expense.reimbursed_at" class="flex items-center justify-between">
              <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'سُدد في' : 'Reimbursed at' }}</dt>
              <dd class="text-neutral-900 dark:text-neutral-0">{{ formatDateTime(expense.reimbursed_at) }}</dd>
            </div>
          </dl>
        </div>

        <!-- Receipt -->
        <div
          v-if="expense.receipt_url"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-5"
        >
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3 flex items-center gap-1.5">
            <UIcon name="i-lucide-receipt" class="w-4 h-4 text-neutral-400" />
            {{ locale === 'ar' ? 'الإيصال' : 'Receipt' }}
          </h3>
          <a
            :href="expense.receipt_url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-sm text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300"
          >
            <UIcon name="i-lucide-external-link" class="w-3.5 h-3.5" />
            {{ locale === 'ar' ? 'فتح الملف' : 'Open file' }}
          </a>
        </div>

        <!-- Notes -->
        <div
          v-if="expense.notes"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
        >
          <h3 class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
            <UIcon name="i-lucide-sticky-note" class="w-3.5 h-3.5" />
            {{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}
          </h3>
          <p class="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-line leading-relaxed">{{ expense.notes }}</p>
        </div>
      </template>
    </div>

    <!-- Reject reason modal -->
    <UiAppModal v-model="rejectModalOpen" :title="locale === 'ar' ? 'سبب الرفض' : 'Reason for rejection'">
      <form @submit.prevent="handleReject" class="space-y-3">
        <textarea
          v-model="rejectReason"
          rows="3"
          class="reject-input resize-none"
          :placeholder="locale === 'ar' ? 'اشرح سبب الرفض للموظف.' : 'Explain to the employee why this is rejected.'"
          required
        />
        <div class="flex items-center gap-2 justify-end">
          <UiAppButton type="button" variant="outline" @click="rejectModalOpen = false">
            {{ $t('common.cancel') }}
          </UiAppButton>
          <UiAppButton
            type="submit"
            variant="danger"
            icon="i-lucide-x-circle"
            :loading="mutations.reject.loading.value"
            :disabled="!rejectReason.trim()"
          >
            {{ locale === 'ar' ? 'تأكيد الرفض' : 'Reject' }}
          </UiAppButton>
        </div>
      </form>
    </UiAppModal>

    <!-- Reimburse modal -->
    <UiAppModal v-model="reimburseModalOpen" :title="locale === 'ar' ? 'تسديد المصروف' : 'Reimburse Expense'">
      <form @submit.prevent="handleReimburse" class="space-y-3">
        <div>
          <label class="reimburse-label">
            {{ locale === 'ar' ? 'تاريخ السداد' : 'Payment Date' }}
            <span class="text-danger-500">*</span>
          </label>
          <input
            v-model="reimburseForm.payment_date"
            type="date"
            class="reimburse-input"
            required
          />
        </div>
        <div>
          <label class="reimburse-label">
            {{ locale === 'ar' ? 'الحساب البنكي' : 'Bank Account' }}
            <span class="text-danger-500">*</span>
          </label>
          <div class="relative">
            <select v-model.number="reimburseForm.bank_account_id" class="reimburse-input" required>
              <option :value="0" disabled>{{ locale === 'ar' ? 'اختر حساباً...' : 'Select account...' }}</option>
              <option v-for="b in bankAccountOptions" :key="b.id" :value="b.id">{{ b.label }}</option>
            </select>
            <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label class="reimburse-label">{{ locale === 'ar' ? 'مرجع' : 'Reference' }}</label>
          <input
            v-model="reimburseForm.reference"
            type="text"
            class="reimburse-input"
            :placeholder="locale === 'ar' ? 'رقم التحويل / الإيصال' : 'Transfer / receipt no.'"
          />
        </div>
        <div class="flex items-center gap-2 justify-end pt-1">
          <UiAppButton type="button" variant="outline" @click="reimburseModalOpen = false">
            {{ $t('common.cancel') }}
          </UiAppButton>
          <UiAppButton
            type="submit"
            variant="primary"
            icon="i-lucide-banknote"
            :loading="mutations.reimburse.loading.value"
            :disabled="!reimburseForm.bank_account_id"
          >
            {{ locale === 'ar' ? 'تسديد' : 'Reimburse' }}
          </UiAppButton>
        </div>
      </form>
    </UiAppModal>

    <!-- Delete confirm -->
    <UiConfirmModal
      v-model="deleteConfirmOpen"
      :title="locale === 'ar' ? 'حذف المصروف' : 'Delete Expense'"
      :description="locale === 'ar' ? 'سيتم حذف هذه المسودة نهائياً.' : 'This draft will be permanently deleted.'"
      icon="i-lucide-trash-2"
      variant="danger"
      :confirm-label="$t('common.delete')"
      :loading="mutations.remove.loading.value"
      @confirm="handleDelete"
    />
  </FeatureBoundary>
</template>

<script setup lang="ts">
import { vendorDisplayName } from '~/features/vendors/services/vendorService'
import type {
  Expense,
  ExpenseCategory,
  ExpensePaymentMethod,
  ExpenseStatus,
} from '~/features/expenses/services/expenseService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const route = useRoute()
const toastStore = useToastStore()
const mutations = useExpenseMutations()

const expenseId = computed(() => Number(route.params.id))
const { data: expense, loading, error, refresh } = useExpense(expenseId)

watch(error, (e) => {
  if (e) {
    toastStore.error(locale.value === 'ar' ? 'المصروف غير موجود' : 'Expense not found')
    navigateTo('/expenses')
  }
})

const rejectModalOpen = ref(false)
const reimburseModalOpen = ref(false)
const deleteConfirmOpen = ref(false)
const rejectReason = ref('')

const reimburseForm = reactive({
  payment_date: new Date().toISOString().slice(0, 10),
  bank_account_id: 0,
  reference: '',
})

// Status workflow gates — mirror ExpenseStatus enum methods on the backend.
const canSubmit = computed(() => expense.value && (expense.value.status === 'draft' || expense.value.status === 'rejected'))
const canApprove = computed(() => expense.value?.status === 'submitted')
const canReject = computed(() => expense.value?.status === 'submitted')
const canReimburse = computed(() => expense.value?.status === 'approved' && expense.value?.payment_method === 'personal')
const canEdit = computed(() => expense.value && (expense.value.status === 'draft' || expense.value.status === 'rejected'))

// Bank accounts for the reimburse modal — gated to active accounts only.
// The query is lazy by default (cache hit on first open is instant after
// initial fetch); useQuery handles refetch on params change.
const bankAccountsParams = computed(() => ({ per_page: 100, is_active: true }))
const { data: bankAccountsData } = useBankAccountsList(bankAccountsParams)
const bankAccountOptions = computed(() => {
  return (bankAccountsData.value?.data ?? []).map(a => ({
    id: a.id,
    label: `${a.bank_name} · ${a.account_name || a.iban || `#${a.id}`}`,
  }))
})

// Vendor ref — backend includes a `vendor` relation on show; surface it for
// the link to the vendor detail page when present.
const vendorRef = computed(() => (expense.value as any)?.vendor ?? null)

const STATUS_LABELS_AR: Record<ExpenseStatus, string> = {
  draft: 'مسودة', submitted: 'مقدمة', approved: 'معتمدة', rejected: 'مرفوضة', reimbursed: 'مسددة',
}
const STATUS_LABELS_EN: Record<ExpenseStatus, string> = {
  draft: 'Draft', submitted: 'Submitted', approved: 'Approved', rejected: 'Rejected', reimbursed: 'Reimbursed',
}
function statusLabel(s: ExpenseStatus) {
  const map = locale.value === 'ar' ? STATUS_LABELS_AR : STATUS_LABELS_EN
  return map[s] ?? s
}

type BadgeColor = 'gray' | 'green' | 'blue' | 'orange' | 'red' | 'emerald' | 'purple'
const STATUS_BADGE_COLOR: Record<ExpenseStatus, BadgeColor> = {
  draft: 'gray', submitted: 'blue', approved: 'green', rejected: 'red', reimbursed: 'purple',
}

const PAYMENT_METHOD_AR: Record<string, string> = {
  cash: 'نقد', bank_transfer: 'تحويل بنكي', company_card: 'بطاقة الشركة', personal: 'شخصي',
}
const PAYMENT_METHOD_EN: Record<string, string> = {
  cash: 'Cash', bank_transfer: 'Bank transfer', company_card: 'Company card', personal: 'Personal',
}
function paymentMethodLabel(m: ExpensePaymentMethod | string | null | undefined) {
  if (!m) return '—'
  const map = locale.value === 'ar' ? PAYMENT_METHOD_AR : PAYMENT_METHOD_EN
  return map[m] ?? m
}

function categoryName(c: ExpenseCategory | null | undefined): string {
  if (!c) return '—'
  if (locale.value === 'ar') return c.name_ar || c.name_en || '—'
  return c.name_en || c.name_ar || '—'
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return d
  }
}
function formatDateTime(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return d
  }
}

async function handleSubmitForApproval() {
  try {
    await mutations.submit.mutate(expenseId.value)
    toastStore.success(locale.value === 'ar' ? 'تم تقديم المصروف' : 'Submitted for approval')
    refresh()
  } catch (e: any) {
    toastStore.error(e?.message || 'Error')
  }
}

async function handleApprove() {
  try {
    await mutations.approve.mutate(expenseId.value)
    toastStore.success(locale.value === 'ar' ? 'تم الاعتماد' : 'Approved')
    refresh()
  } catch (e: any) {
    toastStore.error(e?.message || 'Error')
  }
}

async function handleReject() {
  if (!rejectReason.value.trim()) return
  try {
    await mutations.reject.mutate({ id: expenseId.value, reason: rejectReason.value.trim() })
    toastStore.success(locale.value === 'ar' ? 'تم الرفض' : 'Rejected')
    rejectModalOpen.value = false
    rejectReason.value = ''
    refresh()
  } catch (e: any) {
    toastStore.error(e?.message || 'Error')
  }
}

async function handleReimburse() {
  try {
    await mutations.reimburse.mutate({
      id: expenseId.value,
      payload: {
        payment_date: reimburseForm.payment_date,
        bank_account_id: reimburseForm.bank_account_id,
        reference: reimburseForm.reference.trim() || undefined,
      },
    })
    toastStore.success(locale.value === 'ar' ? 'تم التسديد' : 'Reimbursed')
    reimburseModalOpen.value = false
    refresh()
  } catch (e: any) {
    toastStore.error(e?.message || 'Error')
  }
}

async function handleDelete() {
  try {
    await mutations.remove.mutate(expenseId.value)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
    navigateTo('/expenses')
  } catch (e: any) {
    toastStore.error(e?.message || 'Error')
  } finally {
    deleteConfirmOpen.value = false
  }
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.reject-input,
.reimburse-input {
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
textarea.reject-input { height: auto; padding-block: 0.5rem; }
.reject-input:focus,
.reimburse-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
.reimburse-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

:global(html.dark) .reject-input,
:global(html.dark) .reimburse-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
