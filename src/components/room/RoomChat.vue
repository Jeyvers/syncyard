<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { RoomMessage } from '@/types/index'
import { useAuthModal } from '@/composables/useAuthModal'

const props = defineProps<{
  messages: RoomMessage[]
  currentUserId: string
  isGuest?: boolean
}>()

const { openModal } = useAuthModal()

const emit = defineEmits<{
  send: [content: string]
  close: []
}>()

const input = ref('')
const listEl = ref<HTMLElement | null>(null)

watch(
  () => props.messages.length,
  () => {
    nextTick(() => {
      if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight
    })
  },
)

function submit() {
  const text = input.value.trim()
  if (!text) return
  emit('send', text)
  input.value = ''
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
}
</script>

<template>
  <div class="flex flex-col h-full bg-[#1c2e10] border-l border-white/10">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3.5 border-b border-white/10 shrink-0">
      <div class="flex items-center gap-2">
        <svg class="h-4 w-4 text-[#a8c890]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span class="text-white text-sm font-semibold">Chat</span>
      </div>
      <button
        class="text-white/40 hover:text-white/70 transition-colors"
        @click="emit('close')"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Message list -->
    <div
      ref="listEl"
      class="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
    >
      <div v-if="messages.length === 0" class="flex items-center justify-center h-full">
        <p class="text-white/30 text-xs text-center">No messages yet.<br />Say something!</p>
      </div>

      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['flex gap-2.5', msg.user_id === currentUserId ? 'flex-row-reverse' : 'flex-row']"
      >
        <!-- Avatar -->
        <div class="shrink-0 mt-0.5">
          <img
            v-if="msg.avatar_url"
            :src="msg.avatar_url"
            :alt="msg.display_name"
            class="h-7 w-7 rounded-full object-cover"
          />
          <div
            v-else
            class="h-7 w-7 rounded-full bg-[#4a7a28] flex items-center justify-center text-white text-[10px] font-bold"
          >
            {{ initials(msg.display_name) }}
          </div>
        </div>

        <!-- Bubble -->
        <div :class="['max-w-[75%] flex flex-col', msg.user_id === currentUserId ? 'items-end' : 'items-start']">
          <div class="flex items-baseline gap-1.5 mb-0.5">
            <span
              v-if="msg.user_id !== currentUserId"
              class="text-[#a8c890] text-[10px] font-semibold truncate max-w-[120px]"
            >{{ msg.display_name }}</span>
            <span class="text-white/30 text-[9px]">{{ formatTime(msg.created_at) }}</span>
          </div>
          <div
            :class="[
              'px-3 py-2 rounded-2xl text-sm leading-relaxed break-words',
              msg.user_id === currentUserId
                ? 'bg-[#4a7a28] text-white rounded-tr-sm'
                : 'bg-white/10 text-white/90 rounded-tl-sm',
            ]"
          >
            {{ msg.content }}
          </div>
        </div>
      </div>
    </div>

    <!-- Guest: no-chat prompt -->
    <div v-if="isGuest" class="px-4 pb-4 pt-3 shrink-0 border-t border-white/10">
      <div class="bg-white/5 rounded-xl px-4 py-3 text-center">
        <p class="text-white/60 text-xs mb-2.5 leading-relaxed">You need an account to send messages.</p>
        <div class="flex gap-2">
          <button
            class="flex-1 bg-[#4a7a28] hover:bg-[#5a8a34] text-white text-xs font-semibold py-2 rounded-lg transition-colors"
            @click="openModal('signup')"
          >Sign up free</button>
          <button
            class="flex-1 border border-white/20 text-white/60 hover:text-white text-xs font-medium py-2 rounded-lg transition-colors"
            @click="openModal('login')"
          >Log in</button>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div v-else class="px-3 pb-3 pt-2 shrink-0 border-t border-white/10">
      <form class="flex items-center gap-2" @submit.prevent="submit">
        <input
          v-model="input"
          type="text"
          placeholder="Say something…"
          maxlength="500"
          class="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7a9a50] focus:ring-1 focus:ring-[#7a9a50] transition-colors"
        />
        <button
          type="submit"
          :disabled="!input.trim()"
          class="h-10 w-10 rounded-xl bg-[#4a7a28] hover:bg-[#5a8a34] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
        >
          <svg class="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>
