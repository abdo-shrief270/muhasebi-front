<template>
  <div
    class="border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer"
    :class="isDragging ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200 hover:border-gray-300 bg-gray-50/30'"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
    @click="$refs.fileInput.click()"
  >
    <input
      ref="fileInput"
      type="file"
      :multiple="multiple"
      :accept="accept"
      class="hidden"
      @change="handleSelect"
    />

    <div v-if="!uploading">
      <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl text-gray-300">
        &#8593;
      </div>
      <p class="text-sm font-medium text-gray-600 mb-1">
        {{ locale === 'ar' ? 'اسحب الملفات هنا أو انقر للتحميل' : 'Drag files here or click to upload' }}
      </p>
      <p class="text-xs text-gray-400">
        {{ locale === 'ar' ? 'الحد الأقصى 20 ميجابايت' : 'Max 20MB per file' }}
      </p>
    </div>

    <div v-else class="flex items-center justify-center gap-3">
      <span class="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></span>
      <span class="text-sm text-primary-500 font-medium">{{ locale === 'ar' ? 'جارٍ التحميل...' : 'Uploading...' }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()

defineProps<{
  multiple?: boolean
  accept?: string
  uploading?: boolean
}>()

const emit = defineEmits<{
  files: [files: File[]]
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement>()

function handleDrop(e: DragEvent) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length) emit('files', files)
}

function handleSelect(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  if (files.length) emit('files', files)
  input.value = ''
}
</script>
