<script setup lang="ts">
const props = defineProps({
  label: String,
  value: String,
  title: String,
})
</script>

<template>
  <div class="flex flex-col">
    <slot name="title">
      <div class="text-sm color-muted-foreground">
        {{ props.title }}
      </div>
    </slot>
    <div class="flex justify-between">
      <slot name="label">
        <div class="text-sm color-muted-foreground">
          {{ props.label }}
        </div>
      </slot>
      <slot name="value">
        <div class="text-sm">
          {{ props.value }}
        </div>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
