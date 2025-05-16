<script setup lang="ts">
withDefaults(defineProps<{
  text: string
  loading: boolean
  fullscreen: boolean
}>(), {
})
</script>

<template>
  <view class="ml-mask-wrapper">
    <view
      class="ml-mask pointer-events-none absolute inset-0 z-9999 bg-background/60 opacity-0"
      :class="[
        {
          'is-fullscreen': fullscreen,
          'is-show': loading,
        },
      ]"
    >
      <view v-show="loading" class="absolute inset-0 flex flex-col items-center justify-center">
        <view class="relative h-[100rpx] w-[100rpx]">
          <image class="h-full w-full" src="/static/loading.svg" />
          <image class="absolute left-1/2 top-1/2 h-full w-full scale-4/5 transform -translate-x-1/2 -translate-y-1/2" src="/static/logo.png" />
        </view>
        <text v-if="text" class="mt-4 text-3 text-primary">
          {{ text }}
        </text>
      </view>
    </view>

    <slot />
  </view>
</template>

<style scoped lang="scss">
.is-fullscreen {
  @apply fixed;
}
.is-show {
  @apply opacity-100 pointer-events-auto;
}
</style>
