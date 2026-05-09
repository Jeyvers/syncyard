<script setup lang="ts">
import { computed } from 'vue'
import type { LocalParticipant, RemoteParticipant } from 'livekit-client'
import type { RoomMessage } from '@/types/index'
import ParticipantTile from './ParticipantTile.vue'
import RoomChat from './RoomChat.vue'

const props = defineProps<{
  participants: Array<LocalParticipant | RemoteParticipant>
  localIdentity: string
  isConnecting: boolean
  isCreator: boolean
  error: string | null
  isChatOpen: boolean
  messages: RoomMessage[]
}>()

const emit = defineEmits<{
  toggleChat: []
  leave: []
  sendMessage: [content: string]
}>()

const gridClass = computed(() => {
  const n = props.participants.length
  if (n <= 1) return 'grid-cols-1 max-w-2xl mx-auto w-full'
  if (n === 2) return 'grid-cols-2'
  if (n <= 4) return 'grid-cols-2'
  return 'grid-cols-3'
})
</script>

<template>
  <div class="h-full flex overflow-hidden relative bg-[#0d1a08]">

    <!-- Connecting overlay -->
    <div v-if="isConnecting" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="h-8 w-8 rounded-full border-2 border-white/20 border-t-green-400 animate-spin mx-auto mb-3" />
        <p class="text-white/50 text-sm">{{ isCreator ? 'Starting your sync…' : 'Joining room…' }}</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex-1 flex items-center justify-center">
      <div class="text-center px-6">
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

    <!-- Chat panel (slides in from right) -->
    <Transition
      enter-active-class="transition-transform duration-200 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-150 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div
        v-if="isChatOpen"
        class="absolute inset-y-0 right-0 left-0 z-10 md:relative md:inset-auto md:w-80 md:shrink-0"
      >
        <RoomChat
          :messages="messages"
          :current-user-id="localIdentity"
          class="h-full"
          @send="emit('sendMessage', $event)"
          @close="emit('toggleChat')"
        />
      </div>
    </Transition>
  </div>
</template>
