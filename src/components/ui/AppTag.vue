<script setup lang="ts">
defineProps<{
  label: string
  selected?: boolean
  removable?: boolean
}>()

defineEmits<{ click: []; remove: [] }>()
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150',
      selected
        ? 'bg-violet-600 text-white'
        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-200',
    ]"
    @click="$emit('click')"
  >
    {{ label }}
    <span
      v-if="removable"
      class="ml-0.5 text-current opacity-60 hover:opacity-100 cursor-pointer"
      @click.stop="$emit('remove')"
    >
      ×
    </span>
  </button>
</template>
