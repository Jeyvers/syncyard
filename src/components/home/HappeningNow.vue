<script setup lang="ts">
import { useAuthModal } from '@/composables/useAuthModal'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const { openModal } = useAuthModal()
const auth = useAuthStore()
const router = useRouter()

function handleJoin() {
  if (auth.isAuthenticated) {
    document.getElementById('happening-right-now')?.scrollIntoView({ behavior: 'smooth' })
  } else {
    openModal('login')
  }
}

const rooms = [
  {
    title: 'Solo founders accountability check',
    description:
      'Building alone? Join this open circle. Share your week, get unstuck, move forward.',
    creator: 'Tunde Obi',
    flag: '🇧🇷',
    location: 'Sao Paulo, Brazil',
    joined: 18,
  },
  {
    title: 'Late night chill — anything goes',
    description: 'No agenda. Just vibes. Come hang, vent, laugh, or listen in.',
    creator: 'Mariana F...',
    flag: '🇮🇳',
    location: 'Bangalore, India',
    joined: 2,
  },
  {
    title: 'Learn in public — what are you...',
    description: "Open room for makers to share what they're working on. No gatekeeping.",
    creator: 'Riya Pillai',
    flag: '🇧🇪',
    location: 'Croatia, Belgium',
    joined: 2,
  },
  {
    title: 'Learn in public — what are you...',
    description: "Open room for makers to share what they're working on. No gatekeeping.",
    creator: 'Riya Pillai',
    flag: '🇧🇪',
    location: 'Croatia, Belgium',
    joined: 2,
  },
  {
    title: 'Solo founders accountability check',
    description:
      'Building alone? Join this open circle. Share your week, get unstuck, move forward.',
    creator: 'Tunde Obi',
    flag: '🇧🇷',
    location: 'Sao Paulo, Brazil',
    joined: 18,
  },
  {
    title: 'Late night chill — anything goes',
    description: 'No agenda. Just vibes. Come hang, vent, laugh, or listen in.',
    creator: 'Mariana F...',
    flag: '🇮🇳',
    location: 'Bangalore, India',
    joined: 2,
  },
  {
    title: 'Design critique & feedback',
    description: 'Bring your work. Get honest, kind feedback from other designers and makers.',
    creator: 'Aria Mensah',
    flag: '🇬🇧',
    location: 'London, UK',
    joined: 6,
  },
  {
    title: 'Writers room — open session',
    description: 'Writing in silence together. Drop in, mute, and get stuff done.',
    creator: 'Lena Park',
    flag: '🇰🇷',
    location: 'Seoul, Korea',
    joined: 5,
  },
]

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const avatarColors = [
  'bg-orange-200 text-orange-800',
  'bg-violet-200 text-violet-800',
  'bg-teal-200 text-teal-800',
  'bg-rose-200 text-rose-800',
  'bg-orange-200 text-orange-800',
  'bg-violet-200 text-violet-800',
  'bg-amber-200 text-amber-800',
  'bg-sky-200 text-sky-800',
]
</script>

<template>
  <section id="live-rooms" class="py-16 px-4">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <span class="h-2.5 w-2.5 rounded-full bg-[#387C00] animate-pulse" />
          <h2 class="font-display font-medium text-[#387C00] uppercase tracking-widest">
            Happening Right Now
          </h2>
          <span
            class="border border-[#b5cfb0] text-[#3a5a2d] text-xs font-semibold px-3 py-0.5 rounded-full"
          >
            247 open
          </span>
        </div>
        <button
          class="text-sm text-[#6b6b5a] hover:text-[#2d2d1a] transition-colors"
          @click="handleJoin"
        >
          See all rooms →
        </button>
      </div>

      <!-- Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        <div
          v-for="(room, i) in rooms"
          :key="i"
          class="bg-white border border-[#e8e8e0] rounded-3xl p-7 flex flex-col gap-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-[#c8c89e] hover:-translate-y-0.5 group"
        >
          <!-- LIVE + location -->
          <div class="flex items-center justify-between">
            <span
              class="inline-flex items-center gap-1.5 bg-[#e8f0e3] text-green-500 text-xs font-semibold px-3 py-1.5 rounded-full"
            >
              <span class="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              LIVE
            </span>
            <span class="text-xs text-muted flex items-center gap-1">
              {{ room.flag }} {{ room.location }}
            </span>
          </div>

          <!-- Title -->
          <h3 class="text-[#1a1a0e] font-semibold text-lg leading-snug">
            {{ room.title }}
          </h3>

          <!-- Description -->
          <p class="text-muted text-sm leading-relaxed flex-1">
            {{ room.description }}
          </p>

          <!-- Host -->
          <div class="flex items-center gap-3 mt-8">
            <div
              :class="[
                'h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                avatarColors[i],
              ]"
            >
              {{ initials(room.creator) }}
            </div>
            <div>
              <p class="text-[#a0a08a] text-[10px] uppercase tracking-widest mb-0.5">Host</p>
              <span
                class="font-display text-xs font-semibold text-[#2d2d1a] uppercase tracking-wider"
              >
                {{ room.creator }}
              </span>
            </div>
          </div>

          <!-- Divider -->
          <div class="border-t border-[#f0f0e8]" />

          <!-- Footer -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-muted">
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span class="text-xs">{{ room.joined }} joined</span>
            </div>
            <button
              class="bg-[#387C00] hover:bg-forest text-white text-xs font-semibold px-7 py-2 rounded-full transition-colors"
              @click.stop="handleJoin"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
