<script setup lang="ts">
import { computed } from 'vue'
import type { LocalParticipant, RemoteParticipant } from 'livekit-client'
import ParticipantTile from './ParticipantTile.vue'

const props = defineProps<{
  participants: Array<LocalParticipant | RemoteParticipant>
  localIdentity: string
  isConnecting: boolean
  isCreator: boolean
  error: string | null
}>()

const emit = defineEmits<{ leave: [] }>()

const gridClass = computed(() => {
  const n = props.participants.length
  if (n <= 1) return 'grid-cols-1 max-w-2xl mx-auto w-full'
  if (n === 2) return 'grid-cols-2'
  if (n <= 4) return 'grid-cols-2'
  return 'grid-cols-3'
})
</script>

<template>
  <div class="h-full flex items-stretch bg-[#0d1a08] overflow-hidden">

    <!-- Connecting -->
    <div v-if="isConnecting" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="h-8 w-8 rounded-full border-2 border-white/20 border-t-green-400 animate-spin mx-auto mb-3" />
        <p class="text-white/50 text-sm">{{ isCreator ? 'Starting your sync…' : 'Joining room…' }}</p>
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center px-6">
      <div class="text-center">
        <p class="text-red-400 text-sm mb-3">{{ error }}</p>
        <button class="text-white/50 text-xs underline" @click="emit('leave')">Go back</button>
      </div>
    </div>

    <!-- Participant grid -->
    <div v-else class="flex-1 overflow-y-auto p-4">
      <div :class="['grid gap-3', gridClass]">
        <ParticipantTile
          v-for="p in participants"
          :key="p.sid"
          :participant="p"
          :is-local="p.identity === localIdentity"
        />
      </div>
    </div>

  </div>
</template>
