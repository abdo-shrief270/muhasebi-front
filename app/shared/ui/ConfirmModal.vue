<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-modal flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-neutral-950/50 backdrop-blur-[2px]" @click="cancel"></div>

        <!-- Modal -->
        <div
          v-motion
          :initial="{ opacity: 0, scale: 0.96, y: 8 }"
          :enter="{ opacity: 1, scale: 1, y: 0 }"
          class="relative bg-neutral-0 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-overlay max-w-md w-full p-6"
        >
          <div class="text-center">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
              :class="variant === 'danger' ? 'bg-danger-500/10 text-danger-600 dark:text-danger-400' : 'bg-primary-500/10 text-primary-700 dark:text-primary-300'"
            >
              <UIcon v-if="isLucideIcon" :name="icon" class="w-5 h-5" />
              <span v-else class="text-xl">{{ icon }}</span>
            </div>
            <h3 class="text-base font-bold text-neutral-900 dark:text-neutral-0 mb-1.5">{{ title }}</h3>
            <p v-if="description" class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-5">
              {{ description }}
            </p>
          </div>

          <div class="flex gap-2">
            <UiAppButton variant="outline" size="lg" class="flex-1" @click="cancel">
              {{ $t('common.cancel') }}
            </UiAppButton>
            <UiAppButton
              :variant="variant === 'danger' ? 'danger' : 'primary'"
              size="lg"
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
const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  description?: string
  icon?: string
  variant?: 'default' | 'danger'
  confirmLabel?: string
  loading?: boolean
}>(), {
  icon: 'i-lucide-help-circle',
  variant: 'default',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const isLucideIcon = computed(() => typeof props.icon === 'string' && props.icon.startsWith('i-'))

function cancel() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 200ms var(--ease-standard); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
