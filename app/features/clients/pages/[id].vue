<template>
  <div>
      <FeatureBoundary id="clients">
        <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
          <!-- Loading -->
          <template v-if="loading">
            <div class="space-y-4">
              <div class="h-12 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="i in 3" :key="i" class="h-32 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
              </div>
              <div class="h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
            </div>
          </template>

          <template v-else-if="client">
            <!-- Header -->
            <div
              v-motion
              :initial="{ opacity: 0, y: -6 }"
              :enter="{ opacity: 1, y: 0 }"
              class="mb-5"
            >
              <!-- Back link -->
              <NuxtLink
                to="/clients"
                class="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-0 transition-colors mb-3"
              >
                <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5 rtl:rotate-180" />
                {{ locale === 'ar' ? 'العملاء' : 'Clients' }}
              </NuxtLink>

              <div class="flex items-start sm:items-center justify-between gap-3 flex-wrap">
                <div class="flex items-center gap-3 min-w-0 flex-1">
                  <div
                    class="w-12 h-12 rounded-lg bg-primary-500/10 text-primary-700 dark:text-primary-300 inline-flex items-center justify-center text-base font-bold flex-shrink-0"
                  >
                    {{ initial }}
                  </div>
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <h1 class="text-xl font-bold text-neutral-900 dark:text-neutral-0 tracking-tight truncate">
                        {{ client.name }}
                      </h1>
                      <UiBadge :color="client.is_active ? 'green' : 'gray'" dot>
                        {{ client.is_active
                          ? (locale === 'ar' ? 'نشط' : 'Active')
                          : (locale === 'ar' ? 'غير نشط' : 'Inactive') }}
                      </UiBadge>
                    </div>
                    <p v-if="client.trade_name" class="text-sm text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {{ client.trade_name }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <UiAppButton
                    variant="outline"
                    size="sm"
                    :icon="client.is_active ? 'i-lucide-circle-pause' : 'i-lucide-circle-play'"
                    @click="handleToggleActive"
                  >
                    {{ client.is_active ? (locale === 'ar' ? 'تعطيل' : 'Deactivate') : (locale === 'ar' ? 'تفعيل' : 'Activate') }}
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
              <!-- Outstanding balance -->
              <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                <span class="absolute top-0 start-4 right-4 h-0.5 rounded-b-full bg-warning-500" aria-hidden="true" />
                <div class="flex items-start justify-between mb-2">
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {{ locale === 'ar' ? 'الرصيد المستحق' : 'Outstanding Balance' }}
                  </p>
                  <UIcon name="i-lucide-wallet" class="w-4 h-4 text-warning-500" />
                </div>
                <p class="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">
                  {{ formatMoney(client.balance ?? 0) }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {{ client.currency || 'EGP' }}
                </p>
              </div>

              <!-- Open invoices -->
              <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                <span class="absolute top-0 start-4 right-4 h-0.5 rounded-b-full bg-primary-500" aria-hidden="true" />
                <div class="flex items-start justify-between mb-2">
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {{ locale === 'ar' ? 'فواتير مفتوحة' : 'Open Invoices' }}
                  </p>
                  <UIcon name="i-lucide-file-clock" class="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <p class="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">
                  {{ client.open_invoices_count ?? 0 }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {{ totalInvoicesLabel }}
                </p>
              </div>

              <!-- Credit limit -->
              <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                <span class="absolute top-0 start-4 right-4 h-0.5 rounded-b-full bg-info-500" aria-hidden="true" />
                <div class="flex items-start justify-between mb-2">
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {{ locale === 'ar' ? 'الحد الائتماني' : 'Credit Limit' }}
                  </p>
                  <UIcon name="i-lucide-credit-card" class="w-4 h-4 text-info-600 dark:text-info-400" />
                </div>
                <p class="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">
                  {{ client.credit_limit != null ? formatMoney(client.credit_limit) : '—' }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {{ client.credit_limit != null ? (client.currency || 'EGP') : (locale === 'ar' ? 'لم يحدد' : 'Not set') }}
                </p>
              </div>

              <!-- Status / since -->
              <div class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                <span class="absolute top-0 start-4 right-4 h-0.5 rounded-b-full bg-success-500" aria-hidden="true" />
                <div class="flex items-start justify-between mb-2">
                  <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    {{ locale === 'ar' ? 'منذ' : 'Client Since' }}
                  </p>
                  <UIcon name="i-lucide-calendar" class="w-4 h-4 text-success-600 dark:text-success-500" />
                </div>
                <p class="text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-0">
                  {{ clientSince }}
                </p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  {{ relativeAge }}
                </p>
              </div>
            </div>

            <!-- Aging buckets (shown only if backend provided them) -->
            <div
              v-if="client.aging_buckets"
              v-motion
              :initial="{ opacity: 0, y: 12 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: 140 } }"
              class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-5"
            >
              <div class="flex items-center justify-between mb-3">
                <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
                  {{ locale === 'ar' ? 'تقادم الأرصدة' : 'Aging' }}
                </h3>
                <span class="text-[10px] uppercase tracking-wider text-neutral-400">
                  {{ client.currency || 'EGP' }}
                </span>
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

            <!-- Info cards (contact / legal / address / notes preview) -->
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
                  <li v-if="client.email" class="flex items-start gap-2.5">
                    <UIcon name="i-lucide-mail" class="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <a :href="`mailto:${client.email}`" class="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate" dir="ltr">
                      {{ client.email }}
                    </a>
                  </li>
                  <li v-if="client.phone" class="flex items-start gap-2.5">
                    <UIcon name="i-lucide-phone" class="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <a :href="`tel:${client.phone}`" class="text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" dir="ltr">
                      {{ client.phone }}
                    </a>
                  </li>
                  <li v-if="(client as any).contact_person" class="flex items-start gap-2.5">
                    <UIcon name="i-lucide-user" class="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <span class="text-neutral-700 dark:text-neutral-200">{{ (client as any).contact_person }}</span>
                  </li>
                  <li v-if="!client.email && !client.phone && !(client as any).contact_person" class="text-xs text-neutral-400">
                    —
                  </li>
                </ul>
              </div>

              <!-- Legal -->
              <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                <h4 class="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <UIcon name="i-lucide-scale" class="w-3.5 h-3.5" />
                  {{ locale === 'ar' ? 'قانوني' : 'Legal' }}
                </h4>
                <ul class="space-y-2 text-sm">
                  <li v-if="client.tax_id" class="flex items-start justify-between gap-2">
                    <span class="text-neutral-500 dark:text-neutral-400 text-xs">{{ locale === 'ar' ? 'ضريبي' : 'TIN' }}</span>
                    <span class="font-mono text-xs text-neutral-700 dark:text-neutral-200" dir="ltr">{{ client.tax_id }}</span>
                  </li>
                  <li v-if="(client as any).commercial_register" class="flex items-start justify-between gap-2">
                    <span class="text-neutral-500 dark:text-neutral-400 text-xs">{{ locale === 'ar' ? 'سجل' : 'CR' }}</span>
                    <span class="font-mono text-xs text-neutral-700 dark:text-neutral-200" dir="ltr">{{ (client as any).commercial_register }}</span>
                  </li>
                  <li v-if="!client.tax_id && !(client as any).commercial_register" class="text-xs text-neutral-400">
                    —
                  </li>
                </ul>
              </div>

              <!-- Address -->
              <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4">
                <h4 class="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <UIcon name="i-lucide-map-pin" class="w-3.5 h-3.5" />
                  {{ locale === 'ar' ? 'العنوان' : 'Address' }}
                </h4>
                <div class="space-y-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-200">
                  <p v-if="(client as any).address">{{ (client as any).address }}</p>
                  <p v-if="client.city" class="text-neutral-500 dark:text-neutral-400">{{ client.city }}</p>
                  <p v-if="!(client as any).address && !client.city" class="text-xs text-neutral-400">—</p>
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <UiTabs v-model="activeTab" :tabs="tabs">
              <Transition name="fade-slide" mode="out-in">
                <div :key="activeTab">
                  <!-- Invoices tab -->
                  <div
                    v-if="activeTab === 'invoices'"
                    class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                  >
                    <div class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
                      <span class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {{ clientInvoices.length }} {{ locale === 'ar' ? 'فاتورة' : (clientInvoices.length === 1 ? 'invoice' : 'invoices') }}
                      </span>
                      <UiAppButton
                        variant="primary"
                        size="sm"
                        icon="i-lucide-plus"
                        @click="navigateTo(`/invoices/create?client_id=${client.id}`)"
                      >
                        {{ locale === 'ar' ? 'فاتورة جديدة' : 'New Invoice' }}
                      </UiAppButton>
                    </div>
                    <ul v-if="clientInvoices.length > 0" class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      <li
                        v-for="inv in clientInvoices"
                        :key="inv.id"
                        @click="navigateTo(`/invoices/${inv.id}`)"
                        class="px-4 py-2.5 flex items-center justify-between hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors cursor-pointer group/row"
                      >
                        <div class="flex items-center gap-3 min-w-0">
                          <UIcon name="i-lucide-file-text" class="w-4 h-4 text-neutral-400 group-hover/row:text-primary-500 transition-colors flex-shrink-0" />
                          <div class="min-w-0">
                            <p class="font-mono text-xs text-primary-700 dark:text-primary-400 font-semibold truncate">{{ inv.invoice_number || inv.number }}</p>
                            <p class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{{ formatDate(inv.date) }}</p>
                          </div>
                        </div>
                        <div class="flex items-center gap-2.5 flex-shrink-0">
                          <span class="font-mono text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
                            {{ Number(inv.total).toLocaleString() }}
                          </span>
                          <UiBadge :color="invoiceStatusColor(inv.status)" dot>
                            {{ invoiceStatusLabel(inv.status) }}
                          </UiBadge>
                        </div>
                      </li>
                    </ul>
                    <UiEmptyState
                      v-else
                      icon="i-lucide-file-text"
                      :title="locale === 'ar' ? 'لا توجد فواتير' : 'No invoices yet'"
                      :description="locale === 'ar' ? 'لم تُصدر أي فاتورة لهذا العميل حتى الآن.' : 'No invoices have been issued for this client yet.'"
                    />
                  </div>

                  <!-- Products tab — per-client billable items -->
                  <div
                    v-if="activeTab === 'products'"
                    class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                  >
                    <div class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
                      <span class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {{ products.length }}
                        {{ locale === 'ar' ? 'منتج' : (products.length === 1 ? 'product' : 'products') }}
                      </span>
                      <UiAppButton
                        variant="primary"
                        size="sm"
                        icon="i-lucide-plus"
                        @click="openProductCreate"
                      >
                        {{ locale === 'ar' ? 'منتج جديد' : 'New Product' }}
                      </UiAppButton>
                    </div>

                    <!-- Loading -->
                    <div v-if="productsLoading" class="p-4 space-y-2">
                      <div v-for="i in 3" :key="i" class="h-10 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse"></div>
                    </div>

                    <!-- List -->
                    <ul
                      v-else-if="products.length > 0"
                      class="divide-y divide-neutral-100 dark:divide-neutral-800/60"
                    >
                      <li
                        v-for="p in products"
                        :key="p.id"
                        class="px-4 py-2.5 flex items-center justify-between gap-3 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors group/row"
                      >
                        <div class="flex items-center gap-3 min-w-0 flex-1">
                          <div class="w-8 h-8 rounded-md bg-primary-500/10 text-primary-700 dark:text-primary-300 inline-flex items-center justify-center flex-shrink-0">
                            <UIcon name="i-lucide-package" class="w-4 h-4" />
                          </div>
                          <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                              <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ p.name }}</p>
                              <UiBadge v-if="!p.is_active" color="gray" size="xs">
                                {{ locale === 'ar' ? 'معطل' : 'Inactive' }}
                              </UiBadge>
                            </div>
                            <p
                              v-if="p.description"
                              class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate"
                            >
                              {{ p.description }}
                            </p>
                            <p
                              v-else-if="p.last_used_at"
                              class="text-[11px] text-neutral-400"
                            >
                              {{ locale === 'ar' ? 'آخر استخدام:' : 'Last used' }} {{ formatDate(p.last_used_at) }}
                            </p>
                          </div>
                        </div>
                        <div class="flex items-center gap-3 flex-shrink-0">
                          <div class="text-end">
                            <p class="font-mono text-sm font-semibold tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
                              {{ Number(p.unit_price).toLocaleString() }}
                            </p>
                            <p
                              v-if="p.default_vat_rate != null"
                              class="text-[10px] text-neutral-400 tabular-nums"
                              dir="ltr"
                            >
                              VAT {{ Number(p.default_vat_rate).toFixed(2) }}%
                            </p>
                          </div>
                          <div class="flex items-center gap-0.5">
                            <button
                              type="button"
                              @click="openProductEdit(p)"
                              class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-primary-600 hover:bg-primary-500/10 dark:hover:text-primary-400 transition-colors"
                              :title="$t('common.edit')"
                            >
                              <UIcon name="i-lucide-pencil" class="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              @click="askDeleteProduct(p)"
                              class="w-7 h-7 inline-flex items-center justify-center rounded-md text-neutral-400 hover:text-danger-600 hover:bg-danger-500/10 dark:hover:text-danger-400 transition-colors"
                              :title="$t('common.delete')"
                            >
                              <UIcon name="i-lucide-trash-2" class="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </li>
                    </ul>

                    <UiEmptyState
                      v-else
                      icon="i-lucide-package"
                      :title="locale === 'ar' ? 'لا يوجد منتجات' : 'No products yet'"
                      :description="locale === 'ar' ? 'أضف منتجات قابلة لإعادة الاستخدام لهذا العميل لتسريع إنشاء الفواتير.' : 'Add reusable items for this client to speed up invoice creation.'"
                    >
                      <template #action>
                        <UiAppButton variant="primary" size="sm" icon="i-lucide-plus" @click="openProductCreate">
                          {{ locale === 'ar' ? 'منتج جديد' : 'New Product' }}
                        </UiAppButton>
                      </template>
                    </UiEmptyState>
                  </div>

                  <!-- Documents tab -->
                  <div
                    v-if="activeTab === 'documents'"
                    class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                  >
                    <div class="px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 flex items-center justify-between gap-3">
                      <span class="text-xs text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {{ clientDocuments.length }} {{ locale === 'ar' ? 'مستند' : (clientDocuments.length === 1 ? 'document' : 'documents') }}
                      </span>
                      <UiAppButton
                        variant="outline"
                        size="sm"
                        icon="i-lucide-folder-open"
                        @click="navigateTo(`/documents?client_id=${client.id}`)"
                      >
                        {{ locale === 'ar' ? 'إدارة المستندات' : 'Manage Documents' }}
                      </UiAppButton>
                    </div>
                    <ul v-if="clientDocuments.length > 0" class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                      <li
                        v-for="doc in clientDocuments"
                        :key="doc.id"
                        class="px-4 py-2.5 flex items-center justify-between gap-3"
                      >
                        <div class="flex items-center gap-3 min-w-0">
                          <div class="w-8 h-8 rounded-md bg-neutral-100 dark:bg-neutral-800 inline-flex items-center justify-center flex-shrink-0">
                            <UIcon
                              :name="doc.mime_type?.includes('pdf') ? 'i-lucide-file-text' : 'i-lucide-file'"
                              class="w-4 h-4 text-neutral-500"
                            />
                          </div>
                          <div class="min-w-0">
                            <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ doc.name }}</p>
                            <p class="text-[11px] text-neutral-500 dark:text-neutral-400">{{ formatDate(doc.created_at) }}</p>
                          </div>
                        </div>
                        <a
                          v-if="doc.url"
                          :href="doc.url"
                          target="_blank"
                          rel="noopener"
                          class="inline-flex items-center justify-center w-7 h-7 rounded-sm text-neutral-400 hover:text-primary-600 hover:bg-primary-500/10 dark:hover:text-primary-400 transition-colors"
                          :title="locale === 'ar' ? 'فتح' : 'Open'"
                        >
                          <UIcon name="i-lucide-external-link" class="w-3.5 h-3.5" />
                        </a>
                      </li>
                    </ul>
                    <UiEmptyState
                      v-else
                      icon="i-lucide-folder"
                      :title="locale === 'ar' ? 'لا توجد مستندات' : 'No documents'"
                      :description="locale === 'ar' ? 'لم تُرفع أي مستندات لهذا العميل بعد.' : 'No documents have been uploaded for this client yet.'"
                    />
                  </div>

                  <!-- Notes tab -->
                  <div
                    v-if="activeTab === 'notes'"
                    class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
                  >
                    <p
                      v-if="client.notes"
                      class="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-line leading-relaxed"
                    >
                      {{ client.notes }}
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

        <!-- Edit SlideOver -->
        <UiSlideOver v-model="editOpen" :title="locale === 'ar' ? 'تعديل العميل' : 'Edit Client'">
          <ClientForm
            ref="formRef"
            :client="client"
            :loading="updateMutation.loading.value"
            @submit="handleEdit"
            @cancel="editOpen = false"
          />
        </UiSlideOver>

        <!-- Product create/edit SlideOver -->
        <UiSlideOver
          v-model="productFormOpen"
          :title="editingProduct
            ? (locale === 'ar' ? 'تعديل المنتج' : 'Edit Product')
            : (locale === 'ar' ? 'منتج جديد' : 'New Product')"
        >
          <ClientProductForm
            ref="productFormRef"
            :product="editingProduct"
            :submitting="productCreateMutation.loading.value || productUpdateMutation.loading.value"
            @submit="handleProductSubmit"
            @cancel="productFormOpen = false"
          />
        </UiSlideOver>

        <!-- Product delete confirm -->
        <UiConfirmModal
          v-model="productDeleteOpen"
          :title="locale === 'ar' ? 'حذف المنتج' : 'Delete Product'"
          :description="locale === 'ar'
            ? 'سيتم حذف المنتج. الفواتير الموجودة لن تتأثر — تبقى نسخة من الاسم والسعر داخل كل بند.'
            : 'The product will be deleted. Existing invoices are unaffected — each line keeps its own snapshot of the name and price.'"
          icon="i-lucide-alert-triangle"
          variant="danger"
          :confirm-label="$t('common.delete')"
          :loading="productRemoveMutation.loading.value"
          @confirm="confirmDeleteProduct"
        />

        <!-- Delete Confirm -->
        <UiConfirmModal
          v-model="deleteConfirmOpen"
          :title="locale === 'ar' ? 'حذف العميل' : 'Delete Client'"
          :description="locale === 'ar' ? 'هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع.' : 'Are you sure you want to delete this client? This cannot be undone.'"
          icon="i-lucide-alert-triangle"
          variant="danger"
          :confirm-label="$t('common.delete')"
          :loading="removeMutation.loading.value"
          @confirm="handleDelete"
        />
      </FeatureBoundary>
  </div>
