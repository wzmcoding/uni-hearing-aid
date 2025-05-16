<script setup lang="ts">
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'
import TnInput from '@tuniao/tnui-vue3-uniapp/components/input/src/input.vue'

const emit = defineEmits(['confirm'])
const visible = ref<boolean>(false)
const isActive = ref<boolean>(false)
const price = ref('')

function activePrice() {}
function cancel() {
  visible.value = false
}

function confirm() {
  if (!isActive.value) {
    uni.showModal({
      title: '请先阅读并同意保价协议?',
      cancelText: '取消',
      confirmText: '确定',
      // success: (res) => {
      //   if (res.confirm) {
      //     isActive.value = true
      //     confirm()
      //   }
      // },
    })
    return
  }
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
  <div class="my-2 flex items-center gap-1" @click="show">
    <div class="text-4 text-secondary-foreground">
      保价
    </div>
    <div class="flex-1" />
    <div class="flex items-center gap-1 text-4 text-muted-foreground">
      <div class="text-foreground font-bold">
        请输入保价金额
      </div>
      <div i-icon-park-outline-right />
    </div>
  </div>
  <TnPopup v-model="visible" open-direction="bottom" @close="cancel">
    <div class="px-5 pb-3 pt-4.5">
      <div class="mb-8 text-4 font-500">
        保价
      </div>
      <div class="flex flex-col gap-2.5">
        <MLListItem>
          <template #label>
            <div class="text-3 font-500">
              保价金额
            </div>
          </template>
          <template #value>
            <div class="h-5 w-30 bg-secondary">
              <TnInput
                v-model="price" height="100%" class="flex-1 py-1 text-3 text-muted-foreground placeholder:text-3 placeholder:text-muted-foreground"
                placeholder="最高保价10000元" :border="false" clearable @clear="activePrice" @confirm="activePrice"
              />
            </div>
          </template>
        </MLListItem>
        <MLListItem>
          <template #label>
            <div class="text-3 font-500">
              保费
            </div>
          </template>
          <template #value>
            <div class="text-3 text-accent">
              0元
            </div>
          </template>
        </MLListItem>
        <MLListItem>
          <template #title>
            <div class="flex items-center gap-1 text-3.5">
              <div
                class="text-4"
                :class="isActive ? 'i-carbon-checkbox-checked-filled bg-primary' : 'i-carbon-checkbox bg-muted-foreground'"
                @click="isActive = !isActive"
              />
              <div>我已阅读并同意</div>
              <div class="color-primary">
                《保价协议》
              </div>
            </div>
          </template>
        </MLListItem>
      </div>
      <div class="mt-5">
        <button class="w-full py-3 text-4 btn-accent" @click="confirm">
          确定
        </button>
      </div>
    </div>
  </TnPopup>
</template>

<style lang="scss" scoped>

</style>
