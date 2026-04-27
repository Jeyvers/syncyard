<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/lib/supabase'
import type { Message } from '@/types'
import ChatMessage from './ChatMessage.vue'
import AppButton from '@/components/ui/AppButton.vue'
import type { RealtimeChannel } from '@supabase/supabase-js'

const props = defineProps<{ workspaceId: string }>()
const auth = useAuthStore()

const messages = ref<Message[]>([])
const newMessage = ref('')
const sending = ref(false)
const scrollRef = ref<HTMLDivElement | null>(null)
let channel: RealtimeChannel | null = null

async function loadMessages() {
  const { data } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, avatar_url, username)')
    .eq('workspace_id', props.workspaceId)
    .order('created_at', { ascending: true })
  messages.value = (data ?? []) as Message[]
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  })
}

async function sendMessage() {
  const content = newMessage.value.trim()
  if (!content || !auth.user) return
  sending.value = true
  newMessage.value = ''
  await supabase.from('messages').insert({
    workspace_id: props.workspaceId,
    sender_id: auth.user.id,
    content,
  })
  sending.value = false
}

onMounted(async () => {
  await loadMessages()

  channel = supabase
    .channel(`workspace:${props.workspaceId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `workspace_id=eq.${props.workspaceId}` },
      async (payload) => {
        const { data: sender } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, username')
          .eq('id', payload.new.sender_id)
          .single()
        messages.value.push({ ...payload.new, sender } as Message)
        scrollToBottom()
      },
    )
    .subscribe()
})

onUnmounted(() => channel?.unsubscribe())
watch(messages, scrollToBottom)
</script>

<template>
  <div class="flex flex-col h-full">
    <div ref="scrollRef" class="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
      <div v-if="!messages.length" class="flex items-center justify-center h-full">
        <p class="text-earth-400 dark:text-earth-600 text-sm">No messages yet. Say hi!</p>
      </div>
      <ChatMessage v-for="msg in messages" :key="msg.id" :message="msg" />
    </div>

    <div class="border-t border-earth-200 dark:border-earth-700 p-4">
      <form class="flex gap-2" @submit.prevent="sendMessage">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message…"
          class="flex-1 bg-earth-100 dark:bg-earth-900 border border-earth-200 dark:border-earth-700 rounded-xl px-4 py-2.5
                 text-sm text-earth-900 dark:text-earth-100 placeholder-earth-400 dark:placeholder-earth-500
                 focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 transition-colors"
          @keydown.enter.exact.prevent="sendMessage"
        />
        <AppButton type="submit" :loading="sending" :disabled="!newMessage.trim()">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </AppButton>
      </form>
    </div>
  </div>
</template>
