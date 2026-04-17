<template>
  <div>
    <UiPageHeader :title="locale === 'ar' ? 'العملات وأسعار الصرف' : 'Currencies & Exchange Rates'" />

    <div class="max-w-4xl space-y-6">
      <!-- Currency Converter -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-800 mb-4">{{ locale === 'ar' ? 'محول العملات' : 'Currency Converter' }}</h3>
        <div class="grid grid-cols-4 gap-3 items-end">
          <div>
            <label class="block text-xs text-gray-500 mb-1">{{ locale === 'ar' ? 'المبلغ' : 'Amount' }}</label>
            <input v-model.number="convertAmount" type="number" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">{{ locale === 'ar' ? 'من' : 'From' }}</label>
            <select v-model="convertFrom" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.code }} — {{ c.symbol }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-gray-500 mb-1">{{ locale === 'ar' ? 'إلى' : 'To' }}</label>
            <select v-model="convertTo" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
              <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.code }} — {{ c.symbol }}</option>
            </select>
          </div>
          <UiAppButton variant="primary" @click="doConvert">{{ locale === 'ar' ? 'تحويل' : 'Convert' }}</UiAppButton>
        </div>
        <div v-if="convertResult !== null" class="mt-4 p-4 bg-primary-50 rounded-xl text-center">
          <span class="text-2xl font-bold text-primary-600">{{ convertResult.toLocaleString(undefined, { minimumFractionDigits: 2 }) }}</span>
          <span class="text-sm text-primary-400 ms-2">{{ convertTo }}</span>
          <div v-if="convertRate" class="text-xs text-gray-400 mt-1">1 {{ convertFrom }} = {{ convertRate }} {{ convertTo }}</div>
        </div>
      </div>

      <!-- Currencies List -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-800 mb-4">{{ locale === 'ar' ? 'العملات المتاحة' : 'Available Currencies' }}</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div v-for="c in currencies" :key="c.code" class="border border-gray-100 rounded-xl p-4 text-center">
            <div class="text-2xl mb-1">{{ c.symbol }}</div>
            <div class="text-sm font-bold text-gray-800">{{ c.code }}</div>
            <div class="text-xs text-gray-400">{{ locale === 'ar' ? c.name_ar : c.name_en }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({  })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const currencies = ref<any[]>([])
const convertAmount = ref(1000)
const convertFrom = ref('EGP')
const convertTo = ref('USD')
const convertResult = ref<number | null>(null)
const convertRate = ref<number | null>(null)

async function loadCurrencies() {
  try { currencies.value = (await api.get<any>('/currencies')).data } catch {}
}

async function doConvert() {
  try {
    const res = await api.post<any>('/currencies/convert', { amount: convertAmount.value, from: convertFrom.value, to: convertTo.value })
    convertResult.value = res.data.converted
    convertRate.value = res.data.rate
  } catch (e: any) { toastStore.error(e.data?.message || 'Rate not available') }
}

onMounted(loadCurrencies)
</script>
