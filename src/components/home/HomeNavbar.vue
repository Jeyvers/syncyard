<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppButton from '@/components/ui/AppButton.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const auth = useAuthStore()
const mobileOpen = ref(false)
const scrolled = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 24
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

function scrollTo(id: string) {
  mobileOpen.value = false
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <header
    :class="[
      'fixed inset-x-0 top-0 z-50 transition-all duration-300',
      scrolled
        ? 'bg-earth-100/90 dark:bg-earth-900/90 backdrop-blur-md border-b border-earth-200/80 dark:border-earth-700/80'
        : 'bg-transparent',
    ]"
  >
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <!-- Logo -->
      <RouterLink
        to="/"
        class="text-earth-900 dark:text-earth-100 font-bold text-xl tracking-tight shrink-0"
      >
        syncyard
      </RouterLink>

      <!-- Desktop nav -->
      <nav class="hidden md:flex items-center gap-1">
        <button
          class="px-3 py-1.5 text-sm text-earth-500 dark:text-earth-300 hover:text-earth-900 dark:hover:text-earth-50 hover:bg-earth-200/60 dark:hover:bg-earth-800/60 rounded-lg transition-colors"
          @click="scrollTo('hero')"
        >
          Home
        </button>
        <RouterLink
          to="/discover"
          class="px-3 py-1.5 text-sm text-earth-500 dark:text-earth-300 hover:text-earth-900 dark:hover:text-earth-50 hover:bg-earth-200/60 dark:hover:bg-earth-800/60 rounded-lg transition-colors"
        >
          Discover
        </RouterLink>
        <button
          class="px-3 py-1.5 text-sm text-earth-500 dark:text-earth-300 hover:text-earth-900 dark:hover:text-earth-50 hover:bg-earth-200/60 dark:hover:bg-earth-800/60 rounded-lg transition-colors"
          @click="scrollTo('how-it-works')"
        >
          How it works
        </button>
      </nav>

      <!-- Desktop CTA -->
      <div class="hidden md:flex items-center gap-3">
        <ThemeToggle />

        <template v-if="auth.isAuthenticated">
          <RouterLink to="/dashboard">
            <AppButton size="md">Go to dashboard</AppButton>
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink
            to="/login"
            class="text-sm text-earth-500 dark:text-earth-300 hover:text-earth-900 dark:hover:text-earth-50 transition-colors px-3 py-1.5"
          >
            Sign in
          </RouterLink>
          <RouterLink to="/signup">
            <AppButton size="md">Get started</AppButton>
          </RouterLink>
        </template>
      </div>

      <!-- Mobile: toggle + hamburger -->
      <div class="md:hidden flex items-center gap-2">
        <ThemeToggle />
        <button
          class="p-2 text-earth-500 dark:text-earth-300 hover:text-earth-900 dark:hover:text-earth-50 transition-colors rounded-lg"
          :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
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
        class="md:hidden bg-earth-100 dark:bg-earth-900 border-t border-earth-200 dark:border-earth-700 px-4 py-3 space-y-1"
      >
        <button
          class="block w-full text-left px-3 py-2.5 text-sm text-earth-500 dark:text-earth-300 hover:text-earth-900 dark:hover:text-earth-50 hover:bg-earth-200/60 dark:hover:bg-earth-800/60 rounded-lg transition-colors"
          @click="scrollTo('hero')"
        >
          Home
        </button>
        <RouterLink
          to="/discover"
          class="block px-3 py-2.5 text-sm text-earth-500 dark:text-earth-300 hover:text-earth-900 dark:hover:text-earth-50 hover:bg-earth-200/60 dark:hover:bg-earth-800/60 rounded-lg transition-colors"
          @click="mobileOpen = false"
        >
          Discover
        </RouterLink>
        <button
          class="block w-full text-left px-3 py-2.5 text-sm text-earth-500 dark:text-earth-300 hover:text-earth-900 dark:hover:text-earth-50 hover:bg-earth-200/60 dark:hover:bg-earth-800/60 rounded-lg transition-colors"
          @click="scrollTo('how-it-works')"
        >
          How it works
        </button>

        <div class="pt-3 border-t border-earth-200 dark:border-earth-700 flex flex-col gap-2">
          <template v-if="auth.isAuthenticated">
            <RouterLink to="/dashboard" @click="mobileOpen = false">
              <AppButton size="lg" class="w-full">Go to dashboard</AppButton>
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              class="block px-3 py-2.5 text-sm text-earth-500 dark:text-earth-300 hover:text-earth-900 dark:hover:text-earth-50 rounded-lg text-center transition-colors"
              @click="mobileOpen = false"
            >
              Sign in
            </RouterLink>
            <RouterLink to="/signup" @click="mobileOpen = false">
              <AppButton size="lg" class="w-full">Get started</AppButton>
            </RouterLink>
          </template>
        </div>
      </div>
    </Transition>
  </header>
</template>
