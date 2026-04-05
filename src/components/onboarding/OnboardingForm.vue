<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import AppInput from '@/components/ui/AppInput.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppTag from '@/components/ui/AppTag.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'

const SUGGESTED_TAGS = [
  'Design', 'Illustration', 'Photography', 'Music Production', 'Film', 'Animation',
  '3D', 'Writing', 'Copywriting', 'Motion Graphics', 'Brand Identity', 'UI/UX',
  'Typography', 'Ceramics', 'Sculpture', 'Painting', 'Digital Art', 'Fashion',
  'Architecture', 'Street Art',
]

const router = useRouter()
const auth = useAuthStore()

const step = ref(1)
const totalSteps = 3

const fullName = ref('')
const username = ref('')
const bio = ref('')
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)
const selectedTags = ref<string[]>([])
const customTag = ref('')

const loading = ref(false)
const error = ref('')

function nextStep() {
  error.value = ''
  if (step.value === 1 && (!fullName.value.trim() || !username.value.trim())) {
    error.value = 'Please fill in your display name and username.'
    return
  }
  if (step.value < totalSteps) step.value++
}

function prevStep() {
  if (step.value > 1) step.value--
}

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

function toggleTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) selectedTags.value.push(tag)
  else selectedTags.value.splice(idx, 1)
}

function addCustomTag() {
  const tag = customTag.value.trim()
  if (tag && !selectedTags.value.includes(tag)) selectedTags.value.push(tag)
  customTag.value = ''
}

async function handleSubmit() {
  if (!auth.user) return
  loading.value = true
  error.value = ''

  try {
    let avatarUrl: string | null = null

    if (avatarFile.value) {
      const ext = avatarFile.value.name.split('.').pop()
      const path = `${auth.user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, avatarFile.value, { upsert: true })
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      avatarUrl = urlData.publicUrl
    }

    const { error: insertError } = await supabase.from('profiles').upsert({
      id: auth.user.id,
      full_name: fullName.value.trim(),
      username: username.value.trim().toLowerCase(),
      bio: bio.value.trim(),
      avatar_url: avatarUrl,
      tags: selectedTags.value,
    })
    if (insertError) throw insertError

    await auth.fetchProfile()
    router.push('/dashboard')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 flex items-center justify-center px-4 py-12">
    <!-- Theme toggle -->
    <div class="fixed top-4 right-4">
      <ThemeToggle />
    </div>

    <div class="w-full max-w-lg">
      <!-- Progress -->
      <div class="mb-8">
        <p class="text-zinc-500 text-sm mb-1">Step {{ step }} of {{ totalSteps }}</p>
        <div class="flex gap-1.5 mb-4">
          <div
            v-for="i in totalSteps"
            :key="i"
            :class="['h-1 flex-1 rounded-full transition-all', i <= step ? 'bg-olive-500' : 'bg-zinc-200 dark:bg-zinc-800']"
          />
        </div>
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          <template v-if="step === 1">Set up your profile</template>
          <template v-else-if="step === 2">Add a photo</template>
          <template v-else>What do you create?</template>
        </h1>
        <p class="text-zinc-500 text-sm mt-1">
          <template v-if="step === 1">Tell the community who you are.</template>
          <template v-else-if="step === 2">A face to the name — optional but encouraged.</template>
          <template v-else>Select tags so collaborators can find you.</template>
        </p>
      </div>

      <!-- Step 1 -->
      <div v-if="step === 1" class="space-y-4">
        <AppInput v-model="fullName" label="Display name" placeholder="Alex Rivera" required />
        <AppInput v-model="username" label="Username" placeholder="alexrivera" required />
        <AppTextarea v-model="bio" label="Short bio" placeholder="Illustrator and motion designer based in São Paulo…" :rows="3" />
        <p v-if="error" class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>
        <AppButton size="lg" class="w-full" @click="nextStep">Continue</AppButton>
      </div>

      <!-- Step 2 -->
      <div v-else-if="step === 2" class="space-y-6">
        <div class="flex flex-col items-center gap-4">
          <div
            class="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-olive-500 transition-colors"
            @click="($refs.fileInput as HTMLInputElement).click()"
          >
            <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" alt="Avatar preview" />
            <svg v-else class="h-8 w-8 text-zinc-400 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p class="text-zinc-500 text-sm">Click to upload a photo</p>
          <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
        </div>

        <div class="flex gap-3">
          <AppButton variant="ghost" size="lg" class="flex-1" @click="prevStep">Back</AppButton>
          <AppButton size="lg" class="flex-1" @click="nextStep">Continue</AppButton>
        </div>
      </div>

      <!-- Step 3 -->
      <div v-else class="space-y-6">
        <div class="flex gap-2">
          <input
            v-model="customTag"
            type="text"
            placeholder="Add a custom tag…"
            class="flex-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm
                   text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
                   focus:outline-none focus:border-olive-500 focus:ring-1 focus:ring-olive-500 transition-colors"
            @keydown.enter.prevent="addCustomTag"
          />
          <AppButton variant="ghost" @click="addCustomTag">Add</AppButton>
        </div>

        <div class="flex flex-wrap gap-2">
          <AppTag
            v-for="tag in SUGGESTED_TAGS"
            :key="tag"
            :label="tag"
            :selected="selectedTags.includes(tag)"
            @click="toggleTag(tag)"
          />
        </div>

        <div v-if="selectedTags.some(t => !SUGGESTED_TAGS.includes(t))" class="flex flex-wrap gap-2">
          <AppTag
            v-for="tag in selectedTags.filter(t => !SUGGESTED_TAGS.includes(t))"
            :key="tag"
            :label="tag"
            :selected="true"
            :removable="true"
            @remove="selectedTags.splice(selectedTags.indexOf(tag), 1)"
          />
        </div>

        <p v-if="error" class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>

        <div class="flex gap-3">
          <AppButton variant="ghost" size="lg" class="flex-1" @click="prevStep">Back</AppButton>
          <AppButton size="lg" class="flex-1" :loading="loading" @click="handleSubmit">Finish setup</AppButton>
        </div>
      </div>
    </div>
  </div>
</template>
