<script setup lang="ts">
import { useScrollReveal } from '@/composables/useScrollReveal'
import AppButton from '@/components/ui/AppButton.vue'

const { elementRef, isVisible } = useScrollReveal()
</script>

<template>
  <section
    ref="elementRef"
    :class="[
      'py-8 px-4 transition-all duration-700 ease-out',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
    ]"
  >
    <div class="max-w-6xl mx-auto">
      <div class="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-8 py-16 text-center shadow-sm dark:shadow-none">
        <div
          class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-15 pointer-events-none"
          style="background: radial-gradient(ellipse at center top, #636b2f 0%, transparent 70%)"
        />

        <div class="relative z-10">
          <p class="text-xs font-medium text-olive-400 uppercase tracking-widest mb-4">Get started today</p>
          <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-4">
            Ready to sync?
          </h2>
          <p class="text-zinc-400 text-lg max-w-md mx-auto mb-10">
            Your next collaboration is one profile away.
          </p>
          <RouterLink to="/signup">
            <AppButton size="lg" class="px-10 text-base">Create your profile</AppButton>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
