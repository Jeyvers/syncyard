<script setup lang="ts">
defineProps<{
  isMicEnabled: boolean
  isCameraEnabled: boolean
  participantCount: number
  isChatOpen: boolean
  unreadCount: number
}>()

const emit = defineEmits<{
  toggleMic: []
  toggleCamera: []
  toggleChat: []
  leave: []
}>()
</script>

<template>
  <div class="flex items-center justify-between px-6 py-4 bg-[#0a1506] border-t border-white/10">
    <!-- Left: participant count -->
    <div class="flex items-center gap-1.5 text-white/50 text-xs">
      <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      {{ participantCount }}
    </div>

    <!-- Centre: mic + camera + chat -->
    <div class="flex items-center gap-3">
      <!-- Microphone -->
      <button
        :class="[
          'h-11 w-11 rounded-full flex items-center justify-center transition-colors',
          isMicEnabled
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-red-600/80 hover:bg-red-500 text-white',
        ]"
        title="Toggle microphone"
        @click="emit('toggleMic')"
      >
        <svg v-if="isMicEnabled" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zM17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      </button>

      <!-- Camera -->
      <button
        :class="[
          'h-11 w-11 rounded-full flex items-center justify-center transition-colors',
          isCameraEnabled
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-white/10 hover:bg-white/20 text-white/40',
        ]"
        title="Toggle camera"
        @click="emit('toggleCamera')"
      >
        <svg v-if="isCameraEnabled" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z M3 3l18 18" />
        </svg>
      </button>

      <!-- Chat -->
      <button
        :class="[
          'relative h-11 w-11 rounded-full flex items-center justify-center transition-colors',
          isChatOpen
            ? 'bg-[#4a7a28] text-white'
            : 'bg-white/10 hover:bg-white/20 text-white/70',
        ]"
        title="Toggle chat"
        @click="emit('toggleChat')"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <!-- Unread badge -->
        <span
          v-if="unreadCount > 0 && !isChatOpen"
          class="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-0.5 rounded-full bg-[#4a7a28] text-white text-[9px] font-bold flex items-center justify-center"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>
    </div>

    <!-- Right: leave button -->
    <button
      class="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
      @click="emit('leave')"
    >
      Leave
    </button>
  </div>
</template>
