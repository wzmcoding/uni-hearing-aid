<script setup lang="ts">
import TnActionSheet from '@tuniao/tnui-vue3-uniapp/components/action-sheet/src/action-sheet.vue'
import type { TnActionSheetInstance } from '@tuniao/tnui-vue3-uniapp'
import dayjs from 'dayjs/esm'
import { OrderStatus, SendStatus } from '~/composables/api/order'
import type { OrderEntity } from '~/composables/api/order'

const props = withDefaults(defineProps<{
  id?: string
}>(), {
})
const env = useEnvStore()
const service = useService()
const ui = useUi()
const orderStore = useOrderStore()
const payWayText = ref<any>({
  sender_cash_pay: '寄付现结',
  receiver_cash_pay: '到付现结',
  monthly_settlement: '月结',
})
const info = ref<OrderEntity | undefined>()
const stepList = ref([
  { id: 0, name: '下单成功' },
  { id: 1, name: '上门揽件' },
  // { id: 2, name: '确认支付' },
  { id: 3, name: '寄件成功' },
])
const orderStep = computed(() => {
  let id = 1
  let isEnd = false
  switch (info.value?.sendStatus) {
    case SendStatus.CREATE:
      // 创建完毕
      id = 0
      isEnd = true
      break
    case SendStatus.PICKUP:
      // 等待揽件
      id = 1
      isEnd = false
      break
    case SendStatus.PICKED_UP:
      // 揽件完成
      id = 1
      isEnd = true
      break
    case SendStatus.PAYING:
      // 待支付
      id = 2
      isEnd = false
      break
    case SendStatus.PAYED:
      // 已支付
      id = -9
      isEnd = false
      break
    case SendStatus.SEND_SUCCESS:
      // 寄件成功
      id = 3
      isEnd = true
      break
  }
  if (info.value?.orderStatus === OrderStatus.CANCEL) {
    id = -1
    isEnd = false
  }
  if (info.value?.orderStatus === OrderStatus.SIGNED) {
    id = 4
  }
  return {
    id,
    isEnd,
  }
})

const helpList = ref([
  { id: 0, name: '如何收费?' },
  { id: 1, name: '能否更换快递公司?' },
  { id: 4, name: '如何取消寄件?' },
  { id: 3, name: '上门取货时效?' },
])

const showMore = ref(false)

const moreOperationEl = ref<TnActionSheetInstance>()
const priceDetailEl = ref()
const costAppealEl = ref()
const cancelOrderEl = ref()

function checkShowMore() {
  showMore.value = !showMore.value
}

function copy(copyText: string | undefined) {
  if (!copyText) {
    return
  }
  uni.setClipboardData({
    data: copyText,
    success() {
      uni.showToast({
        title: '复制成功',
        icon: 'none',
      })
    },
  })
}

function moreOperation() {
  moreOperationEl.value?.show({
    actions: [
      { text: '取消订单', value: '1' },
    ],
    cancel: () => {
      console.log('取消按钮被点击')
      return true
    },
    select: (index: number, value?: string | number) => {
      console.log('选项被点击', index, value)
      if (index === 0) {
        openCancelOrder()
      }
      return true
    },
  })
}

function cancelOrder() {
  router.push({
    path: '/pages/order/cancel',
    query: {
      id: props.id,
    },
  })
}

function openCancelOrder() {
  cancelOrderEl.value.show({
    title: '真的要取消订单吗?',
    content: '遇到了问题? 联系客服帮您解决～',
    cancelText: '狠心取消',
    confirmText: '联系客服',
  })
  // router.push({
  //   path: '/pages/order/cancel',
  //   query: {
  //     id: props.id,
  //   },
  // })
  // 左边是确认取消按钮 右边是取消
  // uni.showModal({
  //   title: '亲，确认要取消吗?',
  //   content: `本单已为您节省2元快递费`,
  //   cancelText: '确认取消',
  //   confirmText: '再等等',
  //   success: (res) => {
  //     if (res.confirm) {
  //       console.log('用户点击取消')
  //     }
  //     if (res.cancel) {
  //       router.push({
  //         path: `/pages/order/cancel?id=${props.id}`,
  //       })
  //     }
  //   },
  // })
}

function openOrderState() {
  router.push({
    path: '/pages/order/state',
    query: {
      id: props.id,
    },
  })
}

