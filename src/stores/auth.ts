import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(true)

  const isAuthenticated = computed(() => !!user.value)
  const isOnboarded = computed(() => !!profile.value?.username)

  async function init() {
    loading.value = true

    // Register listener before getSession so no SIGNED_IN events are missed
    // (important for PKCE OAuth callbacks where exchange may complete instantly).
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
      if (user.value) fetchProfile()
      else profile.value = null
    })

    const {
      data: { session },
    } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    if (user.value) await fetchProfile()
    loading.value = false
  }

  async function fetchProfile() {
    if (!user.value) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.value.id).single()
    profile.value = data
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await fetchProfile()
  }

  async function signUp(email: string, password: string, fullName?: string) {
    // Email/password signup always requires email confirmation.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: fullName ? { data: { full_name: fullName } } : undefined,
    })
    if (error) throw error
  }

  async function signInWithGoogle() {
    const siteUrl = window.location.origin as string
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/auth/callback`,
      },
    })

    // If error is thrown before redirect, surface it. Otherwise the browser navigates away.
    if (error) throw error
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    isOnboarded,
    init,
    fetchProfile,
    signIn,
    signUp,
    signInWithGoogle,
    resetPassword,
    signOut,
  }
})
