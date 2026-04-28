<template>
  <FeatureBoundary id="subscription-upgrade">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-trending-up"
        :title="locale === 'ar' ? 'ترقية الباقة' : 'Upgrade Plan'"
        :subtitle="locale === 'ar' ? 'اختر الباقة الأنسب لمكتبك' : 'Pick the plan that fits your firm'"
      />

      <Can :perm="PERMISSIONS.MANAGE_SUBSCRIPTION">
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

        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="i in 3" :key="i" class="h-[400px] rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        </div>

        <div v-else>
          <!-- Billing cycle toggle — pill segmented control. -->
          <div class="flex justify-center mb-6">
            <div class="inline-flex bg-neutral-0 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800 p-1 gap-1">
              <button
                v-for="cycle in billingCycles"
                :key="cycle.value"
                type="button"
                class="px-4 h-8 text-xs font-semibold rounded-md transition-colors inline-flex items-center gap-1.5"
                :class="billingCycle === cycle.value
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-0'"
                @click="billingCycle = cycle.value"
              >
                {{ cycle.label }}
                <span
                  v-if="cycle.badge"
                  class="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  :class="billingCycle === cycle.value
                    ? 'bg-white/25 text-white'
                    : 'bg-success-500/15 text-success-700 dark:text-success-400'"
                >
                  {{ cycle.badge }}
                </span>
              </button>
            </div>
          </div>

          <!-- Plan cards -->
          <div v-if="plans.length" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              v-for="(plan, i) in plans"
              :key="plan.id"
              v-motion
              :initial="{ opacity: 0, y: 8 }"
              :enter="{ opacity: 1, y: 0, transition: { delay: i * 60 } }"
              class="relative rounded-xl border p-5 flex flex-col bg-neutral-0 dark:bg-neutral-900"
              :class="isCurrentPlan(plan)
                ? 'border-primary-500/60 ring-2 ring-primary-500/15'
                : 'border-neutral-200 dark:border-neutral-800'"
            >
              <span
                v-if="isCurrentPlan(plan)"
                class="absolute -top-2.5 start-4 text-[10px] font-bold bg-primary-500 text-white px-2 py-0.5 rounded-full"
              >
                {{ locale === 'ar' ? 'الحالية' : 'CURRENT' }}
              </span>

              <h3 class="text-lg font-bold text-neutral-900 dark:text-neutral-0 mb-1">
                {{ locale === 'ar' ? plan.name_ar : plan.name_en }}
              </h3>

              <p class="text-xs text-neutral-500 dark:text-neutral-400 min-h-[2.5rem] mb-4">
                {{ (locale === 'ar' ? plan.description_ar : plan.description_en) || '' }}
              </p>

              <!-- Price -->
              <div class="mb-5">
                <p class="flex items-baseline gap-1" dir="ltr">
                  <span class="text-3xl font-extrabold text-neutral-900 dark:text-neutral-0 tabular-nums">{{ formatPrice(priceForCycle(plan)) }}</span>
                  <span class="text-sm text-neutral-500 dark:text-neutral-400">{{ plan.currency }}</span>
                  <span class="text-xs text-neutral-400 ms-1">/ {{ cycleShortLabel }}</span>
                </p>
                <p v-if="plan.trial_days > 0" class="text-xs text-success-700 dark:text-success-400 mt-1 flex items-center gap-1">
                  <UIcon name="i-lucide-gift" class="w-3 h-3" />
                  {{ locale === 'ar' ? `${plan.trial_days} يوم تجربة مجانية` : `${plan.trial_days}-day free trial` }}
                </p>
              </div>

              <!-- Features — backend returns `features` as a
                   Record<string, boolean> ({"e_invoice": true, ...}); we
                   iterate (enabled, slug) and only render the enabled keys. -->
              <ul class="space-y-2 mb-5 flex-1">
                <li
                  v-for="(enabled, slug) in plan.features"
                  v-show="enabled"
                  :key="String(slug)"
                  class="flex items-start gap-2 text-sm text-neutral-700 dark:text-neutral-200"
                >
                  <UIcon name="i-lucide-check" class="w-4 h-4 text-success-500 flex-shrink-0 mt-0.5" />
                  <span>{{ featureLabel(String(slug)) }}</span>
                </li>
                <li
                  v-if="plan.limits && Object.keys(plan.limits).length"
                  class="pt-2 mt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1.5"
                >
                  <div v-for="(v, k) in plan.limits" :key="String(k)" class="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{{ limitLabel(String(k)) }}</span>
                    <span class="font-mono text-neutral-700 dark:text-neutral-200">{{ v === -1 ? '∞' : v }}</span>
                  </div>
                </li>
              </ul>

              <!-- CTA -->
              <UiAppButton
                v-if="isCurrentPlan(plan)"
                variant="outline"
                size="sm"
                :disabled="true"
                class="w-full"
              >
                {{ locale === 'ar' ? 'الباقة الحالية' : 'Current Plan' }}
              </UiAppButton>
              <UiAppButton
                v-else
                :variant="isDowngrade(plan) ? 'outline' : 'primary'"
                size="sm"
                class="w-full"
                @click="openSelectionDialog(plan)"
              >
                {{ ctaLabel(plan) }}
              </UiAppButton>
            </div>
          </div>

          <div
            v-else
            class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 py-12 text-center"
          >
            <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-package-x" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm text-neutral-500 dark:text-neutral-400">
              {{ locale === 'ar' ? 'لا توجد باقات متاحة حالياً' : 'No plans are currently available' }}
            </p>
          </div>

          <!-- Back link -->
          <div class="mt-6">
            <NuxtLink
              to="/subscription"
              class="inline-flex items-center gap-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-0 transition-colors"
            >
              <UIcon name="i-lucide-arrow-left" class="w-3.5 h-3.5 rtl:rotate-180" />
              {{ locale === 'ar' ? 'العودة للاشتراك' : 'Back to Subscription' }}
            </NuxtLink>
          </div>
        </div>

        <!-- Selection dialog -->
        <UiSlideOver v-model="dialogOpen" :title="dialogTitle">
          <form v-if="selected" @submit.prevent="confirm" class="space-y-4">
            <!-- Selected-plan recap card -->
            <div class="rounded-xl bg-primary-500/5 dark:bg-primary-500/10 border border-primary-500/20 p-4">
              <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1">
                {{ locale === 'ar' ? 'الباقة المختارة' : 'Selected plan' }}
              </p>
              <p class="font-semibold text-neutral-900 dark:text-neutral-0">
                {{ locale === 'ar' ? selected.name_ar : selected.name_en }}
              </p>
              <p class="text-sm font-mono text-primary-700 dark:text-primary-400 mt-1 tabular-nums" dir="ltr">
                {{ formatPrice(priceForCycle(selected)) }} {{ selected.currency }} / {{ cycleShortLabel }}
              </p>
            </div>

            <!-- Effective date (change-plan only) -->
            <div v-if="hasActiveSub">
              <label class="up-label">{{ locale === 'ar' ? 'وقت التطبيق' : 'Effective Date' }}</label>
              <div class="space-y-2">
                <label
                  class="flex items-start gap-3 cursor-pointer p-3 rounded-md border transition-colors"
                  :class="effectiveDate === 'end_of_period'
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40'"
                >
                  <input v-model="effectiveDate" type="radio" value="end_of_period" class="mt-0.5 accent-primary-500" />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0">
                      {{ locale === 'ar' ? 'عند تجديد الدورة الحالية' : 'At end of current period' }}
                    </p>
                    <p class="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {{ locale === 'ar' ? 'لا توجد رسوم فورية' : 'No immediate charge' }}
                    </p>
                  </div>
                </label>
                <label
                  class="flex items-start gap-3 cursor-pointer p-3 rounded-md border transition-colors"
                  :class="effectiveDate === 'immediate'
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40'"
                >
                  <input v-model="effectiveDate" type="radio" value="immediate" class="mt-0.5 accent-primary-500" />
                  <div class="flex-1">
                    <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0">
                      {{ locale === 'ar' ? 'فوراً' : 'Immediately' }}
                    </p>
                    <p class="text-[11px] text-neutral-500 dark:text-neutral-400">
                      {{ locale === 'ar' ? 'يتم احتساب الفرق مباشرة' : 'Prorated charge applied now' }}
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Payment method (subscribe only — change-plan reuses the existing method) -->
            <div v-if="!hasActiveSub">
              <label class="up-label">{{ locale === 'ar' ? 'طريقة الدفع' : 'Payment Method' }}</label>
              <div class="space-y-2">
                <label
                  v-for="method in paymentMethods"
                  :key="method.value"
                  class="flex items-center gap-3 cursor-pointer p-3 rounded-md border transition-colors"
                  :class="paymentMethod === method.value
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40'"
                >
                  <input v-model="paymentMethod" type="radio" :value="method.value" class="accent-primary-500" />
                  <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0 flex-1">{{ method.label }}</span>
                  <span class="text-[11px] text-neutral-500 dark:text-neutral-400">{{ method.hint }}</span>
                </label>
              </div>
            </div>

            <!-- Coupon (subscribe only) -->
            <div v-if="!hasActiveSub">
              <label class="up-label">
                {{ locale === 'ar' ? 'كوبون الخصم' : 'Coupon Code' }}
                <span class="text-neutral-400 text-[11px] font-normal normal-case tracking-normal">
                  ({{ locale === 'ar' ? 'اختياري' : 'optional' }})
                </span>
              </label>
              <input
                v-model="couponCode"
                type="text"
                maxlength="64"
                class="up-input font-mono"
                dir="ltr"
                placeholder="WELCOME10"
              />
            </div>

            <!-- Submit -->
            <div class="flex items-center gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <UiAppButton type="button" variant="outline" :disabled="submitting" class="flex-1" @click="dialogOpen = false">
                {{ $t('common.cancel') }}
              </UiAppButton>
              <UiAppButton type="submit" variant="primary" icon="i-lucide-check-circle-2" :loading="submitting" class="flex-1">
                {{ submitLabel }}
              </UiAppButton>
            </div>
          </form>
        </UiSlideOver>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { plansService, type SubscriptionPlan } from '~/features/subscription/services/plansService'
