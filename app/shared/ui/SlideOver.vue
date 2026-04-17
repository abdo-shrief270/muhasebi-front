<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex"
        :class="locale === 'ar' ? 'justify-start' : 'justify-end'"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          @click="$emit('update:modelValue', false)"
        ></div>

        <!-- Panel -->
        <Transition :name="locale === 'ar' ? 'slide-right' : 'slide-left'">
          <div
            v-if="modelValue"
            class="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 class="text-lg font-bold text-gray-800">{{ title }}</h2>
              <button
                @click="$emit('update:modelValue', false)"
                class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition"
              >
                &#10005;
              </button>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto px-6 py-5">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const { locale } = useI18n()

defineProps<{
  modelValue: boolean
  title: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(100%);
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(-100%);
}
</style>
