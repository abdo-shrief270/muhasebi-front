<template>
  <UPopover :ui="{ content: 'p-0' }">
    <button
      type="button"
      class="h-7 px-2 rounded-md text-[11px] text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 inline-flex items-center gap-1"
      :title="$t('common.columns', 'Columns')"
    >
      <UIcon name="i-lucide-columns-3" class="w-3.5 h-3.5" />
      {{ $t('common.columns', 'Columns') }}
    </button>
    <template #content>
      <div class="w-56 p-2">
        <p class="text-[11px] font-semibold text-neutral-400 uppercase px-2 pb-1">
          {{ $t('common.columns', 'Columns') }}
        </p>
        <ul class="max-h-72 overflow-y-auto">
          <li
            v-for="col in columns"
            :key="col.key"
            class="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
            @click="toggle(col.key)"
          >
            <input
              type="checkbox"
              class="rounded border-neutral-300 text-primary-500"
              :checked="visible.includes(col.key)"
              :aria-label="col.label"
              @click.stop
              @change="toggle(col.key)"
            />
            <span class="text-xs flex-1">{{ col.label }}</span>
          </li>
        </ul>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { ColumnDef } from '~/shared/ui/table-types'

const props = defineProps<{
  columns: ColumnDef[]
  visible: string[]
}>()

const emit = defineEmits<{
  'update:visible': [keys: string[]]
}>()

function toggle(key: string) {
  const set = new Set(props.visible)
  if (set.has(key)) set.delete(key)
  else set.add(key)
  emit('update:visible', props.columns.map(c => c.key).filter(k => set.has(k)))
}
</script>
