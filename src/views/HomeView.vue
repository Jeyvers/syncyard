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
  if (tab === 'login' || tab === 'signup' || tab === 'guest') openModal(tab)
})

async function startRoom() {
  if (!auth.isAuthenticated) { openModal('login'); return }
  const { data: ws } = await supabase
    .from('workspaces')
    .insert({ name: 'New Sync', creator_id: auth.user?.id })
    .select().single()
  if (ws) {
    await supabase.from('workspace_members').insert({ workspace_id: ws.id, user_id: auth.user?.id })
    router.push(`/workspace/${ws.id}`)
  }
}
</script>

<template>
  <div class="bg-[#f5f5f2] text-[#2d2d1a]">
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