import {
  subscriptionService,
  type SubscriptionRecord,
  type BillingCycle,
  type PaymentMethod,
} from '~/features/subscription/services/subscriptionService'
import { generateIdempotencyKey } from '~/core/api/requestId'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()
const { can } = usePermissions()
const plans = ref<SubscriptionPlan[]>([])
const currentSub = ref<SubscriptionRecord | null>(null)
const loading = ref(true)

const billingCycle = ref<BillingCycle>('monthly')
const billingCycles = computed(() => [
  { value: 'monthly' as const,   label: locale.value === 'ar' ? 'شهرياً' : 'Monthly',    badge: null },
  { value: 'annual' as const,    label: locale.value === 'ar' ? 'سنوياً' : 'Annual',     badge: locale.value === 'ar' ? '-17%' : 'Save 17%' },
])

const cycleShortLabel = computed(() => {
  if (billingCycle.value === 'annual') return locale.value === 'ar' ? 'سنة' : 'yr'
  return locale.value === 'ar' ? 'شهر' : 'mo'
})

const paymentMethods = computed<Array<{ value: PaymentMethod; label: string; hint: string }>>(() => [
  { value: 'paymob',        label: locale.value === 'ar' ? 'Paymob (بطاقة ائتمان)'    : 'Paymob (card)',          hint: locale.value === 'ar' ? 'أونلاين' : 'online' },
  { value: 'fawry',         label: locale.value === 'ar' ? 'فوري'                     : 'Fawry',                  hint: locale.value === 'ar' ? 'كود دفع' : 'payment code' },
  { value: 'bank_transfer', label: locale.value === 'ar' ? 'تحويل بنكي'               : 'Bank transfer',          hint: locale.value === 'ar' ? 'تأكيد يدوي' : 'manual confirm' },
])