</template>

<script setup lang="ts">
import type { ApiError } from '~/core/api/errors'
import type { ClientProduct, ClientProductForm as ClientProductFormType } from '~/features/clients/services/clientProductService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const route = useRoute()
const toastStore = useToastStore()

const clientId = computed(() => Number(route.params.id))
const { data: client, loading, error, refresh } = useClient(clientId)
const { update: updateMutation, remove: removeMutation, toggleActive: toggleMutation } = useClientMutations()

// Per-client products — tab + slideover form + delete flow.
const productsQuery = useClientProducts(clientId)
const products = computed<ClientProduct[]>(() => productsQuery.data.value?.data ?? [])
const productsLoading = computed(() => productsQuery.loading.value)
const {
  create: productCreateMutation,
  update: productUpdateMutation,
  remove: productRemoveMutation,
} = useClientProductMutations()

const productFormOpen = ref(false)
const editingProduct = ref<ClientProduct | null>(null)
const productFormRef = ref<{ applyApiErrors: (e: ApiError) => void } | null>(null)

const productDeleteOpen = ref(false)
const pendingProductDelete = ref<ClientProduct | null>(null)

watch(error, (e) => {
  if (e) {
    toastStore.error(locale.value === 'ar' ? 'العميل غير موجود' : 'Client not found')
    navigateTo('/clients')
  }
})

