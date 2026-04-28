<template>
  <FeatureBoundary id="timesheets-timer">
    <div class="px-4 lg:px-6 py-5 max-w-2xl mx-auto">
      <UiPageHeader
        icon="i-lucide-timer"
        :title="locale === 'ar' ? 'مؤقت الوقت' : 'Timer'"
        :subtitle="locale === 'ar' ? 'ابدأ وأوقف تتبع الوقت الحي' : 'Start and stop live time tracking'"
      />

      <Can :perm="PERMISSIONS.MANAGE_TIMESHEETS">
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

        <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border p-8"
          :class="running
            ? 'border-success-500/30 bg-success-500/5 dark:bg-success-500/10'
            : 'border-neutral-200 dark:border-neutral-800'"
        >
          <div class="text-center mb-6">
            <p
              class="text-6xl font-bold font-mono tabular-nums tracking-wide"
              :class="running ? 'text-success-700 dark:text-success-400' : 'text-neutral-900 dark:text-neutral-0'"
              dir="ltr"
            >
              {{ display }}
            </p>
            <Transition name="fade">
              <p v-if="running" class="text-xs text-success-700 dark:text-success-400 mt-2 inline-flex items-center gap-1.5 justify-center">
                <span class="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" aria-hidden="true" />
                {{ locale === 'ar' ? 'يعمل الآن…' : 'Running…' }}
              </p>
            </Transition>
          </div>

          <div class="space-y-3">
            <div>
              <label class="tm-label">{{ locale === 'ar' ? 'الوصف' : 'Description' }}</label>
              <input
                v-model="description"
                type="text"
                class="tm-input"
                :placeholder="locale === 'ar' ? 'ما الذي تعمل عليه؟' : 'What are you working on?'"
                :disabled="running"
              />
            </div>

            <UiAppButton
              v-if="!running"
              variant="primary"
              icon="i-lucide-play"
              class="w-full"
              :disabled="!description.trim()"
              @click="start"
            >
              {{ locale === 'ar' ? 'ابدأ التتبع' : 'Start tracking' }}
            </UiAppButton>
            <UiAppButton
              v-else
              variant="danger"
              icon="i-lucide-square"
              class="w-full"
              @click="stop"
            >
              {{ locale === 'ar' ? 'أوقف' : 'Stop' }}
            </UiAppButton>
          </div>
        </div>
      </Can>
    </div>
  </FeatureBoundary>
</template>

<script setup lang="ts">
import Can from '~/core/rbac/Can.vue'
import { PERMISSIONS } from '~/core/rbac/permissions'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const toastStore = useToastStore()
const api = useApi()

const running = ref(false)
const description = ref('')
const startedAt = ref<number | null>(null)
const elapsed = ref(0)
let tickInterval: ReturnType<typeof setInterval> | null = null

const display = computed(() => {
  const s = elapsed.value
  const h = Math.floor(s / 3600).toString().padStart(2, '0')
  const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${h}:${m}:${sec}`
})

function tick() {
  if (!startedAt.value) return
  elapsed.value = Math.floor((Date.now() - startedAt.value) / 1000)
}

async function start() {
  if (!description.value.trim()) return
  try {
    await api.post('/timesheets/timer/start', { description: description.value.trim() }).catch(() => null)
    running.value = true
    startedAt.value = Date.now()
    elapsed.value = 0
    tickInterval = setInterval(tick, 1000)
  } catch (e: any) {
    toastStore.error(e?.data?.message || 'Error')
  }
}

async function stop() {
  try {
    await api.post('/timesheets/timer/stop').catch(() => null)
    if (tickInterval) {
      clearInterval(tickInterval)
      tickInterval = null
    }
    running.value = false
    startedAt.value = null
    description.value = ''
    toastStore.success(locale.value === 'ar' ? 'تم حفظ المدخل' : 'Entry saved')
  } catch (e: any) {
    toastStore.error(e?.data?.message || 'Error')
  }
}

onBeforeUnmount(() => {
  if (tickInterval) clearInterval(tickInterval)
})
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.tm-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.tm-input {
  width: 100%;
  padding-inline: 0.75rem;
  height: 2.5rem;
  font-size: 0.95rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard);
}
.tm-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
.tm-input:disabled { opacity: 0.55; cursor: not-allowed; }

:global(html.dark) .tm-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}

.fade-enter-active, .fade-leave-active { transition: opacity 200ms ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
