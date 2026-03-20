<script setup lang="ts">
defineProps<{
  label?: string
  placeholder?: string
  error?: string
  modelValue?: string
  rows?: number
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">{{ label }}</label>
    <textarea
      :placeholder="placeholder"
      :value="modelValue"
      :rows="rows ?? 4"
      class="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm
             text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
             focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" class="text-xs text-red-500 dark:text-red-400">{{ error }}</p>
  </div>
</template>
