<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import { useLiveKit } from '@/composables/useLiveKit'
import { useRoomChat } from '@/composables/useRoomChat'
import { useGuestSession } from '@/composables/useGuestSession'
import RoomView from '@/components/room/RoomView.vue'
import RoomChat from '@/components/room/RoomChat.vue'
import ControlBar from '@/components/room/ControlBar.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const guestSession = useGuestSession()
const workspaceId = route.params.id as string

const workspace = ref<any>(null)
const creator = ref<any>(null)
const loading = ref(true)
const isEnded = ref(false)

// LiveKit
const livekit = useLiveKit()

// Chat
const chat = useRoomChat(workspaceId)

// ── Right panel state ──────────────────────────────────────────────────────
type PanelTab = 'info' | 'chat'
const isPanelOpen = ref(true)
const activeTab = ref<PanelTab>('info')

watch(activeTab, (tab) => {
  if (tab === 'chat') chat.clearUnread()
})

// When ControlBar chat button is pressed:
// closed panel → open on chat tab
// panel on info tab → switch to chat
// panel on chat tab → close
function handleToggleChat() {
  if (!isPanelOpen.value) {
    isPanelOpen.value = true
    activeTab.value = 'chat'
  } else if (activeTab.value !== 'chat') {
    activeTab.value = 'chat'
  } else {
    isPanelOpen.value = false
  }
}

const isChatActive = computed(() => isPanelOpen.value && activeTab.value === 'chat')

// ── Auth ───────────────────────────────────────────────────────────────────
const isCreator = computed(() => !!auth.user?.id && workspace.value?.creator_id === auth.user.id)
const localIdentity = computed(() => auth.user?.id ?? guestSession.guestId.value ?? 'guest')
const displayName = computed(() => {
  if (auth.isAuthenticated) return auth.profile?.full_name || auth.user?.user_metadata?.full_name || 'User'
  return guestSession.guestName.value || 'Guest'
})

// ── Creator form (bottom sheet) ────────────────────────────────────────────
const title = ref('')
const description = ref('')
const category = ref('')
const maxEntry = ref<number | string>('')
const saving = ref(false)
// Sheet disappears once info is filled; persisted by checking workspace name
const infoFilled = ref(false)
const showCreatorSheet = computed(
  () => isCreator.value && !infoFilled.value,
)

// In-panel edit mode (Info tab)
const isEditing = ref(false)

// ── Joiner ─────────────────────────────────────────────────────────────────
const liked = ref(false)
const likeCount = ref(0)
const linkCopied = ref(false)

async function copyRoomLink() {
  await navigator.clipboard.writeText(`${window.location.origin}/workspace/${workspaceId}`)
  linkCopied.value = true
  setTimeout(() => { linkCopied.value = false }, 2000)
}

const categories = [
  'Tech & Founders', 'Creatives (Art, Music, Writing)', 'Late Night Chats',
  'Girlies', 'Design Critique', 'Writers Sync', 'Everything', 'Story Time', 'Other',
]

// ── Supabase sync ──────────────────────────────────────────────────────────
async function markActive() {
  if (!auth.isAuthenticated) return
  await supabase
    .from('workspaces')
    .update({ is_active: true, participant_count: (workspace.value?.participant_count ?? 0) + 1 })
    .eq('id', workspaceId)
}

async function markLeft() {
  if (!auth.isAuthenticated) return
  const next = Math.max(0, (workspace.value?.participant_count ?? 1) - 1)
  const updates: Record<string, unknown> = { participant_count: next, is_active: next > 0 }
  if (next === 0) updates.ended_at = new Date().toISOString()
  await supabase.from('workspaces').update(updates).eq('id', workspaceId)
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
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

    // Mark as ended if ended_at is set
    if (ws.ended_at) {
      isEnded.value = true
      loading.value = false
      return
    }

    // Auto-expire: no one present for 30+ minutes
    const ageMs = Date.now() - new Date(ws.created_at).getTime()
    if (!ws.is_active && (ws.participant_count ?? 0) === 0 && ageMs > 30 * 60 * 1000) {
      isEnded.value = true
      loading.value = false
      return
    }

    // If the sync already has a real title, info is considered filled
    if (ws.name && ws.name !== 'New Sync') infoFilled.value = true

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

  await livekit.connect(workspaceId, localIdentity.value, displayName.value)
  await markActive()
})

