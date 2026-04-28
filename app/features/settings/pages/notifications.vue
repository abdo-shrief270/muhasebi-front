<template>
  <FeatureBoundary id="settings">
    <div class="px-4 lg:px-6 py-5 max-w-4xl mx-auto">
      <UiPageHeader
        icon="i-lucide-bell"
        :title="locale === 'ar' ? 'إعدادات الإشعارات' : 'Notification Preferences'"
        :subtitle="locale === 'ar' ? 'تحكم في طريقة وصول الإشعارات إليك' : 'Control how you receive notifications'"
      >
        <template #actions>
          <Transition name="fade">
            <span
              v-if="saveStatus"
              class="text-xs font-medium inline-flex items-center gap-1.5"
              :class="saveStatus === 'saving'
                ? 'text-primary-700 dark:text-primary-400'
                : saveStatus === 'saved'
                  ? 'text-success-700 dark:text-success-400'
                  : 'text-danger-700 dark:text-danger-400'"
            >
              <UIcon
                :name="saveStatus === 'saving'
                  ? 'i-lucide-loader-2'
                  : saveStatus === 'saved'
                    ? 'i-lucide-check'
                    : 'i-lucide-alert-triangle'"
                class="w-3.5 h-3.5"
                :class="{ 'animate-spin': saveStatus === 'saving' }"
              />
              {{ saveStatus === 'saving'
                ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...')
                : saveStatus === 'saved'
                  ? (locale === 'ar' ? 'تم الحفظ' : 'Saved')
                  : (locale === 'ar' ? 'فشل الحفظ' : 'Save failed') }}
            </span>
          </Transition>
        </template>
      </UiPageHeader>

      <div v-if="loading" class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-2">
        <div v-for="i in 9" :key="i" class="h-10 rounded-md bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
      </div>

      <div
        v-else
        class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
      >
        <table class="w-full">
          <thead class="bg-neutral-50/60 dark:bg-neutral-950/40 border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th class="text-start px-4 py-2 text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400">
                {{ locale === 'ar' ? 'نوع الإشعار' : 'Notification Type' }}
              </th>
              <th v-for="ch in channels" :key="ch.key" class="px-4 py-2 text-center text-[11px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400 w-24">
                <div class="flex flex-col items-center gap-1">
                  <UIcon :name="ch.icon" class="w-3.5 h-3.5" />
                  <span>{{ locale === 'ar' ? ch.labelAr : ch.labelEn }}</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
            <tr
              v-for="(nt, i) in notificationTypes"
              :key="nt.key"
              v-motion
              :initial="{ opacity: 0, x: locale === 'ar' ? 8 : -8 }"
              :enter="{ opacity: 1, x: 0, transition: { delay: 40 + i * 20 } }"
              class="hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors"
            >
              <td class="px-4 py-2.5">
                <p class="text-sm text-neutral-900 dark:text-neutral-0">{{ locale === 'ar' ? nt.labelAr : nt.labelEn }}</p>
              </td>
              <td v-for="ch in channels" :key="ch.key" class="px-4 py-2.5 text-center">
                <button
                  type="button"
                  role="switch"
                  :aria-checked="isEnabled(nt.key, ch.key)"
                  class="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1"
                  :class="isEnabled(nt.key, ch.key)
                    ? 'bg-primary-500'
                    : 'bg-neutral-200 dark:bg-neutral-700'"
                  @click="toggle(nt.key, ch.key)"
                >
                  <span
                    class="inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200"
                    :class="isEnabled(nt.key, ch.key)
                      ? (locale === 'ar' ? '-translate-x-4' : 'translate-x-[18px]')
                      : (locale === 'ar' ? '-translate-x-1' : 'translate-x-1')"
                  />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="!loading" class="text-[11px] text-neutral-400 mt-3 flex items-center gap-1">
        <UIcon name="i-lucide-info" class="w-3 h-3" />
        {{ locale === 'ar' ? 'يتم حفظ التغييرات تلقائياً' : 'Changes save automatically' }}
      </p>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

