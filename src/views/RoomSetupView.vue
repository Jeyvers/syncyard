<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const title = ref('')
const maxEntry = ref<number | ''>('')
const description = ref('')
const category = ref('')
const loading = ref(false)
const error = ref('')

const categories = [
  'Tech & Founders',
  'Creatives (Art, Music, Writing)',
  'Late Night Chats',
  'Girlies',
  'Design Critique',
  'Writers Room',
  'Everything',
  'Story Time',
  'Other',
]

async function handleCreate() {
  if (!title.value.trim()) {
    error.value = 'Please add a title for your sync'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const { data: ws, error: wsError } = await supabase
      .from('workspaces')
      .insert({
        name: title.value.trim(),
        description: description.value.trim() || null,
        category: category.value || null,
        max_members: maxEntry.value || null,
        creator_id: auth.user?.id,
      })
      .select()
      .single()

    if (wsError) throw wsError

    // Add creator as a member
    await supabase.from('workspace_members').insert({
      workspace_id: ws.id,
      user_id: auth.user?.id,
    })

    router.push(`/workspace/${ws.id}`)
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Could not create room'
    loading.value = false
  }
}
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-[#f5f5f2] px-4"
  >
    <!-- Back -->
    <RouterLink
      to="/discover"
      class="fixed top-5 left-5 flex items-center gap-2 text-sm text-muted hover:text-[#2d2d1a] transition-colors"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
      </svg>
      Back
    </RouterLink>

    <!-- Panel -->
    <div class="w-full max-w-sm bg-[#dde8c8]/60 border border-[#c8d8b0] rounded-2xl p-7">
      <h2
        class="font-display text-[#2d5a1a] font-semibold text-base leading-snug mb-6"
      >
        Add a bit more information<br />for your sync
      </h2>

      <div class="space-y-3">
        <input
          v-model="title"
          type="text"
          placeholder="Title"
          class="w-full bg-white/70 border border-[#b8c8a0] rounded-lg px-4 py-2.5 text-sm text-[#2d2d1a] placeholder-[#8a9a70] focus:outline-none focus:border-[#7a8355] focus:ring-1 focus:ring-[#7a8355] transition-colors"
        />

        <input
          v-model="maxEntry"
          type="number"
          min="2"
          max="500"
          placeholder="Max Entry"
          class="w-full bg-white/70 border border-[#b8c8a0] rounded-lg px-4 py-2.5 text-sm text-[#2d2d1a] placeholder-[#8a9a70] focus:outline-none focus:border-[#7a8355] focus:ring-1 focus:ring-[#7a8355] transition-colors"
        />

        <textarea
          v-model="description"
          placeholder="Description"
          rows="3"
          class="w-full bg-white/70 border border-[#b8c8a0] rounded-lg px-4 py-2.5 text-sm text-[#2d2d1a] placeholder-[#8a9a70] focus:outline-none focus:border-[#7a8355] focus:ring-1 focus:ring-[#7a8355] transition-colors resize-none"
        />

        <select
          v-model="category"
          class="w-full bg-white/70 border border-[#b8c8a0] rounded-lg px-4 py-2.5 text-sm text-[#2d2d1a] focus:outline-none focus:border-[#7a8355] focus:ring-1 focus:ring-[#7a8355] transition-colors appearance-none"
        >
          <option value="" disabled>Select Category</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <p v-if="error" class="text-xs text-red-600 mt-3">{{ error }}</p>

      <button
        :disabled="loading"
        class="w-full mt-5 bg-[#2d5a1a] hover:bg-[#3a6e22] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
        @click="handleCreate"
      >
        {{ loading ? 'Creating...' : 'Start your sync' }}
      </button>
    </div>
  </div>
</template>
