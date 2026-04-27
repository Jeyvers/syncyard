<script setup lang="ts">
import type { Message } from '@/types'
import { useAuthStore } from '@/stores/auth'
import AppAvatar from '@/components/ui/AppAvatar.vue'

const props = defineProps<{ message: Message }>()
const auth = useAuthStore()

const isOwn = props.message.sender_id === auth.user?.id
</script>

<template>
  <div :class="['flex gap-2.5', isOwn ? 'flex-row-reverse' : 'flex-row']">
    <AppAvatar :src="message.sender?.avatar_url" :name="message.sender?.full_name" size="sm" class="shrink-0 mt-0.5" />
    <div :class="['max-w-xs lg:max-w-md flex flex-col gap-1', isOwn ? 'items-end' : 'items-start']">
      <p :class="['text-xs text-earth-400', isOwn ? 'text-right' : '']">
        {{ message.sender?.full_name }}
      </p>
      <div
        :class="[
          'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed',
          isOwn
            ? 'bg-sage-600 text-earth-50 rounded-tr-sm'
            : 'bg-earth-200 dark:bg-earth-800 text-earth-900 dark:text-earth-100 rounded-tl-sm',
        ]"
      >
        {{ message.content }}
      </div>
      <p class="text-xs text-earth-400 dark:text-earth-600">
        {{ new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
      </p>
    </div>
  </div>
</template>
