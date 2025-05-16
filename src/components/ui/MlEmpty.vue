<script lang="ts" setup>
const props = defineProps({
  text: {
    type: String,
    default: '暂无记录',
  },
})
</script>

<template>
  <view class="w-full flex flex-col items-center justify-center py-20">
    <slot>
      <image class="h-45 w-45" src="/static/empty/box.png" />
      <view class="mt-4 text-8 text-muted-foreground">
        {{ text }}
      </view>
    </slot>
  </view>
</template>

<style lang="scss" scoped>

</style>
