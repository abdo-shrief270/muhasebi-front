<template>
  <div>
      <FeatureBoundary id="onboarding">
      <div class="max-w-3xl mx-auto">
        <UiPageHeader
          :title="locale === 'ar' ? 'إعداد الحساب' : 'Account Setup'"
          :subtitle="locale === 'ar' ? 'أكمل الخطوات التالية لبدء استخدام محاسبي' : 'Complete the following steps to start using Muhasebi'"
        />

        <!-- Progress steps -->
        <div
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 100 } }"
          class="flex items-center justify-between mb-10 px-4"
        >
          <template v-for="(step, index) in steps" :key="index">
            <div class="flex flex-col items-center">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500"
                :class="stepCircleClass(index)"
              >
                <template v-if="isStepComplete(index)">
                  <span class="text-white">✓</span>
                </template>
                <template v-else>
                  {{ index + 1 }}
                </template>
              </div>
              <p class="text-xs mt-2 text-center max-w-[80px]" :class="currentStep === index ? 'text-primary-500 font-semibold' : 'text-gray-400'">
                {{ step.label }}
              </p>
            </div>
            <div
              v-if="index < steps.length - 1"
              class="flex-1 h-0.5 mx-2 rounded transition-colors duration-500"
              :class="isStepComplete(index) ? 'bg-emerald-400' : 'bg-gray-200'"
            ></div>
          </template>
        </div>

        <!-- Step content -->
        <Transition name="fade-slide" mode="out-in">
          <div :key="currentStep" class="bg-white rounded-2xl border border-gray-100/80 p-8">

            <!-- Step 1: Company Details -->
            <template v-if="currentStep === 0">
              <h3 class="text-lg font-bold text-gray-800 mb-1">
                {{ locale === 'ar' ? 'بيانات الشركة' : 'Company Details' }}
              </h3>
              <p class="text-sm text-gray-400 mb-6">
                {{ locale === 'ar' ? 'أكمل بيانات شركتك الأساسية' : 'Complete your basic company information' }}
              </p>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'البريد الإلكتروني' : 'Email' }}</label>
                    <input v-model="companyForm.email" type="email" class="input-field" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'الهاتف' : 'Phone' }}</label>
                    <input v-model="companyForm.phone" type="tel" class="input-field" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'الرقم الضريبي' : 'Tax ID' }}</label>
                    <input v-model="companyForm.tax_id" type="text" class="input-field" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'المدينة' : 'City' }}</label>
                    <input v-model="companyForm.city" type="text" class="input-field" />
                  </div>
                </div>
              </div>
            </template>

            <!-- Step 2: CoA Template -->
            <template v-if="currentStep === 1">
              <h3 class="text-lg font-bold text-gray-800 mb-1">
                {{ locale === 'ar' ? 'دليل الحسابات' : 'Chart of Accounts' }}
              </h3>
              <p class="text-sm text-gray-400 mb-6">
                {{ locale === 'ar' ? 'اختر قالب دليل الحسابات المناسب لنشاطك' : 'Choose the chart of accounts template that fits your business' }}
              </p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  v-for="template in coaTemplates"
                  :key="template.value"
                  @click="selectedTemplate = template.value"
                  class="p-5 rounded-xl border-2 transition-all duration-200 text-start"
                  :class="selectedTemplate === template.value
                    ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                  "
                >
                  <p class="text-2xl mb-2">{{ template.icon }}</p>
                  <p class="font-semibold text-gray-800">{{ template.label }}</p>
                  <p class="text-xs text-gray-400 mt-1">{{ template.description }}</p>
                </button>
              </div>
            </template>

            <!-- Step 3: First Client -->
            <template v-if="currentStep === 2">
              <h3 class="text-lg font-bold text-gray-800 mb-1">
                {{ locale === 'ar' ? 'أضف أول عميل' : 'Add Your First Client' }}
              </h3>
              <p class="text-sm text-gray-400 mb-6">
                {{ locale === 'ar' ? 'أضف بيانات أول عميل لك' : 'Add your first client information' }}
              </p>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'اسم العميل' : 'Client Name' }}</label>
                    <input v-model="clientForm.name" type="text" class="input-field" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'الرقم الضريبي' : 'Tax ID' }}</label>
                    <input v-model="clientForm.tax_id" type="text" class="input-field" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'البريد الإلكتروني' : 'Email' }}</label>
                    <input v-model="clientForm.email" type="email" class="input-field" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'الهاتف' : 'Phone' }}</label>
                    <input v-model="clientForm.phone" type="tel" class="input-field" />
                  </div>
                </div>
              </div>
            </template>

            <!-- Step 4: Invite Team -->
            <template v-if="currentStep === 3">
              <h3 class="text-lg font-bold text-gray-800 mb-1">
                {{ locale === 'ar' ? 'دعوة فريق العمل' : 'Invite Your Team' }}
              </h3>
              <p class="text-sm text-gray-400 mb-6">
                {{ locale === 'ar' ? 'يمكنك تخطي هذه الخطوة ودعوة الفريق لاحقاً' : 'You can skip this step and invite team members later' }}
              </p>
              <div class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'الاسم' : 'Name' }}</label>
                    <input v-model="teamForm.name" type="text" class="input-field" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-600 mb-1">{{ locale === 'ar' ? 'البريد الإلكتروني' : 'Email' }}</label>
                    <input v-model="teamForm.email" type="email" class="input-field" />
                  </div>
                </div>

                <!-- Role picker — clickable cards instead of a flat select.
                     Excludes the 'client' role since that goes through the
                     portal-invite flow, not the internal team flow. -->
                <div>
                  <label class="block text-sm font-medium text-gray-600 mb-2">{{ locale === 'ar' ? 'الدور' : 'Role' }}</label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      v-for="role in roleOptions"
                      :key="role.value"
                      type="button"
                      @click="teamForm.role = role.value"
                      class="p-4 rounded-xl border-2 transition-all duration-200 text-start"
                      :class="teamForm.role === role.value
                        ? 'border-primary-500 bg-primary-50/50 shadow-sm'
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                      "
                    >
                      <div class="flex items-center gap-2 mb-1.5">
                        <UIcon :name="role.icon" class="w-4 h-4 text-primary-500" />
                        <p class="font-semibold text-gray-800 text-sm">{{ role.label }}</p>
                      </div>
                      <p class="text-xs text-gray-400 leading-snug">{{ role.description }}</p>
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- Step 5: Done -->
            <template v-if="currentStep === 4">
              <div class="text-center py-8">
                <div
                  v-motion
                  :initial="{ scale: 0 }"
                  :enter="{ scale: 1, transition: { type: 'spring', stiffness: 200 } }"
                  class="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <span class="text-4xl text-emerald-500">✓</span>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">
                  {{ locale === 'ar' ? 'تم الإعداد بنجاح!' : 'Setup Complete!' }}
                </h3>
                <p class="text-gray-400 mb-8">
                  {{ locale === 'ar' ? 'أنت جاهز لبدء استخدام محاسبي' : "You're ready to start using Muhasebi" }}
                </p>
                <UiAppButton variant="primary" size="lg" @click="navigateTo('/dashboard')">
                  {{ locale === 'ar' ? 'الذهاب إلى لوحة التحكم' : 'Go to Dashboard' }}
                </UiAppButton>
              </div>
            </template>

            <!-- Navigation buttons -->
            <div v-if="currentStep < 4" class="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
              <UiAppButton
                v-if="currentStep > 0"
                variant="ghost"
                @click="currentStep--"
              >
                {{ $t('common.previous') }}
              </UiAppButton>
              <div v-else></div>

              <div class="flex gap-3">
                <UiAppButton
                  v-if="currentStep === 3"
                  variant="outline"
                  @click="skipAndFinish"
                >
                  {{ locale === 'ar' ? 'تخطي' : 'Skip' }}
                </UiAppButton>
                <UiAppButton
                  variant="primary"
                  :loading="stepLoading"
                  @click="handleNext"
                >
                  {{ currentStep === 3 ? (locale === 'ar' ? 'دعوة وإنهاء' : 'Invite & Finish') : $t('common.next') }}
                </UiAppButton>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      </FeatureBoundary>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  
  layout: 'dashboard',
})

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const currentStep = ref(0)
const stepLoading = ref(false)
const selectedTemplate = ref('general')