// Channel icons replaced with Lucide refs so they pick up the active text
// color and dark-mode tokens instead of riding on emoji rendering.
const channels = [
  { key: 'email',    labelEn: 'Email', labelAr: 'بريد إلكتروني', icon: 'i-lucide-mail' },
  { key: 'database', labelEn: 'App',   labelAr: 'التطبيق',        icon: 'i-lucide-bell' },
  { key: 'sms',      labelEn: 'SMS',   labelAr: 'رسائل قصيرة',    icon: 'i-lucide-smartphone' },
]

const notificationTypes = [
  { key: 'invoice_sent',        labelEn: 'Invoice Sent',       labelAr: 'إرسال فاتورة' },
  { key: 'payment_received',    labelEn: 'Payment Received',   labelAr: 'استلام دفعة' },
  { key: 'invoice_overdue',     labelEn: 'Invoice Overdue',    labelAr: 'فاتورة متأخرة' },
  { key: 'team_invite',         labelEn: 'Team Invitation',    labelAr: 'دعوة فريق' },
  { key: 'document_shared',     labelEn: 'Document Shared',    labelAr: 'مستند مشترك' },
  { key: 'eta_status_change',   labelEn: 'ETA Status Change',  labelAr: 'تغيير حالة ETA' },
  { key: 'payroll_ready',       labelEn: 'Payroll Ready',      labelAr: 'كشف المرتبات جاهز' },
  { key: 'timesheet_approved',  labelEn: 'Timesheet Approved', labelAr: 'اعتماد جدول أعمال' },
  { key: 'timesheet_rejected',  labelEn: 'Timesheet Rejected', labelAr: 'رفض جدول أعمال' },
]

type PreferencesMap = Record<string, Record<string, boolean>>

const loading = ref(true)
const preferences = ref<PreferencesMap>({})
const saveStatus = ref<'saving' | 'saved' | 'error' | null>(null)
let saveTimeout: ReturnType<typeof setTimeout> | null = null
let statusClearTimeout: ReturnType<typeof setTimeout> | null = null

function isEnabled(type: string, channel: string): boolean {
  return preferences.value[type]?.[channel] ?? false
}

function toggle(type: string, channel: string) {
  if (!preferences.value[type]) preferences.value[type] = {}
  preferences.value[type][channel] = !isEnabled(type, channel)
  debouncedSave()
}

async function fetchPreferences() {
  loading.value = true
  try {
    const res = await api.get<{ data: Record<string, { channel: string; enabled: boolean }[]> }>('/notification-preferences')
    const map: PreferencesMap = {}
    for (const [type, channelList] of Object.entries(res.data)) {
      map[type] = {}
      for (const item of channelList) {
        map[type][item.channel] = item.enabled
      }
    }
    preferences.value = map
  } catch {
    toastStore.error(locale.value === 'ar' ? 'فشل تحميل الإعدادات' : 'Failed to load preferences')
  } finally {
    loading.value = false
  }
}

// Debounce so a burst of toggle clicks coalesces into one PUT instead of
// hammering the API. 600ms is short enough to feel autosaved, long enough
// to batch a row of toggles flipped together.
function debouncedSave() {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(savePreferences, 600)
}

async function savePreferences() {
  saveStatus.value = 'saving'
  if (statusClearTimeout) clearTimeout(statusClearTimeout)

  const payload: { type: string; channel: string; enabled: boolean }[] = []
  for (const [type, channelMap] of Object.entries(preferences.value)) {
    for (const [channel, enabled] of Object.entries(channelMap)) {
      payload.push({ type, channel, enabled })
    }
  }

  try {
    await api.put('/notification-preferences', { preferences: payload })
    saveStatus.value = 'saved'
  } catch {
    saveStatus.value = 'error'
    toastStore.error(locale.value === 'ar' ? 'فشل حفظ الإعدادات' : 'Failed to save preferences')
  } finally {
    statusClearTimeout = setTimeout(() => { saveStatus.value = null }, 2000)
  }
}

onMounted(fetchPreferences)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
