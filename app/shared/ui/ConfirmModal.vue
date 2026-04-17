<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px]" @click="cancel"></div>

        <!-- Modal -->
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.95 }"
          :enter="{ opacity: 1, scale: 1 }"
          class="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
        >
          <div class="text-center">
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
              :class="variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-primary-50 text-primary-500'"
            >
              {{ icon }}
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">{{ title }}</h3>
            <p class="text-sm text-gray-400 mb-6">{{ description }}</p>
          </div>

          <div class="flex gap-3">
            <UiAppButton variant="outline" class="flex-1" @click="cancel">
              {{ $t('common.cancel') }}
            </UiAppButton>
            <UiAppButton
              :variant="variant === 'danger' ? 'danger' : 'primary'"
              class="flex-1"
              :loading="loading"
              @click="$emit('confirm')"
            >
              {{ confirmLabel || $t('common.confirm') }}
            </UiAppButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  title: string
  description?: string
  icon?: string
  variant?: 'default' | 'danger'
  confirmLabel?: string
  loading?: boolean
}>(), {
  icon: '?',
  variant: 'default',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

function cancel() {
  emit('update:modelValue', false)
}
</script>
