<script setup lang="ts">
import type { OrderEntity } from '~/composables/api/order'
import { OrderStatus } from '~/composables/api/order'

const props = defineProps<{
  item: OrderEntity
}>()

const emit = defineEmits(['openDetail'])

const orderStore = useOrderStore()
const ui = useUi()
const OrderStatusText = ref<any>({
  CREATE: '已创建',
  ACCEPT: '已接单',
  PICKUP: '待揽收',
  PICKED_UP: '已揽件',
  TRANSPORTING: '运输中',
  DISPATCHING: '派件中',
  SIGNED: '已签收',
  CANCEL: '已取消',
  PROBLEM: '问题件',
  REJECT: '拒签',
  GOBACK: '已退回',
})

function openShare() {
  router.push({
    path: '/pages/share/order',
    query: {
      id: props.item.id,
    },
  })
}

function openDetail() {
  emit('openDetail', props.item)
}
// 补缴
async function handlePay() {
  try {
    await orderStore.toPay(props.item)
    ui.showToast('支付成功')
    router.push({ path: '/pages/order/paySuccess' })
  }
  catch (e: any) {
    ui.showToast(e.message)
  }
}

/**
 * 顺心捷达支付
 * @param data
 */
async function toPay(data: string) {
  try {
    await orderStore.pay(data)
  }
  catch (e: any) {
    ui.showToast(e.message)
  }
}
</script>

<template>
  <div class="mt-2.5 rounded-2.5 bg-background" @click="openDetail">
    <div class="flex items-center gap-2 px-2.5 py-2">
      <img class="h-8 w-8 rounded-full" :src="item.company?.logo" alt="">
      <div class="flex-1 truncate">
        {{ item.company?.name }}
      </div>
      <div class="text-xs">
        {{ utils.renderFormatDate(item.createTime) }}
      </div>
    </div>
    <div class="flex justify-center gap-10">
      <div class="text-center">
        <div>
          {{ utils.renderOverflow(item.sender.city) }}
        </div>
        <div class="mt-3">
          {{ utils.renderOverflow(item.sender.name) }}
        </div>
      </div>
      <div class="mt-2">
        <div class="text-xs color-primary">
          {{ item.waybillCode }}
        </div>
        <div class="mt-1 flex items-center justify-center">
          <div class="gradient-line-left-bg h-[1px] w-12" />
          <div class="i-carbon-send" />
          <div class="gradient-line-right-bg h-[1px] w-12" />
        </div>
        <div class="text-center text-xs color-primary">
          <!-- {{ item.logisticsStatus }} -->
          {{ OrderStatusText[item.orderStatus] }}
        </div>
      </div>
      <div class="text-center">
        <div>{{ utils.renderOverflow(item.receiver.city) }}</div>
        <div class="mt-3">
          {{ utils.renderOverflow(item.receiver.name) }}
        </div>
      </div>
    </div>
    <div v-if="PayStatus.PAYING === item.payStatus || PayStatus.SUPPLEMENTARY_FREIGHT_PAYING === item.payStatus || PayStatus.THIRD_PARTY_PAYING === item?.payStatus" class="px-2.5 pt-5 text-right">
      <div>
        <span class="mr-4">待支付 <span class="color-accent">￥{{ utils.renderPrice(item?.paymentFlow?.amount) }}元</span></span>
        <button v-if="'SXJD' === item.company?.code || PayStatus.THIRD_PARTY_PAYING === item?.payStatus" class="h-6 w-21 btn-accent rounded text-3.5" @click.stop="toPay(item?.thirdPartyPayInfo)">
          去支付
        </button>
        <button v-else class="h-6 w-21 btn-accent rounded text-3.5" @click.stop="handlePay">
          去支付
        </button>
      </div>
    </div>
    <div class="mt-2.5 flex items-center justify-between px-2.5 pb-3">
      <!-- 进行中/已完成-未取消 -->
      <!-- <div
        v-if="item.sendStatus !== SendStatus.PAYING && item.orderStatus !== OrderStatus.CANCEL "
        class="text-sm color-muted-foreground"
      >
        {{ item.salePrice ? `¥${utils.renderPrice(item.salePrice)}` : '' }}
      </div> -->
      <div class="flex flex-1 justify-end gap-2.5">
        <!-- 未取消 -->
        <!-- <div
          v-if="item.orderStatus !== OrderStatus.CANCEL"
          class="h-6 flex items-center border border-primary rounded-1 border-solid px-2 color-primary"
        >
          费用申诉
        </div> -->
        <!-- #ifndef H5 -->
        <div
          v-if="item.orderStatus !== OrderStatus.CANCEL"
          class="h-6 w-21 flex items-center justify-center border border-primary rounded-1 border-solid px-2 color-primary"
          @click.stop="openShare"
        >
          分享单号
        </div>
        <!-- #endif -->
        <!-- <div
          class="h-6 flex items-center border border-primary rounded-1 border-solid px-2 color-primary"
          @click="router.push('/pages/send')"
        >
          再下一单
        </div> -->
        <!-- 待支付 -->
        <!-- <div
          v-if="item.sendStatus === SendStatus.PAYING"
          class="h-6 flex items-center rounded-1 bg-accent px-2 color-background" @click.stop="openPay"
        >
          支付{{ utils.renderPrice(item.salePrice) }}元
        </div> -->
        <!-- 完成-取消 -->
        <div
          v-if="item.orderStatus === OrderStatus.SIGNED || item.orderStatus === OrderStatus.CANCEL"
          class="h-6 w-21 flex items-center justify-center border border-primary rounded-1 border-solid px-2 color-primary"
          @click.stop="router.push('/pages/send')"
        >
          重新下单
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