const formRef = ref<{ applyApiErrors: (e: ApiError) => void; reset: () => void } | null>(null)
const activeTab = ref('invoices')
const editOpen = ref(false)
const deleteConfirmOpen = ref(false)

const clientInvoices = ref<any[]>([])
const clientDocuments = ref<any[]>([])
const api = useApi()

async function loadRelated() {
  const [invRes, docRes] = await Promise.all([
    api.get<{ data: any[] }>(`/invoices?client_id=${clientId.value}&per_page=50`).catch(() => ({ data: [] })),
    api.get<{ data: any[] }>(`/documents?client_id=${clientId.value}&per_page=50`).catch(() => ({ data: [] })),
  ])
  clientInvoices.value = invRes.data || []
  clientDocuments.value = docRes.data || []
}

watch(clientId, (id) => { if (id) loadRelated() }, { immediate: true })

const tabs = computed(() => [
  { key: 'invoices',  label: locale.value === 'ar' ? 'الفواتير'    : 'Invoices',  count: clientInvoices.value.length,  icon: 'i-lucide-file-text' },
  { key: 'products',  label: locale.value === 'ar' ? 'المنتجات'    : 'Products',  count: products.value.length,         icon: 'i-lucide-package' },
  { key: 'documents', label: locale.value === 'ar' ? 'المستندات'   : 'Documents', count: clientDocuments.value.length,  icon: 'i-lucide-folder' },
  { key: 'notes',     label: locale.value === 'ar' ? 'ملاحظات'     : 'Notes',                                            icon: 'i-lucide-sticky-note' },
])

