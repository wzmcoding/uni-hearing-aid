<script lang="ts" setup>
import { aliScene, aliTntInstId, openCustomerServiceChat } from '~/utils/customer-service'

const props = defineProps({
  behavior: {
    type: Object,
    required: true,
  },
})

const service = useService()

async function onContact(e: any) {
  try {
    await service.report.userBehavior(props.behavior)
  }
  catch (err) {
    console.log(err)
  }
}

async function customerServiceChatHandle() {
  try {
    await service.report.userBehavior(props.behavior)
  }
  finally {
    openCustomerServiceChat()
  }
}
</script>

<template>
  <!-- #ifdef MP-TOUTIAO -->
  <button class="open-btn" open-type="contact" @contact="onContact" />
  <!-- #endif -->
  <!-- #ifdef H5 || MP-WEIXIN -->
  <button class="open-btn" @click="customerServiceChatHandle" />
  <!-- #endif -->
  <!-- #ifdef MP-ALIPAY -->
  <div class="ali-contact" @click="onContact">
    <contact-button :tnt-inst-id="aliTntInstId" :scene="aliScene" />
  </div>
  <!-- #endif -->
</template>

<style lang="scss" scoped>

</style>

<style lang="scss">
// #ifdef MP-ALIPAY
.ali-contact contact-button{
  @apply absolute w-full h-full opacity-0 left-0 right-0 top-0 bottom-0;
}
// #endif
</style>
