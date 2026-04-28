<template>
  <FeatureBoundary id="ecommerce">
    <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
      <UiPageHeader
        icon="i-lucide-shopping-cart"
        :title="locale === 'ar' ? 'التجارة الإلكترونية' : 'E-Commerce'"
        :subtitle="locale === 'ar' ? 'ربط متاجرك الإلكترونية' : 'Connect your online stores'"
      />

      <Can :perm="PERMISSIONS.MANAGE_INTEGRATIONS">
        <template #fallback>
          <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-12 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <UIcon name="i-lucide-lock" class="w-5 h-5 text-neutral-400" />
            </div>
            <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0">
              {{ locale === 'ar' ? 'لا تملك صلاحية الوصول' : "You don't have access" }}
            </p>
          </div>
        </template>

        <UiDataTable
          :columns="columns"
          :rows="rows"
          :loading="loading"
          empty-icon="i-lucide-shopping-cart"
          :empty-title="locale === 'ar' ? 'لا توجد قنوات متصلة' : 'No connected channels'"
          :empty-description="locale === 'ar'
            ? 'اربط Shopify أو WooCommerce أو منصة أخرى لاستيراد الطلبات والعملاء تلقائياً.'
            : 'Connect Shopify, WooCommerce, or another platform to import orders and customers automatically.'"
        >
          <template #cell-platform="{ value }">
            <span class="text-sm font-medium text-neutral-900 dark:text-neutral-0 capitalize">{{ value }}</span>
          </template>
          <template #cell-channel_name="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200">{{ value }}</span>
          </template>
          <template #cell-last_sync="{ value }">
            <span class="text-sm text-neutral-700 dark:text-neutral-200 tabular-nums" dir="ltr">{{ formatDate(value) }}</span>
          </template>
          <template #cell-status="{ row }">
            <UiBadge :color="row.is_active ? 'green' : 'gray'" dot>
              {{ row.is_active ? (locale === 'ar' ? 'متصل' : 'Connected') : (locale === 'ar' ? 'غير متصل' : 'Disconnected') }}
            </UiBadge>
          </template>
        </UiDataTable>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'
import { ecommerceService } from '~/features/ecommerce/services/ecommerceService'

definePageMeta({ layout: 'dashboard' })
const { locale } = useI18n()

const rows = ref<any[]>([])
const loading = ref(true)

const columns = computed(() => [
  { key: 'platform', label: locale.value === 'ar' ? 'المنصة' : 'Platform' },
  { key: 'channel_name', label: locale.value === 'ar' ? 'القناة' : 'Channel' },
  { key: 'last_sync', label: locale.value === 'ar' ? 'آخر مزامنة' : 'Last sync' },
  { key: 'status', label: locale.value === 'ar' ? 'الحالة' : 'Status' },
])

function formatDate(d: string | null | undefined) {
  if (!d) return '—'
  try {
    return new Date(d).toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return d }
}

async function load() {
  loading.value = true
  try {
    const svc: any = ecommerceService()
    const fn = svc.channels ?? svc.list ?? svc.integrations ?? svc.get
    const r = typeof fn === 'function' ? await fn() : { data: [] }
    rows.value = Array.isArray(r) ? r : (r.data ?? [])
  } catch { rows.value = [] }
  finally { loading.value = false }
}

onMounted(load)
</script>
