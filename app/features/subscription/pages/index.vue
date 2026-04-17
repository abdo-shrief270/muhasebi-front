<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader :title="$t('nav.subscription')" :subtitle="locale === 'ar' ? 'إدارة اشتراكك وباقتك' : 'Manage your subscription and plan'" />

      <div
        v-if="requiredFeature"
        v-motion
        :initial="{ opacity: 0, y: -10 }"
        :enter="{ opacity: 1, y: 0 }"
        class="max-w-3xl mb-6 border border-amber-200 bg-amber-50/80 rounded-2xl p-5"
      >
        <div class="flex items-start gap-4">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m0 3.75h.007M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="text-sm font-semibold text-amber-900 mb-1">
              {{ locale === 'ar' ? `ميزة "${requiredFeatureLabel}" غير متاحة في باقتك` : `"${requiredFeatureLabel}" is not available on your plan` }}
            </h4>
            <p class="text-sm text-amber-800/80">
              {{ locale === 'ar'
                  ? `تتطلب هذه الميزة باقة ${requiredPlanLabel}. قم بالترقية للوصول إليها.`
                  : `This feature requires a ${requiredPlanLabel} plan. Upgrade to unlock it.` }}
            </p>
          </div>
        </div>
      </div>

      <div v-if="loading"><UiLoadingSkeleton :lines="5" :height="24" /></div>

      <div v-else class="max-w-3xl space-y-6">
        <!-- Current plan -->
        <div v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0 }" class="bg-white rounded-2xl border border-gray-100/80 p-6">
          <h3 class="font-semibold text-gray-700 mb-4">{{ locale === 'ar' ? 'الباقة الحالية' : 'Current Plan' }}</h3>
          <div v-if="sub" class="flex items-center justify-between">
            <div>
              <p class="text-xl font-bold text-primary-500">{{ sub.plan?.name_ar || sub.plan?.name_en || '-' }}</p>
              <UiBadge :color="({ active: 'green', trial: 'blue', past_due: 'orange', cancelled: 'gray', expired: 'red' } as any)[sub.status]" dot class="mt-2">
                {{ sub.status }}
              </UiBadge>
              <p v-if="sub.trial_ends_at" class="text-xs text-amber-500 mt-2">
                {{ locale === 'ar' ? 'تنتهي التجربة:' : 'Trial ends:' }} {{ new Date(sub.trial_ends_at).toLocaleDateString() }}
              </p>
            </div>
            <div class="text-end">
              <p class="text-2xl font-bold text-gray-800" dir="ltr">{{ Number(sub.price).toLocaleString() }} <span class="text-sm text-gray-400">{{ locale === 'ar' ? 'ج.م.' : 'EGP' }}/{{ sub.billing_cycle === 'annual' ? (locale === 'ar' ? 'سنوياً' : 'year') : (locale === 'ar' ? 'شهرياً' : 'month') }}</span></p>
              <p class="text-xs text-gray-400 mt-1">
                {{ locale === 'ar' ? 'التجديد:' : 'Renews:' }} {{ sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '-' }}
              </p>
            </div>
          </div>
          <p v-else class="text-gray-400">{{ locale === 'ar' ? 'لا يوجد اشتراك نشط — تواصل مع الدعم' : 'No active subscription — contact support' }}</p>
        </div>

        <!-- Usage -->
        <div v-if="usage" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }" class="bg-white rounded-2xl border border-gray-100/80 p-6">
          <h3 class="font-semibold text-gray-700 mb-4">{{ locale === 'ar' ? 'الاستخدام' : 'Usage' }}</h3>
          <div class="space-y-5">
            <div v-for="item in usageItems" :key="item.label">
              <div class="flex justify-between text-sm mb-1.5">
                <span class="text-gray-600">{{ item.label }}</span>
                <span class="font-mono text-sm">
                  <span class="text-gray-700 font-medium">{{ item.current }}</span>
                  <span v-if="item.limit" class="text-gray-400"> / {{ item.limit === -1 ? '∞' : item.limit }}</span>
                </span>
              </div>
              <div class="bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  class="rounded-full h-2.5 transition-all duration-700"
                  :class="item.exceeded ? 'bg-red-500' : item.percent > 80 ? 'bg-amber-500' : 'bg-emerald-500'"
                  :style="{ width: Math.min(item.percent, 100) + '%' }"
                ></div>
              </div>
              <p v-if="item.exceeded" class="text-xs text-red-500 mt-1">
                {{ locale === 'ar' ? 'تم تجاوز الحد — قم بالترقية' : 'Limit exceeded — please upgrade' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Plan info -->
        <div v-if="usage" v-motion :initial="{ opacity: 0, y: 15 }" :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }" class="bg-white rounded-2xl border border-gray-100/80 p-6">
          <h3 class="font-semibold text-gray-700 mb-2">{{ locale === 'ar' ? 'باقتك' : 'Your Plan' }}: {{ usage.plan?.name_ar || usage.plan?.name || '-' }}</h3>
          <p class="text-sm text-gray-400">
            {{ locale === 'ar' ? 'للترقية أو تغيير الباقة، تواصل مع مدير المنصة.' : 'To upgrade or change plans, contact your platform admin.' }}
          </p>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { getFeature } from '~/core/subscription/registry'

definePageMeta({ layout: false })
const { locale } = useI18n()
const api = useApi()
const route = useRoute()

const requiredFeatureId = computed(() => {
  const raw = route.query.required
  return Array.isArray(raw) ? raw[0] : raw
})

const requiredFeature = computed(() => requiredFeatureId.value ? getFeature(requiredFeatureId.value) : undefined)

const requiredFeatureLabel = computed(() => {
  const f = requiredFeature.value
  if (!f) return requiredFeatureId.value ?? ''
  return f.navLabel ? (locale.value === 'ar' ? f.id : f.id) : f.id
})

const requiredPlanLabel = computed(() => {
  const plans = requiredFeature.value?.plans
  if (!plans?.length) return ''
  return plans[0]
})

const sub = ref<any>(null)
const usage = ref<any>(null)
const loading = ref(true)

const usageItems = computed(() => {
  if (!usage.value) return []
  const u = usage.value
  return [
    {
      label: locale.value === 'ar' ? 'المستخدمين' : 'Users',
      current: u.users?.current ?? 0,
      limit: u.users?.limit,
      percent: u.users?.percent ?? 0,
      exceeded: u.users?.exceeded ?? false,
    },
    {
      label: locale.value === 'ar' ? 'العملاء' : 'Clients',
      current: u.clients?.current ?? 0,
      limit: u.clients?.limit,
      percent: u.clients?.percent ?? 0,
      exceeded: u.clients?.exceeded ?? false,
    },
    {
      label: locale.value === 'ar' ? 'الفواتير (هذا الشهر)' : 'Invoices (this month)',
      current: u.invoices?.current ?? 0,
      limit: u.invoices?.limit,
      percent: u.invoices?.percent ?? 0,
      exceeded: u.invoices?.exceeded ?? false,
    },
    {
      label: locale.value === 'ar' ? 'التخزين' : 'Storage',
      current: u.storage?.current_human ?? '0 B',
      limit: u.storage?.limit_human ?? null,
      percent: u.storage?.percent ?? 0,
      exceeded: u.storage?.exceeded ?? false,
    },
  ]
})

onMounted(async () => {
  try {
    const [subRes, usageRes] = await Promise.all([
      api.get<{ data: any }>('/subscription').catch(() => ({ data: null })),
      api.get<{ data: any }>('/subscription/usage').catch(() => ({ data: null })),
    ])
    sub.value = subRes.data
    usage.value = usageRes.data
  } catch { /* ignore */ }
  finally { loading.value = false }
})
</script>
