<template>
  <div>
    <NuxtLayout name="public">
      <div class="max-w-3xl mx-auto px-6 py-12">
        <div v-if="loading" class="space-y-4">
          <UiLoadingSkeleton :lines="1" :height="40" />
          <UiLoadingSkeleton :lines="8" :height="16" />
        </div>

        <article v-else>
          <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
            {{ pageTitle }}
          </h1>
          <p v-if="page?.updated_at" class="text-sm text-gray-400 mb-8">
            {{ locale === 'ar' ? 'آخر تحديث:' : 'Last updated:' }}
            {{ new Date(page.updated_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
          </p>
          <div
            class="prose prose-gray max-w-none prose-headings:font-bold prose-a:text-primary-500"
            :class="locale === 'ar' ? 'prose-rtl' : ''"
            v-html="pageContent"
          ></div>

          <div v-if="!page" class="text-gray-500 leading-relaxed space-y-6">
            <p>{{ locale === 'ar' ? 'محتوى هذه الصفحة سيتم إضافته قريباً من لوحة الإدارة.' : 'This page content will be added soon from the admin panel.' }}</p>
          </div>
        </article>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const { locale } = useI18n()
const { getPage } = usePages()

const page = ref<any>(null)
const loading = ref(true)

const pageTitle = computed(() => {
  if (page.value?.title) return locale.value === 'ar' ? page.value.title.ar : page.value.title.en
  return locale.value === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'
})

const pageContent = computed(() => {
  if (page.value?.content) return locale.value === 'ar' ? page.value.content.ar : page.value.content.en
  return ''
})

useHead({
  title: computed(() => `${pageTitle.value} - ${locale.value === 'ar' ? 'محاسبي' : 'Muhasebi'}`),
})

onMounted(async () => {
  try { page.value = await getPage('privacy') } catch {}
  finally { loading.value = false }
})
</script>
