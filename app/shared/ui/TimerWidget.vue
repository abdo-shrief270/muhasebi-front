<template>
  <div class="relative">
    <!-- Timer button -->
    <button
      @click="isOpen = !isOpen"
      class="w-8 h-8 flex items-center justify-center rounded-lg transition"
      :class="timer
        ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 animate-pulse'
        : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-600 dark:hover:text-neutral-300'"
    >
      <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
    </button>

    <!-- Running indicator -->
    <span v-if="timer" class="absolute -top-0.5 -end-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-neutral-0 dark:border-neutral-900"></span>

    <!-- Dropdown -->
    <Transition name="fade">
      <div v-if="isOpen" class="absolute end-0 top-full mt-2 w-72 bg-neutral-0 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl shadow-xl z-50 overflow-hidden">
        <!-- Running timer -->
        <div v-if="timer" class="p-4 border-b border-neutral-50 dark:border-neutral-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase">{{ locale === 'ar' ? 'جارٍ التتبع' : 'Tracking' }}</span>
            <span class="font-mono text-lg font-bold text-neutral-800 dark:text-neutral-100">{{ elapsed }}</span>
          </div>
          <p class="text-sm text-neutral-700 dark:text-neutral-300 truncate">{{ timer.task_description }}</p>
          <p v-if="timer.client" class="text-xs text-neutral-400 dark:text-neutral-500 truncate">{{ timer.client.name }}</p>
          <UiAppButton variant="danger" size="sm" class="w-full mt-3" :loading="stopping" @click="stopTimer">
            {{ locale === 'ar' ? 'إيقاف' : 'Stop Timer' }}
          </UiAppButton>
        </div>

        <!-- Start new -->
        <div v-else class="p-4">
          <p class="text-xs text-neutral-400 dark:text-neutral-500 mb-3 font-semibold uppercase">{{ locale === 'ar' ? 'بدء مؤقت جديد' : 'Start Timer' }}</p>
          <form @submit.prevent="startTimer" class="space-y-3">
            <input
              v-model="newTask"
              type="text"
              required
              class="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-0 rounded-lg text-sm outline-none focus:border-primary-500 transition"
              :placeholder="locale === 'ar' ? 'وصف المهمة...' : 'Task description...'"
            />
            <UiAppButton type="submit" variant="primary" size="sm" class="w-full" :loading="starting">
              {{ locale === 'ar' ? 'بدء' : 'Start' }}
            </UiAppButton>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const isOpen = ref(false)
const timer = ref<any>(null)
const newTask = ref('')
const starting = ref(false)
const stopping = ref(false)
const elapsed = ref('00:00:00')
let interval: ReturnType<typeof setInterval> | null = null

async function fetchCurrent() {
  try {
    const res = await api.get<{ data: any }>('/timers/current')
    timer.value = res.data
    if (timer.value) startElapsedCounter()
  } catch { timer.value = null }
}

function startElapsedCounter() {
  if (interval) clearInterval(interval)
  interval = setInterval(() => {
    if (!timer.value?.started_at) return
    const start = new Date(timer.value.started_at).getTime()
    const diff = Math.floor((Date.now() - start) / 1000)
    const h = String(Math.floor(diff / 3600)).padStart(2, '0')
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
    const s = String(diff % 60).padStart(2, '0')
    elapsed.value = `${h}:${m}:${s}`
  }, 1000)
}

async function startTimer() {
  if (!newTask.value) return
  starting.value = true
  try {
    await api.post('/timers/start', { task_description: newTask.value })
    newTask.value = ''
    toastStore.success(locale.value === 'ar' ? 'تم بدء المؤقت' : 'Timer started')
    await fetchCurrent()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { starting.value = false }
}

async function stopTimer() {
  if (!timer.value) return
  stopping.value = true
  try {
    await api.post(`/timers/${timer.value.id}/stop`)
    if (interval) clearInterval(interval)
    timer.value = null
    elapsed.value = '00:00:00'
    toastStore.success(locale.value === 'ar' ? 'تم إيقاف المؤقت وإنشاء قيد زمني' : 'Timer stopped — timesheet entry created')
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { stopping.value = false }
}

onMounted(fetchCurrent)
onUnmounted(() => { if (interval) clearInterval(interval) })
</script>