// Dialog state
const dialogOpen = ref(false)
const selected = ref<SubscriptionPlan | null>(null)
const submitting = ref(false)
const paymentMethod = ref<PaymentMethod>('paymob')
const couponCode = ref('')
const effectiveDate = ref<'immediate' | 'end_of_period'>('end_of_period')

const hasActiveSub = computed(() => !!currentSub.value && currentSub.value.status !== 'canceled')

const dialogTitle = computed(() => {
  if (!selected.value) return ''
  return hasActiveSub.value
    ? (locale.value === 'ar' ? 'تغيير الباقة' : 'Change Plan')
    : (locale.value === 'ar' ? 'الاشتراك' : 'Subscribe')
})

const submitLabel = computed(() => {
  if (!selected.value) return ''
  if (hasActiveSub.value) {
    return locale.value === 'ar' ? 'تأكيد تغيير الباقة' : 'Confirm Change'
  }
  return locale.value === 'ar' ? 'متابعة الدفع' : 'Continue to Payment'
})

function isCurrentPlan(plan: SubscriptionPlan): boolean {
  return !!currentSub.value && currentSub.value.plan?.id === plan.id
}

// Rank by monthly price — cheaper = downgrade from user's perspective.
function isDowngrade(plan: SubscriptionPlan): boolean {
  if (!currentSub.value?.plan) return false
  return plan.price_monthly < currentSub.value.plan.price_egp_monthly
}

