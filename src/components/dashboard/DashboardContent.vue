<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits<{ 'start-room': [] }>()
const auth = useAuthStore()

const liveSearch = ref('')
const historySearch = ref('')
const liveFilterOpen = ref(false)
const historyFilterOpen = ref(false)
const liveFilter = ref('All rooms')
const historyFilter = ref('All rooms')
const liveFilterRef = ref<HTMLDivElement | null>(null)
const historyFilterRef = ref<HTMLDivElement | null>(null)

const filterOptions = ['All rooms', 'Most popular', 'By location', 'By topic']

function onClickOutside(e: MouseEvent) {
  if (liveFilterRef.value && !liveFilterRef.value.contains(e.target as Node))
    liveFilterOpen.value = false
  if (historyFilterRef.value && !historyFilterRef.value.contains(e.target as Node))
    historyFilterOpen.value = false
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

const firstName = computed(() => {
  const name = auth.profile?.full_name || auth.user?.user_metadata?.full_name || ''
  return name.split(' ')[0] || 'there'
})

const initials = computed(() => {
  const name = auth.profile?.full_name || auth.user?.user_metadata?.full_name || ''
  return (
    name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ME'
  )
})

const fullName = computed(
  () => auth.profile?.full_name || auth.user?.user_metadata?.full_name || 'Your Name',
)

const handle = computed(() => auth.profile?.username || 'you')

const joinedDate = computed(() => {
  const created = auth.profile?.created_at
  if (!created) return 'recently'
  const days = Math.floor((Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
})

const avatarColors = [
  'bg-orange-200 text-orange-800',
  'bg-violet-200 text-violet-800',
  'bg-teal-200 text-teal-800',
  'bg-teal-200 text-teal-800',
  'bg-orange-200 text-orange-800',
  'bg-violet-200 text-violet-800',
  'bg-teal-200 text-teal-800',
  'bg-teal-200 text-teal-800',
]

const liveRooms = [
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
    description: "Open sync for makers to share what they're working on. No gatekeeping.",
    creator: 'Riya Pillai',
    flag: '🇧🇪',
    location: 'Croatia, Belgium',
    joined: 2,
  },
  {
    title: 'Learn in public — what are you...',
    description: "Open sync for makers to share what they're working on. No gatekeeping.",
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
    title: 'Learn in public — what are you...',
    description: "Open sync for makers to share what they're working on. No gatekeeping.",
    creator: 'Riya Pillai',
    flag: '🇧🇪',
    location: 'Croatia, Belgium',
    joined: 2,
  },
  {
    title: 'Learn in public — what are you...',
    description: "Open sync for makers to share what they're working on. No gatekeeping.",
    creator: 'Riya Pillai',
    flag: '🇧🇪',
    location: 'Croatia, Belgium',
    joined: 2,
  },
]

const historyRooms = [
  {
    title: 'Solo founders accountability check',
    description:
      'Building alone? Join this open circle. Share your week, get unstuck, move forward.',
    creator: 'Tunde Obi',
    flag: '🇧🇷',
    location: 'Sao Paulo, Brazil',
    joined: 18,
    timeAgo: '2 days ago',
    lasted: '12mins',
    stayed: '2 mins',
    color: 'bg-orange-200 text-orange-800',
  },
  {
    title: 'Late night chill — anything goes',
    description: 'No agenda. Just vibes. Come hang, vent, laugh, or listen in.',
    creator: 'Mariana F...',
    flag: '🇮🇳',
    location: 'Bangalore, India',
    joined: 5,
    timeAgo: '4 days ago',
    lasted: '45mins',
    stayed: '18 mins',
    color: 'bg-violet-200 text-violet-800',
  },
]

const filteredLive = computed(() =>
  liveRooms.filter(
    (r) => !liveSearch.value || r.title.toLowerCase().includes(liveSearch.value.toLowerCase()),
  ),
)

const filteredHistory = computed(() =>
  historyRooms.filter(
    (r) =>
      !historySearch.value || r.title.toLowerCase().includes(historySearch.value.toLowerCase()),
  ),
)

function roomInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>

<template>
  <div class="min-h-screen bg-[#f5f5f2]">
    <div class="max-w-6xl mx-auto px-4 pt-24 pb-16">
      <!-- Top row: greeting + profile card -->
      <div class="flex items-start justify-between gap-8 mb-10">
        <!-- Greeting + actions -->
        <div>
          <h1 class="font-display text-2xl font-bold text-[#5a6e2a]">Hey, {{ firstName }} 👋</h1>
          <p class="text-sm text-[#6b6b5a] mt-1">
            Here's what's happening in your world right now.
          </p>

          <div class="flex items-center gap-3 mt-5">
            <button
              class="inline-flex items-center gap-2 bg-[#2d4a1e] hover:bg-forest text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors shrink-0"
              @click="emit('start-room')"
            >
              Start a Sync
            </button>
            <div
              class="flex items-center gap-2 border border-[#e0e0d4] bg-white rounded-full px-4 py-3 w-64"
            >
              <svg
                class="h-4 w-4 text-[#b0b09a] shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <input
                type="text"
                placeholder="Enter a code or link"
                class="bg-transparent text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none w-full"
              />
            </div>
          </div>
        </div>

        <!-- Profile card -->
        <div class="shrink-0 hidden lg:block">
          <div class="bg-[#dde8c8]/70 border border-[#c8d8b0] rounded-2xl p-5 text-center w-56">
            <div
              class="h-14 w-14 rounded-full bg-[#2d4a1e] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3"
            >
              {{ initials }}
            </div>
            <p class="font-display font-bold text-[#1a1a0e] text-sm uppercase tracking-wide">
              {{ fullName }}
            </p>
            <p class="text-xs text-[#9a9a82] mt-0.5">@{{ handle }} · joined {{ joinedDate }}</p>

            <div class="flex items-center justify-around mt-4 py-3 border-y border-[#c8d8b0]">
              <div class="text-center">
                <p class="text-base font-bold text-[#2d2d1a]">7</p>
                <p class="text-[9px] text-[#9a9a82] uppercase tracking-wider">Syncs</p>
              </div>
              <div class="text-center">
                <p class="text-base font-bold text-[#2d2d1a]">43</p>
                <p class="text-[9px] text-[#9a9a82] uppercase tracking-wider">Met</p>
              </div>
              <div class="text-center">
                <p class="text-base font-bold text-[#2d2d1a]">2</p>
                <p class="text-[9px] text-[#9a9a82] uppercase tracking-wider">Hosted</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Live Rooms ─────────────────────────────────── -->
      <div class="mb-14">
        <!-- Section header -->
        <div class="flex items-center gap-2.5 mb-4">
          <span class="h-2 w-2 rounded-full bg-green-500" />
          <span class="text-sm font-medium text-[#2d2d1a]">live</span>
          <span
            class="border border-[#b5cfb0] text-[#3a5a2d] text-xs font-medium px-3 py-0.5 rounded-full"
            >247 open</span
          >
        </div>

        <!-- Search + filter row -->
        <div class="flex items-center gap-3 mb-6">
          <div class="flex items-center gap-2 bg-[#ebebdf] rounded-lg px-3 py-2.5 w-64">
            <svg
              class="h-4 w-4 text-[#9a9a82] shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="liveSearch"
              type="text"
              placeholder="search"
              class="bg-transparent text-sm text-[#2d2d1a] placeholder-[#9a9a82] focus:outline-none w-full"
            />
          </div>
          <button class="p-2 text-[#9a9a82] hover:text-[#2d2d1a] transition-colors">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          <!-- Filter dropdown -->
          <div ref="liveFilterRef" class="relative">
            <button
              class="flex items-center gap-2 bg-[#ebebdf] rounded-lg px-4 py-2.5 text-sm text-[#6b6b5a] hover:bg-[#e0e0d4] transition-colors"
              @click.stop="liveFilterOpen = !liveFilterOpen"
            >
              {{ liveFilter }}
              <svg
                class="h-3.5 w-3.5 shrink-0 transition-transform"
                :class="liveFilterOpen ? 'rotate-180' : ''"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <Transition
              enter-active-class="transition-all duration-150 ease-out"
              enter-from-class="opacity-0 scale-95 translate-y-1"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-100 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-1"
            >
              <div
                v-if="liveFilterOpen"
                class="absolute left-0 top-11 w-44 bg-white border border-[#e8e8e0] rounded-xl shadow-lg py-1 z-20"
              >
                <button
                  v-for="opt in filterOptions"
                  :key="opt"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-[#f5f5f0] transition-colors"
                  :class="liveFilter === opt ? 'text-[#2d4a1e] font-semibold' : 'text-[#2d2d1a]'"
                  @click="liveFilter = opt; liveFilterOpen = false"
                >
                  {{ opt }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Room grid — same card style as landing page -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
          <div
            v-for="(room, i) in filteredLive"
            :key="i"
            class="bg-white border border-[#e8e8e0] rounded-3xl p-7 flex flex-col gap-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-[#c8c89e] hover:-translate-y-0.5"
          >
            <!-- LIVE + location -->
            <div class="flex items-center justify-between">
              <span
                class="inline-flex items-center gap-1.5 bg-[#e8f0e3] text-[#387C00] text-xs font-semibold px-3 py-1.5 rounded-full"
              >
                <span class="h-2 w-2 rounded-full bg-[#387C00] animate-pulse-fast" />
                LIVE
              </span>
              <span class="text-xs text-muted flex items-center gap-1"
                >{{ room.flag }} {{ room.location }}</span
              >
            </div>

            <!-- Title -->
            <h3 class="text-[#41431B] font-sans font-semibold text-xl leading-snug">
              {{ room.title }}
            </h3>

            <!-- Description -->
            <p class="text-muted text-sm leading-relaxed flex-1">{{ room.description }}</p>

            <!-- Host -->
            <div class="flex items-center gap-3 mt-8">
              <div
                :class="[
                  'h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  avatarColors[i],
                ]"
              >
                {{ roomInitials(room.creator) }}
              </div>
              <div>
                <p class="text-[#a0a08a] text-[10px] uppercase tracking-widest mb-0.5">Host</p>
                <span
                  class="font-display text-xs font-semibold text-[#2d2d1a] uppercase tracking-wider"
                  >{{ room.creator }}</span
                >
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
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── History ─────────────────────────────────────── -->
      <div>
        <!-- Section header -->
        <div class="flex items-center gap-2.5 mb-4">
          <svg class="h-4 w-4 text-[#6b6b5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span class="text-sm font-medium text-[#2d2d1a]">history of rooms you've joined</span>
        </div>

        <!-- Search + filter row -->
        <div class="flex items-center gap-3 mb-6">
          <div class="flex items-center gap-2 bg-[#ebebdf] rounded-lg px-3 py-2.5 w-64">
            <svg
              class="h-4 w-4 text-[#9a9a82] shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              v-model="historySearch"
              type="text"
              placeholder="search"
              class="bg-transparent text-sm text-[#2d2d1a] placeholder-[#9a9a82] focus:outline-none w-full"
            />
          </div>
          <button class="p-2 text-[#9a9a82] hover:text-[#2d2d1a] transition-colors">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          <!-- Filter dropdown -->
          <div ref="historyFilterRef" class="relative">
            <button
              class="flex items-center gap-2 bg-[#ebebdf] rounded-lg px-4 py-2.5 text-sm text-[#6b6b5a] hover:bg-[#e0e0d4] transition-colors"
              @click.stop="historyFilterOpen = !historyFilterOpen"
            >
              {{ historyFilter }}
              <svg
                class="h-3.5 w-3.5 shrink-0 transition-transform"
                :class="historyFilterOpen ? 'rotate-180' : ''"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <Transition
              enter-active-class="transition-all duration-150 ease-out"
              enter-from-class="opacity-0 scale-95 translate-y-1"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-100 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-1"
            >
              <div
                v-if="historyFilterOpen"
                class="absolute left-0 top-11 w-44 bg-white border border-[#e8e8e0] rounded-xl shadow-lg py-1 z-20"
              >
                <button
                  v-for="opt in filterOptions"
                  :key="opt"
                  class="w-full text-left px-4 py-2 text-sm hover:bg-[#f5f5f0] transition-colors"
                  :class="historyFilter === opt ? 'text-[#2d4a1e] font-semibold' : 'text-[#2d2d1a]'"
                  @click="historyFilter = opt; historyFilterOpen = false"
                >
                  {{ opt }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- History cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
          <div
            v-for="(room, i) in filteredHistory"
            :key="i"
            class="bg-white border border-[#e8e8e0] rounded-3xl p-7 flex flex-col gap-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-[#c8c89e] hover:-translate-y-0.5"
          >
            <!-- Time + location -->
            <div class="flex items-center justify-between">
              <span
                class="bg-[#f0f0e4] text-[#6b6b5a] text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {{ room.timeAgo }}
              </span>
              <span class="text-xs text-muted flex items-center gap-1"
                >{{ room.flag }} {{ room.location }}</span
              >
            </div>

            <!-- Title -->
            <h3 class="text-[#41431B] font-sans font-semibold text-xl leading-snug">
              {{ room.title }}
            </h3>

            <!-- Description -->
            <p class="text-muted text-sm leading-relaxed flex-1">{{ room.description }}</p>

            <!-- Host -->
            <div class="flex items-center gap-3 mt-8">
              <div
                :class="[
                  'h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  room.color,
                ]"
              >
                {{ roomInitials(room.creator) }}
              </div>
              <div>
                <p class="text-[#a0a08a] text-[10px] uppercase tracking-widest mb-0.5">Host</p>
                <span
                  class="font-display text-xs font-semibold text-[#2d2d1a] uppercase tracking-wider"
                  >{{ room.creator }}</span
                >
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
              <div class="text-right">
                <p class="text-[10px] font-semibold text-[#6b6b5a]">lasted {{ room.lasted }}</p>
                <p class="text-[10px] text-muted">You stayed {{ room.stayed }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredHistory.length === 0" class="text-center py-10 text-muted text-sm">
          No room history yet.
        </div>
      </div>
    </div>
  </div>
</template>
