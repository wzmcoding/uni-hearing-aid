<script setup lang="ts">
import dayjs from 'dayjs/esm'
import TnBadge from '@tuniao/tnui-vue3-uniapp/components/badge/src/badge.vue'
import { commonShare } from '~/utils/share'
import type { ExpressCompanyEntity } from '~/composables/api/app'
import { OrderQueryType } from '~/composables/api/order'
import type { OrderEntity, OrderQueryDto } from '~/composables/api/order'

const orderStore = useOrderStore()
const service = useService()
const ui = useUi()
const orderQuery = ref<OrderQueryDto>({
  queryType: OrderQueryType.ALL,
  size: 2,
})
const orderList = ref<OrderEntity[]>([])
interface MenuItem {
  label: string
  content: string
  icon: string
  id: string | number
}
const btnList = ref<MenuItem[]>([
  {
    label: '联系客服',
    content: '帮你解决问题',
    icon: '/static/index/customer.png',
    id: 'cs',
  },
  {
    label: '查违禁',
    content: '哪些是违禁品',
    icon: '/static/index/search.png',
    id: 'search',
  },
  {
    label: '帮助中心',
    content: '查看常见问题',
    icon: '/static/index/help.png',
    id: 'help',
  },
  {
    label: '费用补缴',
    content: '补交寄件费用',
    icon: '/static/index/price.png',
    id: 'pay',
  },
])

