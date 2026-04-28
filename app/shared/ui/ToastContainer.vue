<template>
  <Teleport to="body">
    <div class="fixed top-4 end-4 z-[9999] flex flex-col gap-3 w-80">
      <TransitionGroup name="fade-slide">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-sm cursor-pointer"
          :class="toastClasses(toast.type)"
          @click="toastStore.remove(toast.id)"
        >
          <span class="text-lg flex-shrink-0 mt-0.5">{{ iconMap[toast.type] }}</span>
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const toastStore = useToastStore()
const toasts = computed(() => toastStore.toasts)

const iconMap: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
}

function toastClasses(type: string) {
  // The body auto-inverts to a dark panel via the global `.dark .bg-white`
  // rule in main.css; the accent text would stay dark and become unreadable,
  // so each type carries an explicit `dark:text-*` override.
  return {
    success: 'bg-white/95 border-emerald-200 text-emerald-800 dark:border-emerald-800 dark:text-emerald-300',
    error:   'bg-white/95 border-red-200 text-red-800 dark:border-red-800 dark:text-red-300',
    info:    'bg-white/95 border-blue-200 text-blue-800 dark:border-blue-800 dark:text-blue-300',
    warning: 'bg-white/95 border-amber-200 text-amber-800 dark:border-amber-800 dark:text-amber-300',
  }[type]
}
</script>
