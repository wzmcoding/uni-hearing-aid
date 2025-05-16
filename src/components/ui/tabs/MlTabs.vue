<script lang="ts" setup>
const props = defineProps<{
  tabs: string[]
}>()
const emit = defineEmits(['change'])
const modelValue = defineModel<string | number>({
})

function onClickTabItem(index: number) {
  modelValue.value = index
  emit('change', index)
}
</script>

<template>
  <view class="h-full flex items-center">
    <view
      v-for="(item, index) in tabs"
      :key="index"
      class="flex flex-1 flex-col items-center text-center transition-colors"
      :class="{ active: index === modelValue }"
      @click="onClickTabItem(index)"
    >
      <slot name="item" :item="item">
        <view class="">
          {{ item }}
        </view>
      </slot>
      <view class="bar" />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.active {
  @apply text-primary font-bold;

  .bar {
    @apply opacity-100;
  }
}
.bar {
  @apply h-1 bg-primary rounded-full w-10 mt-1 opacity-0;
}
</style>
