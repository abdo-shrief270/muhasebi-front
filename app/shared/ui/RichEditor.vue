<template>
  <div class="rich-editor" :dir="dir">
    <!-- Toolbar -->
    <div v-if="editor" class="flex flex-wrap items-center gap-1 p-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-t-xl border-b-0">
      <!-- Text formatting -->
      <button
        v-for="btn in formatButtons"
        :key="btn.action"
        @click="btn.command()"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
        :class="btn.isActive?.() ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-300' : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-200'"
        :title="btn.title"
      >
        <span v-html="btn.icon"></span>
      </button>

      <div class="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1"></div>

      <!-- Heading -->
      <select
        @change="setHeading($event)"
        class="h-8 px-2 text-xs bg-neutral-0 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-600 dark:text-neutral-300 cursor-pointer"
      >
        <option value="p">{{ dir === 'rtl' ? 'نص عادي' : 'Paragraph' }}</option>
        <option value="2" :selected="editor.isActive('heading', { level: 2 })">H2</option>
        <option value="3" :selected="editor.isActive('heading', { level: 3 })">H3</option>
        <option value="4" :selected="editor.isActive('heading', { level: 4 })">H4</option>
      </select>

      <div class="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1"></div>

      <!-- Lists -->
      <button
        @click="editor.chain().focus().toggleBulletList().run()"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
        :class="editor.isActive('bulletList') ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-300' : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-200'"
        title="Bullet List"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
      </button>
      <button
        @click="editor.chain().focus().toggleOrderedList().run()"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
        :class="editor.isActive('orderedList') ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-300' : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-200'"
        title="Ordered List"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 6h13M8 12h13M8 18h13M3.5 6h0M3.5 12h0M3.5 18h0" /></svg>
      </button>

      <div class="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1"></div>

      <!-- Alignment -->
      <button
        v-for="align in ['left', 'center', 'right']"
        :key="align"
        @click="editor.chain().focus().setTextAlign(align).run()"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
        :class="editor.isActive({ textAlign: align }) ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-300' : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-200'"
      >
        <svg v-if="align === 'left'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M3 12h10M3 18h14" /></svg>
        <svg v-else-if="align === 'center'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M7 12h10M5 18h14" /></svg>
        <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6h18M11 12h10M7 18h14" /></svg>
      </button>

      <div class="w-px h-6 bg-neutral-200 dark:bg-neutral-700 mx-1"></div>

      <!-- Link -->
      <button
        @click="addLink"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors"
        :class="editor.isActive('link') ? 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-300' : 'text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-200'"
        title="Link"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-1.135a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364l1.757 1.757" /></svg>
      </button>

      <!-- Horizontal Rule -->
      <button
        @click="editor.chain().focus().setHorizontalRule().run()"
        class="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-200 text-sm transition-colors"
        title="Divider"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" /></svg>
      </button>

      <!-- Undo/Redo -->
      <div class="flex-1"></div>
      <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().undo()" class="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-200 disabled:opacity-30 text-sm transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
      </button>
      <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().redo()" class="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 dark:text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:text-neutral-600 dark:hover:text-neutral-200 disabled:opacity-30 text-sm transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" /></svg>
      </button>
    </div>

    <!-- Editor Content -->
    <EditorContent
      :editor="editor"
      class="prose prose-sm dark:prose-invert max-w-none border border-neutral-200 dark:border-neutral-800 bg-neutral-0 dark:bg-neutral-900 rounded-b-xl px-4 py-3 min-h-[300px] focus-within:border-primary-300 focus-within:ring-1 focus-within:ring-primary-100 transition-colors"
      :class="dir === 'rtl' ? 'prose-rtl' : ''"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'

const props = withDefaults(defineProps<{
  modelValue: string
  dir?: 'ltr' | 'rtl'
  placeholder?: string
}>(), {
  dir: 'ltr',
  placeholder: 'Write content here...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary-500 underline' } }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: props.placeholder }),
  ],
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  },
})

// Sync external changes
watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})

const formatButtons = computed(() => {
  if (!editor.value) return []
  const e = editor.value
  return [
    { action: 'bold', title: 'Bold', icon: '<strong class="text-base">B</strong>', command: () => e.chain().focus().toggleBold().run(), isActive: () => e.isActive('bold') },
    { action: 'italic', title: 'Italic', icon: '<em class="text-base">I</em>', command: () => e.chain().focus().toggleItalic().run(), isActive: () => e.isActive('italic') },
    { action: 'underline', title: 'Underline', icon: '<u class="text-base">U</u>', command: () => e.chain().focus().toggleUnderline().run(), isActive: () => e.isActive('underline') },
    { action: 'strike', title: 'Strikethrough', icon: '<s class="text-base">S</s>', command: () => e.chain().focus().toggleStrike().run(), isActive: () => e.isActive('strike') },
  ]
})

function setHeading(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  if (value === 'p') {
    editor.value?.chain().focus().setParagraph().run()
  } else {
    editor.value?.chain().focus().toggleHeading({ level: Number(value) as 2 | 3 | 4 }).run()
  }
}

function addLink() {
  if (!editor.value) return
  if (editor.value.isActive('link')) {
    editor.value.chain().focus().unsetLink().run()
    return
  }
  const url = window.prompt('URL:')
  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
}
</script>

<style>
.ProseMirror {
  outline: none;
  min-height: 250px;
}
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}
[dir="rtl"] .ProseMirror p.is-editor-empty:first-child::before {
  float: right;
}
</style>
