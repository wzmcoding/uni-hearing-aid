<script setup lang="ts">
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'

const emits = defineEmits(['submit'])
const modelValue = defineModel<boolean>({
})
const content = ref('')
const visible = ref(false)
const isSubmit = ref(false)
function cancel() {
  visible.value = false
}
function show(submit = false) {
  visible.value = true
  isSubmit.value = submit
}
async function confirm() {
  visible.value = false
  modelValue.value = true
  await nextTick()
  if (isSubmit.value) {
    emits('submit')
  }
}
// #ifdef MP-TOUTIAO || MP-WEIXIN || MP-ALIPAY
onMounted(async () => {
  const res = await uni.request({
    url: `${WEB_PREFIX}/wx/agreement.html`,
  })
  content.value = res.data as string
})
// #endif

defineExpose({
  show,
})
</script>

<template>
  <div class="flex items-center py-2 text-sm text-secondary-foreground" @click="modelValue = !modelValue">
    <div class="mr-1 text-primary" :class="modelValue ? 'i-carbon-checkbox-checked' : 'i-carbon-checkbox'" />
    <div>我已阅读并同意</div>
    <div class="text-primary" @click.stop="show()">
      《飞驴速运寄件服务协议》
    </div>
  </div>
  <TnPopup v-model="visible" open-direction="bottom" @close="cancel">
    <div class="p-3">
      <scroll-view :scroll-y="true" class="h-[70vh]">
        <!-- #ifdef H5 -->
        <iframe :src="`${WEB_PREFIX}/wx/agreement.html`" class="h-full w-full border-0" />
        <!-- #endif -->
        <!-- #ifndef H5 -->
        <mp-html :content="content" />
        <!-- #endif -->
      </scroll-view>
      <div class="mt-5">
        <button class="w-full btn-accent py-3 text-4" @click="confirm">
          {{ isSubmit ? '同意本协议并下单' : '同意' }}
        </button>
      </div>
    </div>
  </TnPopup>
</template>

<style lang="scss" scoped>

</style>
