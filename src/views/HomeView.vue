<script setup lang="ts">
import HomeNavbar from '@/components/home/HomeNavbar.vue'
import HeroSection from '@/components/home/HeroSection.vue'
import TagsShowcase from '@/components/home/TagsShowcase.vue'
import HowItWorksSection from '@/components/home/HowItWorksSection.vue'
import TestimonialsSection from '@/components/home/TestimonialsSection.vue'
import CtaBanner from '@/components/home/CtaBanner.vue'
import HomeFooter from '@/components/home/HomeFooter.vue'
import NewHeroSection from '@/components/home/NewHeroSection.vue'
</script>

<template>
  <div
    class="min-h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors duration-200"
  >
    <HomeNavbar />
    <NewHeroSection />
    <HeroSection />
    <TagsShowcase />
    <HowItWorksSection />
    <TestimonialsSection />
    <CtaBanner />
    <HomeFooter />
  </div>
</template>
