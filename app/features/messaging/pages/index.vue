<template>
  <div class="px-4 lg:px-6 py-5 max-w-[1400px] mx-auto">
    <UiPageHeader
      icon="i-lucide-message-circle"
      :title="locale === 'ar' ? 'المراسلات' : 'Messaging'"
      :subtitle="locale === 'ar' ? 'إرسال رسائل WhatsApp وSMS للعملاء وإدارة المحادثات' : 'Send WhatsApp/SMS messages to clients and manage conversations'"
    />

    <!-- Quick Send -->
    <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 mb-3">
      <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-3 flex items-center gap-1.5">
        <UIcon name="i-lucide-send" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'إرسال رسالة سريعة' : 'Quick Send' }}
      </h3>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-3">
          <div>
            <label class="msg-label">{{ locale === 'ar' ? 'رقم الهاتف' : 'Phone Number' }}</label>
            <input
              v-model="sendForm.phone"
              type="tel"
              class="msg-input font-mono"
              dir="ltr"
              placeholder="+201012345678"
            />
          </div>
          <div>
            <label class="msg-label">{{ locale === 'ar' ? 'الرسالة' : 'Message' }}</label>
            <textarea
              v-model="sendForm.message"
              rows="3"
              class="msg-textarea"
              :placeholder="locale === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'"
            ></textarea>
          </div>
          <div class="flex gap-2">
            <UiAppButton
              variant="primary"
              icon="i-lucide-message-square"
              size="sm"
              :loading="sending === 'whatsapp'"
              :disabled="!beonConfigured || !sendForm.phone || !sendForm.message"
              @click="send('whatsapp')"
            >
              WhatsApp
            </UiAppButton>
            <UiAppButton
              variant="outline"
              icon="i-lucide-smartphone"
              size="sm"
              :loading="sending === 'sms'"
              :disabled="!beonConfigured || !sendForm.phone || !sendForm.message"
              @click="send('sms')"
            >
              SMS
            </UiAppButton>
          </div>
        </div>

        <div class="bg-neutral-50/60 dark:bg-neutral-950/40 rounded-xl border border-neutral-100 dark:border-neutral-800/60 p-3">
          <p class="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
            {{ locale === 'ar' ? 'حالة التكامل' : 'Integration Status' }}
          </p>
          <div class="flex items-center gap-2 mb-1.5">
            <span
              class="w-2 h-2 rounded-full flex-shrink-0"
              :class="beonConfigured
                ? 'bg-success-500 dark:bg-success-400'
                : 'bg-neutral-300 dark:bg-neutral-700'"
            ></span>
            <span
              class="text-sm font-medium"
              :class="beonConfigured
                ? 'text-success-700 dark:text-success-400'
                : 'text-neutral-500 dark:text-neutral-400'"
            >
              Beon.chat
              <span class="font-normal">
                {{ beonConfigured ? (locale === 'ar' ? '— متصل' : '— Connected') : (locale === 'ar' ? '— غير مُعَد' : '— Not configured') }}
              </span>
            </span>
          </div>
          <p v-if="!beonConfigured" class="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            {{ locale === 'ar' ? 'قم بإعداد Beon.chat في صفحة التكاملات لتفعيل المراسلات.' : 'Configure Beon.chat in Integration Settings to enable messaging.' }}
          </p>

          <!-- SMS credit balance — visible only when the tenant has bought
               an SMS credit pack. Sourced from /subscription/credits, which
               sums all unexpired packs of kind=sms. -->
          <div
            v-if="smsCreditBalance !== null"
            class="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800/60 flex items-center justify-between gap-2"
          >
            <span class="text-[11px] text-neutral-500 dark:text-neutral-400 inline-flex items-center gap-1">
              <UIcon name="i-lucide-coins" class="w-3 h-3" />
              {{ locale === 'ar' ? 'رصيد SMS' : 'SMS credit' }}
            </span>
            <span
              class="font-mono text-sm font-semibold tabular-nums"
              :class="smsCreditBalance > 0
                ? 'text-success-700 dark:text-success-400'
                : 'text-warning-700 dark:text-warning-500'"
              dir="ltr"
            >
              {{ formatNumber(smsCreditBalance) }}
            </span>
          </div>
          <NuxtLink
            v-if="smsCreditBalance !== null && smsCreditBalance < 100"
            to="/subscription/add-ons"
            class="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
          >
            {{ locale === 'ar' ? 'اشترِ المزيد' : 'Buy more credits' }}
            <UIcon name="i-lucide-arrow-right" class="w-3 h-3 rtl:rotate-180" />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Conversations -->
    <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
      <div class="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 flex items-center gap-1.5">
          <UIcon name="i-lucide-messages-square" class="w-3.5 h-3.5 text-neutral-400" />
          {{ locale === 'ar' ? 'المحادثات' : 'Conversations' }}
        </h3>
      </div>

      <div v-if="loadingConvos" class="p-4">
        <UiLoadingSkeleton :lines="4" :height="16" />
      </div>

      <div v-else-if="conversations.length" class="divide-y divide-neutral-100 dark:divide-neutral-800/60">
        <button
          v-for="conv in conversations"
          :key="conv.id"
          type="button"
          class="w-full px-4 py-3 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 transition-colors text-start"
          @click="openConvo(conv)"
        >
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-full bg-primary-50 dark:bg-primary-500/15 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300 flex-shrink-0">
                {{ (conv.contact_name || conv.from || '?').charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-neutral-900 dark:text-neutral-0 truncate">{{ conv.contact_name || conv.from || 'Unknown' }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 truncate">{{ conv.last_message?.text || '' }}</p>
              </div>
            </div>
            <span class="text-[10px] uppercase tracking-wider font-semibold text-neutral-400 dark:text-neutral-500 flex-shrink-0">{{ conv.channel || 'whatsapp' }}</span>
          </div>
        </button>
      </div>

      <div v-else class="p-12 text-center">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <UIcon name="i-lucide-message-circle-off" class="w-5 h-5 text-neutral-400" />
        </div>
        <p class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1">
          {{ locale === 'ar' ? 'لا توجد محادثات' : 'No conversations yet' }}
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400 max-w-md mx-auto">
          {{ locale === 'ar' ? 'الرسائل الواردة من العملاء عبر WhatsApp أو SMS ستظهر هنا.' : 'Incoming messages from clients via WhatsApp or SMS will appear here.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { addOnsService } from '~/features/subscription/services/addOnsService'

definePageMeta({ layout: 'dashboard' })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const sendForm = reactive({ phone: '', message: '' })
const sending = ref('')
const conversations = ref<any[]>([])
const loadingConvos = ref(true)
const beonConfigured = ref(false)

// Null until /subscription/credits resolves; null also means "tenant has no
// SMS credit pack at all" so we render no pill, vs `0` which means
// "depleted — show the buy-more nudge".
const smsCreditBalance = ref<number | null>(null)

function formatNumber(n: number): string {
  return n.toLocaleString(locale.value === 'ar' ? 'ar-EG' : 'en-US')
}

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
  toastStore.success(`Opening ${conv.id}`)
}

onMounted(async () => {
  try {
    await api.get('/messaging/templates')
    beonConfigured.value = true
  } catch { beonConfigured.value = false }

  // Fetch credit balances in parallel; failure here doesn't block the page.
  addOnsService()
    .credits()
    .then((credits) => {
      smsCreditBalance.value = credits?.sms?.balance ?? null
    })
    .catch(() => { smsCreditBalance.value = null })

  loadConversations()
})
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.msg-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }

.msg-input,
.msg-textarea {
  width: 100%;
  padding-inline: 0.75rem;
  font-size: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard);
}
.msg-input { height: 2.25rem; }
.msg-textarea { padding-block: 0.5rem; resize: vertical; }
.msg-input:focus,
.msg-textarea:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
:global(html.dark) .msg-input,
:global(html.dark) .msg-textarea {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
