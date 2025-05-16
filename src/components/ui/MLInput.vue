<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TnInput from '@tuniao/tnui-vue3-uniapp/components/input/src/input.vue'
import { inputEmits, inputProps } from '@tuniao/tnui-vue3-uniapp/components/input/src/input'

const props = defineProps(inputProps)
const emits = defineEmits(inputEmits)

const inputText = ref<string>(String(utils.withDefault(props.modelValue, '')))

onMounted(() => {
  // #ifdef MP-TOUTIAO
  inputText.value = props.modelValue ? String(props.modelValue) : ' '
  setTimeout(() => {
    if (inputText.value === ' ') {
      inputText.value = ''
    }
  }, 100)
  // #endif
})

function input(val: any) {
  emits('input', val)
}
function change(val: any) {
  emits('change', val)
}
function focus(val: any) {
  emits('focus', val)
}
function blur(val: any) {
  emits('blur', val)
}
function confirm(val: any) {
  emits('confirm', val)
}
function clear() {
  emits('clear')
}

watch(() => inputText.value, (val) => {
  emits('update:modelValue', val)
})
watch(() => props.modelValue, (val) => {
  inputText.value = String(utils.withDefault(val, ''))
})
</script>

<template>
  <TnInput v-bind="$props" v-model="inputText" @input="input" @change="change" @blur="blur" @focus="focus" @confirm="confirm" @clear="clear">
    <template #prefix>
      <slot name="prefix" />
    </template>
    <template #suffix>
      <slot name="suffix" />
    </template>
  </TnInput>
</template>

<style lang="scss" scoped>

</style>
