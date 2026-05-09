<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuthModal } from '@/composables/useAuthModal'
import { supabase } from '@/lib/supabase'

import HomeNavbar from '@/components/home/HomeNavbar.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import TagsShowcase from '@/components/home/TagsShowcase.vue'
import HappeningNow from '@/components/home/HappeningNow.vue'
import HowItWorksSection from '@/components/home/HowItWorksSection.vue'
import HomeFooter from '@/components/home/HomeFooter.vue'
import AuthModal from '@/components/auth/AuthModal.vue'
import DashboardContent from '@/components/dashboard/DashboardContent.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { openModal } = useAuthModal()

onMounted(() => {
  const tab = route.query.auth as string
  if (tab === 'login' || tab === 'signup' || tab === 'guest') {
    // Only open the modal if the user is not already authenticated
    if (!auth.isAuthenticated) {
      openModal(tab)
    } else {
      // Authenticated — just clean the URL without navigating
      router.replace({ query: {} })
    }
  }
})

async function startRoom() {
  if (!auth.isAuthenticated) {
    openModal('login')
    return
  }
  const { data: ws, error: wsErr } = await supabase
    .from('workspaces')
    .insert({ name: 'New Sync', creator_id: auth.user?.id })
    .select()
    .single()
  if (wsErr) {
    console.error('[startRoom] workspace insert failed:', wsErr.message, wsErr.details, wsErr.hint)
    return
  }
  if (ws) {
    const { error: memberErr } = await supabase
      .from('workspace_members')
      .insert({ workspace_id: ws.id, user_id: auth.user?.id })
    if (memberErr) console.error('[startRoom] member insert failed:', memberErr.message)
    router.push(`/workspace/${ws.id}`)
  }
}
</script>

<template>
  <div class="bg-white text-[#2d2d1a]">
    <HomeNavbar @start-room="startRoom" />

    <template v-if="auth.isAuthenticated">
      <DashboardContent @start-room="startRoom" />
    </template>
    <template v-else>
      <HeroSection />
      <TagsShowcase />
      <HappeningNow />
      <HowItWorksSection />
      <HomeFooter />
    </template>

    <AuthModal />
  </div>
</template>
