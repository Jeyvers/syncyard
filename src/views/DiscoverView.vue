<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import TagFilter from '@/components/discover/TagFilter.vue'
import UserCard from '@/components/discover/UserCard.vue'
import AppLoader from '@/components/ui/AppLoader.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const auth = useAuthStore()

const allUsers = ref<Profile[]>([])
const selectedTags = ref<string[]>([])
const loading = ref(true)
const visitedIds = ref<Set<string>>(new Set())

const availableTags = computed(() => {
  const set = new Set<string>()
  allUsers.value.forEach((u) => u.tags?.forEach((t) => set.add(t)))
  return Array.from(set).sort()
})

const filteredUsers = computed(() => {
  if (!selectedTags.value.length) return allUsers.value
  return allUsers.value.filter((u) =>
    selectedTags.value.every((tag) => u.tags?.includes(tag)),
  )
})

onMounted(async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .neq('id', auth.user?.id ?? '')
    .order('created_at', { ascending: false })
  allUsers.value = data ?? []
  loading.value = false
})

function randomMatch() {
  const unvisited = filteredUsers.value.filter((u) => !visitedIds.value.has(u.id))
  const pool = unvisited.length ? unvisited : filteredUsers.value
  if (!pool.length) return
  const pick = pool[Math.floor(Math.random() * pool.length)]
  if (!pick) return
  visitedIds.value.add(pick.id)
  router.push(`/profile/${pick.username}`)
}
</script>

<template>
  <AppLayout>
    <div class="mb-8 flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Discover</h1>
        <p class="text-zinc-500 mt-1">Find creatives to collaborate with</p>
      </div>
      <AppButton size="lg" @click="randomMatch">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Random match
      </AppButton>
    </div>

    <div v-if="availableTags.length" class="mb-8">
      <p class="text-xs text-zinc-500 uppercase tracking-wider mb-3 font-medium">Filter by skill</p>
      <TagFilter v-model:selected-tags="selectedTags" :available-tags="availableTags" />
    </div>

    <AppLoader v-if="loading" />

    <template v-else-if="filteredUsers.length">
      <p class="text-zinc-500 text-sm mb-4">
        {{ filteredUsers.length }} creator{{ filteredUsers.length === 1 ? '' : 's' }}
        <span v-if="selectedTags.length"> matching your filters</span>
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UserCard v-for="user in filteredUsers" :key="user.id" :profile="user" />
      </div>
    </template>

    <div v-else class="text-center py-20">
      <p class="text-zinc-500">No creators found{{ selectedTags.length ? ' for these filters' : '' }}.</p>
      <button
        v-if="selectedTags.length"
        class="text-olive-500 hover:text-olive-400 text-sm mt-2 transition-colors"
        @click="selectedTags = []"
      >
        Clear filters
      </button>
    </div>
  </AppLayout>
</template>
