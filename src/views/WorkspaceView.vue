<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useLiveKit } from '@/composables/useLiveKit'
import { useRoomChat } from '@/composables/useRoomChat'
import RoomView from '@/components/room/RoomView.vue'
import ControlBar from '@/components/room/ControlBar.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const workspaceId = route.params.id as string

const workspace = ref<any>(null)
const creator = ref<any>(null)
const loading = ref(true)
const infoOpen = ref(false)

// LiveKit
const livekit = useLiveKit()

// Chat
const chat = useRoomChat(workspaceId)
const isChatOpen = ref(false)

watch(isChatOpen, (open) => {
  if (open) {
    chat.clearUnread()
    infoOpen.value = false
  }
})

const isCreator = computed(() => workspace.value?.creator_id === auth.user?.id)
const localIdentity = computed(() => auth.user?.id ?? 'guest')
const displayName = computed(
  () => auth.profile?.full_name || auth.user?.user_metadata?.full_name || 'Guest',
)

// Creator form
const title = ref('')
const description = ref('')
const category = ref('')
const maxEntry = ref<number | string>('')
const saving = ref(false)
const saved = ref(false)

// Joiner
const liked = ref(false)
const likeCount = ref(0)

// Link sharing
const linkCopied = ref(false)
async function copyRoomLink() {
  await navigator.clipboard.writeText(`${window.location.origin}/workspace/${workspaceId}`)
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 2000)
}

const categories = [
  'Tech & Founders', 'Creatives (Art, Music, Writing)', 'Late Night Chats',
  'Girlies', 'Design Critique', 'Writers Room', 'Everything', 'Story Time', 'Other',
]

// ── Supabase sync ─────────────────────────────────────────────────────────

async function markActive() {
  await supabase
    .from('workspaces')
    .update({ is_active: true, participant_count: (workspace.value?.participant_count ?? 0) + 1 })
    .eq('id', workspaceId)
}

async function markLeft() {
  const next = Math.max(0, (workspace.value?.participant_count ?? 1) - 1)
  await supabase
    .from('workspaces')
    .update({ participant_count: next, is_active: next > 0 })
    .eq('id', workspaceId)
}

// ── Lifecycle ─────────────────────────────────────────────────────────────

onMounted(async () => {
  const { data: ws } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  if (ws) {
    workspace.value = ws
    title.value = ws.name === 'New Sync' ? '' : (ws.name ?? '')
    description.value = ws.description ?? ''
    category.value = ws.category ?? ''
    maxEntry.value = ws.max_members ?? ''
    likeCount.value = ws.like_count ?? 0

    if (ws.creator_id) {
      const { data: creatorProfile } = await supabase
        .from('profiles')
        .select('id, full_name, username, bio, avatar_url, tags')
        .eq('id', ws.creator_id)
        .single()
      creator.value = creatorProfile
    }
  }

  loading.value = false

  // Auto-open sheet for creator so they can fill in room details
  if (isCreator.value) infoOpen.value = true

  await livekit.connect(workspaceId, localIdentity.value, displayName.value)
  await markActive()
})

// ── Actions ───────────────────────────────────────────────────────────────

async function saveRoomInfo() {
  saving.value = true
  await supabase.from('workspaces').update({
    name: title.value.trim() || 'Untitled Sync',
    description: description.value.trim() || null,
    category: category.value || null,
    max_members: maxEntry.value ? Number(maxEntry.value) : null,
  }).eq('id', workspaceId)
  workspace.value = { ...workspace.value, name: title.value.trim() || 'Untitled Sync' }
  saving.value = false
  saved.value = true
  setTimeout(() => { saved.value = false; infoOpen.value = false }, 1500)
}

async function toggleLike() {
  liked.value = !liked.value
  likeCount.value += liked.value ? 1 : -1
  await supabase.from('workspaces').update({ like_count: likeCount.value }).eq('id', workspaceId)
}

async function leaveRoom() {
  await markLeft()
  await livekit.disconnect()
  router.push('/')
}

function creatorInitials(name: string = '') {
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
}
</script>

