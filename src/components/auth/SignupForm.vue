<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppInput from '@/components/ui/AppInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import GoogleButton from '@/components/auth/GoogleButton.vue'

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const submitted = ref(false)

async function handleSubmit() {
  loading.value = true
  error.value = ''
  try {
    await auth.signUp(email.value, password.value)
    submitted.value = true
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Sign up failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Email confirmation required -->
    <template v-if="submitted">
      <div class="text-center py-4">
        <div class="text-3xl mb-3">✉️</div>
        <h2 class="text-xl font-semibold text-earth-900 dark:text-earth-100 mb-2">Check your inbox</h2>
        <p class="text-earth-400 text-sm">
          We sent a confirmation link to <span class="text-earth-700 dark:text-earth-200">{{ email }}</span>.
          Click it to activate your account, then sign in.
        </p>
        <RouterLink to="/login" class="inline-block mt-6 text-sm text-sage-600 hover:text-sage-500 transition-colors">
          Back to sign in →
        </RouterLink>
      </div>
    </template>

    <template v-else>
      <h2 class="text-xl font-semibold text-earth-900 dark:text-earth-100 mb-1">Create your account</h2>
      <p class="text-earth-400 text-sm mb-6">Join the creative network</p>

      <GoogleButton />

      <div class="flex items-center gap-3 my-5">
        <div class="flex-1 h-px bg-earth-200 dark:bg-earth-700" />
        <span class="text-xs text-earth-400 dark:text-earth-600 font-medium">or</span>
        <div class="flex-1 h-px bg-earth-200 dark:bg-earth-700" />
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <AppInput v-model="email" type="email" label="Email" placeholder="you@example.com" required />
        <AppInput v-model="password" type="password" label="Password" placeholder="At least 8 characters" required />

        <p v-if="error" class="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-400/10 rounded-lg px-3 py-2">
          {{ error }}
        </p>

        <AppButton type="submit" :loading="loading" class="w-full" size="lg">Create account</AppButton>
      </form>

      <p class="text-earth-400 text-sm mt-6 text-center">
        Already have an account?
        <RouterLink to="/login" class="text-sage-600 hover:text-sage-500 transition-colors font-medium">
          Sign in
        </RouterLink>
      </p>
    </template>
  </div>
</template>
