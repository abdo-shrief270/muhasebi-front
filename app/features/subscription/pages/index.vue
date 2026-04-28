<template>
  <FeatureBoundary id="subscription">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-credit-card"
        :title="$t('nav.subscription')"
        :subtitle="locale === 'ar' ? 'إدارة الاشتراك والاستخدام والإضافات' : 'Manage your subscription, usage, and add-ons'"
      >
        <template #actions>
          <Can :perm="PERMISSIONS.MANAGE_SUBSCRIPTION">
            <NuxtLink to="/subscription/add-ons">
              <UiAppButton variant="outline" size="sm" icon="i-lucide-puzzle">
                {{ locale === 'ar' ? 'الإضافات' : 'Add-ons' }}
              </UiAppButton>
            </NuxtLink>
          </Can>
          <NuxtLink to="/subscription/usage-history">
            <UiAppButton variant="outline" size="sm" icon="i-lucide-line-chart">
              {{ locale === 'ar' ? 'سجل الاستخدام' : 'Usage history' }}
            </UiAppButton>
          </NuxtLink>
        </template>
      </UiPageHeader>

      <!-- Required-feature banner — shown when a gated route bounces here -->
      <div
        v-if="requiredFeature"
        v-motion
        :initial="{ opacity: 0, y: -8 }"
        :enter="{ opacity: 1, y: 0 }"
        class="mb-4 rounded-xl border border-warning-500/30 bg-warning-500/5 p-4"
      >
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-md bg-warning-500/10 inline-flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-lock" class="w-4 h-4 text-warning-700 dark:text-warning-500" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-warning-800 dark:text-warning-400 mb-1">
              {{ locale === 'ar'
                ? `ميزة "${requiredFeatureLabel}" غير متاحة في باقتك`
                : `"${requiredFeatureLabel}" is not available on your plan` }}
            </h4>
            <p class="text-xs text-warning-700 dark:text-warning-500/80">
              {{ locale === 'ar'
                ? `تتطلب هذه الميزة باقة ${requiredPlanLabel}. قم بالترقية للوصول إليها.`
                : `This feature requires the ${requiredPlanLabel} plan. Upgrade to unlock it.` }}
            </p>
          </div>
        </div>
      </div>

      <!-- Limit-exceeded banner — shown when any metered resource is over its cap -->
      <div
        v-if="exceededMetrics.length"
        v-motion
        :initial="{ opacity: 0, y: -8 }"
        :enter="{ opacity: 1, y: 0 }"
        class="mb-4 rounded-xl border border-danger-500/30 bg-danger-500/5 p-4"
      >
        <div class="flex items-start gap-3">
          <div class="w-9 h-9 rounded-md bg-danger-500/10 inline-flex items-center justify-center flex-shrink-0">
            <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-danger-700 dark:text-danger-400" />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-danger-800 dark:text-danger-400 mb-1">
              {{ locale === 'ar' ? 'تم تجاوز بعض الحدود' : 'You have exceeded some limits' }}
            </h4>
            <p class="text-xs text-danger-700 dark:text-danger-400/80">
              {{ exceededLabels }} —
              {{ locale === 'ar' ? 'قم بالترقية أو أضف إضافة لرفع الحد.' : 'upgrade your plan or buy an add-on to raise the limit.' }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="loading" class="space-y-3">
        <div class="h-32 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div v-for="i in 8" :key="i" class="h-32 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>
      </div>

      <div v-else class="space-y-4">
        <!-- Current plan card -->
        <div
          v-motion
          :initial="{ opacity: 0, y: 8 }"
          :enter="{ opacity: 1, y: 0 }"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-4 flex items-center gap-1.5">
            <UIcon name="i-lucide-package" class="w-3.5 h-3.5 text-neutral-400" />
            {{ locale === 'ar' ? 'الباقة الحالية' : 'Current Plan' }}
          </h3>
          <div v-if="sub" class="flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <p class="text-xl font-bold text-primary-700 dark:text-primary-400">{{ planName }}</p>
              <div class="flex items-center gap-2 flex-wrap mt-2">
                <UiBadge :color="STATUS_COLOR[sub.status as SubStatus] ?? 'gray'" dot>
                  {{ statusLabel(sub.status) }}
                </UiBadge>
                <span v-if="sub.billing_cycle" class="text-[11px] text-neutral-500 dark:text-neutral-400">
                  · {{ sub.billing_cycle === 'annual' ? (locale === 'ar' ? 'سنوي' : 'Annual') : (locale === 'ar' ? 'شهري' : 'Monthly') }}
                </span>
                <span v-if="activeAddOnsCount > 0" class="text-[11px] text-primary-600 dark:text-primary-400 inline-flex items-center gap-1">
                  · <UIcon name="i-lucide-puzzle" class="w-3 h-3" />
                  {{ locale === 'ar' ? `${activeAddOnsCount} إضافة` : `${activeAddOnsCount} add-on${activeAddOnsCount === 1 ? '' : 's'}` }}
                </span>
              </div>
              <p v-if="sub.trial_ends_at" class="text-xs text-warning-700 dark:text-warning-500 mt-2 flex items-center gap-1">
                <UIcon name="i-lucide-hourglass" class="w-3 h-3" />
                {{ locale === 'ar' ? 'تنتهي التجربة:' : 'Trial ends:' }} {{ formatDate(sub.trial_ends_at) }}
              </p>
            </div>
            <div class="text-end flex-shrink-0">
              <p class="font-mono text-2xl font-bold text-neutral-900 dark:text-neutral-0 tabular-nums" dir="ltr">
                {{ formatMoney(sub.price) }}
                <span class="text-sm font-normal text-neutral-500 dark:text-neutral-400">
                  {{ locale === 'ar' ? 'ج.م.' : 'EGP' }}/{{ sub.billing_cycle === 'annual'
                    ? (locale === 'ar' ? 'سنوياً' : 'yr')
                    : (locale === 'ar' ? 'شهرياً' : 'mo') }}
                </span>
              </p>
              <p v-if="sub.current_period_end" class="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 tabular-nums">
                {{ locale === 'ar' ? 'التجديد' : 'Renews' }} · {{ formatDate(sub.current_period_end) }}
              </p>
            </div>
          </div>
          <p v-else class="text-sm text-neutral-500 dark:text-neutral-400">
            {{ locale === 'ar' ? 'لا يوجد اشتراك نشط — تواصل مع الدعم.' : 'No active subscription — contact support.' }}
          </p>
        </div>

        <!-- Usage meter grid -->
        <div v-if="usage" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <UsageMeterCard
            v-for="meter in meterGrid"
            :key="meter.key"
            :label="meter.label"
            :current="meter.current"
            :limit="meter.limit"
            :current-display="meter.currentDisplay"
            :limit-display="meter.limitDisplay"
            :percent="meter.percent"
            :exceeded="meter.exceeded"
            :boost-contribution="meter.boostContribution"
            :projection="meter.projection"
            :history="meter.history"
            :icon="meter.icon"
            :icon-bg="meter.iconBg"
            :icon-color="meter.iconColor"
          />
        </div>

        <!-- Active add-ons quick-list -->
        <div
          v-if="activeAddOns.length"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 flex items-center gap-1.5">
              <UIcon name="i-lucide-puzzle" class="w-3.5 h-3.5 text-neutral-400" />
              {{ locale === 'ar' ? 'الإضافات النشطة' : 'Active Add-ons' }}
            </h3>
            <NuxtLink
              to="/subscription/add-ons"
              class="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1"
            >
              {{ locale === 'ar' ? 'إدارة' : 'Manage' }}
              <UIcon name="i-lucide-arrow-right" class="w-3 h-3 rtl:rotate-180" />
            </NuxtLink>
          </div>
          <ul class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <li
              v-for="row in activeAddOns"
              :key="row.id"
              class="py-2.5 flex items-center justify-between gap-3"
            >
              <div class="flex items-center gap-2 min-w-0">
                <div class="w-7 h-7 rounded-md bg-primary-50 dark:bg-primary-500/10 inline-flex items-center justify-center flex-shrink-0">
                  <UIcon :name="addOnIcon(row)" class="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">
                    {{ locale === 'ar' ? row.add_on?.name_ar : row.add_on?.name_en }}
                    <span v-if="row.quantity > 1" class="text-xs font-normal text-neutral-500 dark:text-neutral-400">×{{ row.quantity }}</span>
                  </p>
                  <p v-if="row.cancel_at_period_end" class="text-[10px] text-warning-600 dark:text-warning-400">
                    {{ locale === 'ar' ? 'يُلغى في نهاية الدورة' : 'Cancels at period end' }}
                  </p>
                </div>
              </div>
              <span class="font-mono text-xs tabular-nums text-neutral-700 dark:text-neutral-200" dir="ltr">
                {{ formatMoney(Number(row.price) * row.quantity) }}
                {{ row.currency }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Upgrade CTA -->
        <div
          v-if="usage"
          class="bg-gradient-to-br from-primary-500/5 to-primary-500/10 dark:from-primary-500/10 dark:to-primary-500/15 rounded-xl border border-primary-500/20 p-5"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1 flex items-center gap-1.5">
                <UIcon name="i-lucide-trending-up" class="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
                {{ locale === 'ar' ? 'حان وقت الترقية؟' : 'Ready to upgrade?' }}
              </h3>
              <p class="text-xs text-neutral-600 dark:text-neutral-400 max-w-md">
                {{ locale === 'ar'
                  ? 'احصل على حدود أعلى وميزات إضافية لمؤسستك.'
                  : 'Unlock higher limits and more features for your team.' }}
              </p>
            </div>
            <Can :perm="PERMISSIONS.MANAGE_SUBSCRIPTION">
              <NuxtLink to="/subscription/upgrade">
                <UiAppButton variant="primary" size="sm" icon="i-lucide-arrow-up-right">
                  {{ locale === 'ar' ? 'عرض الباقات' : 'See plans' }}
                </UiAppButton>
              </NuxtLink>
            </Can>
          </div>
        </div>
      </div>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import { getFeature } from '~/core/subscription/registry'
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import UsageMeterCard from '~/features/subscription/components/UsageMeterCard.vue'
import { addOnsService, type SubscriptionAddOn } from '~/features/subscription/services/addOnsService'
import type { UsageSnapshot } from '~/features/subscription/services/subscriptionService'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const route = useRoute()

type SubStatus = 'active' | 'trial' | 'past_due' | 'cancelled' | 'expired'

const requiredFeatureId = computed(() => {
  const raw = route.query.required
  return Array.isArray(raw) ? raw[0] : raw
})

const requiredFeature = computed(() =>
  requiredFeatureId.value ? getFeature(requiredFeatureId.value) : undefined
)

const requiredFeatureLabel = computed(() => {
  const f = requiredFeature.value
  if (!f) return requiredFeatureId.value ?? ''
  return f.id
})

const requiredPlanLabel = computed(() => {
  const plans = requiredFeature.value?.plans
  if (!plans?.length) return ''
  return plans[0]
})

const sub = ref<any>(null)
const usage = ref<UsageSnapshot | null>(null)
const history = ref<Array<Record<string, number | string>>>([])
const activeAddOns = ref<SubscriptionAddOn[]>([])
const loading = ref(true)

const planName = computed(() => {
  const p = sub.value?.plan
  if (!p) return '—'
  return locale.value === 'ar' ? (p.name_ar || p.name_en || '—') : (p.name_en || p.name_ar || '—')
})

const STATUS_COLOR: Record<SubStatus, 'gray' | 'green' | 'blue' | 'orange' | 'red'> = {
  active: 'green', trial: 'blue', past_due: 'orange', cancelled: 'gray', expired: 'red',
}
const STATUS_AR: Record<SubStatus, string> = {
  active: 'نشط', trial: 'تجربة', past_due: 'متأخر', cancelled: 'مُلغى', expired: 'منتهي',
}
const STATUS_EN: Record<SubStatus, string> = {
  active: 'Active', trial: 'Trial', past_due: 'Past due', cancelled: 'Cancelled', expired: 'Expired',
}
function statusLabel(s: string) {
  const map = locale.value === 'ar' ? STATUS_AR : STATUS_EN
  return map[s as SubStatus] ?? s
}

const activeAddOnsCount = computed(() => activeAddOns.value.length)

// Build a sparkline from the last N daily samples for a given field. Empty
// array if history hasn't loaded yet — UsageMeterCard hides the line in
// that case rather than rendering a flat zero artifact.
function sparkline(field: string): number[] {
  if (!history.value.length) return []
  return history.value.map(row => Number(row[field] ?? 0))
}

const meterGrid = computed(() => {
  if (!usage.value) return []
  const u = usage.value
  const proj = u.projections ?? {}

  const baseIcon = (color: 'primary' | 'info' | 'success' | 'warning' | 'danger') => ({
    iconBg: `bg-${color}-50 dark:bg-${color}-500/15`,
    iconColor: `text-${color}-600 dark:text-${color}-400`,
  })

  return [
    {
      key: 'users',
      label: locale.value === 'ar' ? 'المستخدمون' : 'Users',
      icon: 'i-lucide-users',
      ...baseIcon('primary'),
      current: u.users.current,
      limit: u.users.limit,
      percent: u.users.percent,
      exceeded: u.users.exceeded,
      boostContribution: u.users.boost_contribution,
      projection: proj.users_count,
      history: sparkline('users_count'),
    },
    {
      key: 'clients',
      label: locale.value === 'ar' ? 'العملاء' : 'Clients',
      icon: 'i-lucide-user-check',
      ...baseIcon('info'),
      current: u.clients.current,
      limit: u.clients.limit,
      percent: u.clients.percent,
      exceeded: u.clients.exceeded,
      boostContribution: u.clients.boost_contribution,
      projection: proj.clients_count,
      history: sparkline('clients_count'),
    },
    {
      key: 'invoices',
      label: locale.value === 'ar' ? 'الفواتير (هذا الشهر)' : 'Invoices (this month)',
      icon: 'i-lucide-receipt',
      ...baseIcon('success'),
      current: u.invoices.current,
      limit: u.invoices.limit,
      percent: u.invoices.percent,
      exceeded: u.invoices.exceeded,
      boostContribution: u.invoices.boost_contribution,
      projection: proj.invoices_count,
      history: sparkline('invoices_count'),
    },
    {
      key: 'bills',
      label: locale.value === 'ar' ? 'فواتير الموردين' : 'Bills',
      icon: 'i-lucide-file-input',
      ...baseIcon('warning'),
      current: u.bills.current,
      limit: u.bills.limit,
      percent: u.bills.percent,
      exceeded: u.bills.exceeded,
      boostContribution: u.bills.boost_contribution,
      projection: proj.bills_count,
      history: sparkline('bills_count'),
    },
    {
      key: 'journal_entries',
      label: locale.value === 'ar' ? 'القيود اليومية' : 'Journal entries',
      icon: 'i-lucide-book-open',
      ...baseIcon('primary'),
      current: u.journal_entries.current,
      limit: u.journal_entries.limit,
      percent: u.journal_entries.percent,
      exceeded: u.journal_entries.exceeded,
      boostContribution: u.journal_entries.boost_contribution,
      projection: proj.journal_entries_count,
      history: sparkline('journal_entries_count'),
    },
    {
      key: 'bank_imports',
      label: locale.value === 'ar' ? 'استيراد البنوك' : 'Bank imports',
      icon: 'i-lucide-landmark',
      ...baseIcon('info'),
      current: u.bank_imports.current,
      limit: u.bank_imports.limit,
      percent: u.bank_imports.percent,
      exceeded: u.bank_imports.exceeded,
      boostContribution: u.bank_imports.boost_contribution,
      projection: proj.bank_imports_count,
      history: sparkline('bank_imports_count'),
    },
    {
      key: 'documents',
      label: locale.value === 'ar' ? 'المستندات' : 'Documents',
      icon: 'i-lucide-folder',
      ...baseIcon('success'),
      current: u.documents.current,
      limit: u.documents.limit,
      percent: u.documents.percent,
      exceeded: u.documents.exceeded,
      boostContribution: u.documents.boost_contribution,
      projection: proj.documents_count,
      history: sparkline('documents_count'),
    },
    {
      key: 'storage',
      label: locale.value === 'ar' ? 'التخزين' : 'Storage',
      icon: 'i-lucide-hard-drive',
      ...baseIcon('warning'),
      current: u.storage.current_bytes,
      limit: u.storage.limit_bytes,
      currentDisplay: u.storage.current_human,
      limitDisplay: u.storage.limit_human,
      percent: u.storage.percent,
      exceeded: u.storage.exceeded,
      boostContribution: u.storage.boost_contribution,
      projection: proj.storage_bytes,
      history: sparkline('storage_bytes'),
    },
  ] as const
})

const exceededMetrics = computed(() => meterGrid.value.filter(m => m.exceeded))

const exceededLabels = computed(() => {
  const labels = exceededMetrics.value.map(m => m.label)
  if (labels.length === 0) return ''
  return labels.join(locale.value === 'ar' ? '، ' : ', ')
})

function addOnIcon(row: SubscriptionAddOn): string {
  const t = row.add_on?.type
  if (t === 'feature') return 'i-lucide-sparkles'
  if (t === 'credit_pack') return 'i-lucide-coins'
  return 'i-lucide-plus-circle'
}

function formatMoney(n: number | string | null | undefined) {
  return Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
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

onMounted(async () => {
  try {
    const [subRes, usageRes, historyRes, addOnsRes] = await Promise.all([
      api.get<{ data: any }>('/subscription').catch(() => ({ data: null })),
      api.get<{ data: UsageSnapshot }>('/subscription/usage').catch(() => ({ data: null })),
      api.get<{ data: Array<Record<string, number | string>> }>('/subscription/usage-history?days=14').catch(() => ({ data: [] })),
      addOnsService().list(true).catch(() => [] as SubscriptionAddOn[]),
    ])
    sub.value = subRes.data
    usage.value = usageRes.data
    // Backend returns newest-first; reverse so the sparkline reads
    // left-to-right oldest→newest.
    history.value = (historyRes.data ?? []).slice().reverse()
    activeAddOns.value = addOnsRes
  } catch { /* ignore — empty states render */ }
  finally { loading.value = false }
})
</script>
