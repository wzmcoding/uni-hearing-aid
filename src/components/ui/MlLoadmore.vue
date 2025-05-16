<script lang="ts" setup>
const props = defineProps({
  finished: {
    type: Boolean,
    default: false,
  },
  loadMoreText: {
    type: String,
    default: '加载中...',
  },
  noMoreText: {
    type: String,
    default: '没有更多数据了!',
  },
})
</script>

<template>
  <view class="py-1 text-center">
    {{ !finished ? loadMoreText : noMoreText }}
  </view>
</template>

<style lang="scss" scoped></style>
