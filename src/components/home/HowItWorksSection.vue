<script setup lang="ts">
import { useScrollReveal } from '@/composables/useScrollReveal'

const { elementRef, isVisible } = useScrollReveal()

const steps = [
  {
    number: '01',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />`,
    title: 'Build your profile',
    description:
      'Add your display name, bio, and creative tags so the right collaborators can find you.',
  },
  {
    number: '02',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />`,
    title: 'Discover or get matched',
    description:
      'Browse creatives by skill, or hit Random Match to be introduced to someone unexpected.',
  },
  {
    number: '03',
    icon: `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />`,
    title: 'Collaborate in your workspace',
    description:
      'Connect and a shared workspace opens instantly — with real-time chat and a place for your work.',
  },
]
</script>

<template>
  <section
    id="how-it-works"
    ref="elementRef"
    :class="[
      'py-24 px-4 bg-[#f5f5f2] transition-all duration-700 ease-out mt-20',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
    ]"
  >
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <p class="font-display text-xs font-medium text-olive uppercase tracking-widest mb-4">
          How it works
        </p>
        <h2 class="text-3xl sm:text-4xl font-medium text-[#2d2d1a] tracking-tight">
          Three steps to your next conversation
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div
          class="hidden md:block absolute top-10 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-transparent via-sage-200 to-transparent"
        />

        <div
          v-for="(step, i) in steps"
          :key="i"
          :style="{ transitionDelay: isVisible ? `${i * 120}ms` : '0ms' }"
          :class="[
            'relative bg-white border border-[#e8e8e0] rounded-3xl p-8 flex flex-col gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
          ]"
        >
          <div
            class="h-11 w-11 rounded-2xl bg-sage-50 border border-sage-100 flex items-center justify-center"
          >
            <svg
              class="h-5 w-5 text-olive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              v-html="step.icon"
            />
          </div>
          <p class="text-xs font-mono text-muted">{{ step.number }}</p>
          <h3 class="text-[#1a1a0e] font-medium text-xl leading-snug">{{ step.title }}</h3>
          <p class="text-muted text-sm leading-relaxed">{{ step.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
