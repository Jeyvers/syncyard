<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import type { Workspace, WorkspaceMember } from '@/types'
import AppNavbar from '@/components/ui/AppNavbar.vue'
import MemberList from '@/components/workspace/MemberList.vue'
import ChatPanel from '@/components/workspace/ChatPanel.vue'
import AppLoader from '@/components/ui/AppLoader.vue'

const route = useRoute()
const workspaceId = route.params.id as string

const workspace = ref<Workspace | null>(null)
const members = ref<WorkspaceMember[]>([])
const loading = ref(true)

onMounted(async () => {
  const { data: ws } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()
  workspace.value = ws

  const { data: memberData } = await supabase
    .from('workspace_members')
    .select('*, profile:profiles(id, full_name, avatar_url, username, bio, tags, created_at)')
    .eq('workspace_id', workspaceId)
  members.value = (memberData ?? []).map((m: any) => ({ ...m, profile: m.profile }))

  loading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 flex flex-col">
    <AppNavbar />

    <AppLoader v-if="loading" />

    <div v-else-if="!workspace" class="flex-1 flex items-center justify-center">
      <p class="text-zinc-500">Workspace not found.</p>
    </div>

    <div v-else class="flex-1 flex overflow-hidden" style="height: calc(100vh - 56px)">
      <aside class="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 overflow-y-auto hidden sm:block">
        <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4 truncate">{{ workspace.name }}</h2>
        <MemberList :members="members" />
        <p class="text-xs text-zinc-400 dark:text-zinc-600 mt-2">
          Created {{ new Date(workspace.created_at).toLocaleDateString() }}
        </p>
      </aside>

      <div class="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-950">
        <div class="sm:hidden px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{{ workspace.name }}</h2>
        </div>
        <ChatPanel :workspace-id="workspaceId" class="flex-1 overflow-hidden" />
      </div>
    </div>
  </div>
</template>
