<script setup lang="ts">
import { useAuthModal } from '@/composables/useAuthModal'
import { useAuthStore } from '@/stores/auth'

const { openModal } = useAuthModal()
const auth = useAuthStore()

function handleTopicClick() {
  if (auth.isAuthenticated) {
    document.getElementById('happening-right-now')?.scrollIntoView({ behavior: 'smooth' })
  } else {
    const el = document.getElementById('happening-right-now')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    else openModal('login')
  }
}

const topics = [
  {
    name: 'Tech, Founders, Building...',
    rooms: 40,
    live: 3,
    gradient: 'from-slate-700 via-slate-800 to-zinc-900',
    accent: 'bg-blue-400/20',
  },
  {
    name: 'Creatives (Art, Music, Writing)...',
    rooms: 5,
    live: 0,
    gradient: 'from-amber-800 via-orange-900 to-stone-900',
    accent: 'bg-orange-400/20',
  },
  {
    name: 'Late Night Chats',
    rooms: 12,
    live: 2,
    gradient: 'from-indigo-900 via-violet-900 to-slate-900',
    accent: 'bg-violet-400/20',
  },
  {
    name: 'Girlies',
    rooms: 8,
    live: 1,
    gradient: 'from-rose-800 via-pink-900 to-fuchsia-900',
    accent: 'bg-pink-400/20',
  },
  {
    name: 'Everything',
    rooms: 160,
    live: 4,
    gradient: 'from-teal-800 via-emerald-900 to-green-900',
    accent: 'bg-emerald-400/20',
  },
  {
    name: 'Story Time',
    rooms: 7,
    live: 1,
    gradient: 'from-yellow-800 via-amber-900 to-orange-900',
    accent: 'bg-yellow-400/20',
  },
]
</script>

<template>
  <section class="py-12 px-4 bg-earth-100">
    <div class="max-w-6xl mx-auto">
      <p class="text-xs font-bold text-earth-600 uppercase tracking-widest mb-6">Browse by topics</p>

      <div class="flex gap-4 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
        <div
          v-for="topic in topics"
          :key="topic.name"
          :class="['relative shrink-0 w-36 h-48 rounded-2xl overflow-hidden cursor-pointer group bg-gradient-to-b', topic.gradient]"
          @click="handleTopicClick"
        >
          <!-- Noise texture overlay -->
          <div class="absolute inset-0 opacity-10" :class="topic.accent" />

          <!-- Bottom overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <!-- Content -->
          <div class="absolute bottom-0 left-0 right-0 p-3">
            <p class="text-white text-xs font-semibold leading-snug mb-2">{{ topic.name }}</p>
            <div class="flex items-center gap-2">
              <span class="text-white/70 text-xs">{{ topic.rooms }}+ rooms</span>
              <span v-if="topic.live > 0" class="flex items-center gap-1 text-xs text-green-400 font-medium">
                <span class="h-1.5 w-1.5 rounded-full bg-green-400" />
                {{ topic.live }} live
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
