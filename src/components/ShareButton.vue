<script lang="ts" setup>
defineProps<{
  params: any
}>()
function onShare(e: any) {
  console.log('onContact', e)
}
</script>

<template>
  <!-- #ifdef H5 -->
  <button class="open-btn" @click="onShare" />
  <!-- #endif -->
  <!-- #ifndef H5 -->
  <button class="open-btn" open-type="share" :data-params="params" />
  <!-- #endif -->
</template>

<style lang="scss" scoped>

</style>
