<script setup lang="ts">
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'
import dayjs from 'dayjs'
import debounce from 'debounce'
import type { OrderEntity } from '~/composables/api/order'

const props = defineProps<{
  loading: boolean
  isAgree: boolean
}>()

const emits = defineEmits(['agreement'])

const service = useService()
const ui = useUi()
const orderStore = useOrderStore()
const userStore = useUserStore()

const visible = ref(false)
const toPayModalRef = ref()

const orderId = ref<string | undefined>()

const debouncedSubmit = debounce(() => {
  submit()
}, 500, { immediate: true })

async function getPhoneNumber(e: any) {
  if (e.detail.code) {
    try {
      const res = await service.auth.bindPhone({ code: e.detail.code })
      userStore.update({ phone: res })
      debouncedSubmit()
    }
    catch (err: any) {
      ui.showToast('获取手机号失败')
    }
  }
  else {
    console.log('获取手机号失败', e)
    debouncedSubmit()
  }
}

async function submit() {
  if (orderStore.countWaitingPay) {
    toPayModalRef.value?.open()
    return
  }
  if (props.loading) {
    return
  }
  if (!orderStore.ready) {
    ui.showToast('请先完善寄件信息')
    return
  }
  if (!orderStore.pickupStartTime || !orderStore.pickupEndTime) {
    ui.showToast('请选择取件时间')
    return
  }
  if (!dayjs().isBefore(orderStore.pickupStartTime)) {
    ui.showToast('取件时间已过，请重新选择取件时间')
    return
  }
  if (!orderStore.transport) {
    ui.showToast('请选择快递产品')
    return
  }
  const { sender, receiver, cargoInfo } = orderStore
  if (!sender?.name || !utils.renderPhone(orderStore.sender) || !sender.address || !receiver?.name || !utils.renderPhone(orderStore.receiver) || !receiver.address) {
    ui.showToast('请先补全寄件人、收件人信息')
    return
  }
  if (!cargoInfo?.name) {
    ui.showToast('请先补全物品类型')
    return
  }
  if (!props.isAgree) {
    emits('agreement')
    // uni.showToast({
    //   title: '请先阅读并同意《飞驴速运寄件服务协议》',
    //   icon: 'none',
    // })
    return
  }
  ui.showLoading('订单创建中...')
  try {
    const res = await service.order.add({
      sender: orderStore.sender!,
      receiver: orderStore.receiver!,
      notes: orderStore.notes!,
      pickupStartTime: orderStore.pickupStartTime!,
      pickupEndTime: orderStore.pickupEndTime!,
      cargo: orderStore.cargoInfo!,
      transportId: orderStore.transport!.transportId,
      payer: orderStore.payer!,
    })
    orderId.value = res.id
    const info = await service.order.detail({ orderId: res.id })
    // 如果是跨越订单，需要确认信息
    if (orderStore.transport?.companyCode === 'KYE') {
      const confirmInfo = await service.order.confirmInfo({ orderId: res.id })
      if (confirmInfo.needConfirm) {
        ui.showConfirm({
          title: '入仓收费提醒',
          content: confirmInfo.confirmTips.replace('我司', '跨越'),
          confirm() {
            return new Promise<boolean>(async (resolve) => {
              try {
                const isConfirm = await service.order.confirm({ orderId: res.id })
                if (isConfirm) {
                  await readyPay(info)
                }
                resolve(true)
              }
              catch (e: any) {
                ui.showToast(e.message)
              }
            })
          },
        })
        return
      }
    }
    await readyPay(info)
  }
  finally {
    ui.hideLoading()
  }
}

async function readyPay(info: OrderEntity) {
  // 需要付款的订单进入付款流程
  if (PayStatus.PAYING === info.payStatus) {
    try {
      await orderStore.toPay(info)
      router.replace({ path: '/pages/order/paySuccess' })
      // 重置下单信息
      orderStore.reset()
    }
    catch (e: any) {
      ui.showToast(e.message)
    }
  }
  else {
    show()
    // 重置下单信息
    orderStore.reset()
  }
}

function show() {
  visible.value = true
}

function close() {
  visible.value = false
  router.replace({
    path: '/pages/order/detail',
    query: {
      id: orderId.value,
    },
  })
}

onMounted(async () => {
  if (orderStore.countWaitingPay) {
    orderStore.isPay = false
  }
})

defineExpose({
  submit,
})
</script>

<template>
  <ToPayModal ref="toPayModalRef" />
  <!-- #ifndef MP-WEIXIN -->
  <div class="relative h-full flex flex-col items-center justify-center rounded-full bg-accent px-6 py-1 text-sm text-accent-foreground">
    <template v-if="loading">
      <div>估价中</div>
    </template>
    <template v-else>
      <div>立即下单</div>
      <button class="open-btn" @click="debouncedSubmit" />
    </template>
  </div>
  <!-- #endif -->
  <!-- #ifdef MP-WEIXIN -->
  <div class="relative h-full flex flex-col items-center justify-center rounded-full bg-accent px-6 py-1 text-sm text-accent-foreground">
    <template v-if="loading">
      <div>估价中</div>
    </template>
    <template v-else>
      <div>立即下单</div>
      <button v-if="!userStore.info?.phone" class="open-btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber" />
      <button v-else class="open-btn" @click="debouncedSubmit" />
    </template>
  </div>
  <!-- #endif -->
  <TnPopup v-model="visible" open-direction="bottom" @close="close">
    <div class="relative h-[770rpx] w-full">
      <img class="h-full w-full" :src="`${WEB_PREFIX}/wx/tips.jpg`">
      <div class="absolute bottom-0 left-0 right-0 pb-4">
        <div class="flex items-center justify-center">
          <button class="w-40 btn p-3 text-4.5" @click="close">
            我知道了
          </button>
        </div>
      </div>
    </div>
  </TnPopup>
</template>

<style lang="scss" scoped>

</style>