// --- Derived display ---
const initial = computed(() => client.value?.name?.charAt(0)?.toUpperCase() || '?')

const totalInvoicesLabel = computed(() => {
  const total = clientInvoices.value.length
  return locale.value === 'ar' ? `من إجمالي ${total}` : `of ${total} total`
})

const clientSince = computed(() => {
  const created = (client.value as any)?.created_at
  if (!created) return '—'
  return new Date(created).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'short',
  })
})

const relativeAge = computed(() => {
  const created = (client.value as any)?.created_at
  if (!created) return ''
  const months = Math.floor((Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24 * 30))
  if (months < 1) return locale.value === 'ar' ? 'هذا الشهر' : 'this month'
  if (months < 12) return locale.value === 'ar' ? `منذ ${months} شهر` : `${months} month${months === 1 ? '' : 's'} ago`
  const years = Math.floor(months / 12)
  return locale.value === 'ar' ? `منذ ${years} سنة` : `${years} year${years === 1 ? '' : 's'} ago`
})

const agingBuckets = computed(() => {
  const b = client.value?.aging_buckets
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

const STATUS_COLOR_MAP: Record<string, 'gray' | 'blue' | 'green' | 'orange' | 'red'> = {
  draft: 'gray',
  sent: 'blue',
  paid: 'green',
  partially_paid: 'orange',
  overdue: 'red',
  cancelled: 'gray',
}
function invoiceStatusColor(s: string) {
  return STATUS_COLOR_MAP[s] ?? 'gray'
}
function invoiceStatusLabel(s: string) {
  if (locale.value !== 'ar') return s.replace('_', ' ')
  const map: Record<string, string> = {
    draft: 'مسودة',
    sent: 'مُرسلة',
    paid: 'مدفوعة',
    partially_paid: 'مدفوعة جزئياً',
    overdue: 'متأخرة',
    cancelled: 'ملغاة',
  }
  return map[s] ?? s
}

// --- Mutations ---
// --- Product handlers ---
function openProductCreate() {
  editingProduct.value = null
  productFormOpen.value = true
}

function openProductEdit(p: ClientProduct) {
  editingProduct.value = p
  productFormOpen.value = true
}

async function handleProductSubmit(form: ClientProductFormType) {
  try {
    if (editingProduct.value) {
      await productUpdateMutation.mutate({
        clientId: clientId.value,
        productId: editingProduct.value.id,
        form,
      })
      toastStore.success(locale.value === 'ar' ? 'تم تحديث المنتج' : 'Product updated')
    } else {
      await productCreateMutation.mutate({ clientId: clientId.value, form })
      toastStore.success(locale.value === 'ar' ? 'تم إضافة المنتج' : 'Product created')
    }
    productFormOpen.value = false
  } catch (e) {
    const err = e as ApiError
    productFormRef.value?.applyApiErrors(err)
    if (!err.fieldErrors || Object.keys(err.fieldErrors).length === 0) {
      toastStore.error(err.message || (locale.value === 'ar' ? 'حدث خطأ' : 'Error'))
    }
  }
}

function askDeleteProduct(p: ClientProduct) {
  pendingProductDelete.value = p
  productDeleteOpen.value = true
}

async function confirmDeleteProduct() {
  if (!pendingProductDelete.value) return
  try {
    await productRemoveMutation.mutate({
      clientId: clientId.value,
      productId: pendingProductDelete.value.id,
    })
    toastStore.success(locale.value === 'ar' ? 'تم حذف المنتج' : 'Product deleted')
    productDeleteOpen.value = false
    pendingProductDelete.value = null
  } catch (e) {
    toastStore.error((e as ApiError).message || (locale.value === 'ar' ? 'حدث خطأ' : 'Error'))
  }
}

async function handleEdit(form: any) {
  try {
    await updateMutation.mutate({ id: client.value!.id, form })
    editOpen.value = false
    toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Updated')
    refresh()
  } catch (e) {
    const err = e as ApiError
    formRef.value?.applyApiErrors(err)
    toastStore.error(err.message || 'Error')
  }
}

async function handleToggleActive() {
  try {
    await toggleMutation.mutate(client.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم التحديث' : 'Updated')
    refresh()
  } catch (e) {
    const err = e as ApiError
    toastStore.error(err.message || 'Error')
  }
}

async function handleDelete() {
  try {
    await removeMutation.mutate(client.value!.id)
    toastStore.success(locale.value === 'ar' ? 'تم الحذف' : 'Deleted')
    navigateTo('/clients')
  } catch (e) {
    const err = e as ApiError
    toastStore.error(err.message || 'Error')
  } finally {
    deleteConfirmOpen.value = false
  }
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 200ms var(--ease-standard), transform 200ms var(--ease-standard);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
