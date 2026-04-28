<template>
  <div class="px-4 lg:px-6 py-5 max-w-2xl mx-auto">
    <UiPageHeader
      icon="i-lucide-shield-check"
      :title="locale === 'ar' ? 'الأمان' : 'Security'"
      :subtitle="locale === 'ar' ? 'كلمة المرور وإعدادات الحساب' : 'Password and account safety'"
    />

    <div class="bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5">
      <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-0 mb-1 flex items-center gap-1.5">
        <UIcon name="i-lucide-key-round" class="w-3.5 h-3.5 text-neutral-400" />
        {{ locale === 'ar' ? 'تغيير كلمة المرور' : 'Change Password' }}
      </h3>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
        {{ locale === 'ar'
          ? 'استخدم كلمة مرور قوية لم تستخدمها في أي موقع آخر.'
          : "Use a strong password you don't reuse anywhere else." }}
      </p>

      <form @submit.prevent="changePassword" class="space-y-3">
        <div>
          <label class="sec-label">
            {{ locale === 'ar' ? 'كلمة المرور الحالية' : 'Current Password' }}
            <span class="text-danger-500">*</span>
          </label>
          <input
            v-model="password.values.current_password"
            type="password"
            autocomplete="current-password"
            class="sec-input"
            :class="{ 'sec-input--error': password.errors.value.current_password }"
            dir="ltr"
            @input="password.clearError('current_password')"
          />
          <p v-if="password.errors.value.current_password" class="sec-error">{{ password.errors.value.current_password }}</p>
        </div>

        <div>
          <label class="sec-label">
            {{ locale === 'ar' ? 'كلمة المرور الجديدة' : 'New Password' }}
            <span class="text-danger-500">*</span>
          </label>
          <input
            v-model="password.values.password"
            type="password"
            autocomplete="new-password"
            class="sec-input"
            :class="{ 'sec-input--error': password.errors.value.password }"
            dir="ltr"
            @input="password.clearError('password')"
          />
          <p v-if="password.errors.value.password" class="sec-error">{{ password.errors.value.password }}</p>
        </div>

        <div>
          <label class="sec-label">
            {{ locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password' }}
            <span class="text-danger-500">*</span>
          </label>
          <input
            v-model="password.values.password_confirmation"
            type="password"
            autocomplete="new-password"
            class="sec-input"
            :class="{ 'sec-input--error': password.errors.value.password_confirmation }"
            dir="ltr"
            @input="password.clearError('password_confirmation')"
          />
          <p v-if="password.errors.value.password_confirmation" class="sec-error">{{ password.errors.value.password_confirmation }}</p>
        </div>

        <!-- Requirements list. Mirrors backend zxcvbn check + StoreUserRequest
             rules so the user knows what to aim for before submitting. -->
        <ul class="space-y-1 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
          <li class="flex items-center gap-1.5">
            <UIcon name="i-lucide-circle-dot" class="w-3 h-3 flex-shrink-0" />
            {{ locale === 'ar' ? '10 أحرف على الأقل' : 'At least 10 characters' }}
          </li>
          <li class="flex items-center gap-1.5">
            <UIcon name="i-lucide-circle-dot" class="w-3 h-3 flex-shrink-0" />
            {{ locale === 'ar' ? 'حرف كبير وصغير ورقم ورمز' : 'Upper- and lower-case, a digit, and a symbol' }}
          </li>
          <li class="flex items-center gap-1.5">
            <UIcon name="i-lucide-circle-dot" class="w-3 h-3 flex-shrink-0" />
            {{ locale === 'ar' ? 'مختلفة عن كلمة المرور الحالية' : 'Different from your current password' }}
          </li>
        </ul>

        <div class="pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <UiAppButton type="submit" variant="primary" icon="i-lucide-save" :loading="password.submitting.value">
            {{ locale === 'ar' ? 'تحديث كلمة المرور' : 'Update Password' }}
          </UiAppButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { passwordChangeDefaults, passwordChangeSchema, type PasswordChangeInput } from '~/features/settings/schemas'
import type { ApiError } from '~/core/api/errors'

definePageMeta({ layout: 'dashboard' })

const { locale } = useI18n()
const api = useApi()
const toastStore = useToastStore()

const password = useZodForm<PasswordChangeInput>({
  schema: passwordChangeSchema,
  initial: { ...passwordChangeDefaults },
})

async function changePassword() {
  const result = await password.handleSubmit(async (data) => {
    await api.put('/settings/security/password', data)
  })
  if (result.ok) {
    toastStore.success(locale.value === 'ar' ? 'تم تحديث كلمة المرور' : 'Password updated')
    password.reset()
  } else if ('error' in result && result.error) {
    const err = result.error as ApiError
    password.applyApiErrors(err)
    toastStore.error(err.message || 'Error')
  }
}
</script>

<style scoped>
@reference "~/assets/css/tokens.css";

.sec-label { @apply block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5; }
.sec-error { @apply mt-1 text-xs text-danger-600 dark:text-danger-500; }

.sec-input {
  width: 100%;
  padding-inline: 0.75rem;
  height: 2.25rem;
  font-size: 0.875rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-neutral-200);
  background-color: var(--color-neutral-0, #fff);
  color: var(--color-neutral-900);
  outline: none;
  transition: border-color 150ms var(--ease-standard);
  appearance: none;
}
.sec-input:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary-500) 20%, transparent);
}
.sec-input--error { border-color: color-mix(in oklab, var(--color-danger-500) 60%, transparent); }
:global(html.dark) .sec-input {
  background-color: var(--color-neutral-900);
  border-color: var(--color-neutral-800);
  color: var(--color-neutral-0);
}
</style>