<template>
  <div class="h-screen flex flex-col overflow-hidden bg-[#0d1a08]">

    <!-- Room area — fills all space above control bar -->
    <div class="flex-1 relative overflow-hidden">

      <!-- Navbar strip -->
      <div class="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
        <RouterLink to="/" class="pointer-events-auto">
          <img src="/images/logo.png" alt="Syncyard" class="h-4 w-auto brightness-0 invert opacity-70" />
        </RouterLink>
        <span class="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">
          <span class="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          LIVE
        </span>
      </div>

      <!-- LiveKit room (fills full area) -->
      <RoomView
        class="h-full"
        :participants="livekit.participants.value"
        :local-identity="localIdentity"
        :is-connecting="livekit.isConnecting.value"
        :is-creator="isCreator"
        :error="livekit.error.value"
        :is-chat-open="isChatOpen"
        :messages="chat.messages.value"
        @toggle-chat="isChatOpen = !isChatOpen"
        @leave="leaveRoom"
        @send-message="chat.sendMessage($event)"
      />

      <!-- ── Bottom info sheet ──────────────────────────────────────────── -->
      <div
        class="absolute inset-x-0 bottom-0 z-20 flex flex-col transition-transform duration-300 ease-out"
        :class="infoOpen ? 'translate-y-0' : 'translate-y-[calc(100%-52px)]'"
        style="max-height: 60vh"
      >
        <!-- Handle — always visible, 52px tall -->
        <button
          class="flex-shrink-0 h-[52px] flex items-center justify-between px-5 bg-[#182b0e] border-t border-white/15 rounded-t-2xl"
          @click="infoOpen = !infoOpen"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <div v-if="loading" class="h-3 w-24 bg-white/10 rounded animate-pulse" />
            <span v-else class="text-white text-sm font-semibold truncate">
              {{ workspace?.name || 'New Sync' }}
            </span>
            <span class="text-white/30 text-xs shrink-0">
              · {{ livekit.participantCount.value }} in room
            </span>
          </div>
          <svg
            class="h-4 w-4 text-white/40 transition-transform duration-200 shrink-0 ml-3"
            :class="infoOpen ? 'rotate-180' : ''"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>

        <!-- Sheet content -->
        <div class="flex-1 overflow-y-auto bg-[#182b0e] border-t border-white/5">

          <!-- Loading skeleton -->
          <div v-if="loading" class="flex items-center justify-center py-10">
            <div class="h-5 w-5 rounded-full border-2 border-white/20 border-t-green-400 animate-spin" />
          </div>

          <!-- ── Creator: room info form ── -->
          <template v-else-if="isCreator">
            <div class="px-5 py-4 space-y-2.5">
              <p class="text-[#a8c890] text-[10px] font-semibold uppercase tracking-widest">Your sync</p>
              <p class="text-white/60 text-xs">Add details so others know what to expect</p>

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
                rows="2"
                class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7a9a50] focus:ring-1 focus:ring-[#7a9a50] transition-colors resize-none"
              />
              <select
                v-model="category"
                class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#7a9a50] focus:ring-1 focus:ring-[#7a9a50] transition-colors appearance-none"
              >
                <option value="" disabled class="text-gray-900">Select Category</option>
                <option v-for="cat in categories" :key="cat" :value="cat" class="text-gray-900">{{ cat }}</option>
              </select>

              <div class="flex gap-2 pt-1">
                <button
                  :disabled="saving"
                  class="flex-1 bg-[#4a7a28] hover:bg-[#5a8a34] text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50"
                  @click="saveRoomInfo"
                >
                  {{ saved ? '✓ Saved' : saving ? 'Saving...' : 'Save & publish' }}
                </button>
                <button
                  class="flex items-center gap-1.5 border border-white/20 text-white/60 hover:text-white px-4 rounded-xl text-sm transition-colors"
                  @click="copyRoomLink"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {{ linkCopied ? 'Copied!' : 'Share' }}
                </button>
              </div>
            </div>
          </template>

          <!-- ── Joiner: host info ── -->
          <template v-else>
            <div class="px-5 py-4">
              <!-- Room meta -->
              <h2 class="text-white font-bold text-base leading-snug">{{ workspace?.name }}</h2>
              <p v-if="workspace?.description" class="text-white/60 text-xs leading-relaxed mt-1 mb-2">{{ workspace?.description }}</p>
              <div class="flex flex-wrap gap-1.5 mb-4">
                <span v-if="workspace?.category" class="bg-white/10 text-white/70 text-xs px-2.5 py-0.5 rounded-full">{{ workspace?.category }}</span>
                <span v-if="workspace?.max_members" class="bg-white/10 text-white/70 text-xs px-2.5 py-0.5 rounded-full">Max {{ workspace?.max_members }}</span>
              </div>

              <!-- Host card -->
              <div v-if="creator" class="border-t border-white/10 pt-4 mb-4">
                <p class="text-[#a8c890] text-[10px] font-semibold uppercase tracking-widest mb-3">Hosted by</p>
                <div class="flex items-start gap-3">
                  <div class="h-10 w-10 rounded-full bg-[#4a7a28] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {{ creatorInitials(creator.full_name || creator.username) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-white font-semibold text-sm">{{ creator.full_name || creator.username }}</p>
                    <p v-if="creator.username" class="text-white/50 text-xs">@{{ creator.username }}</p>
                    <p v-if="creator.bio" class="text-white/60 text-xs mt-1 leading-relaxed">{{ creator.bio }}</p>
                  </div>
                </div>
                <div v-if="creator?.tags?.length" class="flex flex-wrap gap-1.5 mt-3">
                  <span v-for="tag in creator.tags" :key="tag" class="bg-white/10 text-white/60 text-xs px-2.5 py-0.5 rounded-full">{{ tag }}</span>
                </div>
                <RouterLink
                  v-if="creator?.username"
                  :to="`/profile/${creator.username}`"
                  class="mt-3 inline-flex items-center gap-1 text-xs text-[#a8c890] hover:text-white transition-colors"
                >
                  View full profile →
                </RouterLink>
              </div>

              <!-- Action row -->
              <div class="flex items-center gap-2">
                <button
                  class="flex-1 flex items-center justify-center gap-1.5 border border-white/20 text-white/70 hover:text-white hover:border-white/40 text-sm font-semibold py-2.5 rounded-xl transition-colors"
                  @click="copyRoomLink"
                >
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {{ linkCopied ? 'Copied!' : 'Share room' }}
                </button>
                <button
                  :class="['flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors',
                    liked ? 'border-rose-500/40 text-rose-400 bg-rose-500/10' : 'border-white/20 text-white/60 hover:text-rose-300']"
                  @click="toggleLike"
                >
                  <svg class="h-4 w-4" :fill="liked ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {{ likeCount }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>

    </div>

    <!-- ── Control bar — always fixed at the very bottom ── -->
    <ControlBar
      :is-mic-enabled="livekit.isMicEnabled.value"
      :is-camera-enabled="livekit.isCameraEnabled.value"
      :participant-count="livekit.participantCount.value"
      :is-chat-open="isChatOpen"
      :unread-count="chat.unreadCount.value"
      @toggle-mic="livekit.toggleMic()"
      @toggle-camera="livekit.toggleCamera()"
      @toggle-chat="isChatOpen = !isChatOpen"
      @leave="leaveRoom"
    />

  </div>
</template>
