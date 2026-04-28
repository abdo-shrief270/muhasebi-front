<template>
    <FeatureBoundary id="vendors">
      <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
        <!-- Loading -->
        <template v-if="loading">
          <div class="space-y-4">
            <div class="h-12 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div v-for="i in 4" :key="i" class="h-24 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            </div>
            <div class="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          </div>
        </template>

        <template v-else-if="vendor">
          <!-- Header -->
          <div v-motion :initial="{ opacity: 0, y: -6 }" :enter="{ opacity: 1, y: 0 }" class="mb-5">
            <NuxtLink
              to="/vendors"
              class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-0 transition-colors mb-3"
            >
              <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5 rtl:rotate-180" />
              {{ $t('nav.vendors') }}
            </NuxtLink>

            <div class="flex items-start sm:items-center justify-between gap-3 flex-wrap">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div
                  class="w-12 h-12 rounded-lg bg-info-500/10 text-info-700 dark:text-info-300 inline-flex items-center justify-center text-base font-bold flex-shrink-0"
                >
                  {{ initial }}
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight truncate">
                      {{ displayName }}
                    </h1>
                    <UiBadge :color="vendor.is_active ? 'green' : 'gray'" dot>
                      {{ vendor.is_active ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
                    </UiBadge>
                  </div>
                  <p v-if="secondaryName" class="text-sm text-neutral-500 dark:text-neutral-400 truncate mt-0.5" :dir="locale === 'ar' ? 'ltr' : 'rtl'">
                    {{ secondaryName }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <UiAppButton
                  variant="outline"
                  size="sm"
                  icon="i-lucide-download"
                  @click="navigateTo(`/vendors/${vendor.id}/statement`)"
                  :disabled="true"
                  :title="locale === 'ar' ? 'كشف حساب — قريباً' : 'Statement — coming soon'"
                >
                  {{ locale === 'ar' ? 'كشف حساب' : 'Statement' }}
                </UiAppButton>
                <UiAppButton variant="outline" size="sm" icon="i-lucide-pencil" @click="editOpen = true">
                  {{ $t('common.edit') }}
                </UiAppButton>
                <UiAppButton variant="danger" size="sm" icon="i-lucide-trash-2" @click="deleteConfirmOpen = true">
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
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5"
          >
            <!-- Outstanding (we owe vendor) -->
            <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <span class="absolute top-0 start-4 right-4 h-0.5 rounded-b-full bg-warning-500" aria-hidden="true" />
              <div class="flex items-start justify-between mb-2">
                <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {{ locale === 'ar' ? 'المستحق للمورد' : 'You Owe' }}
                </p>
                <UIcon name="i-lucide-wallet" class="w-4 h-4 text-warning-500" />
              </div>
              <p class="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">
                {{ formatMoney(vendor.balance ?? 0) }}
              </p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{{ vendor.currency || 'EGP' }}</p>
            </div>

            <!-- Open bills -->
            <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <span class="absolute top-0 start-4 right-4 h-0.5 rounded-b-full bg-primary-500" aria-hidden="true" />
              <div class="flex items-start justify-between mb-2">
                <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {{ locale === 'ar' ? 'فواتير مفتوحة' : 'Open Bills' }}
                </p>
                <UIcon name="i-lucide-receipt" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <p class="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">
                {{ vendor.open_bills_count ?? 0 }}
              </p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {{ totalBillsLabel }}
              </p>
            </div>

            <!-- Last payment -->
            <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <span class="absolute top-0 start-4 right-4 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
              <div class="flex items-start justify-between mb-2">
                <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {{ locale === 'ar' ? 'آخر دفعة' : 'Last Payment' }}
                </p>
                <UIcon name="i-lucide-banknote" class="w-4 h-4 text-success-500" />
              </div>
              <p class="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">
                {{ vendor.last_payment_at ? formatDate(vendor.last_payment_at) : '—' }}
              </p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {{ vendor.last_payment_at ? lastPaymentRelative : (locale === 'ar' ? 'لا توجد مدفوعات' : 'No payments yet') }}
              </p>
            </div>

            <!-- Vendor since -->
            <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <span class="absolute top-0 start-4 right-4 h-0.5 rounded-b-full bg-info-500" aria-hidden="true" />
              <div class="flex items-start justify-between mb-2">
                <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {{ locale === 'ar' ? 'مورد منذ' : 'Vendor Since' }}
                </p>
                <UIcon name="i-lucide-calendar" class="w-4 h-4 text-info-600 dark:text-info-400" />
              </div>
              <p class="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">{{ vendorSince }}</p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{{ relativeAge }}</p>
            </div>
          </div>

          <!-- Aging buckets -->
          <div
            v-if="vendor.aging_buckets"
            v-motion
            :initial="{ opacity: 0, y: 12 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 140 } }"
            class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-5"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
                {{ locale === 'ar' ? 'تقادم الأرصدة' : 'Aging' }}
              </h3>
              <span class="text-[10px] uppercase tracking-wider text-neutral-400">{{ vendor.currency || 'EGP' }}</span>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div
                v-for="b in agingBuckets"
                :key="b.key"
                class="rounded-md p-3 transition-colors"
                :class="b.tint"
              >
                <p class="text-[10px] font-semibold uppercase tracking-wider opacity-70 mb-1">{{ b.label }}</p>
                <p class="text-lg font-bold tabular-nums">{{ formatMoney(b.value) }}</p>
              </div>
            </div>
          </div>

          <!-- Info cards -->
          <div
            v-motion
            :initial="{ opacity: 0, y: 12 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }"
            class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5"
          >
            <!-- Contact -->
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <h4 class="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <UIcon name="i-lucide-contact" class="w-3.5 h-3.5" />
                {{ locale === 'ar' ? 'التواصل' : 'Contact' }}
              </h4>
              <ul class="space-y-2 text-sm">
                <li v-if="vendor.email" class="flex items-start gap-2.5">
                  <UIcon name="i-lucide-mail" class="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <a :href="`mailto:${vendor.email}`" class="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate" dir="ltr">
                    {{ vendor.email }}
                  </a>
                </li>
                <li v-if="vendor.phone" class="flex items-start gap-2.5">
                  <UIcon name="i-lucide-phone" class="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <a :href="`tel:${vendor.phone}`" class="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" dir="ltr">
                    {{ vendor.phone }}
                  </a>
                </li>
                <li v-if="primaryContact?.name" class="flex items-start gap-2.5">
                  <UIcon name="i-lucide-user" class="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <span class="text-neutral-700 dark:text-neutral-200">
                    {{ primaryContact.name }}<span v-if="primaryContact.role" class="text-neutral-400 text-xs"> · {{ primaryContact.role }}</span>
                  </span>
                </li>
                <li v-if="primaryContact?.email" class="flex items-start gap-2.5">
                  <UIcon name="i-lucide-at-sign" class="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <a :href="`mailto:${primaryContact.email}`" class="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate" dir="ltr">
                    {{ primaryContact.email }}
                  </a>
                </li>
                <li v-if="primaryContact?.phone" class="flex items-start gap-2.5">
                  <UIcon name="i-lucide-smartphone" class="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                  <a :href="`tel:${primaryContact.phone}`" class="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" dir="ltr">
                    {{ primaryContact.phone }}
                  </a>
                </li>
                <li v-if="!vendor.email && !vendor.phone && !primaryContact" class="text-xs text-neutral-400">—</li>
              </ul>
            </div>

            <!-- Legal -->
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <h4 class="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <UIcon name="i-lucide-scale" class="w-3.5 h-3.5" />
                {{ locale === 'ar' ? 'قانوني' : 'Legal' }}
              </h4>
              <ul class="space-y-2 text-sm">
                <li v-if="vendor.tax_id" class="flex items-start justify-between gap-2">
                  <span class="text-neutral-500 dark:text-neutral-400 text-xs">{{ locale === 'ar' ? 'ضريبي' : 'TIN' }}</span>
                  <span class="font-mono text-xs text-neutral-700 dark:text-neutral-200" dir="ltr">{{ vendor.tax_id }}</span>
                </li>
                <li v-if="vendor.commercial_register" class="flex items-start justify-between gap-2">
                  <span class="text-neutral-500 dark:text-neutral-400 text-xs">{{ locale === 'ar' ? 'سجل' : 'CR' }}</span>
                  <span class="font-mono text-xs text-neutral-700 dark:text-neutral-200" dir="ltr">{{ vendor.commercial_register }}</span>
                </li>
                <li v-if="vendor.vat_registration" class="flex items-start justify-between gap-2">
                  <span class="text-neutral-500 dark:text-neutral-400 text-xs">{{ locale === 'ar' ? 'القيمة المضافة' : 'VAT' }}</span>
                  <span class="font-mono text-xs text-neutral-700 dark:text-neutral-200" dir="ltr">{{ vendor.vat_registration }}</span>
                </li>
                <li v-if="vendor.payment_terms" class="flex items-start justify-between gap-2">
                  <span class="text-neutral-500 dark:text-neutral-400 text-xs">{{ locale === 'ar' ? 'شروط' : 'Terms' }}</span>
                  <span class="text-xs text-neutral-700 dark:text-neutral-200 text-end">{{ paymentTermsLabel }}</span>
                </li>
                <li v-if="hasCreditLimit" class="flex items-start justify-between gap-2">
                  <span class="text-neutral-500 dark:text-neutral-400 text-xs">{{ locale === 'ar' ? 'حد ائتماني' : 'Credit' }}</span>
                  <span class="font-mono text-xs text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">
                    {{ formatMoney(vendor.credit_limit ?? 0) }} {{ vendor.currency }}
                  </span>
                </li>
                <li v-if="!vendor.tax_id && !vendor.commercial_register && !vendor.vat_registration && !vendor.payment_terms && !hasCreditLimit" class="text-xs text-neutral-400">—</li>
              </ul>
            </div>

            <!-- Address -->
            <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
              <h4 class="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5" />
                {{ locale === 'ar' ? 'العنوان' : 'Address' }}
              </h4>
              <div class="space-y-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                <p v-if="primaryAddress">{{ primaryAddress }}</p>
                <p v-if="vendor.city || vendor.country" class="text-neutral-500 dark:text-neutral-400 text-xs">
                  {{ [vendor.city, vendor.country].filter(Boolean).join(' · ') }}
                </p>
                <p v-if="!primaryAddress && !vendor.city" class="text-xs text-neutral-400">—</p>
              </div>
            </div>
          </div>

          <!-- Banking (only when present) -->
          <div
            v-if="hasBankInfo"
            v-motion
            :initial="{ opacity: 0, y: 12 }"
            :enter="{ opacity: 1, y: 0, transition: { delay: 240 } }"
            class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-5"
          >
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3 flex items-center gap-1.5">
              <UIcon name="i-lucide-landmark" class="w-4 h-4 text-neutral-400" />
              {{ locale === 'ar' ? 'بيانات بنكية' : 'Banking' }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
              <div v-if="vendor.bank_name">
                <p class="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">{{ locale === 'ar' ? 'اسم البنك' : 'Bank' }}</p>
                <p class="text-neutral-900 dark:text-neutral-0">{{ vendor.bank_name }}</p>
              </div>
              <div v-if="vendor.bank_account">
                <p class="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">{{ locale === 'ar' ? 'رقم الحساب' : 'Account' }}</p>
                <p class="font-mono text-xs text-neutral-900 dark:text-neutral-0" dir="ltr">{{ vendor.bank_account }}</p>
              </div>
              <div v-if="vendor.iban">
                <p class="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">IBAN</p>
                <p class="font-mono text-xs text-neutral-900 dark:text-neutral-0 break-all" dir="ltr">{{ vendor.iban }}</p>
              </div>
              <div v-if="vendor.swift_code">
                <p class="text-[10px] text-neutral-500 uppercase tracking-wider mb-0.5">SWIFT</p>
                <p class="font-mono text-xs text-neutral-900 dark:text-neutral-0" dir="ltr">{{ vendor.swift_code }}</p>
              </div>
            </div>
          </div>

          <!-- Tabs: bills + notes -->
          <UiTabs v-model="activeTab" :tabs="tabs">
            <Transition name="fade-slide" mode="out-in">
              <div :key="activeTab">
                <!-- Bills -->
                <div
                  v-if="activeTab === 'bills'"
                  class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                >
                  <div class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
                    <span class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                      {{ vendorBills.length }}
                      {{ locale === 'ar' ? 'فاتورة' : (vendorBills.length === 1 ? 'bill' : 'bills') }}
                    </span>
                    <UiAppButton
                      variant="primary"
                      size="sm"
                      icon="i-lucide-plus"
                      @click="navigateTo(`/bills/create?vendor_id=${vendor.id}`)"
                    >
                      {{ locale === 'ar' ? 'فاتورة جديدة' : 'New Bill' }}
                    </UiAppButton>
                  </div>
                  <ul v-if="vendorBills.length > 0" class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    <li
                      v-for="b in vendorBills"
                      :key="b.id"
                      @click="navigateTo(`/bills/${b.id}`)"
                      class="px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group/row"
                    >
                      <div class="flex items-center gap-3 min-w-0">
                        <UIcon name="i-lucide-receipt" class="w-4 h-4 text-neutral-400 group-hover/row:text-primary-500 transition-colors flex-shrink-0" />
                        <div class="min-w-0">
                          <p class="font-mono text-xs text-primary-700 dark:text-primary-400 font-semibold truncate">{{ b.bill_number || b.number || '—' }}</p>
                          <p class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{{ formatDate(b.bill_date || b.date) }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2.5 flex-shrink-0">
                        <span class="font-mono text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
                          {{ Number(b.total).toLocaleString() }}
                        </span>
                        <UiBadge :color="billStatusColor(b.status)" dot>
                          {{ billStatusLabel(b.status) }}
                        </UiBadge>
                      </div>
                    </li>
                  </ul>
                  <UiEmptyState
                    v-else
                    icon="i-lucide-receipt"
                    :title="locale === 'ar' ? 'لا توجد فواتير' : 'No bills yet'"
                    :description="locale === 'ar' ? 'لم يتم تسجيل أي فاتورة لهذا المورد بعد.' : 'No bills have been recorded for this vendor yet.'"
                  />
                </div>

                <!-- Products (per-vendor billable items) -->
                <div
                  v-if="activeTab === 'products'"
                  class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                >
                  <div class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
                    <span class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                      {{ vendorProducts.length }}
                      {{ locale === 'ar' ? 'بند' : (vendorProducts.length === 1 ? 'item' : 'items') }}
                    </span>
                    <UiAppButton
                      variant="primary"
                      size="sm"
                      icon="i-lucide-plus"
                      @click="openProductCreate"
                    >
                      {{ locale === 'ar' ? 'بند جديد' : 'New Item' }}
                    </UiAppButton>
                  </div>

                  <ul v-if="vendorProducts.length > 0" class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    <li
                      v-for="p in vendorProducts"
                      :key="p.id"
                      class="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
                    >
                      <div class="flex items-start gap-3 min-w-0 flex-1">
                        <UIcon
                          name="i-lucide-package"
                          class="w-4 h-4 mt-0.5 flex-shrink-0"
                          :class="p.is_active ? 'text-info-500' : 'text-neutral-400'"
                        />
                        <div class="min-w-0">
                          <div class="flex items-center gap-2 flex-wrap">
                            <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ p.name }}</p>
                            <UiBadge v-if="!p.is_active" color="gray" dot>
                              {{ locale === 'ar' ? 'غير نشط' : 'Inactive' }}
                            </UiBadge>
                          </div>
                          <div class="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 flex-wrap">
                            <span class="font-mono tabular-nums" dir="ltr">
                              {{ formatMoney(p.unit_price) }} {{ vendor?.currency || 'EGP' }}
                            </span>
                            <span v-if="p.default_vat_rate != null">
                              · VAT {{ Number(p.default_vat_rate).toFixed(0) }}%
                            </span>
                            <span v-if="p.default_account" class="font-mono">
                              · {{ p.default_account.code }}
                            </span>
                          </div>
                          <p v-if="p.description" class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                            {{ p.description }}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-0.5 flex-shrink-0" @click.stop>
                        <button
                          type="button"
                          class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-primary-600 hover:bg-primary-500/10 transition-colors"
                          :title="$t('common.edit')"
                          @click="openProductEdit(p)"
                        >
                          <UIcon name="i-lucide-pencil" class="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-danger-600 hover:bg-danger-500/10 transition-colors"
                          :title="$t('common.delete')"
                          @click="confirmProductDelete(p)"
                        >
                          <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  </ul>
                  <UiEmptyState
                    v-else
                    icon="i-lucide-package"
                    :title="locale === 'ar' ? 'لا توجد بنود محفوظة' : 'No saved items yet'"
                    :description="locale === 'ar' ? 'أضف البنود التي تشتريها من هذا المورد لتسريع إدخال الفواتير.' : 'Save items you buy from this vendor to speed up bill entry.'"
                  >
                    <template #action>
                      <UiAppButton variant="primary" size="sm" icon="i-lucide-plus" @click="openProductCreate">
                        {{ locale === 'ar' ? 'بند جديد' : 'New Item' }}
                      </UiAppButton>
                    </template>
                  </UiEmptyState>
                </div>

                <!-- Notes -->
                <div
                  v-if="activeTab === 'notes'"
                  class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
                >
                  <p
                    v-if="vendor.notes"
                    class="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-line leading-relaxed"
                  >
                    {{ vendor.notes }}
                  </p>
                  <UiEmptyState
                    v-else
                    icon="i-lucide-sticky-note"
                    :title="locale === 'ar' ? 'لا توجد ملاحظات' : 'No notes'"
                    :description="locale === 'ar' ? 'يمكنك إضافة ملاحظات داخلية من شاشة التعديل.' : 'You can add internal notes from the edit form.'"
                  >
                    <template #action>
                      <UiAppButton variant="outline" size="sm" icon="i-lucide-pencil" @click="editOpen = true">
                        {{ $t('common.edit') }}
                      </UiAppButton>
                    </template>
                  </UiEmptyState>
                </div>
              </div>
            </Transition>
          </UiTabs>
        </template>
      </div>

      <!-- Edit slideover -->
      <UiSlideOver v-model="editOpen" :title="locale === 'ar' ? 'تعديل المورد' : 'Edit Vendor'">
        <VendorForm
          ref="formRef"
          :vendor="vendor"
          :loading="updateMutation.loading.value"
          @submit="handleEdit"
          @cancel="editOpen = false"
        />
      </UiSlideOver>

      <!-- Delete confirm -->
      <UiConfirmModal
        v-model="deleteConfirmOpen"
        :title="locale === 'ar' ? 'حذف المورد' : 'Delete Vendor'"
        :description="locale === 'ar' ? 'هل أنت متأكد من حذف هذا المورد؟ لا يمكن التراجع.' : 'Are you sure you want to delete this vendor? This cannot be undone.'"
        icon="i-lucide-alert-triangle"
        variant="danger"
        :confirm-label="$t('common.delete')"
        :loading="removeMutation.loading.value"
        @confirm="handleDelete"
      />

      <!-- Vendor product create/edit slideover -->
      <UiSlideOver
        v-model="productFormOpen"
        :title="editingProduct
          ? (locale === 'ar' ? 'تعديل البند' : 'Edit Item')
          : (locale === 'ar' ? 'بند جديد' : 'New Item')"
      >
        <form @submit.prevent="submitProductForm" class="space-y-4">
          <div>
            <label class="vp-label">
              {{ locale === 'ar' ? 'الاسم' : 'Name' }}
              <span class="text-danger-500">*</span>
            </label>
            <input
              v-model="productValues.name"
              type="text"
              class="vp-input"
              :class="{ 'vp-input--error': productErrors.name }"
              :placeholder="locale === 'ar' ? 'مثال: استشارات شهرية' : 'e.g. Monthly retainer'"
              required
            />
            <p v-if="productErrors.name" class="vp-error">{{ productErrors.name }}</p>
          </div>

          <div>
            <label class="vp-label">{{ locale === 'ar' ? 'وصف' : 'Description' }}</label>
            <textarea
              v-model="productValues.description"
              rows="2"
              class="vp-input resize-none"
              :placeholder="locale === 'ar' ? 'تفاصيل تظهر بشكل افتراضي على الفاتورة.' : 'Pre-filled on the bill line.'"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="vp-label">
                {{ locale === 'ar' ? 'سعر الوحدة' : 'Unit Price' }}
                <span class="text-danger-500">*</span>
              </label>
              <input
                v-model.number="productValues.unit_price"
                type="number"
                min="0"
                step="0.01"
                class="vp-input font-mono text-end"
                dir="ltr"
                required
              />
            </div>
            <div>
              <label class="vp-label">{{ locale === 'ar' ? 'نسبة القيمة المضافة' : 'Default VAT %' }}</label>
              <input
                v-model.number="productValues.default_vat_rate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                class="vp-input font-mono text-end"
                dir="ltr"
                :placeholder="locale === 'ar' ? 'افتراضي المؤسسة' : 'Tenant default'"
              />
            </div>
          </div>

          <div>
            <label class="vp-label">
              {{ locale === 'ar' ? 'الحساب الافتراضي' : 'Default Account' }}
            </label>
            <div class="relative">
              <select v-model.number="productValues.default_account_id" class="vp-input">
                <option :value="null">
                  {{ locale === 'ar' ? '— يحدد عند إنشاء الفاتورة —' : '— Pick at bill time —' }}
                </option>
                <option v-for="a in productAccountOptions" :key="a.id" :value="a.id">
                  {{ a.label }}
                </option>
              </select>
              <UIcon name="i-lucide-chevron-down" class="absolute end-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
            <p class="text-[11px] text-neutral-400 mt-1">
              {{ locale === 'ar'
                ? 'إذا تم اختياره، يتم تعبئته تلقائياً عند اختيار البند في فاتورة.'
                : 'When set, the bill-line picker auto-fills this account.' }}
            </p>
          </div>

          <label class="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-200">
            <input v-model="productValues.is_active" type="checkbox" class="rounded" />
            {{ locale === 'ar' ? 'نشط (يظهر في قائمة الاختيار)' : 'Active (visible in pickers)' }}
          </label>

          <div class="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <UiAppButton type="button" variant="outline" class="flex-1" @click="productFormOpen = false">
              {{ $t('common.cancel') }}
            </UiAppButton>
            <UiAppButton
              type="submit"
              variant="primary"
              :icon="editingProduct ? 'i-lucide-save' : 'i-lucide-plus'"
              :loading="productMutationLoading"
              class="flex-1"
            >
              {{ editingProduct ? $t('common.save') : $t('common.create') }}
            </UiAppButton>
          </div>
        </form>
      </UiSlideOver>

      <UiConfirmModal
        v-model="productDeleteConfirmOpen"
        :title="locale === 'ar' ? 'حذف البند' : 'Delete Item'"
        :description="locale === 'ar' ? 'لن يؤثر هذا على الفواتير السابقة.' : 'Past bills will not be affected.'"
        icon="i-lucide-trash-2"
        variant="danger"
        :confirm-label="$t('common.delete')"
        :loading="productMutations.remove.loading.value"
        @confirm="handleProductDelete"
      />
    </FeatureBoundary>
</template>

<script setup lang="ts">
import type { ApiError } from '~/core/api/errors'
import { vendorDisplayName, type VendorContact } from '~/features/vendors/services/vendorService'
import type { VendorProduct } from '~/features/vendors/services/vendorProductService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const route = useRoute()
const toastStore = useToastStore()
const api = useApi()

const vendorId = computed(() => Number(route.params.id))
const { data: vendor, loading, error, refresh } = useVendor(vendorId)
const { update: updateMutation, remove: removeMutation } = useVendorMutations()

watch(error, (e) => {
  if (e) {
    toastStore.error(locale.value === 'ar' ? 'المورد غير موجود' : 'Vendor not found')
    navigateTo('/vendors')
  }
})

const formRef = ref<{ applyApiErrors: (e: ApiError) => void; reset: () => void } | null>(null)
const activeTab = ref<'bills' | 'products' | 'notes'>('bills')
const editOpen = ref(false)
const deleteConfirmOpen = ref(false)

// --- Vendor products (per-vendor billable items) ---
const productListParams = computed(() => ({ per_page: 100, sort_by: 'name' as const, sort_dir: 'asc' as const }))
const { data: productListData, refresh: refreshProducts } = useVendorProductsList(vendorId, productListParams)
const productMutations = useVendorProductMutations(vendorId as ComputedRef<number>)

const vendorProducts = computed<VendorProduct[]>(() => productListData.value?.data ?? [])

// Accounts for the "default account" picker — only post-able leaves.
const productAccountParams = computed(() => ({ per_page: 500, is_group: false, is_active: true } as any))
const { data: productAccountData } = useAccountsList(productAccountParams as any)
const productAccountOptions = computed(() => {
  return (productAccountData.value?.data ?? []).map(a => ({
    id: a.id,
    label: `${a.code} — ${locale.value === 'ar' ? (a.name_ar || a.name_en) : (a.name_en || a.name_ar)}`,
  }))
})

const productFormOpen = ref(false)
const productDeleteConfirmOpen = ref(false)
const editingProduct = ref<VendorProduct | null>(null)
const deletingProduct = ref<VendorProduct | null>(null)
const productErrors = ref<Record<string, string>>({})

// `default_vat_rate` and `default_account_id` are nullable on the wire —
// using `null` (not `undefined`) so the controller patches them away when
// the user clears either field.
const productValues = reactive<{
  name: string
  description: string
  unit_price: number
  default_vat_rate: number | null
  default_account_id: number | null
  is_active: boolean
}>({
  name: '',
  description: '',
  unit_price: 0,
  default_vat_rate: null,
  default_account_id: null,
  is_active: true,
})

const productMutationLoading = computed(() =>
  productMutations.create.loading.value || productMutations.update.loading.value
)

function resetProductForm() {
  productValues.name = ''
  productValues.description = ''
  productValues.unit_price = 0
  productValues.default_vat_rate = null
  productValues.default_account_id = null
  productValues.is_active = true
  productErrors.value = {}
}

function openProductCreate() {
  editingProduct.value = null
  resetProductForm()
  productFormOpen.value = true
}

function openProductEdit(p: VendorProduct) {
  editingProduct.value = p
  productValues.name = p.name
  productValues.description = p.description ?? ''
  productValues.unit_price = Number(p.unit_price)
  productValues.default_vat_rate = p.default_vat_rate == null ? null : Number(p.default_vat_rate)
  productValues.default_account_id = p.default_account_id ?? null
  productValues.is_active = p.is_active
  productErrors.value = {}
  productFormOpen.value = true
}

function confirmProductDelete(p: VendorProduct) {
  deletingProduct.value = p
  productDeleteConfirmOpen.value = true
}

async function submitProductForm() {
  productErrors.value = {}
  const payload = {
    name: productValues.name.trim(),
    description: productValues.description.trim() || null,
    unit_price: Number(productValues.unit_price),
    default_vat_rate: productValues.default_vat_rate,
    default_account_id: productValues.default_account_id,
    is_active: productValues.is_active,
  }
  try {
    if (editingProduct.value) {
      await productMutations.update.mutate({ id: editingProduct.value.id, form: payload })
      toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Item updated')
    } else {
      await productMutations.create.mutate(payload)
      toastStore.success(locale.value === 'ar' ? 'تم إضافة البند' : 'Item created')
    }
    productFormOpen.value = false
    refreshProducts()
  } catch (e) {
    const err = e as ApiError
    if (err.code === 'validation' && err.fieldErrors) {
      for (const [field, msgs] of Object.entries(err.fieldErrors)) {
        productErrors.value[field] = Array.isArray(msgs) ? msgs[0] : String(msgs)
      }
    }
    toastStore.error(err.message || 'Error')
  }
}

async function handleProductDelete() {
  const p = deletingProduct.value
  if (!p) return
  try {
    await productMutations.remove.mutate(p.id)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
    refreshProducts()
  } catch (e) {
    toastStore.error((e as ApiError).message || 'Error')
  } finally {
    productDeleteConfirmOpen.value = false
    deletingProduct.value = null
  }
}

const vendorBills = ref<any[]>([])

async function loadRelated() {
  try {
    const r = await api.get<{ data: any[] }>(`/bills?vendor_id=${vendorId.value}&per_page=50`)
    vendorBills.value = r.data ?? []
  } catch {
    vendorBills.value = []
  }
}

watch(vendorId, (id) => { if (id) loadRelated() }, { immediate: true })

const tabs = computed(() => [
  { key: 'bills',    label: locale.value === 'ar' ? 'الفواتير' : 'Bills',    count: vendorBills.value.length,    icon: 'i-lucide-receipt' },
  { key: 'products', label: locale.value === 'ar' ? 'البنود' : 'Products', count: vendorProducts.value.length, icon: 'i-lucide-package' },
  { key: 'notes',    label: locale.value === 'ar' ? 'ملاحظات' : 'Notes',    icon: 'i-lucide-sticky-note' },
])

// --- Derived display ---
const displayName = computed(() => vendorDisplayName(vendor.value, locale.value))
const secondaryName = computed(() => {
  // Show the OTHER language as the subtitle, when both are present.
  const v = vendor.value
  if (!v) return ''
  if (locale.value === 'ar') return v.name_en || ''
  return v.name_ar || ''
})
const initial = computed(() => displayName.value.charAt(0).toUpperCase() || '?')

const primaryContact = computed<VendorContact | null>(() => {
  const cs = vendor.value?.contacts ?? []
  return cs.find(c => c.is_primary) ?? cs[0] ?? null
})

const primaryAddress = computed(() => {
  const v = vendor.value
  if (!v) return ''
  if (locale.value === 'ar') return v.address_ar || v.address_en || ''
  return v.address_en || v.address_ar || ''
})

const hasBankInfo = computed(() => {
  const v = vendor.value
  return !!(v && (v.bank_name || v.bank_account || v.iban || v.swift_code))
})

const hasCreditLimit = computed(() => Number(vendor.value?.credit_limit ?? 0) > 0)

const PAYMENT_TERMS_AR: Record<string, string> = {
  net_15: '15 يوماً', net_30: '30 يوماً', net_45: '45 يوماً',
  net_60: '60 يوماً', net_90: '90 يوماً',
  cod: 'دفع عند الاستلام', prepaid: 'دفع مقدم',
}
const PAYMENT_TERMS_EN: Record<string, string> = {
  net_15: 'Net 15', net_30: 'Net 30', net_45: 'Net 45',
  net_60: 'Net 60', net_90: 'Net 90',
  cod: 'Cash on delivery', prepaid: 'Prepaid',
}
const paymentTermsLabel = computed(() => {
  const t = vendor.value?.payment_terms || ''
  const map = locale.value === 'ar' ? PAYMENT_TERMS_AR : PAYMENT_TERMS_EN
  return map[t] ?? t
})

const totalBillsLabel = computed(() => {
  const total = vendorBills.value.length
  return locale.value === 'ar' ? `من إجمالي ${total}` : `of ${total} total`
})

const vendorSince = computed(() => {
  const created = vendor.value?.created_at
  if (!created) return '—'
  return new Date(created).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
  })
})

const relativeAge = computed(() => {
  const created = vendor.value?.created_at
  if (!created) return ''
  const months = Math.floor((Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months < 1) return locale.value === 'ar' ? 'هذا الشهر' : 'this month'
  if (months < 12) return locale.value === 'ar' ? `منذ ${months} شهر` : `${months} month${months === 1 ? '' : 's'} ago`
  const years = Math.floor(months / 12)
  return locale.value === 'ar' ? `منذ ${years} سنة` : `${years} year${years === 1 ? '' : 's'} ago`
})

const lastPaymentRelative = computed(() => {
  const d = vendor.value?.last_payment_at
  if (!d) return ''
  const days = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24))
  if (days < 1) return locale.value === 'ar' ? 'اليوم' : 'today'
  if (days === 1) return locale.value === 'ar' ? 'أمس' : 'yesterday'
  if (days < 30) return locale.value === 'ar' ? `منذ ${days} يوم` : `${days} days ago`
  return locale.value === 'ar' ? `منذ ${Math.floor(days / 30)} شهر` : `${Math.floor(days / 30)} months ago`
})

