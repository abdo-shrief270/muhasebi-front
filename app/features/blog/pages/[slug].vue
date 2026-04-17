<template>
  <div>
    <NuxtLayout name="public">
      <div class="max-w-4xl mx-auto px-6 py-12">
        <div v-if="loading" class="space-y-4">
          <UiLoadingSkeleton :lines="1" :height="40" />
          <UiLoadingSkeleton :lines="1" :height="20" />
          <UiLoadingSkeleton :lines="10" :height="16" />
        </div>

        <div v-else-if="post">
          <!-- Back link -->
          <NuxtLink to="/blog" class="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary-500 transition-colors mb-8">
            <svg class="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            {{ isAr ? 'العودة للمدونة' : 'Back to Blog' }}
          </NuxtLink>

          <!-- Category -->
          <div v-if="post.category" class="mb-4">
            <NuxtLink :to="`/blog?category=${post.category.slug}`" class="inline-flex items-center gap-1 bg-primary-50 text-primary-600 text-xs font-bold px-3 py-1 rounded-full hover:bg-primary-100 transition-colors">
              {{ isAr ? post.category.name.ar : post.category.name.en }}
            </NuxtLink>
          </div>

          <!-- Title -->
          <h1 class="text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {{ isAr ? post.title.ar : post.title.en }}
          </h1>

          <!-- Meta -->
          <div class="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-gray-100">
            <span v-if="post.author_name" class="flex items-center gap-1.5">
              <div class="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-600">{{ post.author_name.charAt(0) }}</div>
              {{ post.author_name }}
            </span>
            <span v-if="post.published_at">{{ formatDate(post.published_at) }}</span>
            <span>{{ post.reading_time }} {{ isAr ? 'دقائق قراءة' : 'min read' }}</span>
            <span>{{ post.views_count.toLocaleString() }} {{ isAr ? 'مشاهدة' : 'views' }}</span>
          </div>

          <!-- Cover image -->
          <div v-if="post.cover_image" class="mb-10 rounded-2xl overflow-hidden">
            <img :src="post.cover_image" :alt="isAr ? post.title.ar : post.title.en" class="w-full h-auto" />
          </div>

          <!-- Content -->
          <article
            class="prose prose-lg prose-gray max-w-none prose-headings:font-bold prose-a:text-primary-500 prose-img:rounded-xl"
            :class="isAr ? 'prose-rtl' : ''"
            v-html="isAr ? post.content.ar : post.content.en"
          ></article>

          <!-- Tags -->
          <div v-if="post.tags?.length" class="mt-10 pt-8 border-t border-gray-100">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-semibold text-gray-500 me-2">{{ isAr ? 'الوسوم:' : 'Tags:' }}</span>
              <NuxtLink
                v-for="tag in post.tags"
                :key="tag.slug"
                :to="`/blog?tag=${tag.slug}`"
                class="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                #{{ isAr ? tag.name.ar : tag.name.en }}
              </NuxtLink>
            </div>
          </div>

          <!-- Share / CTA -->
          <div class="mt-10 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl p-8 text-center">
            <h3 class="text-lg font-bold text-gray-800 mb-2">
              {{ isAr ? 'هل أعجبك هذا المقال؟' : 'Enjoyed this article?' }}
            </h3>
            <p class="text-sm text-gray-500 mb-5">
              {{ isAr ? 'جرب محاسبي مجاناً واكتشف كيف نساعد مكاتب المحاسبة المصرية.' : 'Try Muhasebi for free and discover how we help Egyptian accounting firms.' }}
            </p>
            <NuxtLink to="/auth/register" class="inline-flex bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all">
              {{ isAr ? 'ابدأ مجاناً' : 'Start Free Trial' }}
            </NuxtLink>
          </div>
        </div>

        <!-- Not found -->
        <div v-else class="py-16 text-center">
          <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ isAr ? 'المقال غير موجود' : 'Article not found' }}</h2>
          <NuxtLink to="/blog" class="text-primary-500 text-sm hover:underline">{{ isAr ? 'العودة للمدونة' : 'Back to Blog' }}</NuxtLink>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost } from '~/features/blog/composables/useBlog'

definePageMeta({ layout: false })

const { locale } = useI18n()
const route = useRoute()
const { getPost } = useBlog()

const isAr = computed(() => locale.value === 'ar')
const post = ref<BlogPost | null>(null)
const loading = ref(true)

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(isAr.value ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

useHead({
  title: computed(() => {
    const title = post.value ? (isAr.value ? post.value.title.ar : post.value.title.en) : ''
    return title ? `${title} - ${isAr.value ? 'محاسبي' : 'Muhasebi'}` : (isAr.value ? 'المدونة - محاسبي' : 'Blog - Muhasebi')
  }),
  meta: computed(() => [
    { name: 'description', content: post.value?.meta_description?.[isAr.value ? 'ar' : 'en'] || '' },
  ]),
})

onMounted(async () => {
  try { post.value = await getPost(route.params.slug as string) } catch {}
  finally { loading.value = false }
})
</script>