// ── Actions ────────────────────────────────────────────────────────────────
async function saveRoomInfo() {
  if (!title.value.trim()) return
  saving.value = true
  await supabase.from('workspaces').update({
    name: title.value.trim(),
    description: description.value.trim() || null,
    category: category.value || null,
    max_members: maxEntry.value ? Number(maxEntry.value) : null,
  }).eq('id', workspaceId)
  workspace.value = {
    ...workspace.value,
    name: title.value.trim(),
    description: description.value.trim() || null,
    category: category.value || null,
    max_members: maxEntry.value ? Number(maxEntry.value) : null,
  }
  saving.value = false
  infoFilled.value = true
  isEditing.value = false
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

    <!-- ── Ended state ───────────────────────────────────────────────────── -->
    <div v-if="isEnded" class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <div class="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center mb-5">
        <svg class="h-8 w-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-white font-semibold text-xl mb-2">This sync has ended</h2>
      <p class="text-white/50 text-sm max-w-sm leading-relaxed mb-6">The host has left or the sync expired due to inactivity. Start a new one to keep the conversation going.</p>
      <RouterLink to="/" class="bg-[#4a7a28] hover:bg-[#5a8a34] text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors">
        Back to home
      </RouterLink>
    </div>

    <!-- ── Main area ─────────────────────────────────────────────────────── -->
    <template v-else>
    <div class="flex-1 flex overflow-hidden relative">

      <!-- Floating top bar -->
      <div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/40 to-transparent pointer-events-none">
        <RouterLink to="/" class="pointer-events-auto">
          <img src="/images/logo.png" alt="Syncyard" class="h-4 w-auto brightness-0 invert opacity-70" />
        </RouterLink>
        <span class="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-1 rounded-full">
          <span class="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          LIVE
        </span>
      </div>

      <!-- Video grid — takes all remaining width -->
      <RoomView
        class="flex-1 min-w-0"
        :participants="livekit.participants.value"
        :local-identity="localIdentity"
        :is-connecting="livekit.isConnecting.value"
        :is-creator="isCreator"
        :error="livekit.error.value"
        @leave="leaveRoom"
      />

      <!-- ── Right panel (Info + Chat tabs) ────────────────────────────── -->
      <Transition
        enter-active-class="transition-transform duration-200 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-150 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div
          v-if="isPanelOpen"
          class="absolute inset-y-0 right-0 left-0 z-10 flex flex-col md:static md:inset-auto md:w-72 md:shrink-0 bg-[#1c2e10] border-l border-white/10"
        >
          <!-- Tab bar -->
          <div class="flex items-center border-b border-white/10 shrink-0">
            <button
              v-for="tab in (['info', 'chat'] as const)"
              :key="tab"
              :class="[
                'flex-1 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors',
                activeTab === tab
                  ? 'text-white border-b-2 border-[#4a7a28]'
                  : 'text-white/40 hover:text-white/70',
              ]"
              @click="activeTab = tab"
            >
              <span class="flex items-center justify-center gap-1.5">
                {{ tab === 'info' ? 'Info' : 'Chat' }}
                <span
                  v-if="tab === 'chat' && chat.unreadCount.value > 0 && activeTab !== 'chat'"
                  class="h-4 min-w-[16px] px-0.5 rounded-full bg-[#4a7a28] text-white text-[9px] font-bold flex items-center justify-center"
                >
                  {{ chat.unreadCount.value > 99 ? '99+' : chat.unreadCount.value }}
                </span>
              </span>
            </button>
            <!-- Close button (mobile only) -->
            <button
              class="md:hidden px-4 py-3.5 text-white/40 hover:text-white transition-colors"
              @click="isPanelOpen = false"
            >
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- ── INFO TAB ─────────────────────────────────────────────── -->
          <div v-if="activeTab === 'info'" class="flex-1 overflow-y-auto">

            <div v-if="loading" class="flex items-center justify-center py-10">
              <div class="h-5 w-5 rounded-full border-2 border-white/20 border-t-green-400 animate-spin" />
            </div>

            <template v-else>
              <!-- Participant count pill -->
              <div class="px-4 pt-4 pb-2">
                <div class="flex items-center gap-1.5 text-white/50 text-xs">
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ livekit.participantCount.value }} in this sync
                </div>
              </div>

              <!-- ── Creator: room info section ── -->
              <template v-if="isCreator">
                <div class="px-4 py-3 border-b border-white/10">
                  <div class="flex items-center justify-between mb-2">
                    <p class="text-[#a8c890] text-[10px] font-semibold uppercase tracking-widest">Your sync</p>
                    <button
                      v-if="!isEditing"
                      class="text-[10px] text-white/40 hover:text-white/70 transition-colors flex items-center gap-1"
                      @click="isEditing = true"
                    >
                      <svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  </div>

                  <!-- Display mode -->
                  <template v-if="!isEditing">
                    <h3 class="text-white font-semibold text-sm leading-snug">{{ workspace?.name }}</h3>
                    <p v-if="workspace?.description" class="text-white/60 text-xs leading-relaxed mt-1">{{ workspace?.description }}</p>
                    <div class="flex flex-wrap gap-1.5 mt-2">
                      <span v-if="workspace?.category" class="bg-white/10 text-white/60 text-[10px] px-2 py-0.5 rounded-full">{{ workspace?.category }}</span>
                      <span v-if="workspace?.max_members" class="bg-white/10 text-white/60 text-[10px] px-2 py-0.5 rounded-full">Max {{ workspace?.max_members }}</span>
                    </div>
                    <button
                      class="mt-3 w-full flex items-center justify-center gap-1.5 border border-white/20 text-white/60 hover:text-white text-xs font-medium py-2 rounded-lg transition-colors"
                      @click="copyRoomLink"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {{ linkCopied ? 'Link copied!' : 'Copy invite link' }}
                    </button>
                  </template>

                  <!-- Edit mode (inline) -->
                  <template v-else>
                    <div class="space-y-2">
                      <input v-model="title" type="text" placeholder="Title"
                        class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#7a9a50] transition-colors" />
                      <textarea v-model="description" placeholder="Description" rows="2"
                        class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#7a9a50] transition-colors resize-none" />
                      <input v-model="maxEntry" type="number" min="2" max="500" placeholder="Max Entry"
                        class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#7a9a50] transition-colors" />
                      <select v-model="category"
                        class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#7a9a50] transition-colors appearance-none">
                        <option value="" disabled class="text-gray-900">Category</option>
                        <option v-for="cat in categories" :key="cat" :value="cat" class="text-gray-900">{{ cat }}</option>
                      </select>
                      <div class="flex gap-2 pt-1">
                        <button :disabled="saving"
                          class="flex-1 bg-[#4a7a28] hover:bg-[#5a8a34] text-white text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                          @click="saveRoomInfo">
                          {{ saving ? 'Saving…' : 'Save' }}
                        </button>
                        <button class="px-3 border border-white/20 text-white/60 hover:text-white text-xs rounded-lg transition-colors" @click="isEditing = false">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </template>
                </div>

                <!-- Creator's own profile section -->
                <div class="px-4 py-3">
                  <p class="text-[#a8c890] text-[10px] font-semibold uppercase tracking-widest mb-3">You</p>
                  <div class="flex items-start gap-2.5">
                    <div class="h-9 w-9 rounded-full bg-[#4a7a28] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {{ creatorInitials(auth.profile?.full_name || '') }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-white text-sm font-semibold leading-tight">{{ auth.profile?.full_name }}</p>
                      <p v-if="auth.profile?.username" class="text-white/50 text-xs">@{{ auth.profile?.username }}</p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- ── Joiner: room + host info ── -->
              <template v-else>
                <!-- Room meta -->
                <div class="px-4 py-3 border-b border-white/10">
                  <p class="text-[#a8c890] text-[10px] font-semibold uppercase tracking-widest mb-2">This sync</p>
                  <h3 class="text-white font-semibold text-sm leading-snug">{{ workspace?.name }}</h3>
                  <p v-if="workspace?.description" class="text-white/60 text-xs leading-relaxed mt-1">{{ workspace?.description }}</p>
                  <div class="flex flex-wrap gap-1.5 mt-2">
                    <span v-if="workspace?.category" class="bg-white/10 text-white/60 text-[10px] px-2 py-0.5 rounded-full">{{ workspace?.category }}</span>
                    <span v-if="workspace?.max_members" class="bg-white/10 text-white/60 text-[10px] px-2 py-0.5 rounded-full">Max {{ workspace?.max_members }}</span>
                  </div>
                  <!-- Actions -->
                  <div class="flex items-center gap-2 mt-3">
                    <button
                      class="flex-1 flex items-center justify-center gap-1 border border-white/20 text-white/60 hover:text-white text-xs font-medium py-2 rounded-lg transition-colors"
                      @click="copyRoomLink"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {{ linkCopied ? 'Copied!' : 'Share' }}
                    </button>
                    <button
                      :class="['flex items-center gap-1 text-xs font-medium px-3 py-2 rounded-lg border transition-colors',
                        liked ? 'border-rose-500/40 text-rose-400 bg-rose-500/10' : 'border-white/20 text-white/60 hover:text-rose-300']"
                      @click="toggleLike"
                    >
                      <svg class="h-3.5 w-3.5" :fill="liked ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {{ likeCount }}
                    </button>
                  </div>
                </div>

                <!-- Host info -->
                <div v-if="creator" class="px-4 py-3">
                  <p class="text-[#a8c890] text-[10px] font-semibold uppercase tracking-widest mb-3">Hosted by</p>
                  <div class="flex items-start gap-2.5">
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
                    <span v-for="tag in creator.tags" :key="tag" class="bg-white/10 text-white/60 text-[10px] px-2 py-0.5 rounded-full">{{ tag }}</span>
                  </div>
                  <RouterLink
                    v-if="creator?.username"
                    :to="`/profile/${creator.username}`"
                    class="mt-3 inline-flex items-center gap-1 text-xs text-[#a8c890] hover:text-white transition-colors"
                  >
                    View full profile →
                  </RouterLink>
                </div>

                <!-- Guest "You" section -->
                <div v-if="guestSession.isGuest.value && !auth.isAuthenticated" class="px-4 py-3 border-t border-white/10">
                  <p class="text-[#a8c890] text-[10px] font-semibold uppercase tracking-widest mb-3">You</p>
                  <div class="flex items-center gap-2.5">
                    <div class="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {{ creatorInitials(guestSession.guestName.value || 'G') }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center gap-1.5">
                        <p class="text-white text-sm font-semibold leading-tight">{{ guestSession.guestName.value }}</p>
                        <span class="bg-white/15 text-white/50 text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase tracking-wide">Guest</span>
                      </div>
                      <p class="text-white/40 text-xs mt-0.5">Listening only</p>
                    </div>
                  </div>
                </div>

                <!-- Authenticated joiner "You" section -->
                <div v-else-if="auth.isAuthenticated" class="px-4 py-3 border-t border-white/10">
                  <p class="text-[#a8c890] text-[10px] font-semibold uppercase tracking-widest mb-3">You</p>
                  <div class="flex items-center gap-2.5">
                    <div class="h-9 w-9 rounded-full bg-[#4a7a28] flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {{ creatorInitials(auth.profile?.full_name || '') }}
                    </div>
                    <div class="min-w-0">
                      <p class="text-white text-sm font-semibold leading-tight">{{ auth.profile?.full_name }}</p>
                      <p v-if="auth.profile?.username" class="text-white/50 text-xs">@{{ auth.profile?.username }}</p>
                    </div>
                  </div>
                </div>
              </template>
            </template>
          </div>

          <!-- ── CHAT TAB ──────────────────────────────────────────────── -->
          <RoomChat
            v-if="activeTab === 'chat'"
            :messages="chat.messages.value"
            :current-user-id="localIdentity"
            :is-guest="guestSession.isGuest.value && !auth.isAuthenticated"
            class="flex-1 min-h-0"
            @send="chat.sendMessage($event)"
            @close="isPanelOpen = false"
          />
        </div>
      </Transition>

      <!-- ── Creator bottom sheet (persistent, floating, center-right) ─── -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="showCreatorSheet"
          class="absolute bottom-4 left-4 right-4 md:left-auto md:right-[296px] md:w-[420px] z-30 bg-[#182b0e] border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
        >
          <!-- Sheet header -->
          <div class="px-5 pt-5 pb-4 border-b border-white/10">
            <div class="flex items-start gap-3">
              <div class="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p class="text-white font-semibold text-sm leading-snug">Add info before others can join</p>
                <p class="text-white/50 text-xs mt-0.5">Give your sync a title so people know what to expect.</p>
              </div>
            </div>
          </div>

          <!-- Form -->
          <div class="px-5 py-4 space-y-3">
            <div>
              <input
                v-model="title"
                type="text"
                placeholder="Sync title *"
                class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7a9a50] focus:ring-1 focus:ring-[#7a9a50] transition-colors"
              />
            </div>
            <textarea
              v-model="description"
              placeholder="What's this sync about? (optional)"
              rows="2"
              class="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7a9a50] transition-colors resize-none"
            />
            <div class="grid grid-cols-2 gap-2">
              <select
                v-model="category"
                class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7a9a50] transition-colors appearance-none"
              >
                <option value="" disabled class="text-gray-900">Category</option>
                <option v-for="cat in categories" :key="cat" :value="cat" class="text-gray-900">{{ cat }}</option>
              </select>
              <input
                v-model="maxEntry"
                type="number"
                min="2"
                max="500"
                placeholder="Max entry"
                class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#7a9a50] transition-colors"
              />
            </div>
            <button
              :disabled="saving || !title.trim()"
              class="w-full bg-[#4a7a28] hover:bg-[#5a8a34] text-white text-sm font-semibold py-3 rounded-xl transition-colors disabled:opacity-40"
              @click="saveRoomInfo"
            >
              {{ saving ? 'Saving…' : 'Save & start your sync' }}
            </button>
          </div>
        </div>
      </Transition>

    </div><!-- end main area -->

    <!-- ── ControlBar ────────────────────────────────────────────────────── -->
    <ControlBar
      :is-mic-enabled="livekit.isMicEnabled.value"
      :is-camera-enabled="livekit.isCameraEnabled.value"
      :participant-count="livekit.participantCount.value"
      :is-chat-open="isChatActive"
      :unread-count="chat.unreadCount.value"
      @toggle-mic="livekit.toggleMic()"
      @toggle-camera="livekit.toggleCamera()"
      @toggle-chat="handleToggleChat"
      @leave="leaveRoom"
    />

    </template><!-- end v-else (not ended) -->
  </div>
</template>
