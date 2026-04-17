<template>
  <div v-if="warnings.length" class="space-y-2">
    <div
      v-for="(warning, i) in warnings"
      :key="i"
      class="rounded-xl p-4 flex items-start gap-3"
      :class="{
        'bg-red-50 border border-red-200': warning.severity === 'error',
        'bg-amber-50 border border-amber-200': warning.severity === 'warning',
      }"
    >
      <svg v-if="warning.severity === 'error'" class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
      </svg>
      <svg v-else class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
      </svg>
      <div class="flex-1">
        <p class="text-sm font-medium" :class="warning.severity === 'error' ? 'text-red-800' : 'text-amber-800'">
          {{ locale === 'ar' ? warning.message_ar : warning.message_en }}
        </p>
        <div v-if="warning.data && warning.type === 'credit_limit_exceeded'" class="mt-2 text-xs space-y-0.5"
          :class="warning.severity === 'error' ? 'text-red-600' : 'text-amber-600'">
          <div>{{ locale === 'ar' ? 'الحد الائتماني' : 'Credit Limit' }}: {{ warning.data.credit_limit?.toLocaleString() }}</div>
          <div>{{ locale === 'ar' ? 'المستحق الحالي' : 'Outstanding' }}: {{ warning.data.outstanding?.toLocaleString() }}</div>
          <div>{{ locale === 'ar' ? 'يتجاوز بمقدار' : 'Exceeds by' }}: {{ warning.data.exceeds_by?.toLocaleString() }}</div>
        </div>
        <div v-if="warning.data && warning.type === 'possible_duplicate'" class="mt-2 text-xs text-amber-600">
          {{ locale === 'ar' ? 'فاتورة مشابهة' : 'Similar invoice' }}: #{{ warning.data.existing_invoice_number }}
          ({{ new Date(warning.data.existing_invoice_created_at).toLocaleString() }})
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InvoiceWarning } from '~/features/invoices/composables/useInvoiceGuard'

defineProps<{ warnings: InvoiceWarning[] }>()

const { locale } = useI18n()
</script>
