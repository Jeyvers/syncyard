<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

type Tab = 'signup' | 'login' | 'guest'
const activeTab = ref<Tab>(route.path === '/signup' ? 'signup' : 'login')

function setTab(tab: Tab) {
  activeTab.value = tab
  if (tab === 'signup') router.replace('/signup')
  else if (tab === 'login') router.replace('/login')
}

// ── Login ──
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)
const showLoginPassword = ref(false)

async function handleLogin() {
  loginLoading.value = true
  loginError.value = ''
  try {
    await auth.signIn(loginEmail.value, loginPassword.value)
    router.push('/dashboard')
  } catch (e: unknown) {
    loginError.value = e instanceof Error ? e.message : 'Sign in failed'
  } finally {
    loginLoading.value = false
  }
}

// ── SignUp ──
const signupFirstName = ref('')
const signupLastName = ref('')
const signupEmail = ref('')
const signupPassword = ref('')
const signupError = ref('')
const signupLoading = ref(false)
const showSignupPassword = ref(false)
const signupSubmitted = ref(false)

async function handleSignup() {
  signupLoading.value = true
  signupError.value = ''
  try {
    const fullName = `${signupFirstName.value} ${signupLastName.value}`.trim()
    await auth.signUp(signupEmail.value, signupPassword.value, fullName || undefined)
    signupSubmitted.value = true
  } catch (e: unknown) {
    signupError.value = e instanceof Error ? e.message : 'Sign up failed'
  } finally {
    signupLoading.value = false
  }
}

// ── Google ──
const googleLoading = ref(false)
const googleError = ref('')

async function handleGoogle() {
  googleLoading.value = true
  googleError.value = ''
  try {
    await auth.signInWithGoogle()
  } catch (e: unknown) {
    googleError.value = e instanceof Error ? e.message : 'Google sign-in failed'
    googleLoading.value = false
  }
}

// ── Guest ──
const guestName = ref('')
const guestError = ref('')

function handleGuest() {
  if (!guestName.value.trim()) {
    guestError.value = 'Please enter a name'
    return
  }
  localStorage.setItem('syncyard_guest_name', guestName.value.trim())
  router.push('/discover')
}

const googleBtnLabel = computed(() => {
  if (googleLoading.value) return 'Loading...'
  if (activeTab.value === 'signup') return 'SignUp with Google'
  return 'Login with Google'
})
</script>

