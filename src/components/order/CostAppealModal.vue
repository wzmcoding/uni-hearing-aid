<script setup lang="ts">
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'

const emit = defineEmits(['confirm', 'cancel'])
const visible = ref(false)
function cancel() {
  visible.value = false
  emit('cancel')
}

function confirm() {
  visible.value = false
  emit('confirm')
}

function show() {
  visible.value = true
}

defineExpose({
  show,
})
</script>

<template>
  <div>
    <!-- 功能暂时不做 -->
    <TnPopup v-model="visible" open-direction="bottom" @close="cancel">
      <div class="px-2.5 pb-3 pt-6.5">
        <div class="text-sm">
          若您对本订单存在以下疑问，可进行对应的申诉申请，客服将在您发起申请后1-3天给您答复。
        </div>
        <button
          class="btn-primary mt-2 h-11 w-full text-3.5"
          @click="confirm"
        >
          完成
        </button>
      </div>
    </TnPopup>
  </div>
</template>

<style lang="scss" scoped>

</style>
