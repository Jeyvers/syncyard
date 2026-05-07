<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuthModal, type AuthTab } from '@/composables/useAuthModal'

const router = useRouter()
const auth = useAuthStore()
const { isOpen, activeTab, closeModal } = useAuthModal()

// ── Login ──
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)
const showLoginPw = ref(false)

async function handleLogin() {
  loginLoading.value = true
  loginError.value = ''
  try {
    await auth.signIn(loginEmail.value, loginPassword.value)
    closeModal()
  } catch (e: unknown) {
    loginError.value = e instanceof Error ? e.message : 'Sign in failed'
  } finally {
    loginLoading.value = false
  }
}

// ── Sign Up ──
const signupFirstName = ref('')
const signupLastName = ref('')
const signupEmail = ref('')
const signupPassword = ref('')
const signupError = ref('')
const signupLoading = ref(false)
const showSignupPw = ref(false)
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
  if (!guestName.value.trim()) { guestError.value = 'Please enter a name'; return }
  localStorage.setItem('syncyard_guest_name', guestName.value.trim())
  closeModal()
}

function setTab(tab: AuthTab) { activeTab.value = tab }

// Reset errors when switching tabs
watch(activeTab, () => {
  loginError.value = ''
  signupError.value = ''
  googleError.value = ''
  guestError.value = ''
})
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      style="font-family: 'Plus Jakarta Sans', sans-serif"
      @click.self="closeModal"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />

      <!-- Modal -->
      <div class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <img src="/images/logo.png" alt="Syncyard" class="h-5 w-auto" />
          <button
            class="text-[#8a8a6a] hover:text-[#2d2d1a] transition-colors"
            @click="closeModal"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex items-center border-b border-gray-100 px-6 shrink-0">
          <button
            v-for="(label, tab) in { signup: 'Sign Up', login: 'Login', guest: 'Continue as guest' }"
            :key="tab"
            :class="['py-3 text-sm font-medium mr-5 border-b-2 -mb-px transition-colors whitespace-nowrap',
              activeTab === tab
                ? 'border-[#7a8355] text-[#2d2d1a]'
                : 'border-transparent text-[#a0a08a] hover:text-[#6b6b5a]']"
            @click="setTab(tab as AuthTab)"
          >
            {{ label }}
          </button>
        </div>

        <!-- Scrollable form body -->
        <div class="overflow-y-auto flex-1 px-6 pt-6 pb-4">

          <!-- ── LOGIN ── -->
          <template v-if="activeTab === 'login'">
            <h2 class="font-display text-2xl font-bold text-[#6b7a3a] mb-1">
              Welcome back
            </h2>
            <p class="text-sm text-[#8a8a6a] mb-6">Log in to join rooms and meet people.</p>

            <button :disabled="googleLoading"
              class="w-full flex items-center justify-center gap-3 border border-[#e0e0d4] rounded-xl px-4 py-2.5 text-sm font-medium text-[#2d2d1a] hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50"
              @click="handleGoogle">
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
              {{ googleLoading ? 'Loading...' : 'Login with Google' }}
            </button>
            <p v-if="googleError" class="text-xs text-red-500 mb-3">{{ googleError }}</p>

            <div class="flex items-center gap-3 mb-4">
              <div class="flex-1 h-px bg-[#e8e8e0]" />
              <span class="text-xs text-[#a0a08a] uppercase tracking-wider">or</span>
              <div class="flex-1 h-px bg-[#e8e8e0]" />
            </div>

            <form class="space-y-3" @submit.prevent="handleLogin">
              <input v-model="loginEmail" type="email" placeholder="Email address" required
                class="w-full border border-[#e0e0d4] rounded-xl px-4 py-2.5 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors"/>
              <div class="relative">
                <input v-model="loginPassword" :type="showLoginPw ? 'text' : 'password'" placeholder="Password" required
                  class="w-full border border-[#e0e0d4] rounded-xl px-4 py-2.5 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors pr-16"/>
                <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8a8a6a] hover:text-[#2d2d1a] flex items-center gap-1"
                  @click="showLoginPw = !showLoginPw">
                  <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path v-if="showLoginPw" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  {{ showLoginPw ? 'Hide' : 'Show' }}
                </button>
              </div>
              <p v-if="loginError" class="text-xs text-red-500">{{ loginError }}</p>
              <div class="text-right">
                <a href="#" class="text-xs text-[#8a8a6a] hover:text-[#2d2d1a] underline underline-offset-2">Forgot your password?</a>
              </div>
              <button type="submit" :disabled="loginLoading"
                class="w-full bg-[#5a6e2a] hover:bg-[#4a5e1a] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
                {{ loginLoading ? 'Logging in...' : 'Log in' }}
              </button>
            </form>
          </template>

          <!-- ── SIGN UP ── -->
          <template v-else-if="activeTab === 'signup'">
            <template v-if="signupSubmitted">
              <div class="py-8 text-center">
                <div class="text-4xl mb-3">✉️</div>
                <h2 class="text-xl font-bold text-[#6b7a3a] mb-2">Check your inbox</h2>
                <p class="text-sm text-[#8a8a6a]">We sent a link to <span class="text-[#2d2d1a] font-medium">{{ signupEmail }}</span></p>
                <button class="mt-5 text-sm text-[#7a8355] hover:underline" @click="setTab('login')">Back to log in →</button>
              </div>
            </template>
            <template v-else>
              <h2 class="font-display text-2xl font-bold text-[#6b7a3a] mb-1">
                Join Syncyard
              </h2>
              <p class="text-sm text-[#8a8a6a] mb-6">Create an account to host rooms, save your favorites, and build your profile.</p>

              <button :disabled="googleLoading"
                class="w-full flex items-center justify-center gap-3 border border-[#e0e0d4] rounded-xl px-4 py-2.5 text-sm font-medium text-[#2d2d1a] hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50"
                @click="handleGoogle">
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
                {{ googleLoading ? 'Loading...' : 'Sign Up with Google' }}
              </button>
              <p v-if="googleError" class="text-xs text-red-500 mb-3">{{ googleError }}</p>

              <div class="flex items-center gap-3 mb-4">
                <div class="flex-1 h-px bg-[#e8e8e0]" />
                <span class="text-xs text-[#a0a08a] uppercase tracking-wider">or</span>
                <div class="flex-1 h-px bg-[#e8e8e0]" />
              </div>

              <form class="space-y-3" @submit.prevent="handleSignup">
                <div class="grid grid-cols-2 gap-3">
                  <input v-model="signupFirstName" type="text" placeholder="First Name" required
                    class="border border-[#e0e0d4] rounded-xl px-4 py-2.5 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors"/>
                  <input v-model="signupLastName" type="text" placeholder="Last Name"
                    class="border border-[#e0e0d4] rounded-xl px-4 py-2.5 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors"/>
                </div>
                <input v-model="signupEmail" type="email" placeholder="Email address" required
                  class="w-full border border-[#e0e0d4] rounded-xl px-4 py-2.5 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors"/>
                <div class="relative">
                  <input v-model="signupPassword" :type="showSignupPw ? 'text' : 'password'" placeholder="Password" required
                    class="w-full border border-[#e0e0d4] rounded-xl px-4 py-2.5 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors pr-16"/>
                  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8a8a6a] hover:text-[#2d2d1a] flex items-center gap-1"
                    @click="showSignupPw = !showSignupPw">
                    <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path v-if="showSignupPw" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                      <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    {{ showSignupPw ? 'Hide' : 'Show' }}
                  </button>
                </div>
                <p v-if="signupError" class="text-xs text-red-500">{{ signupError }}</p>
                <button type="submit" :disabled="signupLoading"
                  class="w-full bg-[#5a6e2a] hover:bg-[#4a5e1a] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
                  {{ signupLoading ? 'Creating account...' : 'Sign up' }}
                </button>
              </form>
            </template>
          </template>

          <!-- ── GUEST ── -->
          <template v-else>
            <h2 class="font-display text-2xl font-bold text-[#6b7a3a] mb-1">
              Just browsing?
            </h2>
            <p class="text-sm text-[#8a8a6a] mb-6">Pick a name and jump straight into any open room. No account needed.</p>

            <input v-model="guestName" type="text" placeholder="What should we call you?"
              class="w-full border border-[#e0e0d4] rounded-xl px-4 py-2.5 text-sm text-[#2d2d1a] placeholder-[#b0b09a] focus:outline-none focus:border-[#9aa374] focus:ring-1 focus:ring-[#9aa374] transition-colors mb-5"
              @keydown.enter="handleGuest"/>

            <ul class="space-y-2 mb-5">
              <li v-for="item in ['Browse and join any live room for 10 minutes', 'Chat and participate in discussions', 'No email or password required']" :key="item"
                class="flex items-center gap-3 text-sm text-[#4a4a2a]">
                <span class="h-5 w-5 rounded-full bg-[#dde8c8] flex items-center justify-center shrink-0">
                  <svg class="h-3 w-3 text-[#5a6e2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                  </svg>
                </span>
                {{ item }}
              </li>
            </ul>

            <div class="bg-[#f5f5ee] border border-[#e0e0d4] rounded-xl px-4 py-3 flex gap-3 mb-5">
              <svg class="h-4 w-4 text-[#8a8a6a] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p class="text-xs text-[#6b6b5a] leading-relaxed">Guests can't host rooms or save favorites. Create a free account to unlock everything.</p>
            </div>

            <p v-if="guestError" class="text-xs text-red-500 mb-3">{{ guestError }}</p>
            <button class="w-full bg-[#5a6e2a] hover:bg-[#4a5e1a] text-white font-semibold py-3 rounded-xl transition-colors" @click="handleGuest">
              Continue as guest
            </button>
          </template>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-[#f8f8f5] border-t border-gray-100 text-center shrink-0">
          <template v-if="activeTab === 'login'">
            <p class="text-sm text-[#8a8a6a]">Don't have an account?
              <button class="text-[#2d2d1a] font-semibold underline underline-offset-2 hover:text-[#5a6e2a]" @click="setTab('signup')">Create an account</button>
            </p>
          </template>
          <template v-else-if="activeTab === 'signup'">
            <p class="text-sm text-[#8a8a6a]">Already have an account?
              <button class="text-[#2d2d1a] font-semibold underline underline-offset-2 hover:text-[#5a6e2a]" @click="setTab('login')">Login</button>
            </p>
          </template>
          <template v-else>
            <p class="text-sm text-[#8a8a6a]">Want the full experience?
              <button class="text-[#2d2d1a] font-semibold underline underline-offset-2 hover:text-[#5a6e2a]" @click="setTab('signup')">Sign up free!</button>
            </p>
          </template>
        </div>
      </div>
    </div>
  </Transition>
</template>
