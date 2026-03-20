<script setup lang="ts">
const TAGS = [
  'Motion Design', 'Copywriting', 'Music Production', 'Photography', 'UI Design',
  'Illustration', 'Filmmaking', 'Branding', 'Typography', '3D Art',
  'Web Dev', 'Sound Design', 'Animation', 'Ceramics', 'Content Strategy',
  'Art Direction', 'Painting', 'Fashion Design', 'Video Editing', 'Concept Art',
]

const doubled = [...TAGS, ...TAGS]
</script>

<template>
  <section class="py-16 overflow-hidden">
    <p class="text-center text-xs font-medium text-zinc-400 dark:text-zinc-600 uppercase tracking-widest mb-8">
      Skills on Syncyard
    </p>

    <div
      class="relative"
      style="mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
             -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);"
    >
      <div class="animate-scroll-tags flex gap-3 py-1">
        <span
          v-for="(tag, i) in doubled"
          :key="i"
          class="inline-flex shrink-0 items-center px-3.5 py-1.5 rounded-full text-sm font-medium
                 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800
                 text-zinc-600 dark:text-zinc-400 select-none"
        >
          {{ tag }}
        </span>
      </div>
    </div>
  </section>
</template>
