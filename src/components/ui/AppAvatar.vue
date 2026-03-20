<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}>()

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const sizeClasses = computed(() => ({
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
}[props.size ?? 'md']))
</script>

<template>
  <div
    :class="[
      'rounded-full shrink-0 overflow-hidden flex items-center justify-center font-semibold',
      sizeClasses,
      !src ? 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-200' : '',
    ]"
  >
    <img v-if="src" :src="src" :alt="name" class="w-full h-full object-cover" />
    <span v-else>{{ initials }}</span>
  </div>
</template>
