import { ref, shallowRef, computed, onUnmounted } from 'vue'
import {
  Room,
  RoomEvent,
  ParticipantEvent,
  type LocalParticipant,
  type RemoteParticipant,
} from 'livekit-client'
import { supabase } from '@/lib/supabase'

export type AnyParticipant = LocalParticipant | RemoteParticipant

export function useLiveKit() {
  const room = shallowRef<Room | null>(null)
  // Using a plain ref array. We replace it (trigger reactivity) on every
  // structural change; ParticipantTile handles intra-participant changes itself.
  const participants = ref<AnyParticipant[]>([])
  const isMicEnabled = ref(false)
  const isCameraEnabled = ref(false)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const error = ref<string | null>(null)

  const participantCount = computed(() => participants.value.length)

  // ── helpers ──────────────────────────────────────────────────────────────

  function snapshot() {
    if (!room.value) { participants.value = []; return }
    participants.value = [
      room.value.localParticipant,
      ...Array.from(room.value.remoteParticipants.values()),
    ]
  }

  async function fetchToken(workspaceId: string, identity: string, name: string) {
    const { data, error: fnErr } = await supabase.functions.invoke('livekit-token', {
      body: { roomName: `syncyard-${workspaceId}`, identity, name },
    })
    if (fnErr) throw fnErr
    if (!data?.token) throw new Error('No token returned')
    return data.token as string
  }

  // ── connect ───────────────────────────────────────────────────────────────

  async function connect(workspaceId: string, identity: string, displayName: string) {
    if (isConnected.value || isConnecting.value) return
    isConnecting.value = true
    error.value = null

    try {
      const token = await fetchToken(workspaceId, identity, displayName)
      const url = import.meta.env.VITE_LIVEKIT_URL
      if (!url) throw new Error('VITE_LIVEKIT_URL is not set')

      const r = new Room({ adaptiveStream: true, dynacast: true })

      r.on(RoomEvent.ParticipantConnected, snapshot)
      r.on(RoomEvent.ParticipantDisconnected, snapshot)
      r.on(RoomEvent.LocalTrackPublished, snapshot)
      r.on(RoomEvent.LocalTrackUnpublished, snapshot)
      r.on(RoomEvent.TrackSubscribed, snapshot)
      r.on(RoomEvent.TrackUnsubscribed, snapshot)
      r.on(RoomEvent.Disconnected, () => {
        isConnected.value = false
        participants.value = []
      })

      // Track mic/camera state from local participant events
      r.localParticipant.on(ParticipantEvent.TrackMuted, () => {
        isMicEnabled.value = !r.localParticipant.isMicrophoneEnabled
        isCameraEnabled.value = r.localParticipant.isCameraEnabled
      })
      r.localParticipant.on(ParticipantEvent.TrackUnmuted, () => {
        isMicEnabled.value = r.localParticipant.isMicrophoneEnabled
        isCameraEnabled.value = r.localParticipant.isCameraEnabled
      })

      await r.connect(url, token, { autoSubscribe: true })

      // Audio-first — enable mic, leave camera off by default
      await r.localParticipant.setMicrophoneEnabled(true)
      isMicEnabled.value = true

      room.value = r
      isConnected.value = true
      snapshot()
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : 'Failed to connect'
    } finally {
      isConnecting.value = false
    }
  }

  // ── controls ──────────────────────────────────────────────────────────────

  async function toggleMic() {
    if (!room.value) return
    const next = !isMicEnabled.value
    await room.value.localParticipant.setMicrophoneEnabled(next)
    isMicEnabled.value = next
  }

  async function toggleCamera() {
    if (!room.value) return
    const next = !isCameraEnabled.value
    await room.value.localParticipant.setCameraEnabled(next)
    isCameraEnabled.value = next
  }

  async function disconnect() {
    if (room.value) {
      await room.value.disconnect()
      room.value = null
    }
    isConnected.value = false
    participants.value = []
  }

  onUnmounted(disconnect)

  return {
    room,
    participants,
    participantCount,
    isMicEnabled,
    isCameraEnabled,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    toggleMic,
    toggleCamera,
  }
}
