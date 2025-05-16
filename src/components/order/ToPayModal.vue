<script setup lang="ts">
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'

const orderStore = useOrderStore()

function handlePay() {
  router.push({
    path: '/pages/order/list',
    query: {
      type: OrderQueryType.PENDING_PAYMENT,
    },
  })
}
const visible = ref(false)
onMounted(async () => {
  await orderStore.queryOverView()
  if (orderStore.countWaitingPay) {
    setTimeout(() => {
      visible.value = true
    }, 500)
  }
})

function close() {
  visible.value = false
}

function open() {
  visible.value = true
}

defineExpose({ open })
</script>

<template>
  <TnPopup v-model="visible" width="95%" @close="close">
    <div class="pb-3 pt-3">
      <div class="mb-2 border-b border-b-[1px] border-secondary border-b-solid pb-3 text-center text-lg font-500">
        温馨提示
      </div>
      <div class="w-full flex items-center justify-center">
        <div v-if="orderStore.countWaitingPay" class="font-weight p-4 text-center text-lg">
          {{ orderStore.isPay ? `您有${orderStore.countWaitingPay}个待支付订单，为保障快递运输，请您及时支付。` : `您有${orderStore.countWaitingPay}个待支付订单，请先支付完成后再下单。` }}
        </div>
      </div>
      <div class="px-3">
        <button class="mt-2 h-11 w-full btn-accent text-4" @click="handlePay">
          前往支付
        </button>
      </div>
    </div>
  </TnPopup>
</template>
