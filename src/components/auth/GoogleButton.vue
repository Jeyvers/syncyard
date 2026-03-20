<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const loading = ref(false)
const error = ref('')

async function handleClick() {
  loading.value = true
  error.value = ''
  try {
    await auth.signInWithGoogle()
    // Browser redirects to Google — keep loading=true during redirect
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Google sign-in failed'
    loading.value = false
  }
}
</script>

<template>
  <div>
    <button
      type="button"
      :disabled="loading"
      class="w-full flex items-center justify-center gap-3
             bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700
             border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600
             text-zinc-800 dark:text-zinc-100 text-sm font-medium
             rounded-lg px-4 py-2.5 transition-all duration-150
             focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2
             focus-visible:ring-offset-zinc-100 dark:focus-visible:ring-offset-zinc-900
             disabled:opacity-50 disabled:cursor-not-allowed"
      @click="handleClick"
    >
      <svg
        v-if="loading"
        class="animate-spin h-4 w-4 shrink-0 text-zinc-400"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>

      <svg v-else class="h-4 w-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>

      <span>{{ loading ? 'Redirecting…' : 'Continue with Google' }}</span>
    </button>

    <p v-if="error" class="mt-2 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-400/10 rounded-lg px-3 py-2">
      {{ error }}
    </p>
  </div>
</template>
