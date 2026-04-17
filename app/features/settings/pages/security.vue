<template>
  <div>
    <UiPageHeader :title="locale === 'ar' ? 'الأمان والتحقق الثنائي' : 'Security & 2FA'" />

    <div class="max-w-2xl space-y-6">
      <!-- 2FA Section -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="font-semibold text-gray-800">{{ locale === 'ar' ? 'التحقق الثنائي (2FA)' : 'Two-Factor Authentication' }}</h3>
            <p class="text-xs text-gray-400 mt-1">{{ locale === 'ar' ? 'أضف طبقة حماية إضافية لحسابك باستخدام تطبيق المصادقة.' : 'Add an extra layer of security using an authenticator app.' }}</p>
          </div>
          <span class="text-xs font-semibold px-3 py-1 rounded-full"
            :class="twoFaEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'">
            {{ twoFaEnabled ? (locale === 'ar' ? 'مفعّل' : 'Enabled') : (locale === 'ar' ? 'معطل' : 'Disabled') }}
          </span>
        </div>

        <!-- Enable Flow -->
        <div v-if="!twoFaEnabled && !setupData">
          <UiAppButton variant="primary" :loading="enabling" @click="enable2fa">
            {{ locale === 'ar' ? 'تفعيل التحقق الثنائي' : 'Enable 2FA' }}
          </UiAppButton>
        </div>

        <!-- Setup: Show QR + Recovery Codes -->
        <div v-if="setupData" class="space-y-4">
          <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p class="text-sm font-semibold text-amber-800 mb-2">{{ locale === 'ar' ? 'مهم: احفظ هذه البيانات' : 'Important: Save this information' }}</p>
            <p class="text-xs text-amber-700">{{ locale === 'ar' ? 'لن تظهر هذه البيانات مرة أخرى. احفظها في مكان آمن.' : 'This will not be shown again. Store it securely.' }}</p>
          </div>

          <div>
            <p class="text-xs font-medium text-gray-500 mb-2">{{ locale === 'ar' ? 'امسح الرمز بتطبيق المصادقة:' : 'Scan with your authenticator app:' }}</p>
            <div class="bg-gray-50 rounded-xl p-6 text-center">
              <img v-if="qrImageUrl" :src="qrImageUrl" alt="QR Code" class="mx-auto w-48 h-48" />
              <p v-else class="text-xs text-gray-400 font-mono break-all">{{ setupData.qr_uri }}</p>
            </div>
            <div class="mt-2">
              <p class="text-xs text-gray-400 mb-1">{{ locale === 'ar' ? 'أو أدخل المفتاح يدوياً:' : 'Or enter manually:' }}</p>
              <code class="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-mono select-all block text-center">{{ setupData.secret }}</code>
            </div>
          </div>

          <div>
            <p class="text-xs font-medium text-gray-500 mb-2">{{ locale === 'ar' ? 'رموز الاسترداد (احفظها):' : 'Recovery Codes (save these):' }}</p>
            <div class="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-2">
              <code v-for="code in setupData.recovery_codes" :key="code" class="text-xs font-mono text-gray-600 bg-white px-3 py-1.5 rounded border border-gray-200 text-center select-all">{{ code }}</code>
            </div>
          </div>

          <UiAppButton variant="primary" @click="setupData = null; twoFaEnabled = true">
            {{ locale === 'ar' ? 'تم، أغلق' : 'Done, close' }}
          </UiAppButton>
        </div>

        <!-- Disable -->
        <div v-if="twoFaEnabled && !setupData" class="space-y-3 mt-4">
          <p class="text-xs text-gray-500">{{ locale === 'ar' ? 'أدخل كلمة المرور لتعطيل التحقق الثنائي:' : 'Enter your password to disable 2FA:' }}</p>
          <div class="flex gap-2">
            <input v-model="disablePassword" type="password" class="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" :placeholder="locale === 'ar' ? 'كلمة المرور' : 'Password'" />
            <UiAppButton variant="outline" :loading="disabling" @click="disable2fa">
              {{ locale === 'ar' ? 'تعطيل' : 'Disable' }}
            </UiAppButton>
          </div>
        </div>
      </div>

      <!-- Password Info -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <h3 class="font-semibold text-gray-800 mb-2">{{ locale === 'ar' ? 'أمان كلمة المرور' : 'Password Security' }}</h3>
        <ul class="space-y-2 text-sm text-gray-500">
          <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> {{ locale === 'ar' ? '8 أحرف على الأقل' : 'At least 8 characters' }}</li>
          <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> {{ locale === 'ar' ? 'حرف كبير وصغير' : 'Upper and lowercase letters' }}</li>
          <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> {{ locale === 'ar' ? 'رقم واحد على الأقل' : 'At least one number' }}</li>
          <li class="flex items-center gap-2"><span class="text-emerald-500">✓</span> {{ locale === 'ar' ? 'يتم فحصها ضد تسريبات البيانات' : 'Checked against known data breaches' }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({  })
const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const twoFaEnabled = ref(false)
const setupData = ref<any>(null)
const qrImageUrl = ref('')
const enabling = ref(false)
const disabling = ref(false)
const disablePassword = ref('')

async function checkStatus() {
  try {
    const res = await api.get<any>('/2fa/status')
    twoFaEnabled.value = res.data.enabled
  } catch {}
}

async function enable2fa() {
  enabling.value = true
  try {
    const res = await api.post<any>('/2fa/enable')
    setupData.value = res.data
    twoFaEnabled.value = true

    // Generate QR code URL using Google Charts API
    qrImageUrl.value = `https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=${encodeURIComponent(res.data.qr_uri)}`
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { enabling.value = false }
}

async function disable2fa() {
  if (!disablePassword.value) return
  disabling.value = true
  try {
    await api.post('/2fa/disable', { password: disablePassword.value })
    twoFaEnabled.value = false
    disablePassword.value = ''
    toastStore.success(locale.value === 'ar' ? 'تم تعطيل التحقق الثنائي' : '2FA disabled')
  } catch (e: any) { toastStore.error(e.data?.message || 'Error') }
  finally { disabling.value = false }
}

onMounted(checkStatus)
</script>
