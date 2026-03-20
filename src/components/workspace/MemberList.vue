<script setup lang="ts">
import type { WorkspaceMember } from '@/types'
import AppAvatar from '@/components/ui/AppAvatar.vue'

defineProps<{ members: WorkspaceMember[] }>()
</script>

<template>
  <div class="border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-4">
    <p class="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Members</p>
    <div class="space-y-2">
      <div v-for="member in members" :key="member.id" class="flex items-center gap-2">
        <AppAvatar :src="member.profile?.avatar_url" :name="member.profile?.full_name" size="sm" />
        <div class="min-w-0">
          <p class="text-sm text-zinc-900 dark:text-zinc-200 font-medium truncate">{{ member.profile?.full_name }}</p>
          <p class="text-xs text-zinc-500">@{{ member.profile?.username }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
