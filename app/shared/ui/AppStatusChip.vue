<template>
  <UBadge
    :color="visual.color === 'danger' ? 'error' : visual.color"
    :variant="variant"
    size="sm"
    class="inline-flex items-center gap-1 font-medium whitespace-nowrap"
  >
    <UIcon v-if="!hideIcon" :name="visual.icon" class="w-3 h-3" />
    <span>{{ label }}</span>
  </UBadge>
</template>

<script setup lang="ts">
import { resolveStatus, type StatusVisual } from '~/utils/status-icons'

const props = withDefaults(defineProps<{
  value?: string | null
  /**
   * Entity domain for this status (e.g. 'invoice', 'bill', 'payment',
   * 'journal_entry'). Used to select a translation namespace so the same
   * raw value ('posted') reads correctly in each context.
   */
  kind?: string
  /** Optional literal label override — bypasses i18n lookup. */
  labelOverride?: string
  hideIcon?: boolean
  variant?: 'soft' | 'solid' | 'outline' | 'subtle'
}>(), {
  variant: 'soft',
  hideIcon: false,
  kind: 'status',
})

const { t, te } = useI18n()

const visual = computed<StatusVisual>(() => resolveStatus(props.value))

const label = computed(() => {
  if (props.labelOverride) return props.labelOverride
  if (!props.value) return t('common.status')

  const raw = props.value.toLowerCase()
  const kindKey = `status.${props.kind}.${raw}`
  if (te(kindKey)) return t(kindKey)

  const generic = `status.common.${raw}`
  if (te(generic)) return t(generic)

  // Last-resort: capitalized raw value.
  return raw.charAt(0).toUpperCase() + raw.slice(1)
})
</script>
