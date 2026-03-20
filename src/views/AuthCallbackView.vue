<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLoader from '@/components/ui/AppLoader.vue'

const router = useRouter()
const auth = useAuthStore()

function redirect() {
  router.replace(auth.isOnboarded ? '/dashboard' : '/onboarding')
}

// Session may already be set by the time this view mounts (auth.init runs before mount).
// If not, watch for the auth store's onAuthStateChange listener to update isAuthenticated.

let stopWatch: (() => void) | null = null
let timeoutId: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  if (auth.isAuthenticated) {
    // Session was already established — make sure profile is fetched then redirect.
    await auth.fetchProfile()
    redirect()
    return
  }

  // Watch for the auth state to become active (OAuth code exchange in progress).
  stopWatch = watch(
    () => auth.isAuthenticated,
    async (authenticated) => {
      if (authenticated) {
        stopWatch?.()
        // fetchProfile is already called by auth store's onAuthStateChange listener,
        // but we call it again here to ensure it's done before we check isOnboarded.
        await auth.fetchProfile()
        redirect()
      }
    },
  )

  // Fallback: if nothing happens within 10 seconds, something went wrong.
  timeoutId = setTimeout(() => {
    if (!auth.isAuthenticated) router.replace('/login')
  }, 10_000)
})

onUnmounted(() => {
  stopWatch?.()
  if (timeoutId) clearTimeout(timeoutId)
})
</script>

<template>
  <div class="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
    <AppLoader />
    <p class="text-zinc-500 text-sm">Signing you in…</p>
  </div>
</template>
