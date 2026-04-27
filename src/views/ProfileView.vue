<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import AppTag from '@/components/ui/AppTag.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppLoader from '@/components/ui/AppLoader.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const profile = ref<Profile | null>(null)
const loading = ref(true)
const connecting = ref(false)
const isOwnProfile = ref(false)

onMounted(async () => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', route.params.username as string)
    .single()
  profile.value = data
  isOwnProfile.value = data?.id === auth.user?.id
  loading.value = false
})

async function connect() {
  if (!auth.user || !profile.value) return
  connecting.value = true
  try {
    const { data: existing } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', auth.user.id)

    const myWorkspaceIds = existing?.map((r: any) => r.workspace_id) ?? []

    if (myWorkspaceIds.length) {
      const { data: shared } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', profile.value.id)
        .in('workspace_id', myWorkspaceIds)
      const firstShared = shared?.[0]
      if (firstShared) {
        router.push(`/workspace/${firstShared.workspace_id}`)
        return
      }
    }

    const workspaceName = [auth.profile?.full_name, profile.value.full_name].join(' × ')
    const { data: ws, error } = await supabase
      .from('workspaces')
      .insert({ name: workspaceName })
      .select()
      .single()
    if (error) throw error

    await supabase.from('workspace_members').insert([
      { workspace_id: ws.id, user_id: auth.user.id },
      { workspace_id: ws.id, user_id: profile.value.id },
    ])

    router.push(`/workspace/${ws.id}`)
  } finally {
    connecting.value = false
  }
}
</script>

<template>
  <AppLayout>
    <AppLoader v-if="loading" />

    <div v-else-if="!profile" class="text-center py-24">
      <p class="text-earth-400">Profile not found.</p>
    </div>

    <div v-else class="max-w-2xl mx-auto">
      <div class="flex items-start gap-5 mb-8">
        <AppAvatar :src="profile.avatar_url" :name="profile.full_name" size="xl" />
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold text-earth-900 dark:text-earth-100">{{ profile.full_name }}</h1>
          <p class="text-earth-400 text-sm">@{{ profile.username }}</p>

          <div v-if="!isOwnProfile && auth.isAuthenticated" class="mt-4">
            <AppButton :loading="connecting" @click="connect">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Connect
            </AppButton>
          </div>
        </div>
      </div>

      <div v-if="profile.bio" class="mb-6">
        <p class="text-earth-700 dark:text-earth-200 leading-relaxed">{{ profile.bio }}</p>
      </div>

      <div v-if="profile.tags?.length" class="mb-10">
        <h2 class="text-xs font-medium text-earth-400 uppercase tracking-wider mb-3">Skills & Disciplines</h2>
        <div class="flex flex-wrap gap-2">
          <AppTag v-for="tag in profile.tags" :key="tag" :label="tag" :selected="true" />
        </div>
      </div>

      <div>
        <h2 class="text-xs font-medium text-earth-400 uppercase tracking-wider mb-4">Portfolio</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div
            v-for="i in 6"
            :key="i"
            class="aspect-square bg-earth-200/50 dark:bg-earth-900 border border-dashed border-earth-300 dark:border-earth-700 rounded-xl flex items-center justify-center"
          >
            <span class="text-earth-400 dark:text-earth-600 text-xs">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
