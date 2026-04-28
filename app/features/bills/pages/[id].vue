<template>
  <FeatureBoundary id="bills">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <!-- Loading skeleton -->
      <template v-if="loading">
        <div class="space-y-4">
          <div class="h-12 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div v-for="i in 4" :key="i" class="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          </div>
          <div class="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>
      </template>

      <template v-else-if="bill">
        <!-- Header -->
        <div v-motion :initial="{ opacity: 0, y: -6 }" :enter="{ opacity: 1, y: 0 }" class="mb-5">
          <NuxtLink
            to="/bills"
            class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-0 transition-colors mb-3"
          >
            <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5 rtl:rotate-180" />
            {{ locale === 'ar' ? 'الفواتير' : 'Bills' }}
          </NuxtLink>

          <div class="flex items-start sm:items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-3 min-w-0 flex-1">
              <div
                class="w-12 h-12 rounded-lg bg-primary-500/10 text-primary-700 dark:text-primary-300 inline-flex items-center justify-center flex-shrink-0"
              >
                <UIcon name="i-lucide-receipt" class="w-5 h-5" />
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h1 class="font-mono text-lg font-bold text-neutral-900 dark:text-neutral-0 tracking-tight truncate">
                    {{ bill.bill_number }}
                  </h1>
                  <UiBadge :color="STATUS_BADGE_COLOR[bill.status] ?? 'gray'" dot>
                    {{ locale === 'ar' ? bill.status_label_ar : bill.status_label }}
                  </UiBadge>
                </div>
                <NuxtLink
                  v-if="bill.vendor"
                  :to="`/vendors/${bill.vendor.id}`"
                  class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate block mt-0.5"
                >
                  {{ billVendorName(bill.vendor, locale) }}
                </NuxtLink>
              </div>
            </div>

            <div class="flex items-center gap-1.5 flex-shrink-0">
              <UiAppButton
                v-if="bill.status === 'draft'"
                variant="primary"
                size="sm"
                icon="i-lucide-check-circle-2"
                :loading="mutations.approve.loading.value"
                @click="handleApprove"
              >
                {{ locale === 'ar' ? 'اعتماد' : 'Approve' }}
              </UiAppButton>
              <UiAppButton
                v-if="bill.status === 'draft'"
                variant="outline"
                size="sm"
                icon="i-lucide-pencil"
                @click="navigateTo(`/bills/${bill.id}/edit`)"
              >
                {{ $t('common.edit') }}
              </UiAppButton>
              <UiAppButton
                v-if="bill.status === 'draft' || bill.status === 'approved'"
                variant="outline"
                size="sm"
                icon="i-lucide-x-circle"
                @click="cancelConfirmOpen = true"
              >
                {{ locale === 'ar' ? 'إلغاء' : 'Cancel' }}
              </UiAppButton>
              <UiAppButton
                v-if="bill.status === 'draft'"
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
        <div
          v-motion
          :initial="{ opacity: 0, y: 12 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 80 } }"
          class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"
        >
          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <span class="absolute top-0 start-4 right-4 h-0.5 rounded-b-full bg-primary-500" aria-hidden="true" />
            <div class="flex items-start justify-between mb-2">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {{ locale === 'ar' ? 'الإجمالي' : 'Total' }}
              </p>
              <UIcon name="i-lucide-banknote" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <p class="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(bill.total) }}</p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{{ bill.currency }}</p>
          </div>

          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <span class="absolute top-0 start-4 right-4 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
            <div class="flex items-start justify-between mb-2">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {{ locale === 'ar' ? 'مدفوع' : 'Paid' }}
              </p>
              <UIcon name="i-lucide-wallet" class="w-4 h-4 text-success-500" />
            </div>
            <p class="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(bill.amount_paid) }}</p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{{ bill.currency }}</p>
          </div>

          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <span
              class="absolute top-0 start-4 right-4 h-0.5 rounded-b-full"
              :class="Number(bill.balance_due ?? 0) > 0 ? 'bg-warning-500' : 'bg-neutral-300 dark:bg-neutral-700'"
              aria-hidden="true"
            />
            <div class="flex items-start justify-between mb-2">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {{ locale === 'ar' ? 'متبقي' : 'Balance Due' }}
              </p>
              <UIcon name="i-lucide-clock" class="w-4 h-4" :class="Number(bill.balance_due ?? 0) > 0 ? 'text-warning-500' : 'text-neutral-400'" />
            </div>
            <p class="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(bill.balance_due) }}</p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{{ bill.currency }}</p>
          </div>

          <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
            <span
              class="absolute top-0 start-4 right-4 h-0.5 rounded-b-full"
              :class="isOverdue ? 'bg-danger-500' : 'bg-info-500'"
              aria-hidden="true"
            />
            <div class="flex items-start justify-between mb-2">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                {{ locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date' }}
              </p>
              <UIcon name="i-lucide-calendar" class="w-4 h-4" :class="isOverdue ? 'text-danger-500' : 'text-info-500'" />
            </div>
            <p class="text-base font-bold text-neutral-900 dark:text-neutral-0">{{ formatDate(bill.due_date) }}</p>
            <p class="text-xs mt-1" :class="isOverdue ? 'text-danger-600 dark:text-danger-400' : 'text-neutral-500 dark:text-neutral-400'">{{ dueRelative }}</p>
          </div>
        </div>

        <!-- Lines + amounts breakdown -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
          <div class="lg:col-span-2 bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between">
              <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
                {{ locale === 'ar' ? 'البنود' : 'Line Items' }}
              </h3>
              <span class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                {{ (bill.lines?.length ?? 0) }} {{ locale === 'ar' ? 'بند' : (bill.lines?.length === 1 ? 'item' : 'items') }}
              </span>
            </div>
            <table class="w-full text-sm">
              <thead class="bg-neutral-50/60 dark:bg-neutral-950/40 text-[11px] uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                <tr>
                  <th class="text-start px-4 py-2 font-semibold">{{ locale === 'ar' ? 'الوصف / الحساب' : 'Description / Account' }}</th>
                  <th class="text-end px-3 py-2 font-semibold">{{ locale === 'ar' ? 'الكمية' : 'Qty' }}</th>
                  <th class="text-end px-3 py-2 font-semibold">{{ locale === 'ar' ? 'السعر' : 'Unit' }}</th>
                  <th class="text-end px-3 py-2 font-semibold">VAT %</th>
                  <th class="text-end px-3 py-2 font-semibold">{{ locale === 'ar' ? 'الإجمالي' : 'Total' }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                <tr v-for="(line, i) in (bill.lines ?? [])" :key="line.id ?? i">
                  <td class="px-4 py-2.5">
                    <p class="text-neutral-900 dark:text-neutral-0">{{ line.description || (locale === 'ar' ? '—' : '—') }}</p>
                    <p v-if="line.account" class="text-[11px] text-neutral-500 dark:text-neutral-400">
                      <span v-if="line.account.code" class="font-mono">{{ line.account.code }}</span>
                      <span v-if="line.account.code && line.account.name"> · </span>
                      <span v-if="line.account.name">{{ line.account.name }}</span>
                    </p>
                  </td>
                  <td class="px-3 py-2.5 text-end font-mono tabular-nums" dir="ltr">{{ Number(line.quantity).toLocaleString() }}</td>
                  <td class="px-3 py-2.5 text-end font-mono tabular-nums" dir="ltr">{{ formatMoney(line.unit_price) }}</td>
                  <td class="px-3 py-2.5 text-end font-mono text-xs tabular-nums" dir="ltr">{{ Number(line.vat_rate).toFixed(0) }}%</td>
                  <td class="px-3 py-2.5 text-end font-mono font-semibold tabular-nums" dir="ltr">{{ formatMoney(line.total) }}</td>
                </tr>
                <tr v-if="!(bill.lines?.length)">
                  <td colspan="5" class="px-4 py-8 text-center text-xs text-neutral-400">
                    {{ locale === 'ar' ? 'لا توجد بنود' : 'No line items' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Amounts breakdown -->
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 self-start">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3">
              {{ locale === 'ar' ? 'تفاصيل المبلغ' : 'Amount Breakdown' }}
            </h3>
            <dl class="space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'الإجمالي قبل الضرائب' : 'Subtotal' }}</dt>
                <dd class="font-mono tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(bill.subtotal) }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'القيمة المضافة' : 'VAT' }}</dt>
                <dd class="font-mono tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ formatMoney(bill.vat_amount) }}</dd>
              </div>
              <div v-if="Number(bill.wht_amount ?? 0) > 0" class="flex items-center justify-between">
                <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'خصم من المنبع' : 'WHT' }}</dt>
                <dd class="font-mono tabular-nums text-warning-700 dark:text-warning-500" dir="ltr">−{{ formatMoney(bill.wht_amount) }}</dd>
              </div>
              <div class="border-t border-neutral-200 dark:border-neutral-800 pt-2 flex items-center justify-between">
                <dt class="font-semibold text-neutral-900 dark:text-neutral-0">{{ locale === 'ar' ? 'الإجمالي' : 'Total' }}</dt>
                <dd class="font-mono font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
                  {{ formatMoney(bill.total) }} {{ bill.currency }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Notes -->
        <div
          v-if="bill.notes"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-5"
        >
          <h3 class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
            <UIcon name="i-lucide-sticky-note" class="w-3.5 h-3.5" />
            {{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}
          </h3>
          <p class="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-line leading-relaxed">{{ bill.notes }}</p>
        </div>

        <!-- Payments table — only after approval -->
        <div
          v-if="bill.status !== 'draft' && bill.status !== 'cancelled'"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        >
          <div class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
              {{ locale === 'ar' ? 'المدفوعات' : 'Payments' }}
              <span class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums font-normal ms-1">
                · {{ activePayments.length }}
              </span>
            </h3>
            <UiAppButton
              v-if="canPayBill"
              variant="primary"
              size="sm"
              icon="i-lucide-plus"
              @click="openPaymentForm"
            >
              {{ locale === 'ar' ? 'إضافة دفعة' : 'Add Payment' }}
            </UiAppButton>
          </div>
          <ul v-if="activePayments.length > 0" class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <li
              v-for="p in activePayments"
              :key="p.id"
              class="px-4 py-2.5 flex items-center justify-between gap-3 group/payment"
            >
              <div class="flex items-center gap-3 min-w-0">
                <UIcon name="i-lucide-banknote" class="w-4 h-4 text-success-500 flex-shrink-0" />
                <div class="min-w-0">
                  <p class="text-sm text-neutral-900 dark:text-neutral-0">
                    {{ formatDate(p.payment_date) }} · {{ paymentMethodLabel(p.payment_method) }}
                  </p>
                  <p v-if="p.reference || p.check_number" class="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono" dir="ltr">
                    <template v-if="p.check_number">#{{ p.check_number }}</template>
                    <template v-if="p.check_number && p.reference"> · </template>
                    <template v-if="p.reference">{{ p.reference }}</template>
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2 flex-shrink-0">
                <span class="font-mono text-sm font-semibold tabular-nums text-success-700 dark:text-success-400" dir="ltr">
                  {{ formatMoney(p.amount) }}
                </span>
                <button
                  v-if="bill.status !== 'cancelled'"
                  type="button"
                  class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-danger-600 hover:bg-danger-500/10 transition-colors opacity-0 group-hover/payment:opacity-100 focus:opacity-100"
                  :title="locale === 'ar' ? 'إبطال الدفعة' : 'Void payment'"
                  @click="confirmVoidPayment(p)"
                >
                  <UIcon name="i-lucide-undo-2" class="w-3.5 h-3.5" />
                </button>
              </div>
            </li>
          </ul>
          <UiEmptyState
            v-else
            icon="i-lucide-banknote"
            :title="locale === 'ar' ? 'لا توجد مدفوعات' : 'No payments yet'"
            :description="locale === 'ar' ? 'سجّل دفعة لتقليل الرصيد المستحق.' : 'Record a payment to reduce the balance due.'"
          >
            <template #action>
              <UiAppButton v-if="canPayBill" variant="primary" size="sm" icon="i-lucide-plus" @click="openPaymentForm">
                {{ locale === 'ar' ? 'إضافة دفعة' : 'Add Payment' }}
              </UiAppButton>
            </template>
          </UiEmptyState>
        </div>
      </template>
    </div>

    <!-- Cancel confirm -->
    <UiConfirmModal
      v-model="cancelConfirmOpen"
      :title="locale === 'ar' ? 'إلغاء الفاتورة' : 'Cancel Bill'"
      :description="locale === 'ar' ? 'سيتم عكس قيد الفاتورة في دفتر الأستاذ. لا يمكن التراجع.' : 'The journal entry will be reversed. This cannot be undone.'"
      icon="i-lucide-alert-triangle"
      variant="danger"
      :confirm-label="locale === 'ar' ? 'تأكيد الإلغاء' : 'Cancel Bill'"
      :loading="mutations.cancel.loading.value"
      @confirm="handleCancel"
    />

    <!-- Delete confirm -->
    <UiConfirmModal
      v-model="deleteConfirmOpen"
      :title="locale === 'ar' ? 'حذف الفاتورة' : 'Delete Bill'"
      :description="locale === 'ar' ? 'سيتم حذف هذه المسودة نهائياً.' : 'This draft will be permanently deleted.'"
      icon="i-lucide-trash-2"
      variant="danger"
      :confirm-label="$t('common.delete')"
      :loading="mutations.remove.loading.value"
      @confirm="handleDelete"
    />

    <!-- Add payment slideover -->
    <UiSlideOver
      v-model="paymentFormOpen"
      :title="locale === 'ar' ? 'إضافة دفعة' : 'Record Payment'"
    >
      <form @submit.prevent="submitPayment" class="space-y-4">
        <!-- Balance reminder -->
        <div
          v-if="bill"
          class="rounded-md bg-warning-500/10 border border-warning-500/20 px-3 py-2 flex items-center justify-between gap-3"
        >
          <span class="text-xs text-warning-700 dark:text-warning-500">
            {{ locale === 'ar' ? 'الرصيد المستحق' : 'Balance due' }}
          </span>
          <span class="font-mono text-sm font-semibold tabular-nums text-warning-800 dark:text-warning-400" dir="ltr">
            {{ formatMoney(bill.balance_due) }} {{ bill.currency }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="pf-label">
              {{ locale === 'ar' ? 'المبلغ' : 'Amount' }}
              <span class="text-danger-500">*</span>
            </label>
            <input
              v-model.number="paymentValues.amount"
              type="number"
              min="0.01"
              step="0.01"
              class="pf-input font-mono text-end"
              :class="{ 'pf-input--error': paymentErrors.amount }"
              dir="ltr"
              required
            />
            <p v-if="paymentErrors.amount" class="pf-error">{{ paymentErrors.amount }}</p>
          </div>
          <div>
            <label class="pf-label">
              {{ locale === 'ar' ? 'تاريخ الدفع' : 'Payment Date' }}
              <span class="text-danger-500">*</span>
            </label>
            <input
              v-model="paymentValues.payment_date"
              type="date"
              class="pf-input"
              :class="{ 'pf-input--error': paymentErrors.payment_date }"
              required
            />
            <p v-if="paymentErrors.payment_date" class="pf-error">{{ paymentErrors.payment_date }}</p>
          </div>
        </div>

        <div>
          <label class="pf-label">
            {{ locale === 'ar' ? 'طريقة الدفع' : 'Method' }}
            <span class="text-danger-500">*</span>
          </label>
          <div class="relative">
            <select
              v-model="paymentValues.payment_method"
              class="pf-input"
              :class="{ 'pf-input--error': paymentErrors.payment_method }"
            >
              <option value="cash">{{ paymentMethodLabel('cash') }}</option>
              <option value="bank_transfer">{{ paymentMethodLabel('bank_transfer') }}</option>
              <option value="check">{{ paymentMethodLabel('check') }}</option>
              <option value="mobile_wallet">{{ paymentMethodLabel('mobile_wallet') }}</option>
              <option value="other">{{ paymentMethodLabel('other') }}</option>
            </select>
            <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        <!-- Check number — only when method=check -->
        <div v-if="paymentValues.payment_method === 'check'">
          <label class="pf-label">
            {{ locale === 'ar' ? 'رقم الشيك' : 'Check Number' }}
            <span class="text-danger-500">*</span>
          </label>
          <input
            v-model="paymentValues.check_number"
            type="text"
            class="pf-input font-mono"
            :class="{ 'pf-input--error': paymentErrors.check_number }"
            dir="ltr"
            required
          />
          <p v-if="paymentErrors.check_number" class="pf-error">{{ paymentErrors.check_number }}</p>
        </div>

        <div>
          <label class="pf-label">{{ locale === 'ar' ? 'مرجع' : 'Reference' }}</label>
          <input
            v-model="paymentValues.reference"
            type="text"
            class="pf-input"
            :placeholder="locale === 'ar' ? 'رقم الإيصال / المعاملة' : 'Receipt or transaction #'"
          />
        </div>

        <div>
          <label class="pf-label">{{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}</label>
          <textarea
            v-model="paymentValues.notes"
            rows="2"
            class="pf-input resize-none"
          />
        </div>

        <div class="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <UiAppButton type="button" variant="outline" class="flex-1" @click="paymentFormOpen = false">
            {{ $t('common.cancel') }}
          </UiAppButton>
          <UiAppButton
            type="submit"
            variant="primary"
            icon="i-lucide-banknote"
            :loading="mutations.addPayment.loading.value"
            class="flex-1"
          >
            {{ locale === 'ar' ? 'تسجيل الدفعة' : 'Record Payment' }}
          </UiAppButton>
        </div>
      </form>
    </UiSlideOver>

    <!-- Void payment confirm -->
    <UiConfirmModal
      v-model="voidConfirmOpen"
      :title="locale === 'ar' ? 'إبطال الدفعة' : 'Void Payment'"
      :description="locale === 'ar'
        ? 'سيتم عكس قيد الدفعة في الأستاذ، وإعادة الرصيد المستحق على الفاتورة.'
        : 'The payment journal entry will be reversed and the balance restored on the bill.'"
      icon="i-lucide-undo-2"
      variant="danger"
      :confirm-label="locale === 'ar' ? 'تأكيد الإبطال' : 'Void Payment'"
      :loading="mutations.voidPayment.loading.value"
      @confirm="handleVoidPayment"
    />
  </FeatureBoundary>
</template>

<script setup lang="ts">
import { billVendorName, type BillStatus, type BillPayment, type BillPaymentMethod } from '~/features/bills/services/billService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const route = useRoute()
const toastStore = useToastStore()

const billId = computed(() => Number(route.params.id))
const { data: bill, loading, error, refresh } = useBill(billId)
const mutations = useBillMutations()

const cancelConfirmOpen = ref(false)
const deleteConfirmOpen = ref(false)

watch(error, (e) => {
  if (e) {
    toastStore.error(locale.value === 'ar' ? 'الفاتورة غير موجودة' : 'Bill not found')
    navigateTo('/bills')
  }
})

// Voided payments are soft-deleted on the backend and excluded from the
// `payments` relation by default, so the list we get here is already the
// active set. Keep the local alias for clarity at call sites.
const activePayments = computed(() => bill.value?.payments ?? [])

const isOverdue = computed(() => {
  const b = bill.value
  if (!b) return false
  if (b.status === 'paid' || b.status === 'cancelled') return false
  if (Number(b.balance_due ?? 0) <= 0) return false
  return new Date(b.due_date) < new Date(new Date().toDateString())
})

const dueRelative = computed(() => {
  const b = bill.value
  if (!b) return ''
  const days = Math.floor((new Date(b.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  if (days === 0) return locale.value === 'ar' ? 'اليوم' : 'today'
  if (days > 0) return locale.value === 'ar' ? `خلال ${days} يوم` : `in ${days} days`
  return locale.value === 'ar' ? `متأخرة ${Math.abs(days)} يوم` : `${Math.abs(days)} days overdue`
})

type BadgeColor = 'gray' | 'green' | 'blue' | 'orange' | 'red' | 'emerald' | 'purple'
const STATUS_BADGE_COLOR: Record<BillStatus, BadgeColor> = {
  draft: 'gray',
  approved: 'blue',
  partially_paid: 'orange',
  paid: 'green',
  cancelled: 'red',
}

const PAYMENT_METHOD_AR: Record<string, string> = {
  cash: 'نقد',
  bank_transfer: 'تحويل بنكي',
  check: 'شيك',
  mobile_wallet: 'محفظة إلكترونية',
  other: 'أخرى',
}
const PAYMENT_METHOD_EN: Record<string, string> = {
  cash: 'Cash',
  bank_transfer: 'Bank transfer',
  check: 'Check',
  mobile_wallet: 'Mobile wallet',
  other: 'Other',
}
function paymentMethodLabel(m: string) {
  const map = locale.value === 'ar' ? PAYMENT_METHOD_AR : PAYMENT_METHOD_EN
  return map[m] ?? m
}

// --- Add / void payment state ---
//
// `canPayBill` mirrors the backend BillStatus::canPay() — payments can only
// be recorded against approved or partially-paid bills, and only while
// there's a non-zero balance due.
const canPayBill = computed(() => {
  const b = bill.value
  if (!b) return false
  if (b.status !== 'approved' && b.status !== 'partially_paid') return false
  return Number(b.balance_due ?? 0) > 0
})

const paymentFormOpen = ref(false)
const voidConfirmOpen = ref(false)
const voidingPayment = ref<BillPayment | null>(null)
const paymentErrors = ref<Record<string, string>>({})

const paymentValues = reactive<{
  amount: number
  payment_date: string
  payment_method: BillPaymentMethod
  check_number: string
  reference: string
  notes: string
}>({
  amount: 0,
  payment_date: new Date().toISOString().slice(0, 10),
  payment_method: 'bank_transfer',
  check_number: '',
  reference: '',
  notes: '',
})

function openPaymentForm() {
  // Pre-fill amount with the current balance — the most common case is
  // "settle this bill in one shot". User can always reduce it for partials.
  paymentValues.amount = Number(bill.value?.balance_due ?? 0)
  paymentValues.payment_date = new Date().toISOString().slice(0, 10)
  paymentValues.payment_method = 'bank_transfer'
  paymentValues.check_number = ''
  paymentValues.reference = ''
  paymentValues.notes = ''
  paymentErrors.value = {}
  paymentFormOpen.value = true
}

async function submitPayment() {
  paymentErrors.value = {}
  // Frontend pre-flight: amount > 0 and ≤ balance_due. The backend re-checks
  // both — this just gives faster feedback before the network round-trip.
  const balance = Number(bill.value?.balance_due ?? 0)
  if (!Number.isFinite(paymentValues.amount) || paymentValues.amount <= 0) {
    paymentErrors.value.amount = locale.value === 'ar' ? 'المبلغ يجب أن يكون أكبر من صفر.' : 'Amount must be greater than zero.'
    return
  }
  if (paymentValues.amount > balance + 0.005) {
    paymentErrors.value.amount = locale.value === 'ar'
      ? `المبلغ يتجاوز الرصيد المستحق (${balance.toLocaleString()}).`
      : `Amount exceeds balance due (${balance.toLocaleString()}).`
    return
  }
  if (paymentValues.payment_method === 'check' && !paymentValues.check_number.trim()) {
    paymentErrors.value.check_number = locale.value === 'ar' ? 'رقم الشيك مطلوب.' : 'Check number is required.'
    return
  }

  try {
    await mutations.addPayment.mutate({
      id: billId.value,
      form: {
        amount: Number(paymentValues.amount),
        payment_date: paymentValues.payment_date,
        payment_method: paymentValues.payment_method,
        check_number: paymentValues.payment_method === 'check' ? paymentValues.check_number.trim() : null,
        reference: paymentValues.reference.trim() || null,
        notes: paymentValues.notes.trim() || null,
      },
    })
    toastStore.success(locale.value === 'ar' ? 'تم تسجيل الدفعة' : 'Payment recorded')
    paymentFormOpen.value = false
    refresh()
  } catch (e: any) {
    if (e?.code === 'validation' && e?.fieldErrors) {
      for (const [field, msgs] of Object.entries(e.fieldErrors)) {
        paymentErrors.value[field] = Array.isArray(msgs) ? msgs[0] as string : String(msgs)
      }
    }
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر تسجيل الدفعة' : 'Failed to record payment'))
  }
}

function confirmVoidPayment(p: BillPayment) {
  voidingPayment.value = p
  voidConfirmOpen.value = true
}

async function handleVoidPayment() {
  const p = voidingPayment.value
  if (!p) return
  try {
    await mutations.voidPayment.mutate(p.id)
    toastStore.success(locale.value === 'ar' ? 'تم إبطال الدفعة' : 'Payment voided')
    refresh()
  } catch (e: any) {
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر إبطال الدفعة' : 'Failed to void payment'))
  } finally {
    voidConfirmOpen.value = false
    voidingPayment.value = null
  }
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

async function handleApprove() {
  try {
    await mutations.approve.mutate(billId.value)
    toastStore.success(locale.value === 'ar' ? 'تم اعتماد الفاتورة' : 'Bill approved')
    refresh()
  } catch (e: any) {
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر الاعتماد' : 'Approval failed'))
  }
}

async function handleCancel() {
  try {
    await mutations.cancel.mutate(billId.value)
    toastStore.success(locale.value === 'ar' ? 'تم إلغاء الفاتورة' : 'Bill cancelled')
    refresh()
  } catch (e: any) {
    toastStore.error(e?.message || (locale.value === 'ar' ? 'تعذر الإلغاء' : 'Cancel failed'))
  } finally {
    cancelConfirmOpen.value = false
  }
}

async function handleDelete() {
  try {
    await mutations.remove.mutate(billId.value)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
    navigateTo('/bills')
  } catch (e: any) {
    toastStore.error(e?.message || 'Error')
  } finally {
    deleteConfirmOpen.value = false
  }
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

/* Payment-form scoped styles — `pf-` prefix to keep them isolated. */
.pf-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.pf-error { @apply mt-1 text-xs text-danger-600 dark:text-danger-500; }

.pf-input {
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
.pf-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
textarea.pf-input { height: auto; padding-block: 0.5rem; }
.pf-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }

:global(html.dark) .pf-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
