<template>
  <div>
    <NuxtLayout name="dashboard">
      <UiPageHeader
        :title="locale === 'ar' ? '\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A' : 'Notification Preferences'"
        :subtitle="locale === 'ar' ? '\u062A\u062D\u0643\u0645 \u0641\u064A \u0637\u0631\u064A\u0642\u0629 \u0648\u0635\u0648\u0644 \u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0625\u0644\u064A\u0643' : 'Control how you receive notifications'"
      />

      <div class="max-w-4xl">
        <!-- Loading -->
        <div v-if="loading">
          <UiLoadingSkeleton :lines="9" :height="48" />
        </div>

        <!-- Preferences table -->
        <div
          v-else
          v-motion
          :initial="{ opacity: 0, y: 15 }"
          :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }"
          class="bg-white rounded-2xl border border-gray-100/80 overflow-hidden"
        >
          <!-- Save indicator -->
          <Transition name="fade">
            <div v-if="saveStatus" class="px-6 py-2 text-xs font-medium" :class="saveStatus === 'saving' ? 'bg-primary-50 text-primary-600' : saveStatus === 'saved' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
              {{ saveStatus === 'saving' ? (locale === 'ar' ? '\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638...' : 'Saving...') : saveStatus === 'saved' ? (locale === 'ar' ? '\u062A\u0645 \u0627\u0644\u062D\u0641\u0638' : 'Saved') : (locale === 'ar' ? '\u0641\u0634\u0644 \u0627\u0644\u062D\u0641\u0638' : 'Save failed') }}
            </div>
          </Transition>

          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100/80">
                <th class="text-start px-6 py-4 text-sm font-semibold text-gray-700">
                  {{ locale === 'ar' ? '\u0646\u0648\u0639 \u0627\u0644\u0625\u0634\u0639\u0627\u0631' : 'Notification Type' }}
                </th>
                <th v-for="ch in channels" :key="ch.key" class="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-32">
                  <div class="flex flex-col items-center gap-1">
                    <span class="text-base">{{ ch.icon }}</span>
                    <span>{{ locale === 'ar' ? ch.labelAr : ch.labelEn }}</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(nt, i) in notificationTypes"
                :key="nt.key"
                v-motion
                :initial="{ opacity: 0, x: locale === 'ar' ? 10 : -10 }"
                :enter="{ opacity: 1, x: 0, transition: { delay: 80 + i * 40 } }"
                class="border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition-colors"
              >
                <td class="px-6 py-4">
                  <p class="text-sm font-medium text-gray-800">{{ locale === 'ar' ? nt.labelAr : nt.labelEn }}</p>
                </td>
                <td v-for="ch in channels" :key="ch.key" class="px-6 py-4 text-center">
                  <button
                    type="button"
                    role="switch"
                    :aria-checked="isEnabled(nt.key, ch.key)"
                    @click="toggle(nt.key, ch.key)"
                    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:ring-offset-1"
                    :class="isEnabled(nt.key, ch.key) ? 'bg-primary-500' : 'bg-gray-200'"
                  >
                    <span
                      class="inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200"
                      :class="isEnabled(nt.key, ch.key) ? (locale === 'ar' ? '-translate-x-5' : 'translate-x-6') : (locale === 'ar' ? '-translate-x-1' : 'translate-x-1')"
                    />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Hint -->
        <p
          v-if="!loading"
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1, transition: { delay: 500 } }"
          class="text-xs text-gray-400 mt-4"
        >
          {{ locale === 'ar' ? '\u064A\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u062A\u063A\u064A\u064A\u0631\u0627\u062A \u062A\u0644\u0642\u0627\u0626\u064A\u064B\u0627' : 'Changes are saved automatically' }}
        </p>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  
  layout: false,
})

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

// --- Channel definitions ---
const channels = [
  { key: 'email', labelEn: 'Email', labelAr: '\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A', icon: '\u2709\uFE0F' },
  { key: 'database', labelEn: 'App', labelAr: '\u0627\u0644\u062A\u0637\u0628\u064A\u0642', icon: '\u{1F514}' },
  { key: 'sms', labelEn: 'SMS', labelAr: '\u0631\u0633\u0627\u0626\u0644 \u0642\u0635\u064A\u0631\u0629', icon: '\u{1F4F1}' },
]

// --- Notification type definitions ---
const notificationTypes = [
  { key: 'invoice_sent', labelEn: 'Invoice Sent', labelAr: '\u0625\u0631\u0633\u0627\u0644 \u0641\u0627\u062A\u0648\u0631\u0629' },
  { key: 'payment_received', labelEn: 'Payment Received', labelAr: '\u0627\u0633\u062A\u0644\u0627\u0645 \u062F\u0641\u0639\u0629' },
  { key: 'invoice_overdue', labelEn: 'Invoice Overdue', labelAr: '\u0641\u0627\u062A\u0648\u0631\u0629 \u0645\u062A\u0623\u062E\u0631\u0629' },
  { key: 'team_invite', labelEn: 'Team Invitation', labelAr: '\u062F\u0639\u0648\u0629 \u0641\u0631\u064A\u0642' },
  { key: 'document_shared', labelEn: 'Document Shared', labelAr: '\u0645\u0633\u062A\u0646\u062F \u0645\u0634\u062A\u0631\u0643' },
  { key: 'eta_status_change', labelEn: 'ETA Status Change', labelAr: '\u062A\u063A\u064A\u064A\u0631 \u062D\u0627\u0644\u0629 ETA' },
  { key: 'payroll_ready', labelEn: 'Payroll Ready', labelAr: '\u0643\u0634\u0641 \u0627\u0644\u0645\u0631\u062A\u0628\u0627\u062A \u062C\u0627\u0647\u0632' },
  { key: 'timesheet_approved', labelEn: 'Timesheet Approved', labelAr: '\u0627\u0639\u062A\u0645\u0627\u062F \u062C\u062F\u0648\u0644 \u0623\u0639\u0645\u0627\u0644' },
  { key: 'timesheet_rejected', labelEn: 'Timesheet Rejected', labelAr: '\u0631\u0641\u0636 \u062C\u062F\u0648\u0644 \u0623\u0639\u0645\u0627\u0644' },
]

// --- State ---
type PreferencesMap = Record<string, Record<string, boolean>>

const loading = ref(true)
const preferences = ref<PreferencesMap>({})
const saveStatus = ref<'saving' | 'saved' | 'error' | null>(null)
let saveTimeout: ReturnType<typeof setTimeout> | null = null
let statusClearTimeout: ReturnType<typeof setTimeout> | null = null

// --- Helpers ---
function isEnabled(type: string, channel: string): boolean {
  return preferences.value[type]?.[channel] ?? false
}

function toggle(type: string, channel: string) {
  if (!preferences.value[type]) {
    preferences.value[type] = {}
  }
  preferences.value[type][channel] = !isEnabled(type, channel)
  debouncedSave()
}

// --- Fetch ---
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
    toastStore.error(locale.value === 'ar' ? '\u0641\u0634\u0644 \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A' : 'Failed to load preferences')
  } finally {
    loading.value = false
  }
}

// --- Save (debounced) ---
function debouncedSave() {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    savePreferences()
  }, 600)
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
    toastStore.error(locale.value === 'ar' ? '\u0641\u0634\u0644 \u062D\u0641\u0638 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A' : 'Failed to save preferences')
  } finally {
    statusClearTimeout = setTimeout(() => {
      saveStatus.value = null
    }, 2000)
  }
}

onMounted(fetchPreferences)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
