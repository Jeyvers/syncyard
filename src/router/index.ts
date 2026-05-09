import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

function hasGuestSession() {
  return !!(localStorage.getItem('syncyard_guest_id') && localStorage.getItem('syncyard_guest_name'))
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      // OAuth callback — no meta guards, session exchange happens here
      path: '/auth/callback',
      component: () => import('@/views/AuthCallbackView.vue'),
    },
    {
      path: '/login',
      component: () => import('@/views/AuthView.vue'),
      meta: { guest: true },
    },
    {
      path: '/signup',
      component: () => import('@/views/AuthView.vue'),
      meta: { guest: true },
    },
    {
      path: '/room/create',
      component: () => import('@/views/RoomSetupView.vue'),
      meta: { auth: true },
    },
    {
      path: '/room/:id/join',
      component: () => import('@/views/RoomJoinView.vue'),
    },
    {
      path: '/onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { auth: true },
    },
    { path: '/dashboard', redirect: '/' },
    { path: '/discover', redirect: '/' },
    {
      path: '/profile/:username',
      component: () => import('@/views/ProfileView.vue'),
    },
    {
      path: '/workspace/:id',
      component: () => import('@/views/WorkspaceView.vue'),
      meta: { auth: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Unauthenticated users hitting protected routes → home with modal (preserve intended destination)
  if (to.meta.auth && !auth.isAuthenticated) {
    // Guests with a valid session may join workspace rooms
    if (to.path.startsWith('/workspace/') && hasGuestSession()) return
    return `/?auth=login&redirect=${encodeURIComponent(to.fullPath)}`
  }

  // Authenticated users hitting old login/signup routes → home (now the dashboard)
  if (to.meta.guest && auth.isAuthenticated) return '/'

  // Force onboarding for users who haven't set a username yet
  if (
    to.meta.auth &&
    auth.isAuthenticated &&
    !auth.isOnboarded &&
    to.path !== '/onboarding'
  ) {
    return '/onboarding'
  }
})

export default router
