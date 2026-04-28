<template>
  <div>
    <div
      class="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 transition-colors cursor-pointer group"
      :style="{ paddingInlineStart: `${depth * 24 + 12}px` }"
      @click="$emit('select', node)"
    >
      <button
        v-if="node.children && node.children.length > 0"
        @click.stop="expanded = !expanded"
        class="w-5 h-5 flex items-center justify-center text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-300 transition-transform duration-200"
        :class="{ 'rotate-90': expanded }"
      >
        &#9656;
      </button>
      <span v-else class="w-5"></span>

      <span
        class="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
        :class="node.is_group
          ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-400 dark:text-primary-300'
          : 'bg-neutral-50 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500'"
      >
        {{ node.is_group ? '&#9776;' : '&#9679;' }}
      </span>

      <span class="font-mono text-xs text-neutral-400 dark:text-neutral-500 min-w-[50px]">{{ node.code }}</span>
      <span class="text-sm text-neutral-700 dark:text-neutral-200 flex-1">{{ locale === 'ar' ? node.name_ar : node.name_en }}</span>

      <UiBadge :color="typeColor(node.type)" class="text-[10px]">
        {{ typeLabel(node.type) }}
      </UiBadge>

      <button
        @click.stop="$emit('edit', node)"
        class="opacity-0 group-hover:opacity-100 p-1 text-neutral-300 dark:text-neutral-600 hover:text-primary-500 transition"
      >
        &#9998;
      </button>
    </div>

    <Transition name="fade-slide">
      <div v-if="expanded && node.children && node.children.length > 0">
        <UiTreeNode
          v-for="child in node.children"
          :key="child.id"
          :node="child"
          :depth="depth + 1"
          @select="$emit('select', $event)"
          @edit="$emit('edit', $event)"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Account } from '~/shared/types/accounting'

const { locale } = useI18n()

const props = withDefaults(defineProps<{
  node: Account
  depth?: number
}>(), { depth: 0 })

defineEmits<{
  select: [node: Account]
  edit: [node: Account]
}>()

const expanded = ref(props.depth < 2)

function typeColor(type: string) {
  return ({ asset: 'blue', liability: 'orange', equity: 'purple', revenue: 'green', expense: 'red' } as Record<string, string>)[type] || 'gray'
}

function typeLabel(type: string) {
  if (locale.value === 'ar') {
    return ({ asset: 'أصول', liability: 'خصوم', equity: 'ملكية', revenue: 'إيرادات', expense: 'مصروفات' } as Record<string, string>)[type] || type
  }
  return type
}
</script>
