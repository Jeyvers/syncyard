<script setup lang="ts">
import AppTag from '@/components/ui/AppTag.vue'

const props = defineProps<{ selectedTags: string[]; availableTags: string[] }>()
const emit = defineEmits<{ 'update:selectedTags': [tags: string[]] }>()

function toggle(tag: string) {
  const current = [...props.selectedTags]
  const idx = current.indexOf(tag)
  if (idx === -1) current.push(tag)
  else current.splice(idx, 1)
  emit('update:selectedTags', current)
}
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <AppTag
      v-for="tag in availableTags"
      :key="tag"
      :label="tag"
      :selected="selectedTags.includes(tag)"
      @click="toggle(tag)"
    />
  </div>
</template>
