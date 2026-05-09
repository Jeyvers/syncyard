<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { useRealtimeWorkspaces } from '@/composables/useRealtimeWorkspaces'

const emit = defineEmits<{ 'start-room': [] }>()
const auth = useAuthStore()
const router = useRouter()

const liveSearch = ref('')
const historySearch = ref('')
const liveFilterOpen = ref(false)
const historyFilterOpen = ref(false)
const liveFilter = ref('All syncs')
const historyFilter = ref('All syncs')
const liveFilterRef = ref<HTMLDivElement | null>(null)
const historyFilterRef = ref<HTMLDivElement | null>(null)

const filterOptions = ['All syncs', 'Most popular', 'By topic']

function onClickOutside(e: MouseEvent) {
  if (liveFilterRef.value && !liveFilterRef.value.contains(e.target as Node))
    liveFilterOpen.value = false
  if (historyFilterRef.value && !historyFilterRef.value.contains(e.target as Node))
    historyFilterOpen.value = false
}

// ── Auth profile data ──────────────────────────────────────────────────────
const firstName = computed(() => {
  const name = auth.profile?.full_name || auth.user?.user_metadata?.full_name || ''
  return name.split(' ')[0] || 'there'
})

const initials = computed(() => {
  const name = auth.profile?.full_name || auth.user?.user_metadata?.full_name || ''
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'ME'
})

