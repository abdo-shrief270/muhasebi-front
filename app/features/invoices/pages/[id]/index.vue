<template>
    <FeatureBoundary id="invoices">
      <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
        <!-- Loading -->
        <template v-if="loading">
          <div class="space-y-4">
            <div class="h-12 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div v-for="i in 4" :key="i" class="h-20 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            </div>
            <div class="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          </div>
        </template>

        <template v-else-if="invoice">
          <!-- Header -->
          <div v-motion :initial="{ opacity: 0, y: -6 }" :enter="{ opacity: 1, y: 0 }" class="mb-5">
            <NuxtLink
              to="/invoices"
              class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-0 transition-colors mb-3"
            >
              <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5 rtl:rotate-180" />
              {{ $t('nav.invoices') }}
            </NuxtLink>

            <div class="flex items-start sm:items-center justify-between gap-3 flex-wrap">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h1 class="text-xl font-bold font-mono text-neutral-900 dark:text-neutral-0 tracking-tight" dir="ltr">
                    {{ invoice.invoice_number }}
                  </h1>
                  <UiBadge :color="statusColor(invoice.status)" dot>{{ statusLabel(invoice.status) }}</UiBadge>
                  <UiBadge color="gray" size="xs">{{ typeLabel(invoice.type) }}</UiBadge>
                  <UiBadge
                    v-if="invoice.eta_document"
                    :color="etaColor(invoice.eta_document.status)"
                    size="xs"
                    icon="i-lucide-shield"
                  >
                    ETA {{ etaLabel(invoice.eta_document.status) }}
                  </UiBadge>
                </div>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1 truncate">
                  <span class="font-medium text-neutral-700 dark:text-neutral-200">{{ invoice.client?.name || '—' }}</span>
                  <span class="mx-1.5 text-neutral-300 dark:text-neutral-700">·</span>
                  <span class="tabular-nums">{{ formatDate(invoice.date) }}</span>
                  <span v-if="invoice.due_date">
                    <span class="mx-1.5 text-neutral-300 dark:text-neutral-700">·</span>
                    <span :class="isOverdue ? 'text-danger-600 dark:text-danger-500 font-semibold' : ''">
                      {{ locale === 'ar' ? 'مستحقة' : 'Due' }} {{ formatDate(invoice.due_date) }}
                    </span>
                  </span>
                </p>
              </div>

              <!-- Action toolbar — grouped by intent -->
              <div class="flex items-center gap-1.5 flex-wrap">
                <!-- Primary status action — varies by status -->
                <UiAppButton
                  v-if="invoice.status === 'draft'"
                  variant="primary"
                  size="sm"
                  icon="i-lucide-send"
                  :loading="actionLoading"
                  @click="handleSend"
                >
                  {{ locale === 'ar' ? 'إرسال' : 'Send' }}
                </UiAppButton>
                <UiAppButton
                  v-if="['sent','partially_paid','overdue'].includes(invoice.status)"
                  variant="primary"
                  size="sm"
                  icon="i-lucide-banknote"
                  @click="paymentOpen = true"
                >
                  {{ locale === 'ar' ? 'تسجيل دفعة' : 'Record Payment' }}
                </UiAppButton>

                <!-- Secondary status actions -->
                <UiAppButton
                  v-if="invoice.status === 'draft'"
                  variant="outline"
                  size="sm"
                  icon="i-lucide-pencil"
                  @click="navigateTo(`/invoices/${invoice.id}/edit`)"
                >
                  {{ locale === 'ar' ? 'تعديل' : 'Edit' }}
                </UiAppButton>
                <UiAppButton
                  v-if="['sent','partially_paid','paid','overdue'].includes(invoice.status) && !invoice.journal_entry_id"
                  variant="outline"
                  size="sm"
                  icon="i-lucide-book-open"
                  :loading="actionLoading"
                  @click="handlePostGL"
                >
                  {{ locale === 'ar' ? 'ترحيل للقيود' : 'Post to GL' }}
                </UiAppButton>
                <UiAppButton
                  v-if="['sent','partially_paid','paid','overdue'].includes(invoice.status) && can('manage_eta')"
                  variant="outline"
                  size="sm"
                  icon="i-lucide-shield-check"
                  :loading="etaLoading"
                  @click="handleEtaPrepare"
                >
                  {{ locale === 'ar' ? 'تجهيز ETA' : 'Prepare ETA' }}
                </UiAppButton>

                <!-- Utility -->
                <UiAppButton
                  variant="outline"
                  size="sm"
                  icon="i-lucide-download"
                  @click="handleDownloadPdf"
                >
                  PDF
                </UiAppButton>

                <!-- Destructive — separated by a divider on lg -->
                <span v-if="canCancel || canDelete" class="hidden lg:inline-block w-px h-6 bg-neutral-200 dark:bg-neutral-800 mx-0.5" aria-hidden="true" />
                <UiAppButton
                  v-if="canCancel"
                  variant="outline"
                  size="sm"
                  icon="i-lucide-circle-slash"
                  :loading="actionLoading"
                  @click="handleCancel"
                >
                  {{ $t('common.cancel') }}
                </UiAppButton>
                <UiAppButton
                  v-if="canDelete"
                  variant="danger"
                  size="sm"
                  icon="i-lucide-trash-2"
                  @click="deleteOpen = true"
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
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                {{ locale === 'ar' ? 'الإجمالي الفرعي' : 'Subtotal' }}
              </p>
              <p class="font-mono text-lg font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
                {{ Number(invoice.subtotal).toLocaleString() }}
              </p>
            </div>
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                {{ locale === 'ar' ? 'ضريبة القيمة المضافة' : 'VAT' }}
              </p>
              <p class="font-mono text-lg font-bold tabular-nums text-info-600 dark:text-info-400" dir="ltr">
                {{ Number(invoice.vat_amount).toLocaleString() }}
              </p>
            </div>
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border-2 border-primary-500/30 dark:border-primary-500/40 p-4">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-400 mb-1.5">
                {{ $t('common.total') }}
              </p>
              <p class="font-mono text-xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
                {{ Number(invoice.total).toLocaleString() }}
                <span class="text-xs font-sans text-neutral-500 dark:text-neutral-400 ms-0.5">{{ invoice.currency || 'EGP' }}</span>
              </p>
            </div>
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
                {{ locale === 'ar' ? 'المستحق' : 'Balance Due' }}
              </p>
              <p
                class="font-mono text-lg font-bold tabular-nums"
                dir="ltr"
                :class="Number(invoice.balance_due) > 0
                  ? 'text-warning-600 dark:text-warning-500'
                  : 'text-success-600 dark:text-success-500'"
              >
                {{ Number(invoice.balance_due).toLocaleString() }}
              </p>
            </div>
          </div>

          <!-- Two-column layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <!-- Left: line items + payments -->
            <div class="lg:col-span-2 space-y-5">
              <!-- Line items -->
              <section
                v-motion
                :initial="{ opacity: 0, y: 12 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 140 } }"
                class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
              >
                <header class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 flex items-center gap-2">
                    <UIcon name="i-lucide-list" class="w-4 h-4 text-neutral-400" />
                    {{ locale === 'ar' ? 'البنود' : 'Line Items' }}
                    <span class="text-[11px] font-normal text-neutral-500 dark:text-neutral-400 tabular-nums">
                      ({{ invoice.lines?.length || 0 }})
                    </span>
                  </h3>
                </header>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm border-collapse">
                    <thead class="bg-neutral-50/40 dark:bg-neutral-950/20">
                      <tr class="border-b border-neutral-200 dark:border-neutral-800">
                        <th class="px-3 py-2 text-start text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          {{ locale === 'ar' ? 'الوصف' : 'Description' }}
                        </th>
                        <th class="px-3 py-2 text-end text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-[72px]">
                          {{ locale === 'ar' ? 'الكمية' : 'Qty' }}
                        </th>
                        <th class="px-3 py-2 text-end text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-[100px]">
                          {{ locale === 'ar' ? 'السعر' : 'Price' }}
                        </th>
                        <th class="px-3 py-2 text-end text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-[72px]">
                          {{ locale === 'ar' ? 'ضريبة' : 'VAT' }}
                        </th>
                        <th class="px-3 py-2 text-end text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-[110px]">
                          {{ locale === 'ar' ? 'الإجمالي' : 'Total' }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="line in invoice.lines"
                        :key="line.id"
                        class="border-b border-neutral-100 dark:border-neutral-800/60 last:border-b-0"
                      >
                        <td class="px-3 py-2 text-neutral-700 dark:text-neutral-200">{{ line.description }}</td>
                        <td class="px-3 py-2 text-end font-mono tabular-nums text-neutral-600 dark:text-neutral-400" dir="ltr">{{ line.quantity }}</td>
                        <td class="px-3 py-2 text-end font-mono tabular-nums text-neutral-600 dark:text-neutral-400" dir="ltr">{{ Number(line.unit_price).toLocaleString() }}</td>
                        <td class="px-3 py-2 text-end font-mono tabular-nums text-neutral-500 dark:text-neutral-500" dir="ltr">{{ line.vat_rate }}%</td>
                        <td class="px-3 py-2 text-end font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">{{ Number(line.total).toLocaleString() }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <!-- Payments -->
              <section
                v-if="invoice.payments && invoice.payments.length > 0"
                v-motion
                :initial="{ opacity: 0, y: 12 }"
                :enter="{ opacity: 1, y: 0, transition: { delay: 220 } }"
                class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
              >
                <header class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 flex items-center gap-2">
                    <UIcon name="i-lucide-banknote" class="w-4 h-4 text-success-500" />
                    {{ locale === 'ar' ? 'المدفوعات' : 'Payments' }}
                    <span class="text-[11px] font-normal text-neutral-500 dark:text-neutral-400 tabular-nums">
                      ({{ invoice.payments.length }})
                    </span>
                  </h3>
                </header>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm border-collapse">
                    <thead class="bg-neutral-50/40 dark:bg-neutral-950/20">
                      <tr class="border-b border-neutral-200 dark:border-neutral-800">
                        <th class="px-3 py-2 text-start text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          {{ locale === 'ar' ? 'التاريخ' : 'Date' }}
                        </th>
                        <th class="px-3 py-2 text-end text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          {{ locale === 'ar' ? 'المبلغ' : 'Amount' }}
                        </th>
                        <th class="px-3 py-2 text-start text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          {{ locale === 'ar' ? 'الطريقة' : 'Method' }}
                        </th>
                        <th class="px-3 py-2 text-start text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                          {{ locale === 'ar' ? 'المرجع' : 'Reference' }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="pmt in invoice.payments"
                        :key="pmt.id"
                        class="border-b border-neutral-100 dark:border-neutral-800/60 last:border-b-0"
                      >
                        <td class="px-3 py-2 text-neutral-600 dark:text-neutral-400 tabular-nums">{{ formatDate(pmt.date) }}</td>
                        <td class="px-3 py-2 text-end font-mono font-semibold tabular-nums text-success-700 dark:text-success-400" dir="ltr">
                          {{ Number(pmt.amount).toLocaleString() }}
                        </td>
                        <td class="px-3 py-2">
                          <UiBadge color="gray" size="xs" :icon="paymentMethodIcon(pmt.method)">
                            {{ paymentMethodLabel(pmt.method) }}
                          </UiBadge>
                        </td>
                        <td class="px-3 py-2 text-neutral-500 dark:text-neutral-500 font-mono text-xs">{{ pmt.reference || '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <!-- Notes + Terms -->
              <section
                v-if="invoice.notes || invoice.terms"
                class="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <div
                  v-if="invoice.notes"
                  class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
                >
                  <h4 class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                    <UIcon name="i-lucide-sticky-note" class="w-3.5 h-3.5" />
                    {{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}
                  </h4>
                  <p class="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-line leading-relaxed">{{ invoice.notes }}</p>
                </div>
                <div
                  v-if="invoice.terms"
                  class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
                >
                  <h4 class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1.5">
                    <UIcon name="i-lucide-handshake" class="w-3.5 h-3.5" />
                    {{ locale === 'ar' ? 'شروط الدفع' : 'Payment Terms' }}
                  </h4>
                  <p class="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-line leading-relaxed">{{ invoice.terms }}</p>
                </div>
              </section>
            </div>

            <!-- Right rail: client + dates + ETA -->
            <aside
              v-motion
              :initial="{ opacity: 0, x: locale === 'ar' ? -8 : 8 }"
              :enter="{ opacity: 1, x: 0, transition: { delay: 180 } }"
              class="space-y-3"
            >
              <!-- Client card -->
              <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                <h4 class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 flex items-center gap-1.5">
                  <UIcon name="i-lucide-user" class="w-3.5 h-3.5" />
                  {{ locale === 'ar' ? 'العميل' : 'Client' }}
                </h4>
                <div class="flex items-start gap-3 mb-3">
                  <div
                    class="w-9 h-9 rounded-md bg-primary-500/10 text-primary-700 dark:text-primary-300 inline-flex items-center justify-center text-sm font-bold flex-shrink-0"
                  >
                    {{ (invoice.client?.name || '?').charAt(0).toUpperCase() }}
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 truncate">
                      {{ invoice.client?.name || '—' }}
                    </p>
                    <NuxtLink
                      v-if="invoice.client?.id"
                      :to="`/clients/${invoice.client.id}`"
                      class="text-[11px] text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 inline-flex items-center gap-0.5 mt-0.5"
                    >
                      {{ locale === 'ar' ? 'فتح ملف العميل' : 'Open client' }}
                      <UIcon name="i-lucide-arrow-right" class="w-3 h-3 rtl:rotate-180" />
                    </NuxtLink>
                  </div>
                </div>
                <ul v-if="invoice.client?.email || invoice.client?.phone" class="space-y-1.5 text-xs pt-3 border-t border-neutral-200 dark:border-neutral-800">
                  <li v-if="invoice.client?.email" class="flex items-center gap-2">
                    <UIcon name="i-lucide-mail" class="w-3 h-3 text-neutral-400 flex-shrink-0" />
                    <a :href="`mailto:${invoice.client.email}`" dir="ltr" class="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 truncate">
                      {{ invoice.client.email }}
                    </a>
                  </li>
                  <li v-if="invoice.client?.phone" class="flex items-center gap-2">
                    <UIcon name="i-lucide-phone" class="w-3 h-3 text-neutral-400 flex-shrink-0" />
                    <a :href="`tel:${invoice.client.phone}`" dir="ltr" class="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400">
                      {{ invoice.client.phone }}
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Dates card -->
              <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                <h4 class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 flex items-center gap-1.5">
                  <UIcon name="i-lucide-calendar" class="w-3.5 h-3.5" />
                  {{ locale === 'ar' ? 'التواريخ' : 'Dates' }}
                </h4>
                <dl class="space-y-2 text-xs">
                  <div class="flex justify-between items-center">
                    <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'تاريخ الإصدار' : 'Issue Date' }}</dt>
                    <dd class="text-neutral-900 dark:text-neutral-0 tabular-nums">{{ formatDate(invoice.date) }}</dd>
                  </div>
                  <div v-if="invoice.due_date" class="flex justify-between items-center">
                    <dt class="text-neutral-500 dark:text-neutral-400">{{ locale === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date' }}</dt>
                    <dd class="tabular-nums" :class="isOverdue ? 'text-danger-600 dark:text-danger-500 font-semibold' : 'text-neutral-900 dark:text-neutral-0'">
                      {{ formatDate(invoice.due_date) }}
                      <UIcon v-if="isOverdue" name="i-lucide-alert-triangle" class="inline w-3 h-3 ms-0.5" />
                    </dd>
                  </div>
                </dl>
              </div>

              <!-- ETA card (only when invoice has an ETA document) -->
              <div
                v-if="invoice.eta_document"
                class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
              >
                <h4 class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 flex items-center gap-1.5">
                  <UIcon name="i-lucide-shield" class="w-3.5 h-3.5" />
                  {{ locale === 'ar' ? 'الفوترة الإلكترونية' : 'ETA E-Invoicing' }}
                </h4>
                <div class="flex items-center gap-2 mb-2">
                  <UiBadge :color="etaColor(invoice.eta_document.status)" dot>
                    {{ etaLabel(invoice.eta_document.status) }}
                  </UiBadge>
                </div>
                <p
                  v-if="invoice.eta_document.error_message"
                  class="text-[11px] text-danger-600 dark:text-danger-500 leading-relaxed"
                >
                  {{ invoice.eta_document.error_message }}
                </p>
                <p
                  v-if="invoice.eta_document.uuid"
                  class="text-[10px] font-mono text-neutral-500 dark:text-neutral-500 mt-2 break-all"
                  dir="ltr"
                >
                  UUID: {{ invoice.eta_document.uuid }}
                </p>
              </div>
            </aside>
          </div>

          <!-- Record Payment SlideOver -->
          <UiSlideOver v-model="paymentOpen" :title="locale === 'ar' ? 'تسجيل دفعة' : 'Record Payment'">
            <form @submit.prevent="handlePayment" class="space-y-4">
              <div>
                <label class="form-label">
                  {{ locale === 'ar' ? 'المبلغ' : 'Amount' }}
                  <span class="text-danger-500">*</span>
                </label>
                <input
                  v-model="payment.values.amount"
                  type="number"
                  step="0.01"
                  :max="invoice.balance_due"
                  class="form-input font-mono"
                  :class="{ 'form-input--error': payment.errors.value.amount }"
                  dir="ltr"
                  @input="payment.clearError('amount')"
                />
                <p v-if="payment.errors.value.amount" class="form-error">{{ payment.errors.value.amount }}</p>
                <p v-else class="text-[11px] text-neutral-400 mt-1">
                  {{ locale === 'ar' ? 'المستحق:' : 'Due:' }} {{ Number(invoice.balance_due).toLocaleString() }} {{ invoice.currency || 'EGP' }}
                </p>
              </div>
              <div>
                <label class="form-label">
                  {{ locale === 'ar' ? 'التاريخ' : 'Date' }}
                  <span class="text-danger-500">*</span>
                </label>
                <input
                  v-model="payment.values.date"
                  type="date"
                  class="form-input"
                  :class="{ 'form-input--error': payment.errors.value.date }"
                  @input="payment.clearError('date')"
                />
                <p v-if="payment.errors.value.date" class="form-error">{{ payment.errors.value.date }}</p>
              </div>
              <div>
                <label class="form-label">
                  {{ locale === 'ar' ? 'طريقة الدفع' : 'Method' }}
                  <span class="text-danger-500">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model="payment.values.method"
                    class="form-input"
                    :class="{ 'form-input--error': payment.errors.value.method }"
                    @change="payment.clearError('method')"
                  >
                    <option value="cash">{{ locale === 'ar' ? 'نقدي' : 'Cash' }}</option>
                    <option value="bank_transfer">{{ locale === 'ar' ? 'تحويل بنكي' : 'Bank Transfer' }}</option>
                    <option value="cheque">{{ locale === 'ar' ? 'شيك' : 'Cheque' }}</option>
                    <option value="credit_card">{{ locale === 'ar' ? 'بطاقة ائتمان' : 'Credit Card' }}</option>
                    <option value="other">{{ locale === 'ar' ? 'أخرى' : 'Other' }}</option>
                  </select>
                  <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                </div>
                <p v-if="payment.errors.value.method" class="form-error">{{ payment.errors.value.method }}</p>
              </div>
              <div>
                <label class="form-label">{{ locale === 'ar' ? 'المرجع' : 'Reference' }}</label>
                <input v-model="payment.values.reference" type="text" class="form-input" :placeholder="locale === 'ar' ? 'رقم التحويل / الشيك' : 'Transfer / cheque number'" />
              </div>
              <div>
                <label class="form-label">{{ locale === 'ar' ? 'ملاحظات' : 'Notes' }}</label>
                <textarea v-model="payment.values.notes" rows="2" class="form-input resize-none" />
              </div>
              <div class="flex gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <UiAppButton type="button" variant="outline" class="flex-1" @click="paymentOpen = false">
                  {{ $t('common.cancel') }}
                </UiAppButton>
                <UiAppButton
                  type="submit"
                  variant="primary"
                  icon="i-lucide-check"
                  :loading="payment.submitting.value || paymentMutation.loading.value"
                  class="flex-1"
                >
                  {{ locale === 'ar' ? 'تسجيل' : 'Record' }}
                </UiAppButton>
              </div>
            </form>
          </UiSlideOver>

          <!-- Delete confirm -->
          <UiConfirmModal
            v-model="deleteOpen"
            :title="locale === 'ar' ? 'حذف الفاتورة' : 'Delete Invoice'"
            :description="locale === 'ar' ? 'سيتم حذف هذه المسودة نهائياً. لا يمكن التراجع.' : 'This draft will be permanently deleted. This cannot be undone.'"
            icon="i-lucide-alert-triangle"
            variant="danger"
            :confirm-label="$t('common.delete')"
            :loading="removeMutation.loading.value"
            @confirm="handleDelete"
          />
        </template>
      </div>
    </FeatureBoundary>
</template>

<script setup lang="ts">
import type { ApiError } from '~/core/api/errors'
import { paymentFormSchema, type PaymentFormInput } from '~/features/invoices/schemas'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const route = useRoute()
const toastStore = useToastStore()
const authStore = useAuthStore()
const { can } = usePermissions()

const invoiceId = computed(() => Number(route.params.id))
const { data: invoice, loading, error, refresh } = useInvoice(invoiceId)
const {
  send: sendMutation,
  cancel: cancelMutation,
  postToGL: postGLMutation,
  remove: removeMutation,
  recordPayment: paymentMutation,
} = useInvoiceMutations()

const actionLoading = computed(() =>
  sendMutation.loading.value || cancelMutation.loading.value || postGLMutation.loading.value,
)
const paymentOpen = ref(false)
const deleteOpen = ref(false)
const etaLoading = ref(false)

watch(error, (e) => {
  if (e) {
    toastStore.error(locale.value === 'ar' ? 'الفاتورة غير موجودة' : 'Invoice not found')
    navigateTo('/invoices')
  }
})

const canCancel = computed(() => {
  const s = invoice.value?.status
  return !!s && s !== 'cancelled' && s !== 'draft'
})
const canDelete = computed(() => invoice.value?.status === 'draft')

const isOverdue = computed(() => {
  const s = invoice.value?.status
  if (s !== 'sent' && s !== 'partially_paid' && s !== 'overdue') return false
  const due = invoice.value?.due_date
  if (!due) return false
  return new Date(due).getTime() < Date.now() - 24 * 60 * 60 * 1000
})

const payment = useZodForm<PaymentFormInput>({
  schema: paymentFormSchema,
  initial: {
    invoice_id: 0,
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    method: 'bank_transfer',
    reference: '',
    notes: '',
  },
})

watch(() => paymentOpen.value, (open) => {
  if (open && invoice.value) {
    payment.setValues({
      invoice_id: invoice.value.id,
      amount: Number(invoice.value.balance_due) || 0,
      date: new Date().toISOString().slice(0, 10),
      method: 'bank_transfer',
      reference: '',
      notes: '',
    })
  }
})

// --- Mutations ---
async function handleSend() {
  try {
    await sendMutation.mutate(invoice.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم إرسال الفاتورة' : 'Invoice sent')
    refresh()
  } catch (e) {
    toastStore.error((e as ApiError).message || 'Error')
  }
}

async function handleCancel() {
  try {
    await cancelMutation.mutate(invoice.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم إلغاء الفاتورة' : 'Invoice cancelled')
    refresh()
  } catch (e) {
    toastStore.error((e as ApiError).message || 'Error')
  }
}

async function handlePostGL() {
  try {
    await postGLMutation.mutate(invoice.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم الترحيل' : 'Posted to GL')
    refresh()
  } catch (e) {
    toastStore.error((e as ApiError).message || 'Error')
  }
}

async function handlePayment() {
  const result = await payment.handleSubmit(async (data) => {
    await paymentMutation.mutate(data as any)
  })
  if (result.ok) {
    toastStore.success(locale.value === 'ar' ? 'تم تسجيل الدفعة' : 'Payment recorded')
    paymentOpen.value = false
    payment.reset()
    refresh()
  } else if ('error' in result && result.error) {
    const err = result.error as ApiError
    payment.applyApiErrors(err)
    toastStore.error(err.message || 'Error')
  }
}

async function handleDelete() {
  try {
    await removeMutation.mutate(invoice.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
    navigateTo('/invoices')
  } catch (e) {
    toastStore.error((e as ApiError).message || 'Error')
  }
  deleteOpen.value = false
}

async function handleEtaPrepare() {
  etaLoading.value = true
  try {
    const { prepareDocument } = useEta()
    await prepareDocument(invoice.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم تجهيز المستند الإلكتروني' : 'ETA document prepared')
    refresh()
  } catch (e: any) {
    toastStore.error(e?.message || 'Error')
  } finally {
    etaLoading.value = false
  }
}

function handleDownloadPdf() {
  const config = useRuntimeConfig()
  const token = authStore.token || useCookie('auth_token').value || ''
  const tenantId = useTenantId()
  const url = `${config.public.apiBase}/invoices/${invoice.value!.id}/pdf?token=${encodeURIComponent(token)}&tenant=${tenantId}`
  window.open(url, '_blank')
}

// --- Display helpers ---
const STATUS_COLOR: Record<string, 'gray' | 'blue' | 'green' | 'orange' | 'red'> = {
  draft: 'gray', sent: 'blue', paid: 'green', partially_paid: 'orange', overdue: 'red', cancelled: 'gray',
}
function statusColor(s: string) { return STATUS_COLOR[s] ?? 'gray' }
function statusLabel(s: string) {
  if (locale.value !== 'ar') return s.replace('_', ' ')
  const map: Record<string, string> = {
    draft: 'مسودة', sent: 'مرسلة', paid: 'مدفوعة',
    partially_paid: 'مدفوعة جزئياً', overdue: 'متأخرة', cancelled: 'ملغاة',
  }
  return map[s] ?? s
}
function typeLabel(t: string) {
  if (locale.value !== 'ar') return t.replace('_', ' ')
  const map: Record<string, string> = { invoice: 'فاتورة', credit_note: 'إشعار دائن', debit_note: 'إشعار مدين' }
  return map[t] ?? t
}

const ETA_COLOR: Record<string, 'gray' | 'blue' | 'green' | 'red'> = {
  pending: 'gray', submitted: 'blue', valid: 'green', invalid: 'red', cancelled: 'gray',
}
function etaColor(s: string) { return ETA_COLOR[s] ?? 'gray' }
function etaLabel(s: string) {
  if (locale.value !== 'ar') return s
  const map: Record<string, string> = {
    pending: 'قيد الإرسال', submitted: 'مُرسلة', valid: 'صالحة', invalid: 'مرفوضة', cancelled: 'ملغاة',
  }
  return map[s] ?? s
}

const PAYMENT_METHOD_ICONS: Record<string, string> = {
  cash: 'i-lucide-banknote',
  bank_transfer: 'i-lucide-building-2',
  cheque: 'i-lucide-file-pen',
  credit_card: 'i-lucide-credit-card',
  other: 'i-lucide-circle-help',
}
function paymentMethodIcon(m: string) { return PAYMENT_METHOD_ICONS[m] ?? PAYMENT_METHOD_ICONS.other }
function paymentMethodLabel(m: string) {
  if (locale.value !== 'ar') return m.replace('_', ' ')
  const map: Record<string, string> = {
    cash: 'نقدي', bank_transfer: 'تحويل بنكي', cheque: 'شيك', credit_card: 'بطاقة ائتمان', other: 'أخرى',
  }
  return map[m] ?? m
}

function formatDate(d: string | undefined | null) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch {
    return d
  }
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.form-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.form-error { @apply mt-1 text-xs text-danger-600 dark:text-danger-500 flex items-center gap-1; }

.form-input {
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
.form-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
textarea.form-input { height: auto; padding-block: 0.5rem; }
.form-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }
.form-input--error:focus { border-color: var(--color-danger-500); box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-danger-500) 25%, transparent); }

:global(html.dark) .form-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
