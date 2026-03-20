<script setup lang="ts">
import AppButton from '@/components/ui/AppButton.vue'

function scrollToHowItWorks() {
  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <section
    id="hero"
    class="relative min-h-screen flex items-center justify-center px-4 pt-16 overflow-hidden"
  >
    <!-- Radial glow -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[700px] rounded-full opacity-20"
        style="background: radial-gradient(ellipse at center, #7c3aed 0%, transparent 70%)"
      />
      <div
        class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full opacity-10"
        style="background: radial-gradient(ellipse at center, #a855f7 0%, transparent 70%)"
      />
    </div>

    <!-- Subtle grid -->
    <div
      class="absolute inset-0 opacity-[0.025] pointer-events-none"
      style="
        background-image: linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px);
        background-size: 72px 72px;
      "
    />

    <!-- Content -->
    <div class="relative z-10 text-center max-w-4xl mx-auto">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 bg-violet-950/60 border border-violet-700/40 rounded-full px-4 py-1.5 mb-8">
        <span class="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
        <span class="text-violet-300 text-sm font-medium">Now in early access</span>
      </div>

      <!-- Headline -->
      <h1
        class="text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-100 leading-[1.08] tracking-tight mb-6"
      >
        Where creatives<br />
        <span
          class="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent"
        >
          sync.
        </span>
      </h1>

      <!-- Subheadline -->
      <p class="text-zinc-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
        Syncyard brings together artists, designers, musicians, and makers — so the right people
        find each other and great work actually happens.
      </p>

      <!-- CTAs -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <RouterLink to="/signup">
          <AppButton size="lg" class="px-8 text-base">Get started — it's free</AppButton>
        </RouterLink>
        <button
          class="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm transition-colors"
          @click="scrollToHowItWorks"
        >
          See how it works
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <!-- Scroll hint -->
      <div class="mt-20 flex justify-center">
        <div class="flex flex-col items-center gap-2 opacity-30">
          <div class="h-10 w-6 rounded-full border border-zinc-600 flex items-start justify-center pt-1.5">
            <div class="h-2 w-0.5 bg-zinc-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
