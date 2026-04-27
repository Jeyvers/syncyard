<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppAvatar from '@/components/ui/AppAvatar.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const router = useRouter()
const auth = useAuthStore()

async function handleSignOut() {
  await auth.signOut()
  router.push('/login')
}
</script>

<template>
  <header class="border-b border-earth-200 dark:border-earth-700 bg-earth-100/80 dark:bg-earth-900/80 backdrop-blur-sm sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/dashboard" class="text-earth-900 dark:text-earth-100 font-bold text-lg tracking-tight">
        Syncyard
      </RouterLink>

      <!-- Nav links -->
      <nav class="hidden sm:flex items-center gap-1">
        <RouterLink
          to="/dashboard"
          class="px-3 py-1.5 text-sm text-earth-500 dark:text-earth-300 hover:text-earth-900 dark:hover:text-earth-100 hover:bg-earth-200 dark:hover:bg-earth-800 rounded-lg transition-colors"
          active-class="text-earth-900 dark:text-earth-100 bg-earth-200 dark:bg-earth-800"
        >
          Dashboard
        </RouterLink>
        <RouterLink
          to="/discover"
          class="px-3 py-1.5 text-sm text-earth-500 dark:text-earth-300 hover:text-earth-900 dark:hover:text-earth-100 hover:bg-earth-200 dark:hover:bg-earth-800 rounded-lg transition-colors"
          active-class="text-earth-900 dark:text-earth-100 bg-earth-200 dark:bg-earth-800"
        >
          Discover
        </RouterLink>
      </nav>

      <!-- Right side -->
      <div class="flex items-center gap-3">
        <ThemeToggle />

        <!-- Profile avatar -->
        <RouterLink
          v-if="auth.profile"
          :to="`/profile/${auth.profile.username}`"
          class="flex items-center gap-2"
        >
          <AppAvatar :src="auth.profile.avatar_url" :name="auth.profile.full_name" size="sm" />
        </RouterLink>

        <button
          class="text-xs text-earth-400 dark:text-earth-500 hover:text-earth-700 dark:hover:text-earth-200 transition-colors"
          @click="handleSignOut"
        >
          Sign out
        </button>
      </div>
    </div>
  </header>
</template>
