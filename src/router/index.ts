import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

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
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/signup',
      component: () => import('@/views/SignupView.vue'),
      meta: { guest: true },
    },
    {
      path: '/onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { auth: true },
    },
    {
      path: '/dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { auth: true },
    },
    {
      path: '/discover',
      component: () => import('@/views/DiscoverView.vue'),
      meta: { auth: true },
    },
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

  // Redirect unauthenticated users away from protected routes
  if (to.meta.auth && !auth.isAuthenticated) return '/login'

  // Redirect authenticated users away from guest-only routes
  if (to.meta.guest && auth.isAuthenticated) return '/dashboard'

  // Force onboarding for authenticated users who haven't completed it
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
