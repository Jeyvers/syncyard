<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthModal } from '@/composables/useAuthModal'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import { useRealtimeWorkspaces } from '@/composables/useRealtimeWorkspaces'

const { openModal } = useAuthModal()
const auth = useAuthStore()
const router = useRouter()

const workspaces = ref<any[]>([])
const creatorProfiles = ref<Map<string, any>>(new Map())
const liveCount = ref(0)
const loading = ref(true)

async function ensureCreatorProfile(creatorId: string) {
  if (!creatorId || creatorProfiles.value.has(creatorId)) return
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, username, avatar_url')
    .eq('id', creatorId)
    .single()
  if (data) creatorProfiles.value.set(data.id, data)
}

useRealtimeWorkspaces(workspaces, {
  filter: ws => ws.is_active && !ws.ended_at && ws.name !== 'New Sync',
  channelName: 'happening-now',
  onAdded: (ws) => {
    liveCount.value += 1
    ensureCreatorProfile(ws.creator_id)
  },
  onRemoved: () => { liveCount.value = Math.max(0, liveCount.value - 1) },
})

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

async function fetchLive() {
  const { data, count } = await supabase
    .from('workspaces')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .is('ended_at', null)
    .neq('name', 'New Sync')
    .order('participant_count', { ascending: false })
    .limit(6)

  workspaces.value = data ?? []
  liveCount.value = count ?? 0

  const ids = [...new Set((data ?? []).map((w: any) => w.creator_id).filter(Boolean))]
  const missing = ids.filter(id => !creatorProfiles.value.has(id as string))
  if (missing.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, username, avatar_url')
      .in('id', missing)
    for (const p of profiles ?? []) creatorProfiles.value.set(p.id, p)
  }
  loading.value = false
}

onMounted(async () => {
  await fetchLive()
})

function creatorName(ws: any) {
  const p = creatorProfiles.value.get(ws.creator_id)
  return p?.full_name || p?.username || 'Unknown'
}

function initials(name: string) {
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
}

function handleJoin(workspaceId?: string) {
  if (workspaceId) {
    if (auth.isAuthenticated) {
      router.push(`/workspace/${workspaceId}`)
    } else {
      router.push(`/?auth=login&redirect=${encodeURIComponent(`/workspace/${workspaceId}`)}`)
    }
  } else if (auth.isAuthenticated) {
    document.getElementById('happening-right-now')?.scrollIntoView({ behavior: 'smooth' })
  } else {
    openModal('login')
  }
}
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
          <span class="border border-[#b5cfb0] text-[#3a5a2d] text-xs font-semibold px-3 py-0.5 rounded-full">
            {{ liveCount }} open
          </span>
        </div>
        <button class="text-sm text-[#6b6b5a] hover:text-[#2d2d1a] transition-colors" @click="handleJoin()">
          See all syncs →
        </button>
      </div>

      <!-- Loading skeletons -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="n in 3" :key="n" class="bg-white border border-[#e8e8e0] rounded-3xl p-7 h-64 animate-pulse" />
      </div>

      <!-- Empty state -->
      <div v-else-if="workspaces.length === 0" class="text-center py-16">
        <p class="text-[#9a9a82] text-sm">No live syncs right now — be the first!</p>
        <button class="mt-3 text-sm text-[#387C00] underline underline-offset-2 hover:text-[#2d4a1e]" @click="handleJoin()">
          Start a Sync →
        </button>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
        <div
          v-for="(ws, i) in workspaces"
          :key="ws.id"
          class="bg-white border border-[#e8e8e0] rounded-3xl p-7 flex flex-col gap-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-[#c8c89e] hover:-translate-y-0.5 group"
          @click="handleJoin(ws.id)"
        >
          <!-- LIVE + category -->
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1.5 bg-[#e8f0e3] text-[#387C00] text-xs font-semibold px-3 py-1.5 rounded-full">
              <span class="h-2 w-2 rounded-full bg-[#387C00] animate-pulse" />
              LIVE
            </span>
            <span v-if="ws.category" class="text-xs text-muted truncate max-w-28">{{ ws.category }}</span>
          </div>

          <!-- Title -->
          <h3 class="text-[#41431B] font-sans font-semibold text-xl leading-snug line-clamp-2">{{ ws.name }}</h3>

          <!-- Description -->
          <p class="text-muted text-sm leading-relaxed flex-1 line-clamp-2">{{ ws.description || 'Join this open sync.' }}</p>

          <!-- Host -->
          <div class="flex items-center gap-3 mt-8">
            <div :class="['h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0', avatarColors[i % avatarColors.length]]">
              {{ initials(creatorName(ws)) }}
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
            <button class="bg-[#387C00] hover:bg-forest text-white text-xs font-semibold px-7 py-2 rounded-full transition-colors" @click.stop="handleJoin(ws.id)">
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
