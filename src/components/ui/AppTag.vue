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
        ? 'bg-sage-600 text-earth-50'
        : 'bg-earth-200 dark:bg-earth-800 text-earth-600 dark:text-earth-300 hover:bg-earth-300 dark:hover:bg-earth-700 hover:text-earth-900 dark:hover:text-earth-100',
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
