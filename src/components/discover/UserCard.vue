<script setup lang="ts">
import type { Profile } from '@/types'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import AppTag from '@/components/ui/AppTag.vue'

defineProps<{ profile: Profile }>()
</script>

<template>
  <RouterLink
    :to="`/profile/${profile.username}`"
    class="block bg-earth-50 dark:bg-earth-800 border border-earth-200 dark:border-earth-700 rounded-xl p-5
           hover:border-earth-300 dark:hover:border-earth-600 transition-all duration-200 group shadow-sm dark:shadow-none"
  >
    <div class="flex items-center gap-3 mb-3">
      <AppAvatar :src="profile.avatar_url" :name="profile.full_name" size="md" />
      <div class="min-w-0">
        <p class="text-earth-900 dark:text-earth-100 font-medium text-sm truncate group-hover:text-sage-600 dark:group-hover:text-sage-300 transition-colors">
          {{ profile.full_name }}
        </p>
        <p class="text-earth-400 text-xs">@{{ profile.username }}</p>
      </div>
    </div>

    <p v-if="profile.bio" class="text-earth-600 dark:text-earth-300 text-sm line-clamp-2 mb-3">{{ profile.bio }}</p>

    <div v-if="profile.tags?.length" class="flex flex-wrap gap-1.5">
      <AppTag v-for="tag in profile.tags.slice(0, 4)" :key="tag" :label="tag" />
      <span v-if="profile.tags.length > 4" class="text-earth-400 dark:text-earth-600 text-xs self-center">
        +{{ profile.tags.length - 4 }}
      </span>
    </div>
  </RouterLink>
</template>
