<script setup lang="ts">
const props = defineProps<{
  options: string[][]
  modelValue: number[]
}>()

const emit = defineEmits(['update:modelValue'])

function bindChange(e: { detail: { value: number[] } }) {
  emit('update:modelValue', e.detail.value)
}
</script>

<template>
  <picker-view
    class="h-[30vh]"
    :value="modelValue"
    :immediate-change="true"
    @change="bindChange"
  >
    <picker-view-column v-for="(subOptions, index) in props.options" :key="index">
      <view v-for="(option, i) in subOptions" :key="option" class="flex items-center justify-center">
        <slot name="default" :option="option" :index="i">
          {{ option }}
        </slot>
      </view>
    </picker-view-column>
  </picker-view>
</template>

<style lang="scss" scoped>

</style>
