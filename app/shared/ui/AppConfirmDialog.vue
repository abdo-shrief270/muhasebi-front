<template>
  <UiAppModal
    :model-value="modelValue"
    :title="title"
    :dismissible="!loading"
    :confirm-label="confirmLabel ?? defaultConfirmLabel"
    :cancel-label="cancelLabel ?? $t('common.cancel')"
    :confirm-color="confirmColor"
    :loading="loading"
    :disabled="!canConfirm"
    @update:model-value="v => emit('update:modelValue', v)"
    @confirm="onConfirm"
  >
    <div class="space-y-3">
      <div v-if="iconName" class="flex items-start gap-3">
        <div
          class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center"
          :class="iconBgClass"
        >
          <UIcon :name="iconName" class="w-5 h-5" :class="iconColorClass" />
        </div>
        <div class="flex-1 min-w-0">
          <p v-if="description" class="text-sm text-neutral-700 dark:text-neutral-300">{{ description }}</p>
          <slot />
        </div>
      </div>

      <div v-else>
        <p v-if="description" class="text-sm text-neutral-700 dark:text-neutral-300">{{ description }}</p>
        <slot />
      </div>

      <div v-if="level === 'medium'" class="pt-2">
        <label class="flex items-start gap-2 cursor-pointer select-none">
          <input
            v-model="acknowledged"
            type="checkbox"
            class="mt-0.5 rounded border-neutral-300 text-danger-500 focus:ring-danger-500"
          />
          <span class="text-sm text-neutral-700 dark:text-neutral-300">
            {{ acknowledgeText ?? $t('confirm.acknowledge', 'I understand this action cannot be undone.') }}
          </span>
        </label>
      </div>

      <div v-else-if="level === 'high'" class="pt-2 space-y-1.5">
        <label class="block text-xs font-medium text-neutral-600 dark:text-neutral-400">
          {{ locale === 'ar' ? `للتأكيد، اكتب` : `To confirm, type` }}
          <code class="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-danger-600 font-mono text-xs">{{ requireText }}</code>
        </label>
        <input
          v-model="typed"
          type="text"
          dir="ltr"
          class="w-full h-9 px-3 rounded-md border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-950 text-sm font-mono focus:ring-2 focus:ring-danger-500 focus:border-danger-500 outline-none"
          :placeholder="requireText"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
    </div>
  </UiAppModal>
</template>

<script setup lang="ts">
// Spec §11.9:
//   low    → plain Confirm/Cancel
//   medium → checkbox 'I understand this will …' gates the confirm
//   high   → user must type the entity identifier exactly
//
// Destructive actions MUST pass confirmColor='error' and an explicit verb
// for confirmLabel (e.g. 'Reverse entry') — not the generic 'Confirm'.
const props = withDefaults(defineProps<{
  modelValue: boolean
  level?: 'low' | 'medium' | 'high'
  title?: string
  description?: string
  /** For level='high': the literal text the user must re-type (e.g. invoice number). */
  requireText?: string
  /** For level='medium': custom acknowledgement wording. */
  acknowledgeText?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'primary' | 'error' | 'warning' | 'success' | 'neutral'
  iconName?: string
  loading?: boolean
}>(), {
  level: 'low',
  confirmColor: 'primary',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
}>()

const { locale } = useI18n()

const acknowledged = ref(false)
const typed        = ref('')

// Reset transient state whenever the dialog opens.
watch(() => props.modelValue, open => {
  if (open) {
    acknowledged.value = false
    typed.value = ''
  }
})

const canConfirm = computed(() => {
  if (props.loading) return false
  if (props.level === 'medium') return acknowledged.value
  if (props.level === 'high') return typed.value === (props.requireText ?? '')
  return true
})

const defaultConfirmLabel = computed(() => {
  if (props.confirmColor === 'error') return locale.value === 'ar' ? 'تنفيذ' : 'Delete'
  return locale.value === 'ar' ? 'تأكيد' : 'Confirm'
})

const iconBgClass = computed(() => {
  switch (props.confirmColor) {
    case 'error':   return 'bg-danger-50 dark:bg-danger-500/10'
    case 'warning': return 'bg-warning-50 dark:bg-warning-500/10'
    case 'success': return 'bg-success-50 dark:bg-success-500/10'
    default:        return 'bg-primary-50 dark:bg-primary-500/10'
  }
})

const iconColorClass = computed(() => {
  switch (props.confirmColor) {
    case 'error':   return 'text-danger-500'
    case 'warning': return 'text-warning-500'
    case 'success': return 'text-success-500'
    default:        return 'text-primary-500'
  }
})

function onConfirm() {
  if (!canConfirm.value) return
  emit('confirm')
}
</script>
