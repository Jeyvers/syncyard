<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabase'

const liveCount = ref(0)
const totalParticipants = ref(0)

onMounted(async () => {
  const { count: live } = await supabase
    .from('workspaces')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .is('ended_at', null)
  liveCount.value = live ?? 0

  const { data } = await supabase
    .from('workspaces')
    .select('participant_count')
    .gt('participant_count', 0)
  totalParticipants.value = (data ?? []).reduce((sum: number, w: any) => sum + (w.participant_count ?? 0), 0)
})
</script>

<template>
  <section id="hero" class="relative overflow-hidden pt-28 pb-20 px-4">
    <!-- Squiggle left -->
    <div class="absolute left-8 top-1/2 -translate-y-8 hidden lg:block pointer-events-none">
      <svg width="120" height="44" viewBox="0 0 120 44" fill="none">
        <path
          d="M0,14 C10,4 20,24 30,14 C40,4 50,24 60,14 C70,4 80,24 90,14 C100,4 110,24 120,14"
          stroke="#9aa374"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />
        <path
          d="M0,28 C10,18 20,38 30,28 C40,18 50,38 60,28 C70,18 80,38 90,28 C100,18 110,38 120,28"
          stroke="#9aa374"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
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
          stroke="#9aa374"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />
        <path
          d="M0,28 C10,18 20,38 30,28 C40,18 50,38 60,28 C70,18 80,38 90,28 C100,18 110,38 120,28 C125,23 128,30 130,28"
          stroke="#9aa374"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />
      </svg>
    </div>

    <!-- Content -->
    <div class="relative max-w-3xl mx-auto text-center">
      <!-- Pills row -->
      <div class="flex items-center justify-center gap-4 mb-10 flex-wrap">
        <span class="font-display tracking-[0.15em] text-sage-400 uppercase"> Open Syncs </span>
        <span class="text-sage-400 font-bold">■</span>
        <span class="font-display tracking-[0.15em] text-sage-500 uppercase">
          Different People
        </span>
        <span class="text-sage-400 font-bold">■</span>
        <span class="font-display tracking-[0.15em] text-sage-500 uppercase"> Right Now </span>
      </div>

      <!-- Headline -->
      <h1 class="text-4xl sm:text-5xl lg:text-7xl leading-[1.1] tracking-tight mb-6 text-olive">
        Your next conversation<br />is already happening.
      </h1>

      <!-- Subtext -->
      <p class="text-olive-500 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
        Syncyard is where people from anywhere drop into live syncs, meet strangers, share ideas,
        and just... talk.
      </p>

      <!-- CTA -->
      <a
        href="#live-rooms"
        class="font-body inline-flex items-center justify-center bg-olive-dark text-white font-medium px-12 py-5 rounded-blob shadow-lg hover:scale-105 transition-transform duration-200"
      >
        See live syncs
      </a>

      <!-- Stats -->
      <div class="mt-16 flex items-center justify-center gap-8 sm:gap-12 flex-wrap font-sans">
        <div>
          <span class="text-2xl font-semibold text-olive">{{ liveCount || '0' }}</span>
          <span class="ml-1.5 text-sm font-light text-muted">syncs live</span>
        </div>
        <div>
          <span class="text-2xl font-semibold text-olive">{{ totalParticipants || '0' }}</span>
          <span class="ml-1.5 text-sm font-light text-muted">people in syncs now</span>
        </div>
      </div>
    </div>
  </section>
</template>