const OrderStatusText = ref<any>({
  CREATE: '已创建',
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

function onClickMenu(item: MenuItem) {
  if (item.id === 'pay') {
    router.push({
      path: '/pages/order/list',
      query: {
        type: OrderQueryType.PENDING_PAYMENT,
      },
    })
  }
  else if (item.id === 'help') {
    router.push(`${WEB_PREFIX}/help?t=${new Date().getTime()}`)
  }
  else if (item.id === 'search') {
    router.push(`${WEB_PREFIX}/wx/prohibitedDirectory.html`)
  }
}

// 打开全部订单
function openOrderList() {
  router.push({
    path: '/pages/order/list',
  })
}
// 查看物流详情
function openOrderState(item: OrderEntity) {
  console.log(item)
  router.push({
    path: '/pages/order/state',
    query: {
      id: item.id,
    },
  })
}

const companyList = ref<ExpressCompanyEntity[]>([])
async function queryAppInfo() {
  const res = await service.app.companyList()
  companyList.value = res.slice(0, 4)
}

async function queryRecentlyOrder() {
  const res = await service.order.list(orderQuery.value)
  orderList.value = res
}

function goSend(type: number) {
  router.push({
    path: '/pages/send',
    query: {
      type,
    },
  })
}

onReady(() => {
  queryAppInfo()
  queryRecentlyOrder()
  orderStore.isPay = true
})

onShareAppMessage((res: Page.ShareAppMessageOption) => {
  return commonShare()
})
</script>

<template>
  <MlPage>
    <!-- 待补缴费用 -->
    <ToPayModal />
    <div class="relative z-0">
      <div class="gradient-page-top-bg absolute left-0 right-0 top-0 z--1 h-80 p-2" />
      <div class="p-3" @click="router.push('order/list')">
        <div class="flex items-center justify-center card px-4 py-2">
          <!-- <input class="flex-1" type="text" placeholder="输入要查询的单号"> -->
          <div class="flex-1 color-muted-foreground">
            输入要查询的单号
          </div>
          <button class="h-7 rounded-2 bg-primary px-2 py-1 text-sm text-primary-foreground">
            查快递
          </button>
        </div>
      </div>
      <div class="p-3">
        <div class="grid grid-cols-2 gap-2.5 card rounded-b-none p-2.5">
          <div
            class="relative z-0 rounded-lg bg-primary px-4 py-4 text-primary-foreground"
            @click="goSend(1)"
          >
            <image class="absolute inset-0 z--1 h-full w-full" src="/static/index/bg_bulky.jpg" mode="aspectFill" />
            <div class="flex items-center gap-1 text-5.5">
              寄大件
              <div i-icon-park-outline-right-c />
            </div>
            <div class="mt-3 text-3">
              物流重货 上门取件
            </div>
            <div class="mt-3 flex-inline flex-row-reverse items-center">
              <image v-for="(item, index) in companyList" :key="index" :src="item.companyLogo" class="logo-item" />
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <div class="relative z-0 flex-1 rounded-lg bg-[#E5F7FF] p-3" @click="goSend(0)">
              <image class="absolute inset-0 z--1 h-full w-full" src="/static/index/bg_package.jpg" mode="aspectFill" />
              <div class="flex items-center gap-1 text-4.5">
                寄快递
                <div i-icon-park-outline-right-c />
              </div>
              <div class="mt-2 text-3 text-muted-foreground">
                3元起 快至1小时上门
              </div>
            </div>
            <div class="relative z-0 flex-1 rounded-lg bg-[#EFE1FF] p-3" @click="utils.handleBatteryCar()">
              <image class="absolute inset-0 z--1 h-full w-full" src="/static/index/bg_battery.png" mode="aspectFill" />
              <div class="flex items-center gap-1 text-4.5">
                电瓶车托运
                <div i-icon-park-outline-right-c />
              </div>
              <div class="mt-2 text-3 text-muted-foreground">
                不拆电瓶 整车托运
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-4 card rounded-t-none pb-2.5">
          <div
            v-for="(item, i) in btnList" :key="i" class="relative flex flex-col items-center gap-1"
            @click="onClickMenu(item)"
          >
            <image class="h-7.5 w-7.5" :src="item.icon" />
            <TnBadge v-if="item.id === 'pay'" absolute-center absolute :custom-style="{ right: '-18px', top: '2px' }" :value="orderStore.countWaitingPay" type="danger" />
            <div class="text-3 color-secondary-foreground">
              {{ item.label }}
            </div>
            <CustomerServiceButton v-if="item.id === 'cs'" :behavior="{ paramA: '首页宫格' }" />
          </div>
        </div>
      </div>
      <!-- 订单列表 -->
      <div class="p-3">
        <div class="flex justify-between">
          <div class="font-500">
            最近物流信息
          </div>
          <div class="text-sm color-primary" @click="openOrderList">
            寄件订单
          </div>
        </div>
        <div v-if="orderList.length" class="mt-3.5 flex flex-col gap-2.5">
          <div
            v-for="(item, i) in orderList" :key="i" class="rounded-2.5 bg-background pb-4"
            @click="openOrderState(item)"
          >
            <div
              class="flex items-center gap-3 border-b-[1px] border-destructive-foreground border-b-solid px-3 py-2 text-xs"
            >
              <img class="h-8 w-8 rounded-full" :src="item?.company?.logo" alt="">
              <div class="color-muted-foreground">
                {{ item?.company?.name }}
              </div>
              <div class="flex-1 color-muted-foreground">
                {{ item?.waybillCode }}
              </div>
              <div class="h-4 w-4 flex items-center justify-center bg-muted-foreground color-background">
                寄
              </div>
              <div class="color-muted-foreground">
                {{ utils.renderFormatDate(item?.createTime) }}
              </div>
            </div>
            <div class="flex justify-center gap-10 py-3">
              <div class="flex flex-col items-center">
                <div class="color-muted-foreground">
                  <!-- {{ item?.sender.city }} -->
                  {{ utils.renderOverflow(item?.sender.city) }}
                </div>
                <div>
                  <!-- {{ item.sender.name && item.sender.name.length > 3 ? `${item.sender.name.substring(0, 3)}...`
                    : item.sender.name }} -->
                  {{ utils.renderOverflow(item?.sender.name) }}
                </div>
              </div>
              <div class="">
                <div class="mt-1 flex items-center justify-center">
                  <div class="gradient-line-left-bg h-[1px] w-12" />
                  <div class="i-carbon-send" />
                  <div class="gradient-line-right-bg h-[1px] w-12" />
                </div>
                <div v-if="item?.expectArrivalTime && (item?.orderStatus === 'DISPATCHING' || item?.orderStatus === 'TRANSPORTING' || item?.orderStatus === 'PICKED_UP' || item?.orderStatus === 'PICKUP' || item?.orderStatus === 'CREATE')" class="text-center text-xs">
                  预计{{ dayjs(item?.expectArrivalTime).format('MM月DD日') }}到达
                </div>
                <div v-else class="text-center text-xs">
                  {{ OrderStatusText[item.orderStatus] }}
                </div>
              </div>
              <div class="flex flex-col items-center">
                <div class="color-muted-foreground">
                  <!-- {{ item?.receiver.city }} -->
                  {{ utils.renderOverflow(item?.receiver.city) }}
                </div>
                <div>
                  <!-- {{ item.receiver.name && item.receiver.name.length > 3 ? `${item.receiver.name.substring(0, 3)}...`
                    : item.receiver.name }} -->
                  {{ utils.renderOverflow(item?.receiver.name) }}
                </div>
              </div>
            </div>
            <div class="mt-2 flex items-center gap-2.5 px-4 text-xs">
              <div v-if="item?.tracks?.length">
                {{ OrderStatusText[item.orderStatus] }}
              </div>
              <div class="flex-1 truncate color-muted-foreground">
                {{ item?.tracks?.length ? `${item?.tracks[0].trackDesc}` : '' }}
              </div>
            </div>
          </div>
          <div class="mt-3 flex items-center justify-center gap-1 text-xs color-primary" @click="openOrderList">
            <div>查看更多</div>
            <div i-carbon-chevron-down />
          </div>
        </div>
        <div v-else>
          <MlEmpty>
            <image class="h-35 w-35" src="/static/empty/list.png" />
            <div class="mt-4 text-3.5 text-muted-foreground">
              暂无物流信息
            </div>
            <button class="mt-4 btn px-12 py-3 text-4" @click="router.push('/pages/send')">
              去寄件
            </button>
          </MlEmpty>
        </div>
      </div>
    </div>
  </MlPage>
</template>

<style lang="scss">
.app {
  @apply bg-muted;
   //background: linear-gradient(to bottom, hsl(var(--primary-foreground)), hsl(var(--muted)));
}
</style>

<style lang="scss" scoped>
.logo-item {
  @apply h-5 w-5 rounded-full;

  & + .logo-item {
    @apply mr--1;
  }
}
</style>

<route lang="yaml">
layout: tab
</route>
