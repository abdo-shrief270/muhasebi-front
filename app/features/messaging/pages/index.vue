<template>
  <div>
    <UiPageHeader :title="locale === 'ar' ? 'المراسلات' : 'Messaging'" />

    <div class="max-w-5xl space-y-6">
      <!-- Quick Send -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-800 mb-4">{{ locale === 'ar' ? 'إرسال رسالة سريعة' : 'Quick Send' }}</h3>
        <div class="grid md:grid-cols-2 gap-4">
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">{{ locale === 'ar' ? 'رقم الهاتف' : 'Phone Number' }}</label>
              <input v-model="sendForm.phone" type="tel" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" dir="ltr" placeholder="+201012345678" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">{{ locale === 'ar' ? 'الرسالة' : 'Message' }}</label>
              <textarea v-model="sendForm.message" rows="3" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"></textarea>
            </div>
            <div class="flex gap-2">
              <UiAppButton variant="primary" :loading="sending === 'whatsapp'" @click="send('whatsapp')" size="sm">
                <span class="flex items-center gap-1.5">💬 WhatsApp</span>
              </UiAppButton>
              <UiAppButton variant="outline" :loading="sending === 'sms'" @click="send('sms')" size="sm">
                <span class="flex items-center gap-1.5">📱 SMS</span>
              </UiAppButton>
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="text-xs text-gray-500 mb-2">{{ locale === 'ar' ? 'حالة التكامل:' : 'Integration Status:' }}</p>
            <div class="flex items-center gap-2 mb-2">
              <span class="w-2 h-2 rounded-full" :class="beonConfigured ? 'bg-emerald-500' : 'bg-gray-300'"></span>
              <span class="text-sm" :class="beonConfigured ? 'text-emerald-600' : 'text-gray-400'">
                Beon.chat {{ beonConfigured ? (locale === 'ar' ? 'متصل' : 'Connected') : (locale === 'ar' ? 'غير متصل' : 'Not configured') }}
              </span>
            </div>
            <p v-if="!beonConfigured" class="text-xs text-gray-400">
              {{ locale === 'ar' ? 'قم بإعداد Beon.chat في صفحة التكاملات لتفعيل المراسلات.' : 'Configure Beon.chat in Integration Settings to enable messaging.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Conversations -->
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100">
          <h3 class="font-semibold text-gray-800">{{ locale === 'ar' ? 'المحادثات' : 'Conversations' }}</h3>
        </div>
        <div v-if="loadingConvos" class="p-6"><UiLoadingSkeleton :lines="4" :height="16" /></div>
        <div v-else-if="conversations.length" class="divide-y divide-gray-50">
          <div v-for="conv in conversations" :key="conv.id" class="px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors" @click="openConvo(conv)">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">{{ (conv.contact_name || conv.from || '?').charAt(0) }}</div>
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ conv.contact_name || conv.from || 'Unknown' }}</p>
                  <p class="text-xs text-gray-400 truncate max-w-xs">{{ conv.last_message?.text || '' }}</p>
                </div>
              </div>
              <span class="text-xs text-gray-300">{{ conv.channel || 'whatsapp' }}</span>
            </div>
          </div>
        </div>
        <div v-else class="p-8 text-center"><UiEmptyState :message="locale === 'ar' ? 'لا توجد محادثات' : 'No conversations'" /></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({  })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const sendForm = reactive({ phone: '', message: '' })
const sending = ref('')
const conversations = ref<any[]>([])
const loadingConvos = ref(true)
const beonConfigured = ref(false)

async function send(channel: 'whatsapp' | 'sms') {
  sending.value = channel
  try {
    await api.post(`/messaging/${channel}`, { phone: sendForm.phone, message: sendForm.message })
    toastStore.success(locale.value === 'ar' ? 'تم الإرسال' : 'Sent')
    sendForm.message = ''
  } catch (e: any) { toastStore.error(e.data?.message || 'Failed') }
  finally { sending.value = '' }
}

async function loadConversations() {
  loadingConvos.value = true
  try { conversations.value = (await api.get<any>('/messaging/conversations')).data || [] }
  catch { conversations.value = [] }
  finally { loadingConvos.value = false }
}

function openConvo(conv: any) {
  // TODO: Open conversation detail view
  toastStore.success(`Opening ${conv.id}`)
}

onMounted(async () => {
  try {
    // Check if Beon.chat is configured by trying to list templates
    await api.get('/messaging/templates')
    beonConfigured.value = true
  } catch { beonConfigured.value = false }
  loadConversations()
})
</script>
