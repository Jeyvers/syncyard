<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import GoogleButton from '@/components/auth/GoogleButton.vue'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await auth.signIn(email.value, password.value)
    router.push('/dashboard')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Sign in failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Welcome back</h2>
    <p class="text-zinc-500 text-sm mb-6">Sign in to your account</p>

    <GoogleButton />

    <div class="flex items-center gap-3 my-5">
      <div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
      <span class="text-xs text-zinc-400 dark:text-zinc-600 font-medium">or</span>
      <div class="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
    </div>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <AppInput v-model="email" type="email" label="Email" placeholder="you@example.com" required />
      <AppInput v-model="password" type="password" label="Password" placeholder="••••••••" required />

      <p v-if="error" class="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-400/10 rounded-lg px-3 py-2">
        {{ error }}
      </p>

      <AppButton type="submit" :loading="loading" class="w-full" size="lg">Sign in</AppButton>
    </form>

    <p class="text-zinc-500 text-sm mt-6 text-center">
      Don't have an account?
      <RouterLink to="/signup" class="text-olive-500 hover:text-olive-400 transition-colors font-medium">
        Sign up
      </RouterLink>
    </p>
  </div>
</template>