const fullName = computed(() => auth.profile?.full_name || auth.user?.user_metadata?.full_name || 'Your Name')
const handle = computed(() => auth.profile?.username || 'you')
const joinedDate = computed(() => {
  const created = auth.profile?.created_at
  if (!created) return 'recently'
  const days = Math.floor((Date.now() - new Date(created).getTime()) / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
})

// ── Live data ───────────────────────────────────────────────────────────────
const liveWorkspaces = ref<any[]>([])
const creatorProfiles = ref<Map<string, any>>(new Map())
const liveCount = ref(0)
const liveLoading = ref(true)
const historyWorkspaces = ref<any[]>([])
const historyLoading = ref(true)
const syncCount = ref(0)
const hostedCount = ref(0)

async function ensureCreatorProfile(creatorId: string) {
  if (!creatorId || creatorProfiles.value.has(creatorId)) return
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url')
    .eq('id', creatorId)
    .single()
  if (data) creatorProfiles.value.set(data.id, data)
}

// Live list: surgical INSERT/UPDATE/DELETE — no full refetch
useRealtimeWorkspaces(liveWorkspaces, {
  filter: ws => ws.is_active && !ws.ended_at && ws.name !== 'New Sync',
  channelName: 'dashboard-live',
  onAdded: (ws) => {
    liveCount.value += 1
    ensureCreatorProfile(ws.creator_id)
  },
  onRemoved: () => { liveCount.value = Math.max(0, liveCount.value - 1) },
})

// History list: patch in place, and add a workspace the moment it ends
// (e.g. user is on the dashboard when a sync they joined wraps up)
useRealtimeWorkspaces(historyWorkspaces, {
  filter: ws => !!ws.ended_at && historyWorkspaces.value.some(h => h.id === ws.id),
  channelName: 'dashboard-history',
})

const avatarPalette = [
  'bg-orange-100 text-orange-700',
  'bg-violet-100 text-violet-700',
  'bg-teal-100 text-teal-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-sky-100 text-sky-700',
]

async function fetchLive() {
  const { data, count } = await supabase
    .from('workspaces')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .is('ended_at', null)
    .neq('name', 'New Sync')
    .order('participant_count', { ascending: false })
    .limit(12)

  liveWorkspaces.value = data ?? []
  liveCount.value = count ?? 0

  const ids = [...new Set((data ?? []).map((w: any) => w.creator_id).filter(Boolean))]
  const missing = ids.filter(id => !creatorProfiles.value.has(id as string))
  if (missing.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', missing)
    for (const p of profiles ?? []) {
      creatorProfiles.value.set(p.id, p)
    }
  }
  liveLoading.value = false
}

async function fetchHistory() {
  if (!auth.user) { historyLoading.value = false; return }

  // Collect IDs from both memberships and created workspaces
  const [{ data: memberships }, { data: created }] = await Promise.all([
    supabase.from('workspace_members').select('workspace_id').eq('user_id', auth.user.id),
    supabase.from('workspaces').select('id').eq('creator_id', auth.user.id),
  ])

  const ids = [...new Set([
    ...(memberships ?? []).map((m: any) => m.workspace_id),
    ...(created ?? []).map((w: any) => w.id),
  ])]
  if (ids.length === 0) { historyLoading.value = false; return }

  const { data } = await supabase
    .from('workspaces')
    .select('*')
    .in('id', ids)
    .not('ended_at', 'is', null)
    .order('ended_at', { ascending: false })
    .limit(24)

  historyWorkspaces.value = data ?? []

  const creatorIds = [...new Set((data ?? []).map((w: any) => w.creator_id).filter(Boolean))]
  const missing = creatorIds.filter(id => !creatorProfiles.value.has(id as string))
  if (missing.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', missing)
    for (const p of profiles ?? []) {
      creatorProfiles.value.set(p.id, p)
    }
  }
  historyLoading.value = false
}

async function fetchStats() {
  if (!auth.user) return
  const [{ count: hosted }, { count: joined }] = await Promise.all([
    supabase.from('workspaces').select('id', { count: 'exact', head: true }).eq('creator_id', auth.user.id),
    supabase.from('workspace_members').select('workspace_id', { count: 'exact', head: true }).eq('user_id', auth.user.id),
  ])
  hostedCount.value = hosted ?? 0
  syncCount.value = joined ?? 0
}

onMounted(async () => {
  document.addEventListener('click', onClickOutside)
  await Promise.all([fetchLive(), fetchHistory(), fetchStats()])
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

// ── Helpers ─────────────────────────────────────────────────────────────────
function creatorOf(workspace: any) {
  return creatorProfiles.value.get(workspace.creator_id) ?? null
}

function creatorName(workspace: any) {
  const p = creatorOf(workspace)
  return p?.full_name || p?.username || 'Unknown'
}

function syncInitials(name: string) {
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const filteredLive = computed(() =>
  liveWorkspaces.value.filter(w =>
    !liveSearch.value || w.name?.toLowerCase().includes(liveSearch.value.toLowerCase()),
  ),
)

const filteredHistory = computed(() =>
  historyWorkspaces.value.filter(w =>
    !historySearch.value || w.name?.toLowerCase().includes(historySearch.value.toLowerCase()),
  ),
)
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
            <div class="flex items-center gap-2 border border-[#e0e0d4] bg-white rounded-full px-4 py-3 w-64">
              <svg class="h-4 w-4 text-[#b0b09a] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <input type="text" placeholder="Enter a code or link" class="bg-transparent text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none w-full" />
            </div>
          </div>
        </div>

        <!-- Profile card -->
        <div class="shrink-0 hidden lg:block">
          <div class="bg-[#dde8c8]/70 border border-[#c8d8b0] rounded-2xl p-5 text-center w-56">
            <div class="h-14 w-14 rounded-full bg-[#2d4a1e] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
              {{ initials }}
            </div>
            <p class="font-display font-bold text-[#1a1a0e] text-sm uppercase tracking-wide">{{ fullName }}</p>
            <p class="text-xs text-[#9a9a82] mt-0.5">@{{ handle }} · joined {{ joinedDate }}</p>
            <div class="flex items-center justify-around mt-4 py-3 border-y border-[#c8d8b0]">
              <div class="text-center">
                <p class="text-base font-bold text-[#2d2d1a]">{{ syncCount }}</p>
                <p class="text-[9px] text-[#9a9a82] uppercase tracking-wider">Syncs</p>
              </div>
              <div class="text-center">
                <p class="text-base font-bold text-[#2d2d1a]">—</p>
                <p class="text-[9px] text-[#9a9a82] uppercase tracking-wider">Met</p>
              </div>
              <div class="text-center">
                <p class="text-base font-bold text-[#2d2d1a]">{{ hostedCount }}</p>
                <p class="text-[9px] text-[#9a9a82] uppercase tracking-wider">Hosted</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Live Syncs ─────────────────────────────────────── -->
      <div class="mb-14">
        <div class="flex items-center gap-2.5 mb-4">
          <span class="h-2 w-2 rounded-full bg-green-500" />
          <span class="text-sm font-medium text-[#2d2d1a]">live</span>
          <span class="border border-[#b5cfb0] text-[#3a5a2d] text-xs font-medium px-3 py-0.5 rounded-full">
            {{ liveCount }} open
          </span>
        </div>

        <!-- Search + filter -->
        <div class="flex items-center gap-3 mb-6">
          <div class="flex items-center gap-2 bg-[#ebebdf] rounded-lg px-3 py-2.5 w-64">
            <svg class="h-4 w-4 text-[#9a9a82] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="liveSearch" type="text" placeholder="search" class="bg-transparent text-sm text-[#2d2d1a] placeholder-[#9a9a82] focus:outline-none w-full" />
          </div>

          <div ref="liveFilterRef" class="relative">
            <button
              class="flex items-center gap-2 bg-[#ebebdf] rounded-lg px-4 py-2.5 text-sm text-[#6b6b5a] hover:bg-[#e0e0d4] transition-colors"
              @click.stop="liveFilterOpen = !liveFilterOpen"
            >
              {{ liveFilter }}
              <svg class="h-3.5 w-3.5 shrink-0 transition-transform" :class="liveFilterOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Transition enter-active-class="transition-all duration-150 ease-out" enter-from-class="opacity-0 scale-95 translate-y-1" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition-all duration-100 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-1">
              <div v-if="liveFilterOpen" class="absolute left-0 top-11 w-44 bg-white border border-[#e8e8e0] rounded-xl shadow-lg py-1 z-20">
                <button v-for="opt in filterOptions" :key="opt" class="w-full text-left px-4 py-2 text-sm hover:bg-[#f5f5f0] transition-colors" :class="liveFilter === opt ? 'text-[#2d4a1e] font-semibold' : 'text-[#2d2d1a]'" @click="liveFilter = opt; liveFilterOpen = false">
                  {{ opt }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="liveLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="n in 4" :key="n" class="bg-white border border-[#e8e8e0] rounded-3xl p-7 h-64 animate-pulse" />
        </div>

        <!-- Empty state -->
        <div v-else-if="filteredLive.length === 0" class="text-center py-16">
          <p class="text-[#9a9a82] text-sm">No live syncs right now.</p>
          <button class="mt-3 text-sm text-[#5a6e2a] underline underline-offset-2 hover:text-[#2d4a1e]" @click="emit('start-room')">Start the first one →</button>
        </div>

        <!-- Cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
          <div
            v-for="(ws, i) in filteredLive"
            :key="ws.id"
            class="bg-white border border-[#e8e8e0] rounded-3xl p-7 flex flex-col gap-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-[#c8c89e] hover:-translate-y-0.5"
            @click="router.push(`/workspace/${ws.id}`)"
          >
            <!-- LIVE + category -->
            <div class="flex items-center justify-between">
              <span class="inline-flex items-center gap-1.5 bg-[#e8f0e3] text-[#387C00] text-xs font-semibold px-3 py-1.5 rounded-full">
                <span class="h-2 w-2 rounded-full bg-[#387C00] animate-pulse" />
                LIVE
              </span>
              <span v-if="ws.category" class="text-xs text-muted truncate max-w-[110px]">{{ ws.category }}</span>
            </div>

            <!-- Title -->
            <h3 class="text-[#41431B] font-sans font-semibold text-xl leading-snug line-clamp-2">{{ ws.name }}</h3>

            <!-- Description -->
            <p v-if="ws.description" class="text-muted text-sm leading-relaxed flex-1 line-clamp-2">{{ ws.description }}</p>
            <div v-else class="flex-1" />

            <!-- Host -->
            <div class="flex items-center gap-3 mt-8">
              <div :class="['h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0', avatarPalette[i % avatarPalette.length]]">
                {{ syncInitials(creatorName(ws)) }}
              </div>
              <div>
                <p class="text-[#a0a08a] text-[10px] uppercase tracking-widest mb-0.5">Host</p>
                <span class="font-display text-xs font-semibold text-[#2d2d1a] uppercase tracking-wider">{{ creatorName(ws) }}</span>
              </div>
            </div>

            <div class="border-t border-[#f0f0e8]" />

            <!-- Footer -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-muted">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="text-xs">{{ ws.participant_count ?? 0 }} joined</span>
              </div>
              <button class="bg-[#387C00] hover:bg-forest text-white text-xs font-semibold px-7 py-2 rounded-full transition-colors" @click.stop="router.push(`/workspace/${ws.id}`)">
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ── History ─────────────────────────────────────────── -->
      <div>
        <div class="flex items-center gap-2.5 mb-4">
          <svg class="h-4 w-4 text-[#6b6b5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium text-[#2d2d1a]">past syncs</span>
        </div>

        <!-- Search + filter -->
        <div class="flex items-center gap-3 mb-6">
          <div class="flex items-center gap-2 bg-[#ebebdf] rounded-lg px-3 py-2.5 w-64">
            <svg class="h-4 w-4 text-[#9a9a82] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input v-model="historySearch" type="text" placeholder="search" class="bg-transparent text-sm text-[#2d2d1a] placeholder-[#9a9a82] focus:outline-none w-full" />
          </div>

          <div ref="historyFilterRef" class="relative">
            <button
              class="flex items-center gap-2 bg-[#ebebdf] rounded-lg px-4 py-2.5 text-sm text-[#6b6b5a] hover:bg-[#e0e0d4] transition-colors"
              @click.stop="historyFilterOpen = !historyFilterOpen"
            >
              {{ historyFilter }}
              <svg class="h-3.5 w-3.5 shrink-0 transition-transform" :class="historyFilterOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Transition enter-active-class="transition-all duration-150 ease-out" enter-from-class="opacity-0 scale-95 translate-y-1" enter-to-class="opacity-100 scale-100 translate-y-0" leave-active-class="transition-all duration-100 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0" leave-to-class="opacity-0 scale-95 translate-y-1">
              <div v-if="historyFilterOpen" class="absolute left-0 top-11 w-44 bg-white border border-[#e8e8e0] rounded-xl shadow-lg py-1 z-20">
                <button v-for="opt in filterOptions" :key="opt" class="w-full text-left px-4 py-2 text-sm hover:bg-[#f5f5f0] transition-colors" :class="historyFilter === opt ? 'text-[#2d4a1e] font-semibold' : 'text-[#2d2d1a]'" @click="historyFilter = opt; historyFilterOpen = false">
                  {{ opt }}
                </button>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="historyLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="n in 4" :key="n" class="bg-white border border-[#e8e8e0] rounded-3xl p-7 h-52 animate-pulse" />
        </div>

        <!-- Empty -->
        <div v-else-if="filteredHistory.length === 0" class="text-center py-10 text-muted text-sm">
          No syncs yet. Join or start one to see it here.
        </div>

        <!-- History cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
          <div
            v-for="(ws, i) in filteredHistory"
            :key="ws.id"
            class="bg-white border border-[#e8e8e0] rounded-3xl p-7 flex flex-col gap-4 opacity-80"
          >
            <!-- Status + category -->
            <div class="flex items-center justify-between">
              <span class="bg-[#f0f0e4] text-[#6b6b5a] text-xs font-medium px-3 py-1.5 rounded-full">
                {{ timeAgo(ws.ended_at) }}
              </span>
              <span v-if="ws.category" class="text-xs text-muted truncate max-w-25">{{ ws.category }}</span>
            </div>

            <!-- Title -->
            <h3 class="text-[#41431B] font-sans font-semibold text-xl leading-snug line-clamp-2">{{ ws.name }}</h3>

            <!-- Description -->
            <p v-if="ws.description" class="text-muted text-sm leading-relaxed flex-1 line-clamp-2">{{ ws.description }}</p>
            <div v-else class="flex-1" />

            <!-- Host -->
            <div class="flex items-center gap-3 mt-4">
              <div :class="['h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0', avatarPalette[i % avatarPalette.length]]">
                {{ syncInitials(creatorName(ws)) }}
              </div>
              <div>
                <p class="text-[#a0a08a] text-[10px] uppercase tracking-widest mb-0.5">Host</p>
                <span class="font-display text-xs font-semibold text-[#2d2d1a] uppercase tracking-wider">{{ creatorName(ws) }}</span>
              </div>
            </div>

            <div class="border-t border-[#f0f0e8]" />

            <!-- Footer -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1.5 text-muted">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span class="text-xs">{{ ws.participant_count ?? 0 }} joined</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