function openPriceDetail() {
  priceDetailEl.value.show(info.value)
}

function openCostAppeal() {
  // 暂时不做 ---目前跳转客服连链接
  // costAppealEl.value.show()
}

function makePhoneCall(mobile: string | undefined) {
  if (!mobile) {
    return
  }
  uni.makePhoneCall({
    phoneNumber: mobile,
  })
}

function openShare() {
  router.push({
    path: '/pages/share/order',
    query: {
      id: props.id,
    },
  })
}

function openHelp(id: number) {
  router.push(`${WEB_PREFIX}/help?id=${id}&t=${new Date().getTime()}`)
}

const addressRefresh = useRefresh('refresh:order-cancel')
addressRefresh.onRefresh(async (params) => {
  if (params) {
    // 重新刷新
    refresh()
    if (params.callback) {
      params.callback()
      params.callback = undefined // 只需要最先接收者执行一次，否则可能冲突
    }
  }
})

async function refresh() {
  if (props.id) {
    ui.showLoading('加载中...')
    try {
      info.value = await service.order.detail({ orderId: props.id })
    }
    catch (err: any) {
      ui.showError(err?.message, () => {
        refresh()
      })
      return
    }
    finally {
      ui.hideLoading()
      showLoading()
    }
  }
  else {
    ui.showError('页面参数不正确')
  }
}

