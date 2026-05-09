import { ref, onUnmounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth'
import type { RoomMessage } from '@/types/index'

export function useRoomChat(roomId: string) {
  const messages = ref<RoomMessage[]>([])
  const unreadCount = ref(0)
  const auth = useAuthStore()

  async function loadMessages() {
    const { data } = await supabase
      .from('room_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(100)

    if (data) messages.value = data as RoomMessage[]
  }

  const channel = supabase
    .channel(`room-chat-${roomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'room_messages',
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        const msg = payload.new as RoomMessage
        // Avoid duplicates if our own insert echoes back before optimistic update
        if (!messages.value.find((m) => m.id === msg.id)) {
          messages.value = [...messages.value, msg]
        }
        if (msg.user_id !== auth.user?.id) {
          unreadCount.value += 1
        }
      },
    )
    .subscribe()

  loadMessages()

  async function sendMessage(content: string) {
    if (!content.trim() || !auth.user) return
    const profile = auth.profile
    await supabase.from('room_messages').insert({
      room_id: roomId,
      user_id: auth.user.id,
      display_name:
        profile?.full_name || auth.user.user_metadata?.full_name || 'Anonymous',
      avatar_url: profile?.avatar_url ?? null,
      content: content.trim(),
    })
  }

  function clearUnread() {
    unreadCount.value = 0
  }

  onUnmounted(() => {
    supabase.removeChannel(channel)
  })

  return { messages, unreadCount, sendMessage, clearUnread }
}
