<script setup lang="ts">
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
</script>

<template>
  <div class="min-h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 flex items-center justify-center px-4">
    <!-- Theme toggle — top right -->
    <div class="fixed top-4 right-4">
      <ThemeToggle />
    </div>

    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-10">
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Syncyard</h1>
        <p class="text-zinc-500 text-sm mt-1">Where creatives connect</p>
      </div>

      <!-- Card -->
      <div class="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-8 shadow-sm dark:shadow-none">
        <slot />
      </div>
    </div>
  </div>
</template>
