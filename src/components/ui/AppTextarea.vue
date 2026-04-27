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
    <label v-if="label" class="text-sm font-medium text-earth-700 dark:text-earth-200">{{ label }}</label>
    <textarea
      :placeholder="placeholder"
      :value="modelValue"
      :rows="rows ?? 4"
      class="w-full bg-earth-50 dark:bg-earth-900 border border-earth-300 dark:border-earth-600 rounded-lg px-3 py-2 text-sm
             text-earth-900 dark:text-earth-100 placeholder-earth-400 dark:placeholder-earth-500
             focus:outline-none focus:border-sage-500 focus:ring-1 focus:ring-sage-500 transition-colors resize-none"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" class="text-xs text-red-500 dark:text-red-400">{{ error }}</p>
  </div>
</template>
