<template>
  <FeatureBoundary id="subscription-add-ons">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-puzzle"
        :title="locale === 'ar' ? 'الإضافات' : 'Add-ons'"
        :subtitle="locale === 'ar' ? 'وسّع باقتك بميزات وحدود إضافية' : 'Extend your plan with extra capacity and features'"
      >
        <template #actions>
          <NuxtLink to="/subscription">
            <UiAppButton variant="outline" size="sm" icon="i-lucide-arrow-left" class="rtl:[&_[name=i-lucide-arrow-left]]:rotate-180">
              {{ locale === 'ar' ? 'العودة للاشتراك' : 'Back to Subscription' }}
            </UiAppButton>
          </NuxtLink>
        </template>
      </UiPageHeader>

      <Can :perm="PERMISSIONS.MANAGE_SUBSCRIPTION">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا تملك صلاحية إدارة الاشتراك' : "You don't have access" }}
            </p>
          </div>
        </template>

        <!-- Credit balances summary — only shown when the tenant has any
             credit packs purchased. Aggregates across all packs of the same
             kind so the user sees one number per kind. -->
        <div
          v-if="creditEntries.length"
          class="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          <div
            v-for="entry in creditEntries"
            :key="entry.kind"
            class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex items-center justify-between gap-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-md bg-warning-50 dark:bg-warning-500/15 inline-flex items-center justify-center flex-shrink-0">
                <UIcon name="i-lucide-coins" class="w-4 h-4 text-warning-600 dark:text-warning-400" />
              </div>
              <div class="min-w-0">
                <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {{ creditKindLabel(entry.kind) }}
                </p>
                <p class="text-xs text-neutral-700 dark:text-neutral-200">
                  {{ locale === 'ar' ? 'الرصيد المتبقي' : 'Remaining balance' }}
                </p>
              </div>
            </div>
            <p
              class="font-mono text-2xl font-bold tabular-nums"
              :class="entry.balance > 0
                ? 'text-success-700 dark:text-success-400'
                : 'text-warning-700 dark:text-warning-500'"
              dir="ltr"
            >
              {{ formatNumber(entry.balance) }}
            </p>
          </div>
        </div>

        <!-- Tabs: Available | Yours -->
        <div class="flex justify-center mb-5">
          <div class="inline-flex bg-neutral-0 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-1 gap-1">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              type="button"
              class="px-4 h-8 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1.5"
              :class="activeTab === tab.value
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-0'"
              @click="activeTab = tab.value"
            >
              <UIcon :name="tab.icon" class="w-3.5 h-3.5" />
              {{ tab.label }}
              <span
                v-if="tab.count !== undefined"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                :class="activeTab === tab.value
                  ? 'bg-white/25 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'"
              >
                {{ tab.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Available catalog -->
        <div v-if="activeTab === 'catalog'">
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="i in 6" :key="i" class="h-[260px] rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          </div>
          <div v-else-if="catalog.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="(addOn, i) in catalog"
              :key="addOn.id"
              v-motion
              :initial="{ opacity: 0, y: 8 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: i * 40 } }"
              class="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 p-5 flex flex-col"
            >
              <div class="flex items-start justify-between mb-3 gap-2">
                <div class="w-9 h-9 rounded-md inline-flex items-center justify-center" :class="typeIconClass(addOn.type).bg">
                  <UIcon :name="typeIconClass(addOn.type).icon" class="w-4 h-4" :class="typeIconClass(addOn.type).color" />
                </div>
                <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" :class="typeBadgeClass(addOn.type)">
                  {{ typeLabel(addOn.type) }}
                </span>
              </div>

              <h3 class="text-base font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
                {{ locale === 'ar' ? addOn.name_ar : addOn.name_en }}
              </h3>
              <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-3 min-h-[2.5rem]">
                {{ (locale === 'ar' ? addOn.description_ar : addOn.description_en) || '' }}
              </p>

              <!-- Boost preview -->
              <ul v-if="addOn.type === 'boost' && addOn.boost" class="mb-3 space-y-1">
                <li v-for="(delta, key) in addOn.boost" :key="String(key)" class="flex items-center gap-1.5 text-xs">
                  <UIcon name="i-lucide-plus-circle" class="w-3.5 h-3.5 text-success-500" />
                  <span class="font-mono tabular-nums" dir="ltr">+{{ formatBoost(String(key), Number(delta)) }}</span>
                  <span class="text-neutral-500 dark:text-neutral-400">{{ limitLabel(String(key)) }}</span>
                </li>
              </ul>

              <!-- Credit pack preview -->
              <p v-else-if="addOn.type === 'credit_pack'" class="mb-3 text-xs text-neutral-700 dark:text-neutral-200">
                <UIcon name="i-lucide-coins" class="w-3.5 h-3.5 text-warning-500 inline" />
                <span class="font-mono tabular-nums" dir="ltr">{{ formatNumber(addOn.credit_quantity ?? 0) }}</span>
                {{ creditKindLabel(addOn.credit_kind) }}
              </p>

              <!-- Feature -->
              <p v-else-if="addOn.type === 'feature' && addOn.feature_slug" class="mb-3 text-xs text-neutral-700 dark:text-neutral-200">
                <UIcon name="i-lucide-sparkles" class="w-3.5 h-3.5 text-primary-500 inline" />
                {{ featureLabel(addOn.feature_slug) }}
              </p>

              <!-- Price -->
              <div class="mt-auto pt-3 border-t border-neutral-200 dark:border-neutral-800 flex items-baseline justify-between gap-2">
                <p class="font-mono tabular-nums" dir="ltr">
                  <span class="text-lg font-bold text-neutral-900 dark:text-neutral-0">
                    {{ formatNumber(catalogPrice(addOn)) }}
                  </span>
                  <span class="text-xs text-neutral-500 dark:text-neutral-400 ms-1">
                    {{ addOn.currency }}
                  </span>
                  <span class="text-[11px] text-neutral-400 ms-1">
                    / {{ cycleShort(addOn.billing_cycle) }}
                  </span>
                </p>
                <UiAppButton
                  size="sm"
                  variant="primary"
                  :icon="addOn.type === 'credit_pack' ? 'i-lucide-shopping-cart' : 'i-lucide-plus'"
                  @click="openPurchase(addOn)"
                >
                  {{ addOn.type === 'credit_pack'
                    ? (locale === 'ar' ? 'اشترِ' : 'Buy')
                    : (locale === 'ar' ? 'أضف' : 'Add') }}
                </UiAppButton>
              </div>
            </div>
          </div>
          <div v-else class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-package-x" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
              {{ locale === 'ar' ? 'لا توجد إضافات متاحة' : 'No add-ons available' }}
            </p>
          </div>
        </div>

        <!-- Yours -->
        <div v-else>
          <div v-if="loading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="h-20 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          </div>
          <div v-else-if="mine.length" class="space-y-2">
            <div
              v-for="row in mine"
              :key="row.id"
              class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 flex items-start justify-between gap-3"
            >
              <div class="flex items-start gap-3 min-w-0">
                <div
                  class="w-9 h-9 rounded-md inline-flex items-center justify-center flex-shrink-0"
                  :class="typeIconClass(row.add_on?.type ?? 'boost').bg"
                >
                  <UIcon :name="typeIconClass(row.add_on?.type ?? 'boost').icon" class="w-4 h-4" :class="typeIconClass(row.add_on?.type ?? 'boost').color" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">
                    {{ locale === 'ar' ? row.add_on?.name_ar : row.add_on?.name_en }}
                    <span v-if="row.quantity > 1" class="text-xs font-normal text-neutral-500 dark:text-neutral-400">×{{ row.quantity }}</span>
                  </p>
                  <div class="flex items-center gap-2 flex-wrap mt-1">
                    <UiBadge :color="statusColor(row.status)" dot>{{ statusLabel(row.status) }}</UiBadge>
                    <span v-if="row.cancel_at_period_end && row.status === 'active'" class="text-[10px] text-warning-700 dark:text-warning-500 inline-flex items-center gap-1">
                      <UIcon name="i-lucide-clock-3" class="w-3 h-3" />
                      {{ locale === 'ar' ? `يُلغى في ${formatDate(row.current_period_end)}` : `Cancels ${formatDate(row.current_period_end)}` }}
                    </span>
                    <span v-else-if="row.current_period_end && row.status === 'active'" class="text-[10px] text-neutral-500 dark:text-neutral-400">
                      {{ locale === 'ar' ? `يجدّد ${formatDate(row.current_period_end)}` : `Renews ${formatDate(row.current_period_end)}` }}
                    </span>
                  </div>
                  <!-- Credit balance for credit packs -->
                  <p
                    v-if="row.credits?.length"
                    class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 tabular-nums"
                    dir="ltr"
                  >
                    {{ creditsRemaining(row) }} / {{ creditsTotal(row) }} {{ creditKindLabel(row.add_on?.credit_kind) }}
                  </p>
                </div>
              </div>
              <div class="text-end flex-shrink-0">
                <p class="font-mono text-sm tabular-nums text-neutral-900 dark:text-neutral-0" dir="ltr">
                  {{ formatNumber(Number(row.price) * row.quantity) }}
                  <span class="text-xs text-neutral-500 dark:text-neutral-400">{{ row.currency }}</span>
                </p>
                <button
                  v-if="row.status === 'active' && !row.cancel_at_period_end && row.billing_cycle !== 'once'"
                  type="button"
                  class="text-[11px] text-danger-600 dark:text-danger-400 hover:underline mt-1"
                  @click="confirmCancel(row)"
                >
                  {{ locale === 'ar' ? 'إلغاء' : 'Cancel' }}
                </button>
              </div>
            </div>
          </div>
          <div v-else class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-puzzle" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
              {{ locale === 'ar' ? 'لا توجد إضافات' : 'No add-ons yet' }}
            </p>
            <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-3">
              {{ locale === 'ar' ? 'تصفح المتجر لإضافة سعات أو ميزات أو رصيد إلى باقتك.' : 'Browse the catalog to add capacity, features, or credits.' }}
            </p>
            <UiAppButton variant="primary" size="sm" icon="i-lucide-store" @click="activeTab = 'catalog'">
              {{ locale === 'ar' ? 'اعرض المتجر' : 'Browse catalog' }}
            </UiAppButton>
          </div>
        </div>

        <!-- Purchase slideover -->
        <UiSlideOver v-model="purchaseOpen" :title="purchaseTitle">
          <form v-if="selected" @submit.prevent="confirmPurchase" class="space-y-4">
            <!-- Recap -->
            <div class="rounded-xl bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/20 p-4">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                {{ locale === 'ar' ? 'الإضافة' : 'Add-on' }}
              </p>
              <p class="font-semibold text-neutral-900 dark:text-neutral-0">
                {{ locale === 'ar' ? selected.name_ar : selected.name_en }}
              </p>
              <p class="font-mono text-sm text-primary-700 dark:text-primary-400 mt-1 tabular-nums" dir="ltr">
                {{ formatNumber(catalogPrice(selected) * (purchaseForm.quantity || 1)) }} {{ selected.currency }} / {{ cycleShort(selected.billing_cycle) }}
              </p>
            </div>

            <!-- Quantity (only for boost rows that allow stacking) -->
            <div v-if="selected.type !== 'feature'">
              <label class="ao-label">{{ locale === 'ar' ? 'الكمية' : 'Quantity' }}</label>
              <input
                v-model.number="purchaseForm.quantity"
                type="number"
                min="1"
                max="100"
                class="ao-input font-mono"
                dir="ltr"
              />
              <p v-if="selected.type === 'boost'" class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                {{ locale === 'ar' ? 'يمكنك شراء أكثر من نسخة لمضاعفة الزيادة.' : 'Buy multiple to stack the boost.' }}
              </p>
            </div>

            <!-- Payment method -->
            <div>
              <label class="ao-label">{{ locale === 'ar' ? 'طريقة الدفع' : 'Payment Method' }}</label>
              <div class="space-y-2">
                <label
                  v-for="method in paymentMethods"
                  :key="method.value"
                  class="flex items-center gap-3 cursor-pointer p-3 rounded-md border transition-colors"
                  :class="purchaseForm.payment_method === method.value
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40'"
                >
                  <input v-model="purchaseForm.payment_method" type="radio" :value="method.value" class="accent-primary-500" />
                  <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0 flex-1">{{ method.label }}</span>
                  <span class="text-[11px] text-neutral-500 dark:text-neutral-400">{{ method.hint }}</span>
                </label>
              </div>
            </div>

            <div class="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <UiAppButton type="button" variant="outline" :disabled="submitting" class="flex-1" @click="purchaseOpen = false">
                {{ $t('common.cancel') }}
              </UiAppButton>
              <UiAppButton type="submit" variant="primary" icon="i-lucide-check-circle-2" :loading="submitting" class="flex-1">
                {{ locale === 'ar' ? 'تأكيد' : 'Confirm purchase' }}
              </UiAppButton>
            </div>
          </form>
        </UiSlideOver>

        <!-- Cancel confirm -->
        <UiConfirmModal
          v-model="cancelOpen"
          :title="locale === 'ar' ? 'إلغاء الإضافة' : 'Cancel add-on'"
          :description="locale === 'ar'
            ? 'سيظل نشطاً حتى نهاية الدورة الحالية ولن يتجدد بعد ذلك.'
            : 'It stays active until the end of the current period and will not renew after that.'"
          icon="i-lucide-alert-triangle"
          variant="danger"
          :confirm-label="locale === 'ar' ? 'إلغاء الإضافة' : 'Cancel add-on'"
          :loading="cancelling"
          @confirm="performCancel"
        />
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import {
  addOnsService,
  type AddOn,
  type AddOnBillingCycle,
  type AddOnType,
  type SubscriptionAddOn,
} from '~/features/subscription/services/addOnsService'
import type { PaymentMethod } from '~/features/subscription/services/subscriptionService'
import { generateIdempotencyKey } from '~/core/api/requestId'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()

const catalog = ref<AddOn[]>([])
const mine = ref<SubscriptionAddOn[]>([])
const credits = ref<Record<string, { kind: string; balance: number }>>({})
const loading = ref(true)

const creditEntries = computed(() => Object.values(credits.value))

const activeTab = ref<'catalog' | 'mine'>('catalog')

const tabs = computed(() => [
  {
    value: 'catalog' as const,
    label: locale.value === 'ar' ? 'متجر الإضافات' : 'Available',
    icon: 'i-lucide-store',
    count: catalog.value.length,
  },
  {
    value: 'mine' as const,
    label: locale.value === 'ar' ? 'إضافاتي' : 'Yours',
    icon: 'i-lucide-puzzle',
    count: mine.value.length,
  },
])

// ── Catalog rendering helpers ──

function typeIconClass(type: AddOnType): { icon: string; bg: string; color: string } {
  return ({
    boost: { icon: 'i-lucide-trending-up', bg: 'bg-success-50 dark:bg-success-500/15', color: 'text-success-600 dark:text-success-400' },
    feature: { icon: 'i-lucide-sparkles', bg: 'bg-primary-50 dark:bg-primary-500/15', color: 'text-primary-600 dark:text-primary-400' },
    credit_pack: { icon: 'i-lucide-coins', bg: 'bg-warning-50 dark:bg-warning-500/15', color: 'text-warning-600 dark:text-warning-400' },
  } as const)[type]
}

function typeBadgeClass(type: AddOnType): string {
  return ({
    boost: 'bg-success-50 dark:bg-success-500/15 text-success-700 dark:text-success-400',
    feature: 'bg-primary-50 dark:bg-primary-500/15 text-primary-700 dark:text-primary-400',
    credit_pack: 'bg-warning-50 dark:bg-warning-500/15 text-warning-700 dark:text-warning-500',
  } as const)[type]
}

function typeLabel(type: AddOnType): string {
  if (locale.value === 'ar') {
    return ({ boost: 'رفع الحد', feature: 'ميزة', credit_pack: 'باقة رصيد' } as const)[type]
  }
  return ({ boost: 'Boost', feature: 'Feature', credit_pack: 'Credit Pack' } as const)[type]
}

function cycleShort(cycle: AddOnBillingCycle): string {
  if (cycle === 'once') return locale.value === 'ar' ? 'مرة' : 'one-time'
  if (cycle === 'annual') return locale.value === 'ar' ? 'سنة' : 'yr'
  return locale.value === 'ar' ? 'شهر' : 'mo'
}

function catalogPrice(addOn: AddOn): number {
  if (addOn.billing_cycle === 'annual') return Number(addOn.price_annual ?? 0)
  if (addOn.billing_cycle === 'once') return Number(addOn.price_once ?? 0)
  return Number(addOn.price_monthly ?? 0)
}

function formatNumber(n: number): string {
  return Number(n ?? 0).toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US')
}

function formatBoost(key: string, delta: number): string {
  // storage_bytes is the only key where the raw integer hurts readability —
  // surface a GB-rounded view instead of "5,368,709,120".
  if (key === 'max_storage_bytes') {
    const gb = delta / (1024 * 1024 * 1024)
    return Number.isInteger(gb) ? `${gb} GB` : `${gb.toFixed(1)} GB`
  }
  return formatNumber(delta)
}

function limitLabel(key: string): string {
  const ar: Record<string, string> = {
    max_users: 'مستخدمون',
    max_clients: 'عملاء',
    max_invoices_per_month: 'فاتورة شهرياً',
    max_bills_per_month: 'فاتورة موردين شهرياً',
    max_journal_entries_per_month: 'قيد يومي شهرياً',
    max_bank_imports_per_month: 'استيراد بنكي شهرياً',
    max_documents: 'مستند',
    max_api_calls_per_month: 'طلب API شهرياً',
    max_storage_bytes: 'تخزين',
  }
  const en: Record<string, string> = {
    max_users: 'users',
    max_clients: 'clients',
    max_invoices_per_month: 'invoices/mo',
    max_bills_per_month: 'bills/mo',
    max_journal_entries_per_month: 'journal entries/mo',
    max_bank_imports_per_month: 'bank imports/mo',
    max_documents: 'documents',
    max_api_calls_per_month: 'API calls/mo',
    max_storage_bytes: 'storage',
  }
  return locale.value === 'ar' ? (ar[key] ?? key) : (en[key] ?? key.replace(/_/g, ' '))
}

function featureLabel(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function creditKindLabel(kind: string | null | undefined): string {
  if (!kind) return ''
  if (locale.value === 'ar') {
    return ({ sms: 'رسالة SMS', ai_tokens: 'رصيد ذكاء اصطناعي' } as Record<string, string>)[kind] ?? kind
  }
  return ({ sms: 'SMS', ai_tokens: 'AI tokens' } as Record<string, string>)[kind] ?? kind
}

// ── Yours helpers ──

type BadgeColor = 'gray' | 'green' | 'orange' | 'red'
function statusColor(s: string): BadgeColor {
  return ({ active: 'green', cancelled: 'gray', expired: 'red' } as Record<string, BadgeColor>)[s] ?? 'gray'
}
function statusLabel(s: string): string {
  if (locale.value === 'ar') {
    return ({ active: 'نشط', cancelled: 'مُلغى', expired: 'منتهي' } as Record<string, string>)[s] ?? s
  }
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function creditsRemaining(row: SubscriptionAddOn): string {
  if (!row.credits?.length) return '0'
  return formatNumber(row.credits.reduce((s, c) => s + (c.remaining ?? 0), 0))
}
function creditsTotal(row: SubscriptionAddOn): string {
  if (!row.credits?.length) return '0'
  return formatNumber(row.credits.reduce((s, c) => s + c.quantity_total, 0))
}

function formatDate(d: string | null | undefined): string {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleDateString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
  } catch { return d }
}

// ── Purchase ──

const purchaseOpen = ref(false)
const submitting = ref(false)
const selected = ref<AddOn | null>(null)
const purchaseForm = reactive({
  quantity: 1,
  payment_method: 'paymob' as PaymentMethod,
})

const purchaseTitle = computed(() => {
  if (!selected.value) return ''
  const name = locale.value === 'ar' ? selected.value.name_ar : selected.value.name_en
  return locale.value === 'ar' ? `شراء ${name}` : `Purchase ${name}`
})

const paymentMethods = computed<Array<{ value: PaymentMethod; label: string; hint: string }>>(() => [
  { value: 'paymob',        label: locale.value === 'ar' ? 'Paymob (بطاقة ائتمان)' : 'Paymob (card)',      hint: locale.value === 'ar' ? 'أونلاين' : 'online' },
  { value: 'fawry',         label: locale.value === 'ar' ? 'فوري'                  : 'Fawry',              hint: locale.value === 'ar' ? 'كود دفع' : 'payment code' },
  { value: 'bank_transfer', label: locale.value === 'ar' ? 'تحويل بنكي'            : 'Bank transfer',      hint: locale.value === 'ar' ? 'تأكيد يدوي' : 'manual confirm' },
])

function openPurchase(addOn: AddOn) {
  selected.value = addOn
  purchaseForm.quantity = 1
  purchaseForm.payment_method = 'paymob'
  purchaseOpen.value = true
}

async function confirmPurchase() {
  if (!selected.value) return
  submitting.value = true
  try {
    await addOnsService().purchase(
      {
        add_on_id: selected.value.id,
        quantity: Math.max(1, Math.min(100, Number(purchaseForm.quantity) || 1)),
        billing_cycle: selected.value.billing_cycle,
        payment_method: purchaseForm.payment_method,
      },
      generateIdempotencyKey(),
    )
    toastStore.success(locale.value === 'ar' ? 'تمت الإضافة' : 'Add-on activated')
    purchaseOpen.value = false
    await loadAll()
    activeTab.value = 'mine'
  } catch (e: unknown) {
    const err = e as ApiError
    toastStore.error(err?.message || (locale.value === 'ar' ? 'فشل الشراء' : 'Purchase failed'))
  } finally {
    submitting.value = false
  }
}

// ── Cancel ──

const cancelOpen = ref(false)
const cancelling = ref(false)
const toCancel = ref<SubscriptionAddOn | null>(null)

function confirmCancel(row: SubscriptionAddOn) {
  toCancel.value = row
  cancelOpen.value = true
}

async function performCancel() {
  if (!toCancel.value) return
  cancelling.value = true
  try {
    await addOnsService().cancel(toCancel.value.id)
    toastStore.success(locale.value === 'ar' ? 'تم الإلغاء' : 'Cancellation scheduled')
    cancelOpen.value = false
    toCancel.value = null
    await loadAll()
  } catch (e: unknown) {
    const err = e as ApiError
    toastStore.error(err?.message || (locale.value === 'ar' ? 'فشل الإلغاء' : 'Cancel failed'))
  } finally {
    cancelling.value = false
  }
}

// ── Loading ──

async function loadAll() {
  loading.value = true
  try {
    const service = addOnsService()
    const [cat, my, balances] = await Promise.all([
      service.catalog(),
      service.list().catch(() => [] as SubscriptionAddOn[]),
      service.credits().catch(() => ({} as Record<string, { kind: string; balance: number }>)),
    ])
    catalog.value = cat.slice().sort((a, b) => a.sort_order - b.sort_order)
    mine.value = my
    credits.value = balances ?? {}
  } catch {
    toastStore.error(locale.value === 'ar' ? 'فشل تحميل الإضافات' : 'Failed to load add-ons')
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.ao-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.ao-input {
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
.ao-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .ao-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