function ctaLabel(plan: SubscriptionPlan): string {
  if (!hasActiveSub.value) {
    return locale.value === 'ar' ? 'اشترك' : 'Subscribe'
  }
  return isDowngrade(plan)
    ? (locale.value === 'ar' ? 'تخفيض' : 'Downgrade')
    : (locale.value === 'ar' ? 'ترقية' : 'Upgrade')
}

function priceForCycle(plan: SubscriptionPlan): number {
  return billingCycle.value === 'annual' ? plan.price_annual : plan.price_monthly
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat(locale.value === 'ar' ? 'ar-EG' : 'en-US').format(price)
}

function featureLabel(slug: string): string {
  // Try an i18n key first; fall back to humanizing the slug so unknown
  // feature flags from the backend still render something readable.
  try {
    const { t, te } = useI18n()
    const key = `subscription.features.${slug}`
    if (te(key)) return t(key)
  } catch {}
  return slug.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function limitLabel(slug: string): string {
  try {
    const { t, te } = useI18n()
    const key = `subscription.limits.${slug}`
    if (te(key)) return t(key)
  } catch {}
  return slug.replace(/_/g, ' ')
}

function guardManageSubscription(): boolean {
  if (can(PERMISSIONS.MANAGE_SUBSCRIPTION)) return true
  toastStore.error(locale.value === 'ar' ? 'لا تملك صلاحية إدارة الاشتراك' : 'You do not have permission to manage subscriptions')
  return false
}

function openSelectionDialog(plan: SubscriptionPlan) {
  if (!guardManageSubscription()) return
  selected.value = plan
  paymentMethod.value = 'paymob'
  couponCode.value = ''
  effectiveDate.value = 'end_of_period'
  dialogOpen.value = true
}

async function confirm() {
  if (!guardManageSubscription()) return
  if (!selected.value) return

  submitting.value = true
  const service = subscriptionService()
  try {
    if (hasActiveSub.value) {
      await service.changePlan(
        {
          new_plan_id: selected.value.id,
          effective_date: effectiveDate.value,
        },
        generateIdempotencyKey(),
      )
      toastStore.success(
        effectiveDate.value === 'immediate'
          ? (locale.value === 'ar' ? 'تم تغيير الباقة' : 'Plan changed')
          : (locale.value === 'ar' ? 'سيتم تغيير الباقة في نهاية الدورة' : 'Plan change scheduled for end of period'),
      )
      dialogOpen.value = false
      await loadAll()
    } else {
      const result = await service.subscribe(
        {
          plan_id: selected.value.id,
          billing_cycle: billingCycle.value,
          payment_method: paymentMethod.value,
          coupon_code: couponCode.value.trim() || undefined,
        },
        generateIdempotencyKey(),
      )
      // Online payment flows hand us back a hosted-checkout URL. Navigate
      // away; the gateway redirects back on success/failure.
      if (result.redirect_url && import.meta.client) {
        window.location.href = result.redirect_url
        return
      }
      toastStore.success(locale.value === 'ar' ? 'تم الاشتراك' : 'Subscribed')
      dialogOpen.value = false
      await loadAll()
    }
  } catch (e: unknown) {
    const err = e as ApiError
    toastStore.error(err?.message || (locale.value === 'ar' ? 'فشل العملية' : 'Operation failed'))
  } finally {
    submitting.value = false
  }
}

async function loadAll() {
  loading.value = true
  try {
    const service = subscriptionService()
    const [planList, sub] = await Promise.all([
      plansService().list(),
      service.current().catch(() => null),
    ])
    plans.value = planList.filter(p => p.is_active).sort((a, b) => a.sort_order - b.sort_order)
    currentSub.value = sub
  } catch {
    toastStore.error(locale.value === 'ar' ? 'فشل تحميل الباقات' : 'Failed to load plans')
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.up-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.up-input {
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
.up-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .up-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
