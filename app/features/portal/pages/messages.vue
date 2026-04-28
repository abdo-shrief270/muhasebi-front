<template>
  <div>
      <UiPageHeader :title="locale === 'ar' ? 'الرسائل' : 'Messages'">
        <template #actions>
          <UiAppButton variant="primary" size="sm" @click="composeOpen = true">
            {{ locale === 'ar' ? 'رسالة جديدة' : 'New Message' }}
          </UiAppButton>
        </template>
      </UiPageHeader>

      <div v-if="loading"><UiLoadingSkeleton :lines="5" :height="50" /></div>

      <div v-else-if="messages.length" class="space-y-3">
        <div
          v-for="(msg, i) in messages"
          :key="msg.id"
          v-motion
          :initial="{ opacity: 0, x: locale === 'ar' ? 15 : -15 }"
          :enter="{ opacity: 1, x: 0, transition: { delay: i * 40 } }"
          class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border p-4 transition-all cursor-pointer hover:border-neutral-200 dark:hover:border-neutral-700"
          :class="msg.is_read
            ? 'border-neutral-100/80 dark:border-neutral-800'
            : 'border-s-4 border-s-secondary-400 border-neutral-100/80 dark:border-neutral-800'"
          @click="openMessage(msg)"
        >
          <div class="flex items-start justify-between">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <UiBadge :color="msg.direction === 'inbound' ? 'blue' : 'gray'" class="text-[10px]">
                  {{ msg.direction === 'inbound' ? (locale === 'ar' ? 'صادر' : 'Sent') : (locale === 'ar' ? 'وارد' : 'Received') }}
                </UiBadge>
                <span class="text-xs text-neutral-400 dark:text-neutral-500">{{ new Date(msg.created_at).toLocaleDateString() }}</span>
              </div>
              <p class="font-medium text-neutral-800 dark:text-neutral-100 text-sm">{{ msg.subject }}</p>
            </div>
            <span v-if="!msg.is_read" class="w-2 h-2 rounded-full bg-secondary-400 flex-shrink-0 mt-2"></span>
          </div>
        </div>
      </div>

      <UiEmptyState v-else icon="&#9993;" :title="locale === 'ar' ? 'لا توجد رسائل' : 'No messages'" />

      <!-- Compose -->
      <UiSlideOver v-model="composeOpen" :title="locale === 'ar' ? 'رسالة جديدة' : 'New Message'">
        <form @submit.prevent="handleSend" class="space-y-4">
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'الموضوع' : 'Subject' }} *</label>
            <input v-model="form.subject" type="text" required class="input-field" />
          </div>
          <div>
            <label class="form-label">{{ locale === 'ar' ? 'الرسالة' : 'Message' }} *</label>
            <textarea v-model="form.body" rows="5" required class="input-field resize-none"></textarea>
          </div>
          <div class="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <UiAppButton type="submit" variant="primary" :loading="sending">{{ locale === 'ar' ? 'إرسال' : 'Send' }}</UiAppButton>
            <UiAppButton variant="outline" @click="composeOpen = false">{{ $t('common.cancel') }}</UiAppButton>
          </div>
        </form>
      </UiSlideOver>

      <!-- Read message -->
      <UiSlideOver v-model="readOpen" :title="selectedMsg?.subject || ''">
        <div v-if="selectedMsg" class="space-y-4">
          <div class="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
            <span>{{ selectedMsg.sender?.name }}</span>
            <span>&middot;</span>
            <span>{{ new Date(selectedMsg.created_at).toLocaleString() }}</span>
          </div>
          <div class="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-line leading-relaxed">{{ selectedMsg.body }}</div>
        </div>
      </UiSlideOver>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'portal' })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const messages = ref<any[]>([])
const loading = ref(true)
const composeOpen = ref(false)
const sending = ref(false)
const readOpen = ref(false)
const selectedMsg = ref<any>(null)
const form = reactive({ subject: '', body: '' })

async function load() {
  loading.value = true
  try {
    const data = await api.get<{ data: any[] }>('/portal/messages')
    messages.value = data.data
  } catch { messages.value = [] }
  finally { loading.value = false }
}

async function handleSend() {
  sending.value = true
  try {
    await api.post('/portal/messages', form)
    toastStore.success(locale.value === 'ar' ? 'تم الإرسال' : 'Sent')
    composeOpen.value = false
    form.subject = ''; form.body = ''
    load()
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { sending.value = false }
}

function openMessage(msg: any) {
  selectedMsg.value = msg
  readOpen.value = true
  if (!msg.is_read) {
    api.post(`/portal/messages/${msg.id}/read`).then(() => { msg.is_read = true })
  }
}

onMounted(load)
</script>

<style scoped>
@reference "~/assets/css/tokens.css";
.input-field { @apply w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-sm bg-neutral-50/50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-0; }
.form-label { @apply block text-sm font-medium text-neutral-600 dark:text-neutral-300 mb-1; }
</style>