<template>
    <!-- Left panel — photo -->
    <div
      class="hidden md:block md:w-1/2 relative overflow-hidden bg-[#1a2010]"
      style="background-image: url('/images/onboarding.png'); background-size: cover; background-position: center top;"
    >
      <div class="absolute inset-0 bg-black/20" />
    </div>

    <!-- Right panel -->
    <div class="w-full md:w-1/2 flex flex-col bg-white min-h-screen">
      <!-- Header -->
      <div class="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <RouterLink to="/">
          <img src="/images/logo.png" alt="Syncyard" class="h-5 w-auto" />
        </RouterLink>
        <RouterLink to="/" class="text-muted hover:text-[#2d2d1a] transition-colors">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </RouterLink>
      </div>

      <!-- Tabs -->
      <div class="flex items-center border-b border-gray-100 px-8">
        <button
          :class="['py-4 text-sm font-medium mr-6 border-b-2 -mb-px transition-colors',
            activeTab === 'signup'
              ? 'border-[#7a8355] text-[#2d2d1a]'
              : 'border-transparent text-muted hover:text-[#2d2d1a]']"
          @click="setTab('signup')"
        >
          SignUp
        </button>
        <button
          :class="['py-4 text-sm font-medium mr-6 border-b-2 -mb-px transition-colors',
            activeTab === 'login'
              ? 'border-[#7a8355] text-[#2d2d1a]'
              : 'border-transparent text-muted hover:text-[#2d2d1a]']"
          @click="setTab('login')"
        >
          Login
        </button>
        <button
          :class="['py-4 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === 'guest'
              ? 'border-[#7a8355] text-[#2d2d1a]'
              : 'border-transparent text-[#a0a08a] hover:text-[#6b6b5a]']"
          @click="activeTab = 'guest'"
        >
          Continue as guest
        </button>
      </div>

      <!-- Form area -->
      <div class="flex-1 flex flex-col px-8 pt-10 pb-6">

        <!-- ── LOGIN ── -->
        <template v-if="activeTab === 'login'">
          <h1
            class="font-display text-3xl font-bold mb-1 text-[#6b7a3a]"
          >
            Welcome back
          </h1>
          <p class="text-sm text-muted mb-8">Log in to join rooms and meet people.</p>

          <!-- Google -->
          <button
            :disabled="googleLoading"
            class="w-full flex items-center justify-center gap-3 border border-[#e0e0d4] rounded-xl px-4 py-3 text-sm font-medium text-[#2d2d1a] hover:bg-gray-50 transition-colors mb-5 disabled:opacity-50"
            @click="handleGoogle"
          >
            <svg v-if="googleLoading" class="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <svg v-else class="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {{ googleBtnLabel }}
          </button>
          <p v-if="googleError" class="text-xs text-red-500 mb-3">{{ googleError }}</p>

          <div class="flex items-center gap-3 mb-5">
            <div class="flex-1 h-px bg-[#e8e8e0]" />
            <span class="text-xs text-[#a0a08a] uppercase tracking-wider">or</span>
            <div class="flex-1 h-px bg-[#e8e8e0]" />
          </div>

          <form class="space-y-3" @submit.prevent="handleLogin">
            <input
              v-model="loginEmail"
              type="email"
              placeholder="Email address"
              required
              class="w-full border border-[#e0e0d4] rounded-xl px-4 py-3 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors"
            />

            <div class="relative">
              <input
                v-model="loginPassword"
                :type="showLoginPassword ? 'text' : 'password'"
                placeholder="Password"
                required
                class="w-full border border-[#e0e0d4] rounded-xl px-4 py-3 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors pr-16"
              />
              <button
                type="button"
                class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted hover:text-[#2d2d1a] transition-colors"
                @click="showLoginPassword = !showLoginPassword"
              >
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path v-if="showLoginPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                {{ showLoginPassword ? 'Hide' : 'Show' }}
              </button>
            </div>

            <p v-if="loginError" class="text-xs text-red-500">{{ loginError }}</p>

            <div class="text-right pt-1">
              <a href="#" class="text-sm text-muted hover:text-[#2d2d1a] underline underline-offset-2 transition-colors">
                Forgot your password?
              </a>
            </div>

            <button
              type="submit"
              :disabled="loginLoading"
              class="w-full bg-[#5a6e2a] hover:bg-[#4a5e1a] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 mt-2"
            >
              {{ loginLoading ? 'Logging in...' : 'Log in' }}
            </button>
          </form>
        </template>

        <!-- ── SIGN UP ── -->
        <template v-else-if="activeTab === 'signup'">
          <template v-if="signupSubmitted">
            <div class="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div class="text-4xl mb-4">✉️</div>
              <h2 class="font-display text-2xl font-bold text-[#6b7a3a] mb-2">
                Check your inbox
              </h2>
              <p class="text-sm text-muted max-w-xs">
                We sent a confirmation link to <span class="text-[#2d2d1a] font-medium">{{ signupEmail }}</span>. Click it to activate your account.
              </p>
              <button class="mt-6 text-sm text-[#7a8355] hover:underline" @click="setTab('login')">
                Back to log in →
              </button>
            </div>
          </template>

          <template v-else>
            <h1
              class="font-display text-3xl font-bold mb-1 text-[#6b7a3a]"
            >
              Join Syncyard
            </h1>
            <p class="text-sm text-muted mb-8">
              Create an account to host rooms,<br />save your favorites, and build your profile.
            </p>

            <!-- Google -->
            <button
              :disabled="googleLoading"
              class="w-full flex items-center justify-center gap-3 border border-[#e0e0d4] rounded-xl px-4 py-3 text-sm font-medium text-[#2d2d1a] hover:bg-gray-50 transition-colors mb-5 disabled:opacity-50"
              @click="handleGoogle"
            >
              <svg v-if="googleLoading" class="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <svg v-else class="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {{ googleBtnLabel }}
            </button>
            <p v-if="googleError" class="text-xs text-red-500 mb-3">{{ googleError }}</p>

            <div class="flex items-center gap-3 mb-5">
              <div class="flex-1 h-px bg-[#e8e8e0]" />
              <span class="text-xs text-[#a0a08a] uppercase tracking-wider">or</span>
              <div class="flex-1 h-px bg-[#e8e8e0]" />
            </div>

            <form class="space-y-3" @submit.prevent="handleSignup">
              <div class="grid grid-cols-2 gap-3">
                <input
                  v-model="signupFirstName"
                  type="text"
                  placeholder="First Name"
                  required
                  class="w-full border border-[#e0e0d4] rounded-xl px-4 py-3 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors"
                />
                <input
                  v-model="signupLastName"
                  type="text"
                  placeholder="Last Name"
                  class="w-full border border-[#e0e0d4] rounded-xl px-4 py-3 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors"
                />
              </div>

              <input
                v-model="signupEmail"
                type="email"
                placeholder="Email address"
                required
                class="w-full border border-[#e0e0d4] rounded-xl px-4 py-3 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors"
              />

              <div class="relative">
                <input
                  v-model="signupPassword"
                  :type="showSignupPassword ? 'text' : 'password'"
                  placeholder="Password"
                  required
                  class="w-full border border-[#e0e0d4] rounded-xl px-4 py-3 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors pr-16"
                />
                <button
                  type="button"
                  class="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted hover:text-[#2d2d1a] transition-colors"
                  @click="showSignupPassword = !showSignupPassword"
                >
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path v-if="showSignupPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  {{ showSignupPassword ? 'Hide' : 'Show' }}
                </button>
              </div>

              <p v-if="signupError" class="text-xs text-red-500">{{ signupError }}</p>

              <div class="text-right pt-1">
                <a href="#" class="text-sm text-muted hover:text-[#2d2d1a] underline underline-offset-2 transition-colors">
                  Forgot your password?
                </a>
              </div>

              <button
                type="submit"
                :disabled="signupLoading"
                class="w-full bg-[#5a6e2a] hover:bg-[#4a5e1a] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 mt-2"
              >
                {{ signupLoading ? 'Creating account...' : 'Sign up' }}
              </button>
            </form>
          </template>
        </template>

        <!-- ── GUEST ── -->
        <template v-else>
          <h1
            class="font-display text-3xl font-bold mb-1 text-[#6b7a3a]"
          >
            Just browsing?
          </h1>
          <p class="text-sm text-muted mb-8">
            Pick a name and jump straight into any open room.<br />No account needed.
          </p>

          <input
            v-model="guestName"
            type="text"
            placeholder="What should we call you?"
            class="w-full border border-[#e0e0d4] rounded-xl px-4 py-3 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors mb-5"
            @keydown.enter="handleGuest"
          />

          <ul class="space-y-2 mb-6">
            <li v-for="item in ['Browse and join any live room for 10 minutes', 'Chat and participate in discussions', 'No email or password required']"
              :key="item"
              class="flex items-center gap-3 text-sm text-[#4a4a2a]"
            >
              <span class="h-5 w-5 rounded-full bg-[#dde8c8] flex items-center justify-center shrink-0">
                <svg class="h-3 w-3 text-[#5a6e2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                </svg>
              </span>
              {{ item }}
            </li>
          </ul>

          <div class="bg-[#f5f5ee] border border-[#e0e0d4] rounded-xl px-4 py-3 flex gap-3 mb-6">
            <svg class="h-4 w-4 text-muted shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-xs text-[#6b6b5a] leading-relaxed">
              Guests can't host rooms or save favorites.
              Create a free account to unlock everything.
            </p>
          </div>

          <p v-if="guestError" class="text-xs text-red-500 mb-3">{{ guestError }}</p>

          <button
            class="w-full bg-[#5a6e2a] hover:bg-[#4a5e1a] text-white font-semibold py-3.5 rounded-xl transition-colors"
            @click="handleGuest"
          >
            Continue as guest
          </button>
        </template>
      </div>

      <!-- Footer -->
      <div class="px-8 py-6 bg-[#f8f8f5] border-t border-gray-100 text-center">
        <template v-if="activeTab === 'login'">
          <p class="text-sm text-muted">
            Don't have an account?
            <button class="text-[#2d2d1a] font-semibold underline underline-offset-2 hover:text-[#5a6e2a] transition-colors" @click="setTab('signup')">
              Create an account
            </button>
          </p>
        </template>
        <template v-else-if="activeTab === 'signup'">
          <p class="text-sm text-muted">
            Already have an account?
            <button class="text-[#2d2d1a] font-semibold underline underline-offset-2 hover:text-[#5a6e2a] transition-colors" @click="setTab('login')">
              Login
            </button>
          </p>
        </template>
        <template v-else>
          <p class="text-sm text-muted">
            Want the full experience?
            <button class="text-[#2d2d1a] font-semibold underline underline-offset-2 hover:text-[#5a6e2a] transition-colors" @click="setTab('signup')">
              Sign up free!
            </button>
          </p>
        </template>
      </div>
    </div>
  </div>
</template>
