<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import type { Workspace } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import WorkspaceCard from '@/components/dashboard/WorkspaceCard.vue'
import AppLoader from '@/components/ui/AppLoader.vue'
import AppButton from '@/components/ui/AppButton.vue'

const auth = useAuthStore()
const workspaces = ref<Workspace[]>([])
const loading = ref(true)

onMounted(async () => {
  if (!auth.user) return
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id, workspaces(id, name, created_at, workspace_members(id, user_id, joined_at, profiles(id, full_name, avatar_url, username)))')
    .eq('user_id', auth.user.id)

  if (data) {
    workspaces.value = data.map((row: any) => ({
      ...row.workspaces,
      members: row.workspaces?.workspace_members?.map((m: any) => ({
        ...m,
        profile: m.profiles,
      })) ?? [],
    }))
  }
  loading.value = false
})
</script>

<template>
  <AppLayout>
    <div class="mb-10">
      <h1 class="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Hey, {{ auth.profile?.full_name?.split(' ')[0] ?? 'there' }} 👋
      </h1>
      <p class="text-zinc-500 mt-1">Here's what's happening in your creative world.</p>
    </div>

    <div class="flex gap-3 mb-10">
      <RouterLink to="/discover">
        <AppButton size="lg">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Find collaborators
        </AppButton>
      </RouterLink>
      <RouterLink :to="`/profile/${auth.profile?.username}`">
        <AppButton variant="ghost" size="lg">View my profile</AppButton>
      </RouterLink>
    </div>

    <section>
      <h2 class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-4">
        Active workspaces
      </h2>

      <AppLoader v-if="loading" />

      <template v-else-if="workspaces.length">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <WorkspaceCard v-for="ws in workspaces" :key="ws.id" :workspace="ws" />
        </div>
      </template>

      <div v-else class="text-center py-16 bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
        <p class="text-zinc-500 text-sm">No workspaces yet.</p>
        <RouterLink to="/discover" class="text-violet-500 hover:text-violet-400 text-sm transition-colors mt-1 inline-block">
          Connect with someone →
        </RouterLink>
      </div>
    </section>
  </AppLayout>
</template>
