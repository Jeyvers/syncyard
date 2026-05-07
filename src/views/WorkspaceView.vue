<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

declare global {
  interface Window { JitsiMeetExternalAPI: any }
}

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const workspaceId = route.params.id as string

const workspace = ref<any>(null)
const creator = ref<any>(null)
const loading = ref(true)
const jitsiContainer = ref<HTMLDivElement | null>(null)
let jitsiApi: any = null

const isCreator = computed(() => workspace.value?.creator_id === auth.user?.id)

// Creator form fields
const title = ref('')
const description = ref('')
const category = ref('')
const maxEntry = ref<number | string>('')
const saving = ref(false)
const saved = ref(false)

// Joiner
const liked = ref(false)
const likeCount = ref(0)

const categories = [
  'Tech & Founders', 'Creatives (Art, Music, Writing)', 'Late Night Chats',
  'Girlies', 'Design Critique', 'Writers Room', 'Everything', 'Story Time', 'Other',
]

onMounted(async () => {
  const { data: ws } = await supabase
    .from('workspaces')
    .select('*, creator:profiles!workspaces_creator_id_fkey(id, full_name, username, bio, avatar_url, tags)')
    .eq('id', workspaceId)
    .single()

  if (ws) {
    workspace.value = ws
    creator.value = ws.creator
    title.value = ws.name === 'New Sync' ? '' : (ws.name ?? '')
    description.value = ws.description ?? ''
    category.value = ws.category ?? ''
    maxEntry.value = ws.max_members ?? ''
    likeCount.value = ws.like_count ?? 0
  }

  loading.value = false
  loadJitsi()
})

function loadJitsi() {
  if (document.getElementById('jitsi-api-script')) { initJitsi(); return }
  const s = document.createElement('script')
  s.id = 'jitsi-api-script'
  s.src = 'https://meet.jit.si/external_api.js'
  s.async = true
  s.onload = () => initJitsi()
  document.head.appendChild(s)
}

function initJitsi() {
  if (!jitsiContainer.value || !window.JitsiMeetExternalAPI) return
  const displayName =
    auth.profile?.full_name ||
    auth.user?.user_metadata?.full_name ||
    localStorage.getItem('syncyard_guest_name') ||
    'Guest'

  jitsiApi = new window.JitsiMeetExternalAPI('meet.jit.si', {
    roomName: `syncyard-${workspaceId}`,
    parentNode: jitsiContainer.value,
    width: '100%',
    height: '100%',
    userInfo: { displayName },
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      prejoinPageEnabled: false,
      disableThirdPartyRequests: true,
      defaultLocalDisplayName: displayName,
    },
    interfaceConfigOverwrite: {
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: false,
      BRAND_WATERMARK_LINK: '',
      DEFAULT_BACKGROUND: '#111111',
      TOOLBAR_BUTTONS: [
        'microphone', 'camera', 'desktop', 'fullscreen', 'hangup',
        'chat', 'tileview', 'videoquality', 'raisehand', 'mute-everyone',
      ],
    },
  })

  jitsiApi.addEventListener('readyToClose', () => {
    router.push('/')
  })
}

async function saveRoomInfo() {
  saving.value = true
  await supabase.from('workspaces').update({
    name: title.value.trim() || 'Untitled Sync',
    description: description.value.trim() || null,
    category: category.value || null,
    max_members: maxEntry.value ? Number(maxEntry.value) : null,
  }).eq('id', workspaceId)
  saving.value = false
  saved.value = true
  setTimeout(() => { saved.value = false }, 2000)
}

async function toggleLike() {
  liked.value = !liked.value
  likeCount.value += liked.value ? 1 : -1
  await supabase.from('workspaces').update({ like_count: likeCount.value }).eq('id', workspaceId)
}

function creatorInitials(name: string = '') {
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
}

function leaveRoom() {
  jitsiApi?.dispose()
  router.push('/')
}

onUnmounted(() => { jitsiApi?.dispose() })
</script>