onShow(() => {
  refresh()
})
function showLoading() {
  if (!info.value) {
    return
  }
  if (PayStatus.PAY_SUCCESS === info.value?.payStatus) {
    if (OrderStatus.CREATE === info.value?.orderStatus) {
      ui.showLoading('快递公司接单中...')
    }
    else if (OrderStatus.ACCEPT === info.value?.orderStatus) {
      ui.hideLoading()
    }
  }
}
async function handlePay() {
  try {
    await orderStore.toPay(info.value!)
    ui.showToast('支付成功')
    router.push({ path: '/pages/order/paySuccess' })
  }
  catch (e: any) {
    ui.showToast(e.message)
  }
}

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
  <MlPage>
    <div class="h-[100vh] overflow-y-auto bg-muted">
      <!-- 步骤条 -->
      <div class="flex items-center justify-around gap-10 py-4">
        <div v-for="(item, i) in stepList" :key="i" class="relative flex items-center">
          <div class="flex flex-col items-center gap-1">
            <div
              :class="orderStep.id >= item.id || (orderStep.id === item.id - 1 && orderStep.isEnd) ? 'bg-primary' : 'bg-primary/50'"
              class="h-6 w-6 flex items-center justify-center rounded-full bg-primary/50"
            >
              <div
                :class="[
                  { 'i-icon-park-outline-check-one color-background': (orderStep.id === item.id && orderStep.isEnd) || orderStep.id > item.id },
                  { 'i-icon-park-outline-more color-background': (!orderStep.isEnd && orderStep.id === item.id) || (orderStep.id + 1 === item.id && orderStep.isEnd) },
                  { 'i-icon-park-outline-more color-primary': item.id > orderStep.id + 1 || (item.id === orderStep.id + 1 && !orderStep.isEnd) },
                ]"
              />
            </div>
            <div class="text-xs">
              {{ item.name }}
            </div>
          </div>
          <div
            v-if="i + 1 < stepList.length" class="absolute right-3 top-3 h-[2px] w-28 translate-x-full bg-primary/50"
            :class="orderStep.id >= item.id ? 'gradient' : null"
          />
        </div>
      </div>
      <div class="px-3">
        <div class="rounded-2.5 bg-muted-foreground/20">
          <!-- 快递单号 -->
          <div v-if="info?.waybillCode" class="flex items-center gap-1 px-3 py-1 text-sm">
            <div>快递单号: </div>
            <div>{{ info?.waybillCode }}</div>
            <div @click="copy(info?.waybillCode)">
              复制
            </div>
          </div>
          <!-- 运单号/揽件信息/揽件人 -->
          <div v-if="orderStep.id >= 1" class="px-3.5">
            <!-- 快递员已分配显示 -->
            <!-- 分配快递员后显示 -->
            <!-- 物流信息 -->
            <div v-if="info?.tracks?.length" class="flex items-center gap-1 text-sm">
              <div class="flex-1 truncate">
                {{ info?.tracks?.length ? `${info?.tracks[0].trackDesc}` : '' }}
              </div>
              <div class="color-primary" @click="openOrderState">
                查看更多
              </div>
            </div>
            <!-- 揽件人信息 -->
            <!-- <div class="flex items-center gap-1 text-sm">
              <div>揽收人:</div>
              <div>{{ info?.pickupCourierName }}({{ info?.pickupCourierMobile }})</div>
              <div class="color-primary" @click="openOrderState">
                查看更多
              </div>
            </div> -->
          </div>
          <!-- 提示信息/操作信息 -->
          <div class="rounded-2.5 bg-background px-4 pb-2.5 pt-3.5">
            <!-- 支付完成，快递公司接单中 -->
            <div v-if="PayStatus.PAY_SUCCESS === info?.payStatus && OrderStatus.CREATE === info?.orderStatus">
              <div class="text-sm font-semibold">
                支付完成，正在通知快递公司接单！
              </div>
            </div>
            <!-- 下单成功 -->
            <div v-if="orderStep.id === 0">
              <div class="font-500">
                下单成功，正在为您分派快递员!
              </div>
              <div v-if="'KYE' === info?.company?.code" class="mt-3 bg-accent/10 px-2 py-1 text-sm color-accent">
                寄件须知：跨越将在预约的上门取件时间前一小时分配快递员，请您耐心等待，超时请联系客服~
              </div>
              <div v-else class="mt-3 bg-accent/10 px-2 py-1 text-sm color-accent">
                寄件须知：预计5分钟内分派快递员，超时请联系客服~
              </div>
            </div>
            <!-- 待揽件 -->
            <div v-if="orderStep.id === 1 && !orderStep.isEnd && OrderStatus.CREATE !== info?.orderStatus">
              <div class="font-500">
                快递员正在上门取件，请保持电话畅通！
              </div>
              <div class="mt-3 bg-accent/10 px-2 py-1.5 text-sm color-accent">
                寄件须知：如果快递员未及时上门，请及时联系快递员！
              </div>
              <div class="flex items-center gap-2 bg-muted px-2 py-1.5">
                <img class="h-10 w-10 rounded-full" :src="info?.company?.logo" alt="">
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <div class="text-sm">
                      {{ info?.company?.name }}-{{ info?.pickupCourierName }}
                    </div>
                    <div
                      v-if="info?.pickupCourierMobile" class="flex items-center gap-1"
                      @click="makePhoneCall(info?.pickupCourierMobile)"
                    >
                      <div class="i-icon-park-outline-phone-telephone" />
                      <div class="text-xs">
                        拨打电话
                      </div>
                    </div>
                  </div>
                  <div class="text-xs">
                    {{ info?.company?.name }}官方快递员上门取件
                  </div>
                </div>
              </div>
            </div>
            <!-- 已取件 -->
            <div v-if="orderStep.id === 1 && orderStep.isEnd">
              <div class="font-500">
                快递员已取件，稍后推送账单!
              </div>
              <div class="mt-3 bg-accent/10 px-2 py-1.5 text-sm color-accent">
                寄件须知：请及时留意微信消息通知!
              </div>
            </div>
            <!-- 运输中 -->
            <div v-if="orderStep.id === 3">
              <div v-if="info?.expectArrivalTime" class="font-500">
                快递已发出，预计{{ dayjs(info?.expectArrivalTime).format('MM月DD日') }}送达!
              </div>
              <div v-else class="font-500">
                快递已发出
              </div>
              <div class="mt-3 bg-accent/10 px-2 py-1.5 text-sm color-accent">
                寄件提示：签收时包裹如有破损，请拆封保留视频!
              </div>
            </div>
            <!-- 已签收 -->
            <div v-if="orderStep.id === 4">
              <div class="font-500">
                快递已签收！感谢您的使用!
              </div>
              <div class="mt-3 bg-accent/10 px-2 py-1.5 text-sm color-accent">
                寄件提示：签收时包裹如有破损，请拆封保留视频!
              </div>
            </div>
            <!-- 已取消 -->
            <div v-if="orderStep.id === -1">
              <div class="font-500">
                您的订单已取消，请重新下单!
              </div>
              <div class="my-3 bg-accent/10 px-2 py-1.5 text-sm color-accent">
                取消原因: {{ info?.cancelReason }}
              </div>
              <div v-if="'SXJD' === info?.company?.code" class="py-1.5 text-sm">
                温馨提示：已揽件的快递超时未支付，可能会收取揽件费，如遇问题请联系客服
              </div>
            </div>
            <!-- 操作 -->
            <div v-if="orderStep.id >= 0" class="mt-9 flex flex-wrap justify-end gap-2.5">
              <!-- @click="moreOperation" 打开更多 -->
              <button
                v-if="orderStep.id < 2 || (orderStep.id === 2 && orderStep.isEnd)"
                class="m-0 h-6.5 btn-outline px-2.5 py-1.5 text-3.5" @click="openCancelOrder"
              >
                取消订单
              </button>
              <div class="relative m-0 h-6.5 btn-outline px-2.5 text-3.5">
                在线客服
                <CustomerServiceButton :behavior="{ paramA: '订单详情-顶部按钮', paramB: info?.orderNo, paramC: info?.orderStatus }" />
              </div>
              <div
                v-if="info?.supplierPhone || info?.company?.customerServicePhone" class="relative m-0 h-6.5 btn-outline px-2.5 text-3.5"
                @click="makePhoneCall(info?.supplierPhone || info?.company?.customerServicePhone)"
              >
                {{ info?.company?.customerServiceName || '电话客服' }}
              </div>
              <!-- <button class="m-0 px-2 py-1 text-3.5 btn-outline">
                再下一单
              </button> -->
              <button
                v-if="env.platform !== AppPlatform.H5" :class="orderStep.id === 0 ? 'btn-outline' : 'btn-accent'"
                class="m-0 h-6.5 px-2.5 py-1.5 text-3.5" @click="openShare"
              >
                通知收件人
              </button>
            </div>
          </div>
        </div>
        <!-- 已签收-未支付/快递员信息 -->
        <div v-if="orderStep.id === 1 && orderStep.isEnd" class="mt-2.5 rounded-2.5 bg-background">
          <div class="flex items-center gap-2 px-2 py-3">
            <img class="h-10 w-10 rounded-full" :src="info?.company?.logo" alt="">
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div class="text-sm">
                  {{ info?.company?.name }}-{{ info?.pickupCourierName }}
                </div>
                <div v-if="info?.pickupCourierMobile" class="flex items-center gap-1">
                  <div class="i-icon-park-outline-phone-telephone" />
                  <div class="text-xs" @click="makePhoneCall(info?.pickupCourierMobile)">
                    拨打电话
                  </div>
                </div>
              </div>
              <div class="text-xs">
                {{ info?.company?.name }}官方快递员上门取件
              </div>
            </div>
          </div>
        </div>
        <!-- 寄件信息 -->
        <div class="mt-2.5 rounded-2.5 bg-background">
          <!-- 费用明细 -->
          <div class="flex items-center justify-between px-4 pb-3 pt-4">
            <div class="flex items-center gap-1.5">
              <div class="font-500">
                费用
              </div>
              <div class="color-accent font-500">
                ¥{{ info?.salePrice ? utils.renderPrice(info?.salePrice) : utils.renderPrice(info?.estimatePrice) }}元
              </div>
              <div class="flex items-center text-xs color-muted-foreground" @click="openPriceDetail">
                <div>详情</div>
                <div class="i-icon-park-outline-right" />
              </div>
            </div>
            <!-- <button
              class="m-0 border-muted-foreground px-2 py-1 text-3 color-muted-foreground btn-outline"
              @click="openCostAppeal"
            >
              费用申诉
            </button> -->
          </div>
          <!-- 节省明细/暂时隐藏 -->
          <div v-if="false" class="border-b-[1px] border-secondary border-b-solid px-4 pb-3">
            <div class="w-max flex gap-1 border border-accent rounded-full border-solid pr-2">
              <div class="h-5 w-5 flex items-center justify-center rounded-full bg-accent text-xs color-background">
                省
              </div>
              <div class="w-auto color-accent">
                较其他平台为您省¥2.5
              </div>
            </div>
          </div>
          <!-- 邮寄概括 -->
          <div class="flex justify-center gap-10 border-b-[1px] border-secondary border-b-solid py-5">
            <div class="flex flex-col items-center">
              <div>
                <!-- {{ info?.sender.city }} -->
                {{ utils.renderOverflow(info?.sender.city) }}
              </div>
              <div class="">
                <!-- {{ info?.sender.name && info?.sender.name.length > 3 ? `${info.sender.name.substring(0, 3)}...`
                  : info?.sender.name }} -->
                {{ utils.renderOverflow(info?.sender.name) }}
              </div>
            </div>
            <div class="">
              <div class="mt-1 flex items-center justify-center">
                <div class="gradient-line-left-bg h-[1px] w-12" />
                <div class="i-carbon-send" />
                <div class="gradient-line-right-bg h-[1px] w-12" />
              </div>
              <div v-if="info?.expectArrivalTime" class="text-center text-xs color-muted-foreground">
                预计{{ dayjs(info?.expectArrivalTime).format('MM月DD日') }}到达
              </div>
            </div>
            <div class="flex flex-col items-center">
              <div>
                <!-- {{ info?.receiver.city }} -->
                {{ utils.renderOverflow(info?.receiver.city) }}
              </div>
              <div class="">
                <!-- {{ info?.receiver.name && info?.receiver.name.length > 3 ? `${info.receiver.name.substring(0, 3)}...`
                  : info?.receiver.name }} -->
                {{ utils.renderOverflow(info?.receiver.name) }}
              </div>
            </div>
          </div>
          <!-- 邮寄明细 -->
          <div class="flex flex-col gap-1.5 border-b-[1px] border-secondary border-b-solid px-4 py-2">
            <div class="flex text-xs">
              <div class="w-16">
                寄件人:
              </div>
              <div class="flex-1">
                {{ info?.sender.name }} {{ utils.renderPhone(info?.sender, true) }}
              </div>
            </div>
            <div class="flex text-xs">
              <div class="w-16">
                寄件地址:
              </div>
              <div class="flex-1">
                {{ info?.sender.address }}
              </div>
            </div>
            <div class="flex text-xs">
              <div class="w-16">
                收件人:
              </div>
              <div class="flex-1">
                {{ info?.receiver.name }} {{ utils.renderPhone(info?.receiver, true) }}
              </div>
            </div>
            <div class="flex text-xs">
              <div class="w-16">
                收件地址:
              </div>
              <div class="flex-1">
                {{ info?.receiver.address }}
              </div>
            </div>
            <div class="flex text-xs">
              <div class="w-16">
                预约时间:
              </div>
              <div class="flex-1">
                {{ info?.pickupStartTime }} - {{ info?.pickupEndTime }}
              </div>
            </div>
            <template v-if="showMore">
              <div class="flex text-xs">
                <div class="w-16">
                  物品信息:
                </div>
                <div class="flex-1">
                  <!-- 日用品/1kg -->
                  {{ info?.cargo.name ? `${info?.cargo.name}/` : '' }}
                  {{ info?.cargo.weight ? `${math.div(info?.cargo.weight, 1000)}kg` : '' }}
                </div>
              </div>
              <div class="flex text-xs">
                <div class="w-16">
                  产品类型:
                </div>
                <div class="flex-1">
                  {{ info?.product?.name }}
                </div>
              </div>
              <!-- 电子存银/隐藏 -->
              <div v-if="false" class="flex text-xs">
                <div class="w-16">
                  电子存银:
                </div>
                <div class="flex-1 color-primary">
                  去查看>>>
                </div>
              </div>
            </template>
          </div>
          <!-- 展开/关闭 -->
          <div class="py-3 text-center" @click="checkShowMore">
            {{
              showMore ? '关闭' : '展开' }}
          </div>
        </div>
        <!-- #ifdef MP-WEIXIN || H5 -->
        <div class="mt-2.5 overflow-hidden card rounded-2.5">
          <OfficialAccount />
        </div>
        <!-- #endif -->
        <!-- 联系客服 -->
        <div class="mt-2.5 rounded-2.5 bg-background">
          <div class="border-b-[1px] border-secondary border-b-solid px-4 pb-4 pt-2.5 font-500">
            遇到问题?
          </div>
          <div
            v-for="(item, i) in helpList" :key="i"
            class="flex items-center justify-between border-b-[1px] border-secondary border-b-solid px-4 py-3"
            @click="openHelp(item.id)"
          >
            <div class="text-xs">
              {{ item.name }}
            </div>
            <div class="i-icon-park-outline-right" />
          </div>
          <!-- <div class="flex items-center justify-between border-b-[1px] border-secondary border-b-solid px-4 py-3">
            <div class="text-xs">
              能否更换取件快递员?
            </div>
            <div class="i-icon-park-outline-right" />
          </div>
          <div class="flex items-center justify-between border-b-[1px] border-secondary border-b-solid px-4 py-3">
            <div class="text-xs">
              寄件人如何取消订单?
            </div>
            <div class="i-icon-park-outline-right" />
          </div>
          <div class="flex items-center justify-between border-b-[1px] border-secondary border-b-solid px-4 py-3">
            <div class="text-xs">
              更改取件时间?
            </div>
            <div class="i-icon-park-outline-right" />
          </div> -->
          <div
            class="relative border-b-[1px] border-secondary border-b-solid px-4 pb-3 pt-4 text-center color-primary font-500"
          >
            联系客服
            <CustomerServiceButton :behavior="{ paramA: '订单详情-遇到问题', paramB: info?.orderNo, paramC: info?.orderStatus }" />
          </div>
        </div>
        <!-- 支付方式 -->
        <div class="mt-2.5 flex items-center justify-between rounded-2.5 bg-background px-3.5 py-4">
          <div>支付方式</div>
          <div v-if="PayWay.MONTHLY_SETTLEMENT === info?.payWay">
            微信支付
          </div>
          <div v-else>
            {{ info?.payWay ? payWayText[info?.payWay] : null }}
          </div>
        </div>
        <!-- 订单编号/来源/创建时间 -->
        <div
          class="my-2.5 rounded-2.5 bg-background"
          :class="{ 'mb-35': PayStatus.PAYING === info?.payStatus || PayStatus.SUPPLEMENTARY_FREIGHT_PAYING === info?.payStatus || PayStatus.THIRD_PARTY_PAYING === info?.payStatus }"
        >
          <div class="flex items-center justify-between border-b-[1px] border-secondary border-b-solid px-4 py-3">
            <div>
              订单编号
            </div>
            <div class="flex items-center gap-1">
              <div>{{ info?.orderNo }}</div>
              <div @click="copy(info?.orderNo)">
                复制
              </div>
            </div>
          </div>
          <div class="flex items-center justify-between border-b-[1px] border-secondary border-b-solid px-4 py-3">
            <div>
              订单来源
            </div>
            <div>
              {{ AppType[info?.app?.appType] }}
            </div>
          </div>
          <div class="flex items-center justify-between px-4 py-3">
            <div>
              创建时间
            </div>
            <div>
              {{ info?.createTime }}
            </div>
          </div>
        </div>
        <div
          v-if="PayStatus.PAYING === info?.payStatus || PayStatus.SUPPLEMENTARY_FREIGHT_PAYING === info?.payStatus || PayStatus.THIRD_PARTY_PAYING === info?.payStatus"
          class="fixed-bottom-container"
        >
          <div class="bg-background">
            <template v-if="'SXJD' === info?.company?.code || PayStatus.THIRD_PARTY_PAYING === info?.payStatus">
              <div class="flex items-center gap-1.5 bg-accent/10 p-2 text-xs color-accent">
                该订单仅支持在快递公司官方小程序内支付，如遇问题请联系客服
              </div>
              <button class="mt-2 h-11 w-full btn-accent text-4" @click="toPay(info?.thirdPartyPayInfo as string)">
                前往支付
              </button>
            </template>
            <button v-else class="mt-2 h-11 w-full btn-accent text-4" @click="handlePay">
              立即支付 ￥{{ utils.renderPrice(info?.paymentFlow?.amount) }}元
            </button>
          </div>
        </div>
      </div>
      <!-- 更多操作 -->
      <TnActionSheet ref="moreOperationEl" />
      <!-- 价格明细 -->
      <PriceDetailModal ref="priceDetailEl" />
      <!-- 费用申诉 -->
      <CostAppealModal ref="costAppealEl" />
      <!-- 取消订单 -->
      <MLMessageBox ref="cancelOrderEl" @cancel="cancelOrder">
        <template #confirm>
          <div class="relative">
            在线客服
            <CustomerServiceButton :behavior="{ paramA: '订单详情-取消订单', paramB: info?.orderNo, paramC: info?.orderStatus }" />
          </div>
        </template>
      </MLMessageBox>
    </div>
  </MlPage>
</template>

<style lang="scss" scoped>
.gradient {
  background: linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--background)) 100%);
}
</style>

<route lang="yaml">
style:
  navigationBarTitleText: "订单详情"
</route>
