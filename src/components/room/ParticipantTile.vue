<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, onUnmounted } from 'vue'
import {
  ParticipantEvent,
  Track,
  type LocalParticipant,
  type RemoteParticipant,
  type LocalVideoTrack,
  type RemoteVideoTrack,
} from 'livekit-client'

const props = defineProps<{
  participant: LocalParticipant | RemoteParticipant
  isLocal?: boolean
}>()

type AnyVideoTrack = LocalVideoTrack | RemoteVideoTrack

const videoEl = ref<HTMLVideoElement | null>(null)
const videoTrack = shallowRef<AnyVideoTrack | null>(null)
const isSpeaking = ref(false)
const isMuted = ref(false)

// Find the camera track on the participant
function getCameraTrack(): AnyVideoTrack | null {
  for (const pub of props.participant.trackPublications.values()) {
    if (
      pub.kind === Track.Kind.Video &&
      pub.source === Track.Source.Camera &&
      pub.track &&
      !pub.isMuted
    ) {
      return pub.track as AnyVideoTrack
    }
  }
  return null
}

function refreshTrack() {
  videoTrack.value = getCameraTrack()
  isMuted.value = !props.participant.isMicrophoneEnabled
}

// Attach/detach video track to the DOM element
watch([videoTrack, videoEl], ([track, el], [oldTrack]) => {
  if (oldTrack && el) oldTrack.detach(el)
  if (track && el) track.attach(el)
}, { immediate: true })

onMounted(() => {
  refreshTrack()
  props.participant.on(ParticipantEvent.TrackSubscribed, refreshTrack)
  props.participant.on(ParticipantEvent.TrackUnsubscribed, refreshTrack)
  props.participant.on(ParticipantEvent.LocalTrackPublished, refreshTrack)
  props.participant.on(ParticipantEvent.LocalTrackUnpublished, refreshTrack)
  props.participant.on(ParticipantEvent.TrackMuted, refreshTrack)
  props.participant.on(ParticipantEvent.TrackUnmuted, refreshTrack)
  props.participant.on(ParticipantEvent.IsSpeakingChanged, (speaking: boolean) => {
    isSpeaking.value = speaking
  })
})

onUnmounted(() => {
  if (videoTrack.value && videoEl.value) videoTrack.value.detach(videoEl.value)
  props.participant.off(ParticipantEvent.TrackSubscribed, refreshTrack)
  props.participant.off(ParticipantEvent.TrackUnsubscribed, refreshTrack)
  props.participant.off(ParticipantEvent.LocalTrackPublished, refreshTrack)
  props.participant.off(ParticipantEvent.LocalTrackUnpublished, refreshTrack)
  props.participant.off(ParticipantEvent.TrackMuted, refreshTrack)
  props.participant.off(ParticipantEvent.TrackUnmuted, refreshTrack)
})

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
}
</script>

<template>
  <div
    :class="[
      'relative rounded-2xl overflow-hidden bg-[#0d1a08] border transition-all duration-200 min-h-[160px] md:min-h-0 md:aspect-video',
      isSpeaking ? 'border-green-400/70 shadow-[0_0_0_2px_rgba(74,222,128,0.35)]' : 'border-white/10',
    ]"
  >
    <!-- Video (shown when camera is on) -->
    <video
      v-show="videoTrack"
      ref="videoEl"
      autoplay
      playsinline
      :muted="isLocal"
      :class="['absolute inset-0 w-full h-full object-cover', isLocal ? 'scale-x-[-1]' : '']"
    />

    <!-- Avatar fallback (camera off) -->
    <div
      v-if="!videoTrack"
      class="absolute inset-0 w-full h-full min-h-[140px] flex items-center justify-center bg-[#1c2e10]"
    >
      <div class="h-14 w-14 rounded-full bg-[#4a7a28] flex items-center justify-center text-white font-bold text-xl">
        {{ initials(participant.name ?? participant.identity) }}
      </div>
    </div>

    <!-- Name + mic badge -->
    <div class="absolute bottom-0 inset-x-0 px-3 py-2 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-between">
      <span class="text-white text-xs font-semibold truncate">
        {{ participant.name ?? participant.identity }}
        <span v-if="isLocal" class="text-white/50 font-normal"> (you)</span>
      </span>
      <!-- Mic muted indicator -->
      <svg
        v-if="isMuted"
        class="h-3.5 w-3.5 text-red-400 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      </svg>
    </div>

    <!-- Speaking pulse ring -->
    <div
      v-if="isSpeaking"
      class="absolute inset-0 rounded-2xl border-2 border-green-400/60 pointer-events-none animate-pulse"
    />
  </div>
</template>
