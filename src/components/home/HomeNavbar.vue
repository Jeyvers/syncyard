<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuthModal } from '@/composables/useAuthModal'

const emit = defineEmits<{ 'start-room': [] }>()

const auth = useAuthStore()
const router = useRouter()
const { openModal } = useAuthModal()
const mobileOpen = ref(false)
const scrolled = ref(false)
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLDivElement | null>(null)

function onScroll() {
  scrolled.value = window.scrollY > 24
}

function scrollTo(id: string) {
  mobileOpen.value = false
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
  else window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}

function initials() {
  const name = auth.profile?.full_name || auth.user?.user_metadata?.full_name || ''
  return (
    name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'ME'
  )
}

function closeMenuOnOutsideClick(e: MouseEvent) {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    userMenuOpen.value = false
  }
}

function mobileHostRoom() {
  mobileOpen.value = false
  emit('start-room')
}

function mobileSignIn() {
  mobileOpen.value = false
  openModal('login')
}

function mobileSignUp() {
  mobileOpen.value = false
  openModal('signup')
}

async function handleLogout() {
  userMenuOpen.value = false
  mobileOpen.value = false
  await auth.signOut()
  router.push('/')
}

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  document.addEventListener('click', closeMenuOnOutsideClick)
})
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  document.removeEventListener('click', closeMenuOnOutsideClick)
})
</script>

<template>
  <header
    :class="[
      'fixed inset-x-0 top-0 z-40 transition-all duration-300',
      scrolled
        ? 'bg-[#f5f5f2]/95 backdrop-blur-md border-b border-[#e0e0d4]'
        : 'bg-[#f5f5f2] border-b border-[#e8e8e0]',
    ]"
    class="font-body"
  >
    <div class="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
      <!-- Logo -->
      <RouterLink to="/">
        <img src="/images/logo.png" alt="Syncyard" class="h-5 w-auto" />
      </RouterLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-1">
        <button
          class="px-4 py-1.5 font-display text-sm text-[#41431B] hover:text-[#2d2d1a] transition-colors"
          @click="scrollTo('live-rooms')"
        >
          Explore
        </button>
        <button
          class="px-4 py-1.5 font-display text-sm text-[#41431B] hover:text-[#2d2d1a] transition-colors"
          @click="scrollTo('how-it-works')"
        >
          How it works
        </button>
        <button
          class="px-4 py-1.5 font-display text-sm text-[#41431B] hover:text-[#2d2d1a] transition-colors"
          @click="emit('start-room')"
        >
          Host a room
        </button>
      </nav>

      <!-- Desktop right -->
      <div class="hidden md:flex items-center gap-3">
        <template v-if="auth.isAuthenticated">
          <!-- Avatar + dropdown -->
          <div ref="userMenuRef" class="relative">
            <button
              class="h-8 w-8 rounded-full bg-[#2d4a1e] flex items-center justify-center text-white text-xs font-bold hover:bg-[#3a5a28] transition-colors"
              @click="userMenuOpen = !userMenuOpen"
            >
              {{ initials() }}
            </button>

            <Transition
              enter-active-class="transition-all duration-150 ease-out"
              enter-from-class="opacity-0 scale-95 translate-y-1"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition-all duration-100 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-1"
            >
              <div
                v-if="userMenuOpen"
                class="absolute right-0 top-10 w-48 bg-white border border-[#e8e8e0] rounded-xl shadow-lg py-1 z-50"
              >
                <div class="px-4 py-2.5 border-b border-[#f0f0e8]">
                  <p class="text-xs font-semibold text-[#1a1a0e] truncate">
                    {{ auth.profile?.full_name || auth.user?.user_metadata?.full_name || 'You' }}
                  </p>
                  <p class="text-[10px] text-muted truncate">{{ auth.user?.email }}</p>
                </div>
                <RouterLink
                  v-if="auth.profile?.username"
                  :to="`/profile/${auth.profile.username}`"
                  class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#2d2d1a] hover:bg-[#f5f5f0] transition-colors"
                  @click="userMenuOpen = false"
                >
                  <svg
                    class="h-4 w-4 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  My Profile
                </RouterLink>
                <RouterLink
                  to="/onboarding"
                  class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#2d2d1a] hover:bg-[#f5f5f0] transition-colors"
                  @click="userMenuOpen = false"
                >
                  <svg
                    class="h-4 w-4 text-muted"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </RouterLink>
                <div class="border-t border-[#f0f0e8] mt-1 pt-1">
                  <button
                    class="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                    @click="handleLogout"
                  >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Log out
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </template>

        <template v-else>
          <button
            class="text-sm text-[#6b6b5a] hover:text-[#2d2d1a] transition-colors px-3 py-1.5"
            @click="openModal('login')"
          >
            Sign in
          </button>
          <button
            class="bg-[#2d4a1e] hover:bg-[#3a5a28] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
            @click="openModal('signup')"
          >
            Get started
          </button>
        </template>
      </div>

      <!-- Mobile hamburger -->
      <button
        class="md:hidden p-2 text-[#6b6b5a] hover:text-[#2d2d1a] transition-colors"
        @click="mobileOpen = !mobileOpen"
      >
        <svg
          v-if="!mobileOpen"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileOpen"
        class="md:hidden bg-[#f5f5f2] border-t border-[#e8e8e0] px-4 py-3 space-y-1"
      >
        <button
          class="block w-full text-left px-3 py-2.5 text-sm text-[#6b6b5a] hover:text-[#2d2d1a] rounded-lg transition-colors"
          @click="scrollTo('live-rooms')"
        >
          Explore
        </button>
        <button
          class="block w-full text-left px-3 py-2.5 text-sm text-[#6b6b5a] hover:text-[#2d2d1a] rounded-lg transition-colors"
          @click="scrollTo('how-it-works')"
        >
          How it works
        </button>
        <button
          class="block w-full text-left px-3 py-2.5 text-sm text-[#6b6b5a] hover:text-[#2d2d1a] rounded-lg transition-colors"
          @click="mobileHostRoom"
        >
          Host a room
        </button>

        <div class="pt-3 border-t border-[#e8e8e0] flex flex-col gap-2">
          <template v-if="auth.isAuthenticated">
            <RouterLink
              v-if="auth.profile?.username"
              :to="`/profile/${auth.profile.username}`"
              class="block px-3 py-2.5 text-sm text-[#2d2d1a] rounded-lg"
              @click="mobileOpen = false"
            >
              My Profile
            </RouterLink>
            <RouterLink
              to="/onboarding"
              class="block px-3 py-2.5 text-sm text-[#2d2d1a] rounded-lg"
              @click="mobileOpen = false"
            >
              Settings
            </RouterLink>
            <button class="text-sm text-red-600 py-2.5 text-left px-3" @click="handleLogout">
              Log out
            </button>
          </template>
          <template v-else>
            <button class="text-sm text-[#6b6b5a] py-2 text-center" @click="mobileSignIn">
              Sign in
            </button>
            <button
              class="bg-[#2d4a1e] text-white text-sm font-semibold py-2.5 rounded-full"
              @click="mobileSignUp"
            >
              Get started
            </button>
          </template>
        </div>
      </div>
    </Transition>
  </header>
</template>