const agingBuckets = computed(() => {
  const b = vendor.value?.aging_buckets
  if (!b) return []
  return [
    { key: '0_30',    value: Number(b['0_30']    ?? 0), label: '0–30',    tint: 'bg-success-500/10 text-success-700 dark:text-success-400' },
    { key: '31_60',   value: Number(b['31_60']   ?? 0), label: '31–60',   tint: 'bg-info-500/10    text-info-700    dark:text-info-400' },
    { key: '61_90',   value: Number(b['61_90']   ?? 0), label: '61–90',   tint: 'bg-warning-500/10 text-warning-700 dark:text-warning-500' },
    { key: '90_plus', value: Number(b['90_plus'] ?? 0), label: '90+',     tint: 'bg-danger-500/10  text-danger-700  dark:text-danger-400' },
  ]
})

// --- Helpers ---
function formatMoney(n: number | string) {
  return Number(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
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


const BILL_STATUS_COLOR: Record<string, 'gray' | 'blue' | 'green' | 'orange' | 'red'> = {
  draft: 'gray', open: 'blue', approved: 'blue', paid: 'green', partially_paid: 'orange', overdue: 'red', cancelled: 'gray',
}
function billStatusColor(s: string) { return BILL_STATUS_COLOR[s] ?? 'gray' }
function billStatusLabel(s: string) {
  if (locale.value !== 'ar') return s.replace('_', ' ')
  const map: Record<string, string> = {
    draft: 'مسودة', open: 'مفتوحة', approved: 'مُعتمدة',
    paid: 'مدفوعة', partially_paid: 'مدفوعة جزئياً', overdue: 'متأخرة', cancelled: 'ملغاة',
  }
  return map[s] ?? s
}

// --- Mutations ---
async function handleEdit(form: Record<string, unknown>) {
  try {
    await updateMutation.mutate({ id: vendor.value!.id, form })
    editOpen.value = false
    toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Updated')
    refresh()
  } catch (e) {
    const err = e as ApiError
    formRef.value?.applyApiErrors(err)
    toastStore.error(err.message || 'Error')
  }
}

async function handleDelete() {
  try {
    await removeMutation.mutate(vendor.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
    navigateTo('/vendors')
  } catch (e) {
    toastStore.error((e as ApiError).message || 'Error')
  } finally {
    deleteConfirmOpen.value = false
  }
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 200ms var(--ease-standard), transform 200ms var(--ease-standard);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* Vendor-product form scoped styles — `vp-` prefix to avoid colliding with
   the vendor edit form's `form-` classes. */
.vp-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.vp-error { @apply mt-1 text-xs text-danger-600 dark:text-danger-500; }

.vp-input {
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
.vp-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
textarea.vp-input { height: auto; padding-block: 0.5rem; }
.vp-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }

:global(html.dark) .vp-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
