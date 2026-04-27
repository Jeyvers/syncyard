<script setup lang="ts">
import AppNavbar from '@/components/ui/AppNavbar.vue'
</script>

<template>
  <div class="min-h-screen bg-earth-100 dark:bg-earth-900 text-earth-900 dark:text-earth-100 transition-colors duration-200">
    <AppNavbar />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <slot />
    </main>
  </div>
</template>
