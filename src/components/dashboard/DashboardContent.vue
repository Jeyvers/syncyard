<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{ 'start-room': [] }>()

const auth = useAuthStore()

const followedSet = ref(new Set<number>())

function toggleFollow(i: number) {
  if (followedSet.value.has(i)) followedSet.value.delete(i)
  else followedSet.value.add(i)
  followedSet.value = new Set(followedSet.value)
}

function scrollToHappening() {
  document.getElementById('happening-right-now')?.scrollIntoView({ behavior: 'smooth' })
}

const firstName = computed(() => {
  const name = auth.profile?.full_name || auth.user?.user_metadata?.full_name || ''
  return name.split(' ')[0] || 'there'
})

const initials = computed(() => {
  const name = auth.profile?.full_name || auth.user?.user_metadata?.full_name || ''
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'ME'
})

const handle = computed(() => auth.profile?.username || 'you')

const favoriteRooms = [
  { title: 'Solo founders accountability check', description: "Building alone? Join this open circle. Share your week, get unstuck...", creator: 'Tunde Obi', flag: '🇧🇷', location: 'Sao Paulo, Brazil', joined: 18, color: 'bg-orange-200 text-orange-800' },
  { title: 'Learn in public — what are you...', description: "Open room for makers to share what they're working on. No gatekeeping.", creator: 'Riya Pillai', flag: '🇧🇪', location: 'Croatia, Belgium', joined: 2, color: 'bg-teal-200 text-teal-800' },
  { title: 'Solo founders accountability check', description: "Building alone? Join this open circle. Share your week, get unstuck...", creator: 'Tunde Obi', flag: '🇧🇷', location: 'Sao Paulo, Brazil', joined: 18, color: 'bg-orange-200 text-orange-800' },
]

const rooms = [
  { title: 'Solo founders accountability check', description: "Building alone? Join this open circle. Share your week, get unstuck, move forward.", creator: 'Tunde Obi', flag: '🇧🇷', location: 'Sao Paulo, Brazil', joined: 18, color: 'bg-orange-200 text-orange-800' },
  { title: 'Late night chill — anything goes', description: 'No agenda. Just vibes. Come hang, vent, laugh, or listen in.', creator: 'Mariana F...', flag: '🇮🇳', location: 'Bangalore, India', joined: 2, color: 'bg-violet-200 text-violet-800' },
  { title: 'Learn in public — what are you...', description: "Open room for makers to share what they're working on. No gatekeeping.", creator: 'Riya Pillai', flag: '🇧🇪', location: 'Croatia, Belgium', joined: 2, color: 'bg-teal-200 text-teal-800' },
  { title: 'Learn in public — what are you...', description: "Open room for makers to share what they're working on. No gatekeeping.", creator: 'Riya Pillai', flag: '🇧🇪', location: 'Croatia, Belgium', joined: 2, color: 'bg-teal-200 text-teal-800' },
  { title: 'Solo founders accountability check', description: "Building alone? Join this open circle. Share your week, get unstuck, move forward.", creator: 'Tunde Obi', flag: '🇧🇷', location: 'Sao Paulo, Brazil', joined: 18, color: 'bg-orange-200 text-orange-800' },
  { title: 'Late night chill — anything goes', description: 'No agenda. Just vibes. Come hang, vent, laugh, or listen in.', creator: 'Mariana F...', flag: '🇮🇳', location: 'Bangalore, India', joined: 2, color: 'bg-violet-200 text-violet-800' },
  { title: 'Design critique & feedback', description: "Bring your work. Get honest, kind feedback from other designers.", creator: 'Aria Mensah', flag: '🇬🇧', location: 'London, UK', joined: 6, color: 'bg-rose-200 text-rose-800' },
  { title: 'Writers room — open session', description: "Writing in silence together. Drop in, mute, and get stuff done.", creator: 'Lena Park', flag: '🇰🇷', location: 'Seoul, Korea', joined: 5, color: 'bg-sky-200 text-sky-800' },
]

const suggestions = [
  { name: 'Tunde Obi', role: 'Founder · Lagos', color: 'bg-orange-200 text-orange-800' },
  { name: 'Tunde Obi', role: 'Founder · Lagos', color: 'bg-amber-200 text-amber-800' },
  { name: 'Tunde Obi', role: 'Founder · Lagos', color: 'bg-violet-200 text-violet-800' },
  { name: 'Tunde Obi', role: 'Founder · Lagos', color: 'bg-teal-200 text-teal-800' },
]

function roomInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

</script>

