<template>
  <USlideover
    :open="modelValue"
    :title="title"
    :description="description"
    :side="resolvedSide"
    :dismissible="dismissible"
    :ui="{ content: widthClass }"
    @update:open="v => emit('update:modelValue', v)"
    @after:leave="emit('after:leave')"
  >
    <template v-if="title" #header>
      <div class="flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <div class="min-w-0 flex-1">
          <h2 class="text-base font-semibold text-neutral-900 dark:text-neutral-0 truncate">{{ title }}</h2>
          <p v-if="description" class="text-xs text-neutral-500 truncate mt-0.5">{{ description }}</p>
        </div>
        <button
          v-if="dismissible"
          type="button"
          class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          :aria-label="$t('common.close')"
          @click="emit('update:modelValue', false)"
        >
          <UIcon name="i-lucide-x" class="w-4 h-4" />
        </button>
      </div>
    </template>

    <template #body>
      <div class="px-4 py-4 flex-1 overflow-y-auto">
        <slot />
      </div>
    </template>

    <template v-if="$slots.footer" #footer>
      <div class="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-950">
        <slot name="footer" />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
// Per spec §11.1: slide-overs enter from the *end* edge. In LTR that's
// physical 'right'; in RTL that's physical 'left'. Consumers can override
// with explicit `side` when the entity truly needs to come from start
// (mobile sidebar drawer).
const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  description?: string
  width?: 'sm' | 'md' | 'lg' | 'xl'
  side?: 'start' | 'end' | 'left' | 'right' | 'top' | 'bottom'
  dismissible?: boolean
}>(), {
  width: 'md',
  side: 'end',
  dismissible: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'after:leave': []
}>()

const { isRtl } = useDir()

const resolvedSide = computed(() => {
  // Logical side → physical side based on document direction.
  if (props.side === 'end')   return isRtl.value ? 'left' : 'right'
  if (props.side === 'start') return isRtl.value ? 'right' : 'left'
  return props.side
})

const widthClass = computed(() => ({
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-4xl',
}[props.width]))
</script>
