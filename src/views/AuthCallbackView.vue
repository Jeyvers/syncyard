<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import AppLoader from '@/components/ui/AppLoader.vue'

const router = useRouter()
const auth = useAuthStore()

function redirect() {
  router.replace(auth.isOnboarded ? '/dashboard' : '/onboarding')
}

let stopWatch: (() => void) | null = null
let timeoutId: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  // Explicitly exchange PKCE code if present in the URL.
  // The Supabase client may have already started the exchange but we can't
  // rely on the onAuthStateChange event being registered in time.
  const code = new URLSearchParams(window.location.search).get('code')
  if (code) {
    // Attempt explicit exchange — ignore errors since detectSessionInUrl
    // (runs on Supabase client init) may have already consumed the code.
    await supabase.auth.exchangeCodeForSession(code).catch(() => {})
  }

  // After exchange, session should be immediately available.
  if (auth.isAuthenticated) {
    await auth.fetchProfile()
    redirect()
    return
  }

  // Fallback: watch in case the store hasn't updated yet from onAuthStateChange.
  stopWatch = watch(
    () => auth.isAuthenticated,
    async (authenticated) => {
      if (authenticated) {
        stopWatch?.()
        await auth.fetchProfile()
        redirect()
      }
    },
  )

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
  <div
    class="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex flex-col items-center justify-center gap-4"
  >
    <AppLoader />
    <p class="text-zinc-500 text-sm">Signing you in…</p>
  </div>
</template>
