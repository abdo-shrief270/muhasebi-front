<template>
  <div>
    <NuxtLayout name="public">
      <div class="max-w-7xl mx-auto px-6 py-12">
        <!-- Header -->
        <div class="text-center mb-12">
          <div class="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
            {{ isAr ? 'المدونة' : 'Blog' }}
          </div>
          <h1 class="text-3xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            {{ isAr ? 'أحدث المقالات والأخبار' : 'Latest Articles & News' }}
          </h1>
          <p class="text-lg text-gray-400 max-w-2xl mx-auto">
            {{ isAr ? 'نصائح محاسبية، تحديثات ضريبية، وكل ما يهم مكاتب المحاسبة المصرية' : 'Accounting tips, tax updates, and everything Egyptian accounting firms need' }}
          </p>
        </div>

        <!-- Categories -->
        <div v-if="categories.length" class="flex flex-wrap items-center justify-center gap-2 mb-10">
          <button
            @click="selectedCategory = ''"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            :class="!selectedCategory ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
          >
            {{ isAr ? 'الكل' : 'All' }}
          </button>
          <button
            v-for="cat in categories"
            :key="cat.slug"
            @click="selectedCategory = cat.slug"
            class="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            :class="selectedCategory === cat.slug ? 'bg-primary-500 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
          >
            {{ isAr ? cat.name.ar : cat.name.en }}
            <span v-if="cat.posts_count" class="text-xs opacity-60 ms-1">({{ cat.posts_count }})</span>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="space-y-3">
            <UiLoadingSkeleton :lines="1" :height="200" />
            <UiLoadingSkeleton :lines="2" :height="16" />
          </div>
        </div>

        <!-- Posts grid -->
        <div v-else-if="posts.length" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NuxtLink
            v-for="post in posts"
            :key="post.id"
            :to="`/blog/${post.slug}`"
            class="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 hover:border-gray-200 transition-all duration-300 hover:-translate-y-1"
          >
            <!-- Cover image placeholder -->
            <div class="h-48 bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center relative overflow-hidden">
              <img v-if="post.cover_image" :src="post.cover_image" :alt="isAr ? post.title.ar : post.title.en" class="w-full h-full object-cover" />
              <div v-else class="text-4xl opacity-20">
                <svg class="w-16 h-16 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
              </div>
              <!-- Category badge -->
              <span v-if="post.category" class="absolute top-3 start-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1 rounded-full text-primary-600">
                {{ isAr ? post.category.name.ar : post.category.name.en }}
              </span>
            </div>

            <div class="p-5">
              <div class="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span v-if="post.published_at">{{ formatDate(post.published_at) }}</span>
                <span>{{ post.reading_time }} {{ isAr ? 'دقائق قراءة' : 'min read' }}</span>
              </div>
              <h3 class="font-bold text-gray-800 mb-2 group-hover:text-primary-500 transition-colors line-clamp-2">
                {{ isAr ? post.title.ar : post.title.en }}
              </h3>
              <p class="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                {{ isAr ? post.excerpt.ar : post.excerpt.en }}
              </p>
            </div>
          </NuxtLink>
        </div>

        <!-- Empty state -->
        <div v-else class="py-16 text-center">
          <UiEmptyState :message="isAr ? 'لا توجد مقالات بعد' : 'No articles yet'" />
        </div>

        <!-- Pagination -->
        <div v-if="meta.last_page > 1" class="flex justify-center gap-2 mt-12">
          <button
            v-for="p in meta.last_page" :key="p"
            @click="currentPage = p; loadPosts()"
            class="w-10 h-10 rounded-xl text-sm font-medium transition-colors"
            :class="p === meta.current_page ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
          >{{ p }}</button>
        </div>
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import type { BlogPost, BlogCategory } from '~/features/blog/composables/useBlog'

definePageMeta({ layout: false })

const { locale } = useI18n()
const { getPosts, getCategories } = useBlog()

const isAr = computed(() => locale.value === 'ar')
const posts = ref<BlogPost[]>([])
const categories = ref<BlogCategory[]>([])
const meta = ref({ current_page: 1, last_page: 1, total: 0 })
const loading = ref(true)
const currentPage = ref(1)
const selectedCategory = ref('')

async function loadPosts() {
  loading.value = true
  try {
    const res = await getPosts({ page: currentPage.value, category: selectedCategory.value || undefined })
    posts.value = res.data
    meta.value = res.meta
  } catch { posts.value = [] }
  finally { loading.value = false }
}

watch(selectedCategory, () => { currentPage.value = 1; loadPosts() })

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(isAr.value ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

useHead({ title: computed(() => isAr.value ? 'المدونة - محاسبي' : 'Blog - Muhasebi') })

onMounted(async () => {
  const [_, cats] = await Promise.all([loadPosts(), getCategories()])
  categories.value = cats
})
</script>
