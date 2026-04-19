<template>
  <div class="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
    <header class="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-950 sticky top-0 z-20">
      <div class="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img v-if="tenantLogo" :src="tenantLogo" alt="" class="w-8 h-8 rounded-lg object-cover" />
          <div
            v-else
            class="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white"
            :style="{ backgroundColor: primaryColor }"
          >
            {{ tenantName ? tenantName.charAt(0).toUpperCase() : 'M' }}
          </div>
          <span class="text-base font-semibold">{{ $t('app.name') }}</span>
        </div>

        <NuxtLink
          to="/dashboard"
          class="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
        >
          {{ locale === 'ar' ? 'حفظ والخروج' : 'Save and exit' }}
        </NuxtLink>
      </div>

      <div v-if="steps.length" class="max-w-screen-xl mx-auto px-6 pb-4">
        <ol class="flex items-center gap-2">
          <li v-for="(step, idx) in steps" :key="step.id" class="flex-1 flex items-center gap-2">
            <div
              class="flex items-center gap-2 flex-1 min-w-0"
              :class="{ 'opacity-60': idx > currentIndex && !step.completed }"
            >
              <div
                class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                :class="[
                  step.completed
                    ? 'bg-success-500 text-white'
                    : idx === currentIndex
                      ? 'bg-primary-500 text-white'
                      : 'bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
                ]"
              >
                <UIcon v-if="step.completed" name="i-lucide-check" class="w-3 h-3" />
                <span v-else>{{ idx + 1 }}</span>
              </div>
              <span
                class="text-xs font-medium truncate"
                :class="idx === currentIndex ? 'text-neutral-900 dark:text-neutral-0' : 'text-neutral-500'"
              >
                {{ step.label }}
              </span>
            </div>
            <div
              v-if="idx < steps.length - 1"
              class="h-px flex-shrink-0 w-8"
              :class="step.completed ? 'bg-success-500' : 'bg-neutral-200 dark:bg-neutral-800'"
            />
          </li>
        </ol>
      </div>
    </header>

    <main class="flex-1 w-full max-w-screen-xl mx-auto px-6 py-8">
      <slot />
    </main>

    <footer v-if="steps.length" class="border-t border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-950 sticky bottom-0 z-20">
      <div class="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
        <button
          type="button"
          class="px-4 h-9 rounded-md text-sm text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="currentIndex === 0"
          @click="goBack"
        >
          {{ $t('common.back') }}
        </button>
        <button
          type="button"
          class="px-5 h-9 rounded-md text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          :disabled="!canProceed"
          @click="goNext"
        >
          {{ currentIndex === steps.length - 1 ? $t('common.submit') : $t('common.next') }}
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const { tenantName, tenantLogo, primaryColor } = useTenantTheme()
const { state, goBack, goNext } = useOnboardingWizard()

const steps = computed(() => state.value.steps)
const currentIndex = computed(() => state.value.currentIndex)
const canProceed = computed(() => state.value.canProceed)
</script>
