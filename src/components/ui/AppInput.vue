<script setup lang="ts">
defineProps<{
  label?: string
  placeholder?: string
  type?: string
  error?: string
  modelValue?: string
  required?: boolean
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-sm font-medium text-zinc-700 dark:text-zinc-300">
      {{ label }}
      <span v-if="required" class="text-violet-500 ml-0.5">*</span>
    </label>
    <input
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :value="modelValue"
      :required="required"
      class="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm
             text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500
             focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-xs text-red-500 dark:text-red-400">{{ error }}</p>
  </div>
</template>
