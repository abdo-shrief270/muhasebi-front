<template>
  <div>
    <NuxtLayout name="public">
      <div class="max-w-6xl mx-auto px-6 py-12">
        <div class="grid lg:grid-cols-5 gap-12">
          <!-- Left: Contact Info -->
          <div class="lg:col-span-2">
            <div class="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
              {{ isAr ? 'تواصل معنا' : 'Contact Us' }}
            </div>
            <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {{ isAr ? 'نحن هنا لمساعدتك' : "We're here to help" }}
            </h1>
            <p class="text-gray-500 leading-relaxed mb-10">
              {{ isAr ? 'هل لديك سؤال أو استفسار؟ أرسل لنا رسالة وسنرد عليك في أقرب وقت.' : 'Have a question? Send us a message and we\'ll get back to you as soon as possible.' }}
            </p>

            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="w-11 h-11 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-800 text-sm">{{ isAr ? 'البريد الإلكتروني' : 'Email' }}</p>
                  <p class="text-sm text-gray-400">info@muhasebi.com</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-11 h-11 bg-secondary-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-800 text-sm">{{ isAr ? 'الهاتف' : 'Phone' }}</p>
                  <p class="text-sm text-gray-400" dir="ltr">+20 100 000 0000</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                </div>
                <div>
                  <p class="font-semibold text-gray-800 text-sm">{{ isAr ? 'العنوان' : 'Address' }}</p>
                  <p class="text-sm text-gray-400">{{ isAr ? 'القاهرة، مصر' : 'Cairo, Egypt' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Form -->
          <div class="lg:col-span-3">
            <div v-if="submitted" class="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center">
              <div class="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.5 12.75l6 6 9-13.5" /></svg>
              </div>
              <h3 class="text-lg font-bold text-emerald-800 mb-2">{{ isAr ? 'تم إرسال رسالتك!' : 'Message sent!' }}</h3>
              <p class="text-sm text-emerald-600">{{ isAr ? 'شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.' : 'Thank you for reaching out. We\'ll get back to you as soon as possible.' }}</p>
              <button @click="resetForm" class="mt-4 text-sm text-emerald-700 underline hover:no-underline">{{ isAr ? 'إرسال رسالة أخرى' : 'Send another message' }}</button>
            </div>

            <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
              <div class="grid sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1.5">{{ isAr ? 'الاسم' : 'Name' }} *</label>
                  <input v-model="form.name" type="text" required class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary-300 focus:ring-1 focus:ring-primary-100 transition-colors" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1.5">{{ isAr ? 'البريد الإلكتروني' : 'Email' }} *</label>
                  <input v-model="form.email" type="email" required class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary-300 focus:ring-1 focus:ring-primary-100 transition-colors" />
                </div>
              </div>
              <div class="grid sm:grid-cols-2 gap-5">
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1.5">{{ isAr ? 'الهاتف' : 'Phone' }}</label>
                  <input v-model="form.phone" type="tel" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary-300 focus:ring-1 focus:ring-primary-100 transition-colors" />
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-500 mb-1.5">{{ isAr ? 'الشركة' : 'Company' }}</label>
                  <input v-model="form.company" type="text" class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary-300 focus:ring-1 focus:ring-primary-100 transition-colors" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1.5">{{ isAr ? 'الموضوع' : 'Subject' }} *</label>
                <select v-model="form.subject" required class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary-300 focus:ring-1 focus:ring-primary-100 transition-colors bg-white">
                  <option value="">{{ isAr ? 'اختر الموضوع' : 'Select a subject' }}</option>
                  <option v-for="s in subjects" :key="s.value" :value="s.value">{{ s.label }}</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1.5">{{ isAr ? 'الرسالة' : 'Message' }} *</label>
                <textarea v-model="form.message" rows="5" required class="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:border-primary-300 focus:ring-1 focus:ring-primary-100 transition-colors resize-none"></textarea>
              </div>

              <!-- Honeypot (hidden from users, traps bots) -->
              <div class="absolute -left-[9999px]" aria-hidden="true" tabindex="-1">
                <input v-model="form.website" type="text" name="website" autocomplete="off" tabindex="-1" />
              </div>

              <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

              <button
                type="submit"
                :disabled="sending"
                class="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {{ sending ? (isAr ? 'جاري الإرسال...' : 'Sending...') : (isAr ? 'إرسال الرسالة' : 'Send Message') }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { locale } = useI18n()
const api = useApi()

const isAr = computed(() => locale.value === 'ar')

const form = reactive({ name: '', email: '', phone: '', company: '', subject: '', message: '', website: '', _timestamp: 0 })
const sending = ref(false)
const submitted = ref(false)
const error = ref('')

const subjects = computed(() => isAr.value ? [
  { value: 'استفسار عام', label: 'استفسار عام' },
  { value: 'دعم فني', label: 'دعم فني' },
  { value: 'المبيعات', label: 'المبيعات والأسعار' },
  { value: 'شراكة', label: 'شراكة أو تعاون' },
  { value: 'أخرى', label: 'أخرى' },
] : [
  { value: 'General Inquiry', label: 'General Inquiry' },
  { value: 'Technical Support', label: 'Technical Support' },
  { value: 'Sales', label: 'Sales & Pricing' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'Other', label: 'Other' },
])

async function handleSubmit() {
  sending.value = true
  error.value = ''
  try {
    await api.post('/contact', { ...form })
    submitted.value = true
  } catch (e: any) {
    error.value = e.data?.message || (isAr.value ? 'حدث خطأ. حاول مرة أخرى.' : 'An error occurred. Please try again.')
  } finally {
    sending.value = false
  }
}

function resetForm() {
  Object.assign(form, { name: '', email: '', phone: '', company: '', subject: '', message: '' })
  submitted.value = false
}

onMounted(() => { form._timestamp = Math.floor(Date.now() / 1000) })

useHead({
  title: computed(() => isAr.value ? 'تواصل معنا - محاسبي' : 'Contact Us - Muhasebi'),
})
</script>
