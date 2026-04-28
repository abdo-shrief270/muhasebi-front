<template>
  <div class="px-4 lg:px-6 py-5 max-w-4xl mx-auto">
    <UiPageHeader
      icon="i-lucide-coins"
      :title="locale === 'ar' ? 'العملات وأسعار الصرف' : 'Currencies & Exchange Rates'"
      :subtitle="locale === 'ar' ? 'محوّل العملات وقائمة العملات المتاحة' : 'Currency converter and the supported list'"
    />

    <div class="space-y-3">
      <!-- Currency Converter -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-4 flex items-center gap-1.5">
          <UIcon name="i-lucide-arrow-left-right" class="w-3.5 h-3.5 text-neutral-400" />
          {{ locale === 'ar' ? 'محوّل العملات' : 'Currency Converter' }}
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
          <div>
            <label class="cur-label">{{ locale === 'ar' ? 'المبلغ' : 'Amount' }}</label>
            <input
              v-model.number="convertAmount"
              type="number"
              min="0"
              step="0.01"
              class="cur-input font-mono text-end"
              dir="ltr"
            />
          </div>
          <div>
            <label class="cur-label">{{ locale === 'ar' ? 'من' : 'From' }}</label>
            <div class="relative">
              <select v-model="convertFrom" class="cur-input">
                <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.code }} — {{ c.symbol }}</option>
              </select>
              <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label class="cur-label">{{ locale === 'ar' ? 'إلى' : 'To' }}</label>
            <div class="relative">
              <select v-model="convertTo" class="cur-input">
                <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.code }} — {{ c.symbol }}</option>
              </select>
              <UIcon name="i-lucide-chevron-down" class="absolute end-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
            </div>
          </div>
          <UiAppButton variant="primary" icon="i-lucide-arrow-right" :loading="converting" @click="doConvert">
            {{ locale === 'ar' ? 'تحويل' : 'Convert' }}
          </UiAppButton>
        </div>

        <div
          v-if="convertResult !== null"
          class="mt-4 p-4 rounded-lg bg-primary-500/5 border border-primary-500/20 text-center"
        >
          <p class="font-mono text-3xl font-bold text-primary-700 dark:text-primary-400 tabular-nums" dir="ltr">
            {{ convertResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            <span class="text-base font-normal text-primary-600 dark:text-primary-500">{{ convertTo }}</span>
          </p>
          <p v-if="convertRate" class="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 tabular-nums" dir="ltr">
            1 {{ convertFrom }} = {{ Number(convertRate).toLocaleString(undefined, { maximumFractionDigits: 6 }) }} {{ convertTo }}
          </p>
        </div>
      </div>

      <!-- Currencies List -->
      <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
        <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-4 flex items-center gap-1.5">
          <UIcon name="i-lucide-list" class="w-3.5 h-3.5 text-neutral-400" />
          {{ locale === 'ar' ? 'العملات المتاحة' : 'Available Currencies' }}
        </h3>

        <div v-if="!currencies.length" class="py-6 text-center text-xs text-neutral-400">
          {{ locale === 'ar' ? 'جارٍ التحميل...' : 'Loading...' }}
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div
            v-for="c in currencies"
            :key="c.code"
            class="border border-neutral-200 dark:border-neutral-800 rounded-md p-3 text-center hover:border-primary-500/30 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
          >
            <div class="text-2xl mb-0.5 text-neutral-700 dark:text-neutral-200">{{ c.symbol }}</div>
            <div class="text-sm font-bold font-mono text-neutral-900 dark:text-neutral-0" dir="ltr">{{ c.code }}</div>
            <div class="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
              {{ locale === 'ar' ? c.name_ar : c.name_en }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const currencies = ref<any[]>([])
const convertAmount = ref(1000)
const convertFrom = ref('EGP')
const convertTo = ref('USD')
const convertResult = ref<number | null>(null)
const convertRate = ref<number | null>(null)
const converting = ref(false)

async function loadCurrencies() {
  try {
    currencies.value = (await api.get<any>('/currencies')).data
  } catch {
    currencies.value = []
  }
}

async function doConvert() {
  converting.value = true
  try {
    const res = await api.post<any>('/currencies/convert', {
      amount: convertAmount.value,
      from: convertFrom.value,
      to: convertTo.value,
    })
    convertResult.value = res.data.converted
    convertRate.value = res.data.rate
  } catch (e: any) {
    toastStore.error(e?.data?.message || (locale.value === 'ar' ? 'سعر الصرف غير متاح' : 'Rate not available'))
  } finally {
    converting.value = false
  }
}

onMounted(loadCurrencies)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.cur-label { @apply block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1; }

.cur-input {
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
.cur-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .cur-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
