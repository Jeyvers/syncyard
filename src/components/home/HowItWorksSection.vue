<script setup lang="ts">
import { useScrollReveal } from '@/composables/useScrollReveal'

const { elementRef, isVisible } = useScrollReveal()

const steps = [
  {
    number: '01',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />`,
    title: 'Build your profile',
    description: 'Add your display name, bio, and creative tags so the right collaborators can find you.',
  },
  {
    number: '02',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />`,
    title: 'Discover or get matched',
    description: 'Browse creatives by skill, or hit Random Match to be introduced to someone unexpected.',
  },
  {
    number: '03',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />`,
    title: 'Collaborate in your workspace',
    description: 'Connect and a shared workspace opens instantly — with real-time chat and a place for your work.',
  },
]
</script>

<template>
  <section
    id="how-it-works"
    ref="elementRef"
    :class="[
      'py-24 px-4 transition-all duration-700 ease-out',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
    ]"
  >
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <p class="text-xs font-medium text-violet-500 uppercase tracking-widest mb-3">How it works</p>
        <h2 class="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Three steps to your next collaboration
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div class="hidden md:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-transparent via-zinc-300 dark:via-zinc-700 to-transparent" />

        <div
          v-for="(step, i) in steps"
          :key="i"
          :style="{ transitionDelay: isVisible ? `${i * 120}ms` : '0ms' }"
          :class="[
            'relative bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 transition-all duration-600 ease-out shadow-sm dark:shadow-none',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
          ]"
        >
          <div class="h-12 w-12 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800/40 flex items-center justify-center mb-5">
            <svg class="h-6 w-6 text-violet-500 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" v-html="step.icon" />
          </div>
          <p class="text-xs font-mono text-zinc-400 dark:text-zinc-600 mb-2">{{ step.number }}</p>
          <h3 class="text-zinc-900 dark:text-zinc-100 font-semibold text-lg mb-2">{{ step.title }}</h3>
          <p class="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
