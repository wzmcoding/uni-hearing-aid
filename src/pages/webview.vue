<script setup lang="ts">
const { url } = defineProps<{ url: string }>()
</script>

<template>
  <web-view :src="decodeURIComponent(url)" />
</template>
