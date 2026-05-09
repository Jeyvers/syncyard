<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuthModal, type AuthTab } from '@/composables/useAuthModal'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { isOpen, activeTab, closeModal } = useAuthModal()

// After auth, go to the redirect destination if one was saved
function redirectAfterAuth() {
  const dest = route.query.redirect as string | undefined
  closeModal()
  if (dest) router.push(decodeURIComponent(dest))
}

// ── Login ──
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')
const loginLoading = ref(false)
const showLoginPw = ref(false)
const forgotMode = ref(false)
const forgotEmail = ref('')
const forgotSent = ref(false)
const forgotLoading = ref(false)
const forgotError = ref('')

async function handleLogin() {
  loginLoading.value = true
  loginError.value = ''
  try {
    await auth.signIn(loginEmail.value, loginPassword.value)
    redirectAfterAuth()
  } catch (e: unknown) {
    loginError.value = e instanceof Error ? e.message : 'Sign in failed'
  } finally {
    loginLoading.value = false
  }
}

async function handleForgot() {
  if (!forgotEmail.value.trim()) { forgotError.value = 'Please enter your email'; return }
  forgotLoading.value = true
  forgotError.value = ''
  try {
    await auth.resetPassword(forgotEmail.value.trim())
    forgotSent.value = true
  } catch (e: unknown) {
    forgotError.value = e instanceof Error ? e.message : 'Could not send reset email'
  } finally {
    forgotLoading.value = false
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
  redirectAfterAuth()
}

function setTab(tab: AuthTab) { activeTab.value = tab }

watch(activeTab, () => {
  loginError.value = ''
  signupError.value = ''
  googleError.value = ''
  guestError.value = ''
  forgotMode.value = false
  forgotSent.value = false
  forgotEmail.value = ''
  forgotError.value = ''
})

// Input class shared across all inputs
const inputCls = 'w-full border border-gray-200 rounded-2xl px-5 py-3.5 text-sm text-[#2d4a1e] placeholder-gray-400 focus:outline-none focus:border-[#7C824E] focus:ring-1 focus:ring-[#7C824E] transition-colors'
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-250 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeModal" />

      <Transition
        appear
        enter-active-class="transition-all duration-350 ease-out"
        enter-from-class="opacity-0 translate-y-16"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div class="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

          <!-- Header -->
          <div class="flex items-center justify-between px-8 pt-7 pb-5 shrink-0">
            <img src="/images/logo.png" alt="Syncyard" class="h-6 w-auto" />
            <button class="text-muted hover:text-[#2d4a1e] transition-colors" @click="closeModal">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex items-center justify-center border-b border-gray-100 px-8 gap-8 shrink-0">
            <button
              v-for="(label, tab) in { signup: 'Sign Up', login: 'Login', guest: 'Continue as guest' }"
              :key="tab"
              :class="['py-4 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap',
                activeTab === tab
                  ? 'border-[#7C824E] text-[#7C824E]'
                  : 'border-transparent text-gray-400 hover:text-gray-500']"
              @click="setTab(tab as AuthTab)"
            >{{ label }}</button>
          </div>

          <!-- Body -->
          <div class="overflow-y-auto flex-1 px-8 pt-8 pb-6">

            <!-- ── LOGIN ── -->
            <template v-if="activeTab === 'login'">

              <!-- Forgot password sent confirmation -->
              <template v-if="forgotSent">
                <div class="text-center py-8">
                  <div class="text-4xl mb-3">📬</div>
                  <h2 class="text-xl font-bold text-[#2d4a1e] mb-2">Reset link sent</h2>
                  <p class="text-sm text-gray-500 mb-1">
                    Check <span class="text-[#2d4a1e] font-medium">{{ forgotEmail }}</span> for a password reset link.
                  </p>
                  <p class="text-xs text-gray-400 mb-5">It may take a minute. Check your spam folder if you don't see it.</p>
                  <button class="text-sm text-[#7C824E] hover:underline" @click="forgotMode = false; forgotSent = false">
                    ← Back to log in
                  </button>
                </div>
              </template>

              <!-- Forgot password form -->
              <template v-else-if="forgotMode">
                <h2 class="font-display text-2xl font-medium text-[#A5AC74] mb-2 text-center">Reset your password</h2>
                <p class="text-sm text-gray-500 mb-6 text-center">Enter your email and we'll send you a link to reset it.</p>
                <div class="space-y-4">
                  <input v-model="forgotEmail" type="email" placeholder="Email address" :class="inputCls" @keydown.enter="handleForgot" />
                  <p v-if="forgotError" class="text-xs text-red-500">{{ forgotError }}</p>
                  <button
                    :disabled="forgotLoading"
                    class="w-full bg-[#7C824E] hover:bg-[#6a7040] text-white font-semibold py-4 rounded-2xl transition-colors disabled:opacity-50 text-base"
                    @click="handleForgot"
                  >
                    {{ forgotLoading ? 'Sending...' : 'Send reset link' }}
                  </button>
                  <button class="w-full text-sm text-gray-400 hover:text-[#2d4a1e] transition-colors" @click="forgotMode = false">
                    ← Back to log in
                  </button>
                </div>
              </template>

              <!-- Login form -->
              <template v-else>
                <h2 class="font-display text-3xl font-medium text-[#A5AC74] mb-2 text-center">Welcome back</h2>
                <p class="text-sm text-gray-500 mb-8 text-center">Log in to join rooms and meet people.</p>

                <button
                  :disabled="googleLoading"
                  class="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-2xl px-4 py-4 text-sm font-medium text-[#2d4a1e] hover:bg-gray-50 transition-colors mb-5 disabled:opacity-50"
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
                  {{ googleLoading ? 'Loading...' : 'Login with Google' }}
                </button>
                <p v-if="googleError" class="text-xs text-red-500 mb-3">{{ googleError }}</p>

                <div class="flex items-center gap-3 mb-4">
                  <div class="flex-1 h-px bg-[#e8e8e0]" />
                  <span class="text-xs text-gray-400 uppercase tracking-wider">or</span>
                  <div class="flex-1 h-px bg-[#e8e8e0]" />
                </div>

                <form class="space-y-4" @submit.prevent="handleLogin">
                  <input v-model="loginEmail" type="email" placeholder="Email address" required :class="inputCls" />
                  <div class="relative">
                    <input v-model="loginPassword" :type="showLoginPw ? 'text' : 'password'" placeholder="Password" required
                      :class="inputCls + ' pr-20'" />
                    <button type="button"
                      class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-[#2d4a1e] flex items-center gap-1.5"
                      @click="showLoginPw = !showLoginPw"
                    >
                      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path v-if="showLoginPw" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                      {{ showLoginPw ? 'Hide' : 'Show' }}
                    </button>
                  </div>
                  <p v-if="loginError" class="text-xs text-red-500">{{ loginError }}</p>
                  <div class="text-right">
                    <button type="button" class="text-xs text-muted hover:text-[#2d4a1e] underline underline-offset-2 transition-colors" @click="forgotMode = true; forgotEmail = loginEmail">
                      Forgot your password?
                    </button>
                  </div>
                  <button type="submit" :disabled="loginLoading"
                    class="w-full bg-[#7C824E] hover:bg-[#6a7040] text-white font-semibold py-4 rounded-2xl transition-colors disabled:opacity-50 text-base mt-2">
                    {{ loginLoading ? 'Logging in...' : 'Log in' }}
                  </button>
                </form>
              </template>
            </template>

            <!-- ── SIGN UP ── -->
            <template v-else-if="activeTab === 'signup'">
              <template v-if="signupSubmitted">
                <div class="py-8 text-center">
                  <div class="text-4xl mb-3">✉️</div>
                  <h2 class="text-xl font-bold text-[#2d4a1e] mb-2">Check your inbox</h2>
                  <p class="text-sm text-gray-500 mb-1">
                    We sent a confirmation link to <span class="text-[#2d4a1e] font-medium">{{ signupEmail }}</span>.
                  </p>
                  <p class="text-xs text-gray-400 mb-1">Open the email and click the link to activate your account.</p>
                  <p class="text-xs text-gray-400 mb-5">Don't see it? Check your <span class="font-medium">spam or junk</span> folder.</p>
                  <button class="mt-2 text-sm text-[#7a8355] hover:underline" @click="setTab('login')">Back to log in →</button>
                </div>
              </template>
              <template v-else>
                <h2 class="font-display text-3xl font-medium text-[#A5AC74] mb-2 text-center">Join Syncyard</h2>
                <p class="text-sm text-gray-500 mb-8 text-center">Create an account to host rooms, save your favorites, and build your profile.</p>

                <button :disabled="googleLoading"
                  class="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-2xl px-4 py-4 text-sm font-medium text-[#2d4a1e] hover:bg-gray-50 transition-colors mb-5 disabled:opacity-50"
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

                <div class="flex items-center gap-3 mb-5">
                  <div class="flex-1 h-px bg-gray-100" />
                  <span class="text-xs text-gray-400 uppercase tracking-wider">or</span>
                  <div class="flex-1 h-px bg-gray-100" />
                </div>

                <form class="space-y-4" @submit.prevent="handleSignup">
                  <div class="grid grid-cols-2 gap-3">
                    <input v-model="signupFirstName" type="text" placeholder="First Name" required
                      class="border border-gray-200 rounded-2xl px-5 py-3.5 text-sm text-[#2d4a1e] placeholder-gray-400 focus:outline-none focus:border-[#7C824E] focus:ring-1 focus:ring-[#7C824E] transition-colors"/>
                    <input v-model="signupLastName" type="text" placeholder="Last Name"
                      class="border border-gray-200 rounded-2xl px-5 py-3.5 text-sm text-[#2d4a1e] placeholder-gray-400 focus:outline-none focus:border-[#7C824E] focus:ring-1 focus:ring-[#7C824E] transition-colors"/>
                  </div>
                  <input v-model="signupEmail" type="email" placeholder="Email address" required :class="inputCls" />
                  <div class="relative">
                    <input v-model="signupPassword" :type="showSignupPw ? 'text' : 'password'" placeholder="Password (min 8 characters)" required
                      :class="inputCls + ' pr-20'" />
                    <button type="button"
                      class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-[#2d4a1e] flex items-center gap-1.5"
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
                    class="w-full bg-[#7C824E] hover:bg-[#6a7040] text-white font-semibold py-4 rounded-2xl transition-colors disabled:opacity-50 text-base mt-2">
                    {{ signupLoading ? 'Creating account...' : 'Sign up' }}
                  </button>
                </form>
              </template>
            </template>

            <!-- ── GUEST ── -->
            <template v-else>
              <h2 class="font-display text-3xl font-medium text-[#A5AC74] mb-2 text-center">Just browsing?</h2>
              <p class="text-sm text-gray-500 mb-8 text-center">Pick a name and jump straight into any open room. No account needed.</p>

              <input v-model="guestName" type="text" placeholder="What should we call you?"
                :class="inputCls + ' mb-5'"
                @keydown.enter="handleGuest" />

              <ul class="space-y-2 mb-5">
                <li v-for="item in ['Browse and join any live room', 'Chat and participate in discussions', 'No email or password required']" :key="item"
                  class="flex items-center gap-3 text-sm text-[#4a4a2a]">
                  <span class="h-5 w-5 rounded-full bg-[#dde8c8] flex items-center justify-center shrink-0">
                    <svg class="h-3 w-3 text-[#5a6e2a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  </span>
                  {{ item }}
                </li>
              </ul>

              <div class="bg-[#f5f5ee] border border-gray-200 rounded-xl px-4 py-3 flex gap-3 mb-5">
                <svg class="h-4 w-4 text-muted shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <p class="text-xs text-gray-500 leading-relaxed">Guests can't host rooms or save favorites. Create a free account to unlock everything.</p>
              </div>

              <p v-if="guestError" class="text-xs text-red-500 mb-3">{{ guestError }}</p>
              <button class="w-full bg-[#7C824E] hover:bg-[#6a7040] text-white font-semibold py-4 rounded-2xl transition-colors text-base" @click="handleGuest">
                Continue as guest
              </button>
            </template>
          </div>

          <!-- Footer -->
          <div class="px-8 py-5 bg-[#f8f8f5] border-t border-gray-100 text-center shrink-0">
            <template v-if="activeTab === 'login'">
              <p class="text-sm text-muted">Don't have an account?
                <button class="text-[#7C824E] font-semibold underline underline-offset-2 hover:text-[#6a7040]" @click="setTab('signup')">Create an account</button>
              </p>
            </template>
            <template v-else-if="activeTab === 'signup'">
              <p class="text-sm text-muted">Already have an account?
                <button class="text-[#7C824E] font-semibold underline underline-offset-2 hover:text-[#6a7040]" @click="setTab('login')">Login</button>
              </p>
            </template>
            <template v-else>
              <p class="text-sm text-muted">Want the full experience?
                <button class="text-[#7C824E] font-semibold underline underline-offset-2 hover:text-[#6a7040]" @click="setTab('signup')">Sign up free!</button>
              </p>
            </template>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
