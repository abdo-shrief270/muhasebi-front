<template>
  <div v-if="password" class="space-y-1">
    <div class="flex items-center gap-2">
      <div class="flex-1 flex gap-1">
        <span
          v-for="i in 5"
          :key="i"
          class="h-1 flex-1 rounded-full transition-colors"
          :class="i <= score ? barColor : 'bg-neutral-200 dark:bg-neutral-800'"
        />
      </div>
      <span class="text-[10px] font-medium uppercase tracking-wider" :class="textColor">
        {{ label }}
      </span>
    </div>
    <ul class="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-1.5">
      <li
        v-for="rule in rules"
        :key="rule.id"
        class="flex items-center gap-1.5 text-[11px] transition-colors"
        :class="rule.met ? 'text-success-600 dark:text-success-500' : 'text-neutral-400 dark:text-neutral-500'"
      >
        <UIcon
          :name="rule.met ? 'i-lucide-check-circle-2' : 'i-lucide-circle'"
          class="w-3 h-3 flex-shrink-0"
        />
        <span>{{ rule.label }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ password: string }>()
const { locale } = useI18n()

const rules = computed(() => {
  const p = props.password
  const ar = locale.value === 'ar'
  return [
    { id: 'len',    met: p.length >= 10,                  label: ar ? '10 أحرف على الأقل'      : 'At least 10 characters' },
    { id: 'upper',  met: /[A-Z]/.test(p),                 label: ar ? 'حرف كبير (A-Z)'         : 'Uppercase letter (A-Z)' },
    { id: 'lower',  met: /[a-z]/.test(p),                 label: ar ? 'حرف صغير (a-z)'         : 'Lowercase letter (a-z)' },
    { id: 'digit',  met: /\d/.test(p),                    label: ar ? 'رقم (0-9)'              : 'Number (0-9)' },
    { id: 'symbol', met: /[^A-Za-z0-9]/.test(p),          label: ar ? 'رمز (!@#…)'             : 'Symbol (!@#…)' },
  ]
})

const score = computed(() => rules.value.filter(r => r.met).length)

const barColor = computed(() => {
  if (score.value <= 1) return 'bg-danger-500'
  if (score.value === 2) return 'bg-danger-500'
  if (score.value === 3) return 'bg-warning-500'
  if (score.value === 4) return 'bg-info-500'
  return 'bg-success-500'
})

const textColor = computed(() => {
  if (score.value <= 2) return 'text-danger-600 dark:text-danger-500'
  if (score.value === 3) return 'text-warning-600 dark:text-warning-500'
  if (score.value === 4) return 'text-info-600 dark:text-info-500'
  return 'text-success-600 dark:text-success-500'
})

const label = computed(() => {
  const ar = locale.value === 'ar'
  const arLabels = ['', 'ضعيفة جداً', 'ضعيفة', 'متوسطة', 'جيدة', 'قوية']
  const enLabels = ['', 'Very weak',  'Weak',   'Fair',  'Good', 'Strong']
  return (ar ? arLabels : enLabels)[score.value]
})
</script>
