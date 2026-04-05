<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-500 focus-visible:ring-offset-2',
      'focus-visible:ring-offset-zinc-100 dark:focus-visible:ring-offset-zinc-900',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      {
        'bg-olive-600 hover:bg-olive-500 text-white': !variant || variant === 'primary',
        'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600':
          variant === 'ghost',
        'bg-red-600 hover:bg-red-500 text-white': variant === 'danger',
        'px-3 py-1.5 text-xs': size === 'sm',
        'px-4 py-2 text-sm': !size || size === 'md',
        'px-6 py-3 text-base': size === 'lg',
      },
    ]"
  >
    <svg
      v-if="loading"
      class="animate-spin h-4 w-4 shrink-0"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
    <slot />
  </button>
</template>
