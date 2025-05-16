<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits(['cancel', 'confirm'])
const visible = ref(false)
const title = ref('提示')
const content = ref('这是一条消息提示')
const cancelText = ref('取消')
const confirmText = ref('确定')

function show(options: any) {
  const {
    title: _title,
    content: _content,
    cancelText: _cancelText,
    confirmText: _confirmText,
  } = options
  title.value = _title || title.value
  content.value = _content || content.value
  cancelText.value = _cancelText || cancelText.value
  confirmText.value = _confirmText || confirmText.value
  visible.value = true
}

function close() {
  visible.value = false
}

function cancel() {
  visible.value = false
  emit('cancel')
}

function confirm() {
  visible.value = false
  emit('confirm')
}

defineExpose({
  show,
})
</script>

<template>
  <div v-if="visible" class="fixed left-0 top-0 h-100vh w-100vw flex flex-col items-center justify-center bg-muted-foreground/80">
    <div class="relative w-[70%] rounded-2.5 bg-background px-3 pb-4 pt-5">
      <div class="i-carbon-close absolute right-3 top-5 cursor-pointer text-xl" @click="close" />
      <div class="text-center text-4 font-bold">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <div class="mt-6 w-full text-center text-3.5">
        <slot name="content">
          {{ content }}
        </slot>
      </div>
      <div class="mt-6 flex justify-center gap-5">
        <div class="btn-outline border-muted-foreground px-3 py-1.5 text-3 text-muted-foreground" @click="cancel">
          <slot name="cancel">
            {{ cancelText }}
          </slot>
        </div>
        <div class="btn px-3 py-1.5 text-3" @click="confirm">
          <slot name="confirm">
            {{ confirmText }}
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