/**
 * Per-step completion state, fetched from /onboarding/progress on mount.
 * UI step indices: 0=company, 1=coa, 2=first client, 3=team. Step 4 is the
 * "Done" confirmation screen — no backend flag.
 */
const completedSteps = ref<[boolean, boolean, boolean, boolean]>([false, false, false, false])

interface ProgressDto {
  company_details_completed: boolean
  coa_template_selected: boolean
  first_client_added: boolean
  team_invited: boolean
  wizard_completed?: boolean
}

async function loadProgress() {
  try {
    const res = await api.get<{ data: ProgressDto }>('/onboarding/progress')
    const p = res.data
    completedSteps.value = [
      !!p.company_details_completed,
      !!p.coa_template_selected,
      !!p.first_client_added,
      !!p.team_invited,
    ]
    // Jump to the first incomplete step. If everything is done, land on the
    // Done screen so the user can navigate back to /dashboard cleanly.
    const firstIncomplete = completedSteps.value.findIndex(done => !done)
    currentStep.value = firstIncomplete === -1 ? 4 : firstIncomplete
  } catch {
    // Progress fetch failed — fall back to step 0 so the user can still proceed.
  }
}

onMounted(loadProgress)

const companyForm = reactive({ email: '', phone: '', tax_id: '', city: '' })
const clientForm = reactive({ name: '', tax_id: '', email: '', phone: '' })
const teamForm = reactive({ name: '', email: '', role: 'accountant' })

