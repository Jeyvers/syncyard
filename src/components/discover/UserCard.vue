<script setup lang="ts">
import type { Profile } from '@/types'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import AppTag from '@/components/ui/AppTag.vue'

defineProps<{ profile: Profile }>()
</script>

<template>
  <RouterLink
    :to="`/profile/${profile.username}`"
    class="block bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-5
           hover:border-zinc-300 dark:hover:border-zinc-600 transition-all duration-200 group shadow-sm dark:shadow-none"
  >
    <div class="flex items-center gap-3 mb-3">
      <AppAvatar :src="profile.avatar_url" :name="profile.full_name" size="md" />
      <div class="min-w-0">
        <p class="text-zinc-900 dark:text-zinc-100 font-medium text-sm truncate group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
          {{ profile.full_name }}
        </p>
        <p class="text-zinc-500 text-xs">@{{ profile.username }}</p>
      </div>
    </div>

    <p v-if="profile.bio" class="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 mb-3">{{ profile.bio }}</p>

    <div v-if="profile.tags?.length" class="flex flex-wrap gap-1.5">
      <AppTag v-for="tag in profile.tags.slice(0, 4)" :key="tag" :label="tag" />
      <span v-if="profile.tags.length > 4" class="text-zinc-400 dark:text-zinc-600 text-xs self-center">
        +{{ profile.tags.length - 4 }}
      </span>
    </div>
  </RouterLink>
</template>
