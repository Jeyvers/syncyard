<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section id="hero" class="relative overflow-hidden bg-[#f5f5f2] pt-28 pb-20 px-4">
    <!-- Squiggle left -->
    <div class="absolute left-8 top-1/2 -translate-y-8 hidden lg:block pointer-events-none">
      <svg width="120" height="44" viewBox="0 0 120 44" fill="none">
        <path
          d="M0,14 C10,4 20,24 30,14 C40,4 50,24 60,14 C70,4 80,24 90,14 C100,4 110,24 120,14"
          stroke="#9aa374" stroke-width="2" stroke-linecap="round" fill="none"
        />
        <path
          d="M0,28 C10,18 20,38 30,28 C40,18 50,38 60,28 C70,18 80,38 90,28 C100,18 110,38 120,28"
          stroke="#9aa374" stroke-width="2" stroke-linecap="round" fill="none"
        />
      </svg>
    </div>

    <!-- Circle decoration -->
    <div class="absolute right-20 top-1/2 -translate-y-12 hidden lg:block pointer-events-none">
      <div class="h-20 w-20 rounded-full bg-[#e8e8e0]" />
    </div>

    <!-- Squiggle right -->
    <div class="absolute right-8 top-1/2 translate-y-8 hidden lg:block pointer-events-none">
      <svg width="130" height="44" viewBox="0 0 130 44" fill="none">
        <path
          d="M0,14 C10,4 20,24 30,14 C40,4 50,24 60,14 C70,4 80,24 90,14 C100,4 110,24 120,14 C125,9 128,16 130,14"
          stroke="#9aa374" stroke-width="2" stroke-linecap="round" fill="none"
        />
        <path
          d="M0,28 C10,18 20,38 30,28 C40,18 50,38 60,28 C70,18 80,38 90,28 C100,18 110,38 120,28 C125,23 128,30 130,28"
          stroke="#9aa374" stroke-width="2" stroke-linecap="round" fill="none"
        />
      </svg>
    </div>

    <!-- Content -->
    <div class="relative max-w-3xl mx-auto text-center">
      <!-- Pills row -->
      <div class="flex items-center justify-center gap-4 mb-10 flex-wrap">
        <span class="text-xs font-semibold tracking-[0.15em] text-sage-500 uppercase"
          style="font-family: 'Montserrat Alternates', sans-serif">
          Open Rooms
        </span>
        <span class="text-sage-400 text-xs font-bold">■</span>
        <span class="text-xs font-semibold tracking-[0.15em] text-sage-500 uppercase"
          style="font-family: 'Montserrat Alternates', sans-serif">
          Different People
        </span>
        <span class="text-sage-400 text-xs font-bold">■</span>
        <span class="text-xs font-semibold tracking-[0.15em] text-sage-500 uppercase"
          style="font-family: 'Montserrat Alternates', sans-serif">
          Right Now
        </span>
      </div>

      <!-- Headline -->
      <h1
        class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6 text-[#2d2d1a]"
        style="font-family: 'Plus Jakarta Sans', sans-serif"
      >
        Your next conversation<br />is already happening.
      </h1>

      <!-- Subtext -->
      <p class="text-[#6b6b5a] text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
        style="font-family: 'Plus Jakarta Sans', sans-serif">
        Syncyard is where people from anywhere drop into live rooms, meet strangers, share ideas, and just... talk.
      </p>

      <!-- CTA -->
      <RouterLink
        to="/discover"
        class="inline-flex items-center gap-2 bg-[#2d2d1a] hover:bg-[#3d3d2a] text-white text-sm font-semibold px-7 py-3.5 rounded-full transition-colors"
        style="font-family: 'Plus Jakarta Sans', sans-serif"
      >
        See live rooms
      </RouterLink>

      <!-- Stats -->
      <div class="mt-16 flex items-center justify-center gap-8 sm:gap-12 flex-wrap">
        <div>
          <span class="text-2xl font-bold text-[#2d2d1a]">24</span>
          <span class="ml-1.5 text-sm text-[#8a8a6a]">rooms open now</span>
        </div>
        <div>
          <span class="text-2xl font-bold text-[#2d2d1a]">82</span>
          <span class="ml-1.5 text-sm text-[#8a8a6a]">people connected recently</span>
        </div>
        <div>
          <span class="text-2xl font-bold text-[#2d2d1a]">3</span>
          <span class="ml-1.5 text-sm text-[#8a8a6a]">countries</span>
        </div>
      </div>
    </div>
  </section>
</template>