<template>

    <!-- Left panel -->
    <div class="w-72 shrink-0 flex flex-col bg-[#1c2e10] overflow-y-auto">
      <!-- Logo/back -->
      <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <RouterLink to="/">
          <img src="/images/logo.png" alt="Syncyard" class="h-4 w-auto brightness-0 invert opacity-80" />
        </RouterLink>
        <span class="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">
          <span class="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse-fast" />
          LIVE
        </span>
      </div>

      <div v-if="loading" class="flex-1 flex items-center justify-center">
        <div class="h-6 w-6 rounded-full border-2 border-white/20 border-t-green-400 animate-spin" />
      </div>

      <!-- Creator: room info form -->
      <template v-else-if="isCreator">
        <div class="flex-1 px-5 py-5">
          <p class="text-[#a8c890] text-xs font-semibold uppercase tracking-widest mb-1">Your sync</p>
          <h2 class="font-display text-white font-bold text-sm mb-5 leading-snug">
            Add a bit more information<br />for your sync
          </h2>

          <div class="space-y-3">
            <input
              v-model="title"
              type="text"
              placeholder="Title"
              class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7a9a50] focus:ring-1 focus:ring-[#7a9a50] transition-colors"
            />
            <input
              v-model="maxEntry"
              type="number"
              min="2"
              max="500"
              placeholder="Max Entry"
              class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7a9a50] focus:ring-1 focus:ring-[#7a9a50] transition-colors"
            />
            <textarea
              v-model="description"
              placeholder="Description"
              rows="3"
              class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7a9a50] focus:ring-1 focus:ring-[#7a9a50] transition-colors resize-none"
            />
            <select
              v-model="category"
              class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7a9a50] focus:ring-1 focus:ring-[#7a9a50] transition-colors appearance-none"
            >
              <option value="" disabled class="text-gray-900">Select Category</option>
              <option v-for="cat in categories" :key="cat" :value="cat" class="text-gray-900">{{ cat }}</option>
            </select>
          </div>

          <button
            :disabled="saving"
            class="mt-5 w-full bg-[#4a7a28] hover:bg-[#5a8a34] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
            @click="saveRoomInfo"
          >
            {{ saved ? '✓ Saved' : saving ? 'Saving...' : 'Save & publish' }}
          </button>

          <button
            class="mt-3 w-full border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm font-semibold py-2.5 rounded-xl transition-colors"
            @click="leaveRoom"
          >
            End & leave
          </button>
        </div>
      </template>

      <!-- Joiner: creator profile -->
      <template v-else>
        <div class="flex-1 px-5 py-5">
          <!-- Room info -->
          <div class="mb-5">
            <p class="text-[#a8c890] text-xs font-semibold uppercase tracking-widest mb-2">This sync</p>
            <h2 class="text-white font-bold text-base leading-snug mb-1">{{ workspace?.name }}</h2>
            <p v-if="workspace?.description" class="text-white/60 text-xs leading-relaxed">{{ workspace?.description }}</p>
            <div class="flex flex-wrap gap-1.5 mt-3">
              <span v-if="workspace?.category"
                class="bg-white/10 text-white/70 text-xs px-2.5 py-0.5 rounded-full">
                {{ workspace?.category }}
              </span>
              <span v-if="workspace?.max_members"
                class="bg-white/10 text-white/70 text-xs px-2.5 py-0.5 rounded-full">
                Max {{ workspace?.max_members }}
              </span>
            </div>
          </div>

          <button
            class="mb-4 w-full border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm font-semibold py-2.5 rounded-xl transition-colors"
            @click="leaveRoom"
          >
            Leave room
          </button>

          <!-- Like -->
          <button
            :class="['flex items-center gap-2 text-sm font-medium mb-5 transition-colors',
              liked ? 'text-rose-400' : 'text-white/60 hover:text-rose-300']"
            @click="toggleLike"
          >
            <svg class="h-5 w-5" :fill="liked ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {{ likeCount }} likes
          </button>

          <div class="border-t border-white/10 pt-5">
            <p class="text-[#a8c890] text-xs font-semibold uppercase tracking-widest mb-3">Hosted by</p>

            <div v-if="creator" class="flex items-start gap-3">
              <div class="h-10 w-10 rounded-full bg-[#4a7a28] flex items-center justify-center text-white text-sm font-bold shrink-0">
                {{ creatorInitials(creator.full_name || creator.username) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-white font-semibold text-sm">{{ creator.full_name || creator.username }}</p>
                <p v-if="creator.username" class="text-white/50 text-xs">@{{ creator.username }}</p>
                <p v-if="creator.bio" class="text-white/60 text-xs mt-1.5 leading-relaxed">{{ creator.bio }}</p>
              </div>
            </div>

            <div v-if="creator?.tags?.length" class="flex flex-wrap gap-1.5 mt-3">
              <span v-for="tag in creator.tags" :key="tag"
                class="bg-white/10 text-white/60 text-xs px-2.5 py-0.5 rounded-full">
                {{ tag }}
              </span>
            </div>

            <RouterLink
              v-if="creator?.username"
              :to="`/profile/${creator.username}`"
              class="mt-4 flex items-center gap-1.5 text-xs text-[#a8c890] hover:text-white transition-colors"
            >
              View full profile →
            </RouterLink>
          </div>
        </div>
      </template>
    </div>

    <!-- Jitsi video call area -->
    <div ref="jitsiContainer" class="flex-1 h-full" />
  </div>
</template>
