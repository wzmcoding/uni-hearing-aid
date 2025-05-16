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
    label: '助听器',
    content: '帮你解决问题',
    icon: '/static/index/hearing-aid.png',
    id: 'cs',
  },
  {
    label: '配件专区',
    content: '哪些是违禁品',
    icon: '/static/index/accessories-zone.png',
    id: 'search',
  },
  {
    label: '试用申请',
    content: '查看常见问题',
    icon: '/static/index/trial-application.png',
    id: 'help',
  },
  {
    label: '更多分类',
    content: '补交寄件费用',
    icon: '/static/index/category.png',
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
    <div class="relative z-0 bg-background pb-[100px]">
      <div class="z-1 h-10 w-full bg-[#DBBC84]" />
      <div class="relative h-10 bg-[#DBBC84]">
        <image src="/static/index/logo.png" class="ml-4 h-5 w-26" alt="" />
      </div>
      <div class="h-13.5 bg-[#DBBC84]">
        <div class="mx-3 flex items-center justify-center card rounded-md px-4 py-2">
          <div class="h-5 flex flex-1 items-center justify-start gap-2 color-muted-foreground">
            <div i-carbon-search />
            <div>搜索商品</div>
          </div>
        </div>
      </div>
      <div>
        <image src="/static/index/banner.png" class="h-143 w-full object-contain" alt="" />
      </div>
      <div class="p-3">
        <div class="grid grid-cols-4 rounded-t-none pb-2.5">
          <div v-for="(item, i) in btnList" :key="i" class="relative flex flex-col items-center gap-1" @click="onClickMenu(item)">
            <image class="h-7.5 w-7.5" :src="item.icon" />
            <div class="text-3.5 font-normal">
              {{ item.label }}
            </div>
          </div>
        </div>
      </div>
      <div class="grid grid-cols-2 mx-3 mb-4 gap-3">
        <div class="h-35 rounded-md from-[#FDF2E2] to-[#FFFFFF] bg-gradient-to-b p-3">
          <div class="text-base font-semibold">热销爆款</div>
          <div class="mt-3 flex items-center justify-between gap-2">
            <div class="flex flex-col items-center gap-0.5">
              <image src="/static/index/hot-goods.png" class="h-16 w-16" />
              <div class="font-base text-primary font-semibold">￥3150</div>
            </div>
            <div class="flex flex-col items-center gap-0.5">
              <image src="/static/index/hot-goods.png" class="h-16 w-16" />
              <div class="font-base text-primary font-semibold">￥3150</div>
            </div>
          </div>
        </div>
        <div class="h-35 rounded-md from-[#E8F7FE] to-[#FFFFFF] bg-gradient-to-b p-3">
          <div class="text-base font-semibold">新品推荐</div>
          <div class="mt-3 flex items-center justify-between gap-2">
            <div class="flex flex-col items-center gap-0.5">
              <image src="/static/index/hot-goods.png" class="h-16 w-16" />
              <div class="font-base text-primary font-semibold">￥3150</div>
            </div>
            <div class="flex flex-col items-center gap-0.5">
              <image src="/static/index/hot-goods.png" class="h-16 w-16" />
              <div class="font-base text-primary font-semibold">￥3150</div>
            </div>
          </div>
        </div>
      </div>
      <div class="mx-3 my-3">
        <image src="/static/index/banner1.png" class="h-26" />
      </div>
      <div class="mx-3 my-3">
        <image src="/static/index/banner2.png" class="h-36.5" />
      </div>
    </div>
  </MlPage>
</template>

<route lang="json5">
{
  layout: 'tab',
  style: {
    navigationStyle: 'custom',
  },
}
</route>
