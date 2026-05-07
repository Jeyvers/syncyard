<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const roomId = route.params.id as string
const workspace = ref<any>(null)
const creator = ref<any>(null)
const loading = ref(true)
const joining = ref(false)
const liked = ref(false)
const likeCount = ref(0)

onMounted(async () => {
  const { data: ws } = await supabase
    .from('workspaces')
    .select('*, creator:profiles!workspaces_creator_id_fkey(id, full_name, username, bio, avatar_url, tags)')
    .eq('id', roomId)
    .single()

  if (ws) {
    workspace.value = ws
    creator.value = ws.creator
    likeCount.value = ws.like_count ?? 0
  }
  loading.value = false
})

function initials(name: string = '') {
  return name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
}

async function handleJoin() {
  joining.value = true
  try {
    if (auth.isAuthenticated) {
      await supabase.from('workspace_members').upsert({
        workspace_id: roomId,
        user_id: auth.user?.id,
      }, { onConflict: 'workspace_id,user_id' })
    }
    router.push(`/workspace/${roomId}`)
  } catch {
    router.push(`/workspace/${roomId}`)
  }
}

async function toggleLike() {
  liked.value = !liked.value
  likeCount.value += liked.value ? 1 : -1
  if (auth.isAuthenticated && workspace.value) {
    await supabase
      .from('workspaces')
      .update({ like_count: likeCount.value })
      .eq('id', roomId)
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-[#f5f5f2] flex flex-col"
  >
    <!-- Back -->
    <div class="px-6 py-4">
      <RouterLink
        to="/discover"
        class="inline-flex items-center gap-2 text-sm text-muted hover:text-[#2d2d1a] transition-colors"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
        </svg>
        Back to rooms
      </RouterLink>
    </div>

    <div v-if="loading" class="flex-1 flex items-center justify-center">
      <div class="h-8 w-8 rounded-full border-2 border-[#7a8355] border-t-transparent animate-spin" />
    </div>

    <div v-else-if="!workspace" class="flex-1 flex items-center justify-center">
      <p class="text-muted">Room not found.</p>
    </div>

    <div v-else class="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
      <!-- Room card -->
      <div class="bg-white border border-[#e8e8e0] rounded-2xl p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <span class="inline-flex items-center gap-1.5 bg-[#e8f0e3] text-[#3a5a2d] text-xs font-bold px-3 py-1 rounded-full">
            <span class="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse-fast" />
            LIVE
          </span>
          <button
            :class="['flex items-center gap-1.5 text-sm font-medium transition-colors',
              liked ? 'text-rose-500' : 'text-muted hover:text-rose-400']"
            @click="toggleLike"
          >
            <svg class="h-5 w-5" :fill="liked ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
            {{ likeCount }} likes
          </button>
        </div>

        <h1 class="text-2xl font-bold text-[#1a1a0e] mb-2">{{ workspace.name }}</h1>
        <p v-if="workspace.description" class="text-[#6b6b5a] text-sm leading-relaxed mb-4">
          {{ workspace.description }}
        </p>

        <div class="flex flex-wrap gap-2 mb-5">
          <span v-if="workspace.category"
            class="bg-[#e8f0e3] text-[#3a5a2d] text-xs font-medium px-3 py-1 rounded-full">
            {{ workspace.category }}
          </span>
          <span v-if="workspace.max_members"
            class="bg-[#f0f0e8] text-[#6b6b5a] text-xs font-medium px-3 py-1 rounded-full">
            Max {{ workspace.max_members }} people
          </span>
        </div>

        <button
          :disabled="joining"
          class="w-full bg-[#2d4a1e] hover:bg-forest text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 text-base"
          @click="handleJoin"
        >
          {{ joining ? 'Joining...' : 'Join this sync →' }}
        </button>
      </div>

      <!-- Creator profile card -->
      <div v-if="creator" class="bg-white border border-[#e8e8e0] rounded-2xl p-6">
        <p class="text-xs font-bold text-[#a0a08a] uppercase tracking-widest mb-4">Hosted by</p>

        <div class="flex items-start gap-4">
          <div class="h-14 w-14 rounded-full bg-[#dde8c8] flex items-center justify-center text-[#3a5a2d] font-bold text-lg shrink-0">
            {{ initials(creator.full_name || creator.username) }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold text-[#1a1a0e] text-lg">{{ creator.full_name || creator.username }}</h3>
            <p v-if="creator.username" class="text-sm text-muted mb-2">@{{ creator.username }}</p>
            <p v-if="creator.bio" class="text-sm text-[#6b6b5a] leading-relaxed">{{ creator.bio }}</p>
          </div>
        </div>

        <div v-if="creator.tags?.length" class="flex flex-wrap gap-2 mt-4">
          <span
            v-for="tag in creator.tags"
            :key="tag"
            class="bg-[#f0f0e8] text-[#6b6b5a] text-xs font-medium px-2.5 py-1 rounded-full"
          >
            {{ tag }}
          </span>
        </div>

        <RouterLink
          v-if="creator.username"
          :to="`/profile/${creator.username}`"
          class="mt-4 inline-flex items-center gap-1.5 text-sm text-[#5a6e2a] hover:text-[#3a4e1a] font-medium transition-colors"
        >
          View full profile →
        </RouterLink>
      </div>
    </div>
  </div>
</template>