<template>
  <div class="min-h-screen bg-[#f5f5f2]" style="font-family: 'Plus Jakarta Sans', sans-serif">
    <div class="max-w-6xl mx-auto px-4 pt-20 pb-16">
      <div class="flex gap-8 items-start">

        <!-- Main content -->
        <div class="flex-1 min-w-0">

          <!-- Greeting -->
          <div class="mb-7">
            <h1 class="text-2xl font-bold text-[#5a6e2a]" style="font-family: 'Montserrat Alternates', sans-serif">
              Hey, {{ firstName }} 👋
            </h1>
            <p class="text-sm text-[#6b6b5a] mt-1">Here's what's happening in your world right now.</p>
          </div>

          <!-- Action row -->
          <div class="flex items-center gap-3 mb-10">
            <button
              class="inline-flex items-center gap-2 bg-[#2d4a1e] hover:bg-[#3a5a28] text-white text-sm font-semibold px-5 py-3 rounded-full transition-colors shrink-0"
              @click="emit('start-room')"
            >
              Start a room
              <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <div class="flex items-center gap-2 border border-[#e0e0d4] bg-white rounded-full px-4 py-3 flex-1 max-w-xs">
              <svg class="h-4 w-4 text-[#b0b09a] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
              </svg>
              <input type="text" placeholder="Enter a code or link"
                class="bg-transparent text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none w-full"/>
            </div>
          </div>

          <!-- Your Favorites - Live -->
          <div class="mb-10">
            <div class="flex items-center justify-between mb-4">
              <p class="text-xs font-bold text-[#6b6b5a] uppercase tracking-widest">Your Favorites — Live</p>
              <button class="text-sm text-[#6b6b5a] hover:text-[#2d2d1a] transition-colors" @click="scrollToHappening">
                See all rooms
              </button>
            </div>
            <div class="grid grid-cols-3 gap-4">
              <div
                v-for="(room, i) in favoriteRooms" :key="i"
                class="bg-white border border-[#e8e8e0] rounded-2xl p-4 flex flex-col hover:bg-[#faf9e8] hover:border-[#c8c89e] hover:shadow-sm transition-all cursor-pointer"
              >
                <!-- LIVE + location -->
                <div class="flex items-center justify-between mb-3">
                  <span class="inline-flex items-center gap-1.5 bg-[#e8f0e3] text-[#3a5a2d] text-xs font-bold px-2.5 py-0.5 rounded-full">
                    <span class="h-1.5 w-1.5 rounded-full bg-green-500" />LIVE
                  </span>
                  <span class="text-[10px] text-[#8a8a6a]">{{ room.flag }} {{ room.location }}</span>
                </div>
                <!-- Title -->
                <h3 class="text-[#1a1a0e] font-bold text-sm leading-snug mb-2">{{ room.title }}</h3>
                <!-- Description -->
                <p class="text-[#8a8a6a] text-xs leading-relaxed flex-1 mb-3">{{ room.description }}</p>
                <!-- Host -->
                <div class="flex items-center gap-2 mb-3">
                  <div :class="['h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0', room.color]">
                    {{ roomInitials(room.creator) }}
                  </div>
                  <div>
                    <p class="text-[8px] text-[#a0a08a] uppercase tracking-widest leading-none mb-0.5">Host</p>
                    <p class="text-[10px] font-bold text-[#2d2d1a] uppercase tracking-wider">{{ room.creator }}</p>
                  </div>
                </div>
                <!-- Footer -->
                <div class="border-t border-[#e8e8e0] pt-2.5 flex items-center justify-between">
                  <div class="flex items-center gap-1 text-[#8a8a6a]">
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span class="text-xs">{{ room.joined }} joined</span>
                  </div>
                  <button class="bg-[#2d4a1e] hover:bg-[#3a5a28] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors" @click.stop="scrollToHappening">Join</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Happening Right Now -->
          <div id="happening-right-now">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <span class="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                <h2 class="text-xs font-bold text-[#3a5a2d] uppercase tracking-widest" style="font-family: 'Montserrat Alternates', sans-serif">
                  Happening Right Now
                </h2>
                <span class="border border-[#b5cfb0] text-[#3a5a2d] text-xs font-semibold px-3 py-0.5 rounded-full">247 open</span>
              </div>
              <button class="text-sm text-[#6b6b5a] hover:text-[#2d2d1a] transition-colors" @click="scrollToHappening">See all rooms →</button>
            </div>

            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                v-for="(room, i) in rooms" :key="i"
                class="bg-white border border-[#e8e8e0] rounded-2xl p-4 flex flex-col hover:bg-[#faf9e8] hover:border-[#c8c89e] hover:shadow-sm transition-all cursor-pointer"
              >
                <div class="flex items-center justify-between mb-3">
                  <span class="inline-flex items-center gap-1.5 bg-[#e8f0e3] text-[#3a5a2d] text-xs font-bold px-2.5 py-0.5 rounded-full">
                    <span class="h-1.5 w-1.5 rounded-full bg-green-500" />LIVE
                  </span>
                  <span class="text-[10px] text-[#8a8a6a] truncate max-w-[100px] text-right">{{ room.flag }} {{ room.location }}</span>
                </div>
                <h3 class="text-[#1a1a0e] font-bold text-sm leading-snug mb-2">{{ room.title }}</h3>
                <p class="text-[#8a8a6a] text-xs leading-relaxed flex-1 mb-3">{{ room.description }}</p>
                <div class="flex items-center gap-2 mb-3">
                  <div :class="['h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0', room.color]">
                    {{ roomInitials(room.creator) }}
                  </div>
                  <p class="text-[10px] font-bold text-[#2d2d1a] uppercase tracking-wider truncate">{{ room.creator }}</p>
                </div>
                <div class="border-t border-[#e8e8e0] pt-2.5 flex items-center justify-between">
                  <div class="flex items-center gap-1 text-[#8a8a6a]">
                    <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span class="text-xs">{{ room.joined }} joined</span>
                  </div>
                  <button class="bg-[#2d4a1e] hover:bg-[#3a5a28] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors" @click.stop="scrollToHappening">Join</button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Sidebar -->
        <div class="w-64 shrink-0 hidden lg:block">

          <!-- Profile card -->
          <div class="bg-[#dde8c8]/60 border border-[#c8d8b0] rounded-2xl p-5 text-center mb-5">
            <div class="h-14 w-14 rounded-full bg-[#2d4a1e] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
              {{ initials }}
            </div>
            <p class="font-bold text-[#1a1a0e] text-sm uppercase tracking-wide" style="font-family: 'Montserrat Alternates', sans-serif">
              {{ auth.profile?.full_name || auth.user?.user_metadata?.full_name || 'Your Name' }}
            </p>
            <p class="text-xs text-[#8a8a6a] mt-0.5">@{{ handle }} · joined recently</p>

            <div class="flex items-center justify-around mt-4 py-3 border-y border-[#c8d8b0]">
              <div class="text-center">
                <p class="text-base font-bold text-[#2d2d1a]">7</p>
                <p class="text-[9px] text-[#8a8a6a] uppercase tracking-wider">Rooms</p>
              </div>
              <div class="text-center">
                <p class="text-base font-bold text-[#2d2d1a]">43</p>
                <p class="text-[9px] text-[#8a8a6a] uppercase tracking-wider">Met</p>
              </div>
              <div class="text-center">
                <p class="text-base font-bold text-[#2d2d1a]">2</p>
                <p class="text-[9px] text-[#8a8a6a] uppercase tracking-wider">Hosted</p>
              </div>
            </div>

            <button
              class="mt-4 w-full border border-[#b8c8a0] hover:border-[#7a8355] text-[#2d4a1e] text-sm font-semibold py-2 rounded-full transition-colors"
              @click="scrollToHappening"
            >
              Find People
            </button>
          </div>

          <!-- People you may like -->
          <div>
            <p class="text-xs font-bold text-[#8a8a6a] uppercase tracking-widest mb-3">People you may like</p>
            <div class="space-y-2">
              <div v-for="(person, i) in suggestions" :key="i"
                class="flex items-center gap-3 bg-white border border-[#e8e8e0] rounded-xl px-3 py-2.5">
                <div :class="['h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0', person.color]">
                  {{ person.name[0] }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-[#1a1a0e] truncate">{{ person.name }}</p>
                  <p class="text-[10px] text-[#8a8a6a] truncate">{{ person.role }}</p>
                </div>
                <button
                  :class="[
                    'text-xs font-semibold px-2.5 py-1 rounded-full transition-colors shrink-0 border',
                    followedSet.has(i)
                      ? 'bg-[#2d4a1e] text-white border-[#2d4a1e]'
                      : 'text-[#5a6e2a] hover:text-[#3a4e1a] border-[#c8d8b0] hover:border-[#7a8355]'
                  ]"
                  @click="toggleFollow(i)"
                >
                  {{ followedSet.has(i) ? 'Following' : 'Follow' }}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