// Roles offered for the *internal* team-invite flow. Backend accepts a wider
// set (admin, accountant, auditor, client) but `client` belongs to the portal
// invite flow, so we leave it out here. Default = accountant for an accounting
// firm — the most common new-hire role.
const roleOptions = computed(() => [
  {
    value: 'accountant',
    icon: 'i-lucide-calculator',
    label: locale.value === 'ar' ? 'محاسب' : 'Accountant',
    description: locale.value === 'ar'
      ? 'يدخل العمليات اليومية والقيود والفواتير.'
      : 'Records day-to-day transactions, journals, and invoices.',
  },
  {
    value: 'auditor',
    icon: 'i-lucide-shield-check',
    label: locale.value === 'ar' ? 'مراجع' : 'Auditor',
    description: locale.value === 'ar'
      ? 'صلاحيات قراءة فقط للمراجعة الداخلية.'
      : 'Read-only access for review and audit.',
  },
  {
    value: 'admin',
    icon: 'i-lucide-shield',
    label: locale.value === 'ar' ? 'مدير' : 'Admin',
    description: locale.value === 'ar'
      ? 'صلاحيات كاملة على بيانات الشركة والإعدادات.'
      : 'Full access to company data and settings.',
  },
])

const steps = computed(() => [
  { label: locale.value === 'ar' ? 'بيانات الشركة' : 'Company' },
  { label: locale.value === 'ar' ? 'دليل الحسابات' : 'Accounts' },
  { label: locale.value === 'ar' ? 'أول عميل' : 'First Client' },
  { label: locale.value === 'ar' ? 'دعوة الفريق' : 'Team' },
  { label: locale.value === 'ar' ? 'انتهى' : 'Done' },
])

const coaTemplates = computed(() => [
  { value: 'general', icon: '◈', label: locale.value === 'ar' ? 'عام' : 'General', description: locale.value === 'ar' ? 'قالب عام لجميع الأنشطة' : 'General template for all activities' },
  { value: 'trading', icon: '◉', label: locale.value === 'ar' ? 'تجاري' : 'Trading', description: locale.value === 'ar' ? 'للشركات التجارية' : 'For trading companies' },
  { value: 'services', icon: '◎', label: locale.value === 'ar' ? 'خدمي' : 'Services', description: locale.value === 'ar' ? 'لشركات الخدمات' : 'For service companies' },
])

function isStepComplete(index: number) {
  // Steps 0–3 read from the fetched progress state; step 4 is the final
  // "Done" screen — only "complete" once we're actually on it.
  if (index < 4) return completedSteps.value[index] === true
  return currentStep.value >= 4
}

function stepCircleClass(index: number) {
  if (isStepComplete(index)) return 'bg-emerald-500 text-white scale-100'
  if (index === currentStep.value) return 'bg-primary-500 text-white scale-110 shadow-lg shadow-primary-500/30'
  return 'bg-gray-100 text-gray-400'
}

async function handleNext() {
  // Skip the API call if this step is already marked complete server-side
  // (e.g. user landed mid-flow and clicked through). Just advance the cursor
  // and find the next incomplete step.
  if (isStepComplete(currentStep.value)) {
    advanceToNextIncomplete()
    return
  }

  stepLoading.value = true
  try {
    const step = currentStep.value
    if (step === 0) {
      await api.post('/onboarding/complete-step', { step: 'company_details' })
    } else if (step === 1) {
      await api.post('/onboarding/setup-coa', { template: selectedTemplate.value })
    } else if (step === 2 && clientForm.name) {
      await api.post('/clients', clientForm)
      await api.post('/onboarding/complete-step', { step: 'first_client' })
    } else if (step === 3 && teamForm.email) {
      await api.post('/onboarding/invite-team-member', teamForm)
    }
    completedSteps.value[step] = true
    advanceToNextIncomplete()
    toastStore.success(locale.value === 'ar' ? 'تم حفظ البيانات' : 'Data saved')
  } catch (e: any) {
    toastStore.error(e.data?.message || 'Something went wrong')
  } finally {
    stepLoading.value = false
  }
}

/**
 * Move the cursor forward to the next not-yet-completed step. If everything
 * is done, land on step 4 (the Done screen). Used after successful completion
 * AND when the user clicks Continue on a step we already know is done.
 */
function advanceToNextIncomplete() {
  const startFrom = currentStep.value + 1
  for (let i = startFrom; i < 4; i++) {
    if (!completedSteps.value[i]) {
      currentStep.value = i
      return
    }
  }
  currentStep.value = 4
}

function skipAndFinish() {
  currentStep.value = 4
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";
.input-field {
  @apply w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-gray-50/50;
}
</style>
