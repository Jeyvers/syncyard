<script setup lang="ts">
import { useScrollReveal } from '@/composables/useScrollReveal'
import AppAvatar from '@/components/ui/AppAvatar.vue'

const { elementRef, isVisible } = useScrollReveal()

const testimonials = [
  {
    quote: "Found my favorite collaborator through Syncyard. We shipped a full album in two months — something I'd been trying to do solo for years.",
    name: 'Mara Osei',
    discipline: 'Music Producer',
  },
  {
    quote: "The random match feature is wild. I clicked it once and got introduced to a motion designer who made my brand come alive.",
    name: 'Léo Fontaine',
    discipline: 'Brand Strategist',
  },
  {
    quote: "Having a shared workspace the moment you connect removes all the awkward 'where should we chat?' friction. It just works.",
    name: 'Priya Desai',
    discipline: 'UI Designer',
  },
]
</script>

<template>
  <section
    ref="elementRef"
    :class="[
      'py-24 px-4 transition-all duration-700 ease-out',
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
    ]"
  >
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-14">
        <p class="text-xs font-medium text-sage-500 uppercase tracking-widest mb-3">Voices</p>
        <h2 class="text-3xl sm:text-4xl font-bold text-earth-900 dark:text-earth-100 tracking-tight">
          From the community
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="(t, i) in testimonials"
          :key="i"
          :style="{ transitionDelay: isVisible ? `${i * 100}ms` : '0ms' }"
          :class="[
            'bg-earth-50 dark:bg-earth-800 border border-earth-200 dark:border-earth-700 rounded-2xl p-6 flex flex-col gap-5 shadow-sm dark:shadow-none transition-all duration-600 ease-out',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
          ]"
        >
          <svg class="h-6 w-6 text-sage-300 dark:text-sage-700" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>

          <p class="text-earth-700 dark:text-earth-200 text-sm leading-relaxed flex-1">{{ t.quote }}</p>

          <div class="flex items-center gap-3 pt-2 border-t border-earth-200 dark:border-earth-700">
            <AppAvatar :name="t.name" size="sm" />
            <div>
              <p class="text-earth-900 dark:text-earth-100 text-sm font-medium">{{ t.name }}</p>
              <p class="text-earth-400 text-xs">{{ t.discipline }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
