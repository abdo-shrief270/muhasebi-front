<template>
  <UModal
    :open="modelValue"
    :title="title"
    :description="description"
    :dismissible="dismissible"
    :fullscreen="fullscreen"
    :scrollable="scrollable"
    @update:open="v => emit('update:modelValue', v)"
    @after:leave="emit('after:leave')"
  >
    <template v-if="$slots.trigger" #default>
      <slot name="trigger" />
    </template>

    <template #body>
      <slot />
    </template>

    <template v-if="$slots.footer || showDefaultFooter" #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <slot name="footer">
          <UButton
            color="neutral"
            variant="ghost"
            size="sm"
            @click="emit('update:modelValue', false)"
          >
            {{ cancelLabel ?? $t('common.cancel') }}
          </UButton>
          <UButton
            :color="confirmColor"
            size="sm"
            :loading="loading"
            :disabled="disabled"
            @click="emit('confirm')"
          >
            {{ confirmLabel ?? $t('common.confirm') }}
          </UButton>
        </slot>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
// Spec §11.1: close-on-esc, focus trap, RTL flip are inherited from UModal.
// Dismissible controls esc + backdrop click; default true for low-risk modals,
// pass false when the only exit should be through an explicit action.
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  description?: string
  dismissible?: boolean
  fullscreen?: boolean
  scrollable?: boolean
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'primary' | 'error' | 'warning' | 'success' | 'neutral'
  loading?: boolean
  disabled?: boolean
  showDefaultFooter?: boolean
}>(), {
  dismissible: true,
  fullscreen: false,
  scrollable: false,
  confirmColor: 'primary',
  loading: false,
  disabled: false,
  showDefaultFooter: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'after:leave': []
}>()

// Mark props as used for strict eslint config.
void props
</script>
