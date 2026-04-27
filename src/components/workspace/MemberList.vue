<script setup lang="ts">
import type { WorkspaceMember } from '@/types'
import AppAvatar from '@/components/ui/AppAvatar.vue'

defineProps<{ members: WorkspaceMember[] }>()
</script>

<template>
  <div class="border-b border-earth-200 dark:border-earth-700 pb-4 mb-4">
    <p class="text-xs font-medium text-earth-400 uppercase tracking-wider mb-3">Members</p>
    <div class="space-y-2">
      <div v-for="member in members" :key="member.id" class="flex items-center gap-2">
        <AppAvatar :src="member.profile?.avatar_url" :name="member.profile?.full_name" size="sm" />
        <div class="min-w-0">
          <p class="text-sm text-earth-900 dark:text-earth-100 font-medium truncate">{{ member.profile?.full_name }}</p>
          <p class="text-xs text-earth-400">@{{ member.profile?.username }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
