<script setup lang="ts">
import type { Workspace } from '@/types'
import AppAvatar from '@/components/ui/AppAvatar.vue'

defineProps<{ workspace: Workspace }>()
</script>

<template>
  <RouterLink
    :to="`/workspace/${workspace.id}`"
    class="block bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5
           hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200 group shadow-sm dark:shadow-none"
  >
    <div class="flex items-start justify-between gap-3 mb-4">
      <h3 class="text-zinc-900 dark:text-zinc-100 font-medium text-sm group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors line-clamp-1">
        {{ workspace.name }}
      </h3>
      <svg class="h-4 w-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-600 dark:group-hover:text-zinc-400 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>

    <div v-if="workspace.members?.length" class="flex items-center gap-2">
      <div class="flex -space-x-2">
        <AppAvatar
          v-for="member in workspace.members?.slice(0, 3)"
          :key="member.id"
          :src="member.profile?.avatar_url"
          :name="member.profile?.full_name"
          size="sm"
          class="ring-2 ring-white dark:ring-zinc-900"
        />
      </div>
      <span class="text-zinc-500 text-xs">
        {{ workspace.members?.length }} member{{ workspace.members?.length === 1 ? '' : 's' }}
      </span>
    </div>

    <p class="text-zinc-400 dark:text-zinc-600 text-xs mt-3">
      Created {{ new Date(workspace.created_at).toLocaleDateString() }}
    </p>
  </RouterLink>
</template>
