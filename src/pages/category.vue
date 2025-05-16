<script setup lang="ts">
import TnBadge from '@tuniao/tnui-vue3-uniapp/components/badge/src/badge.vue'
import { OrderQueryType } from '~/composables/api/order'
import { useEnvStore } from '~/stores/env'

interface MenuItem {
  name: string
  imgUrl: string
  id: string | number
}
const orderList = ref<MenuItem[]>([
  {
    name: '进行中',
    imgUrl: '/static/mine/processing.png',
    id: OrderQueryType.IN_PROGRESS,
  },
  {
    name: '待支付',
    imgUrl: '/static/mine/pending.png',
    id: OrderQueryType.PENDING_PAYMENT,
  },
  {
    name: '已完成',
    imgUrl: '/static/mine/completed.png',
    id: OrderQueryType.COMPLETED,
  },
  {
    name: '全部',
    imgUrl: '/static/mine/all.png',
    id: OrderQueryType.ALL,
  },
])
const othersList = ref<MenuItem[]>([
  {
    name: '地址管理',
    imgUrl: 'i-carbon-location',
    id: 'address',
  },
  // {
  //   name: '电子发票',
  //   imgUrl: 'i-carbon-ibm-cloud-hsm',
  //   id: 'fapiao', // https://en.wiktionary.org/wiki/fapiao
  // },
  {
    name: '联系客服',
    imgUrl: 'i-carbon-customer-service',
    id: 'cs',
  },
  {
    name: '帮助中心',
    imgUrl: 'i-carbon-help',
    id: 'help',
  },
])
function openOrderList(item: MenuItem) {
  router.push({
    path: '/pages/order/list',
    query: {
      type: item.id,
    },
  })
}
function onClickItem(item: MenuItem) {
  if (item.id === 'address') {
    router.push('/pages/address-book/list')
  }
  else if (item.id === 'help') {
    router.push(`${WEB_PREFIX}/help?t=${new Date().getTime()}`)
  }
  else if (item.id === 'search') {
    router.push(`${WEB_PREFIX}/`)
  }
}

const userStore = useUserStore()

const debug = useDebug({
  callback: () => {
    router.push('/pages/debug')
  },
})
const { version } = useEnvStore()
const orderStore = useOrderStore()
// 费用补缴数
const toPayCount = computed(() => {
  return orderStore.countWaitingPay
})
onShow(async () => {
  await orderStore.queryOverView()
})
</script>

<template>
  <MlPage>
    <div class="relative z-0">
      <div class="gradient-page-top-bg absolute left-0 right-0 top-0 z--1 h-80 p-2" />
      <div class="p-3">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex flex-1 items-center gap-2">
            <image src="/static/logo.png" class="h-10 w-10 rounded-full" />
            <div class="flex flex-col gap-2">
              <div class="flex items-center gap-2">
                <div class="text-5 font-bold">
                  {{ userStore.info?.name || '未登录' }}
                </div>
                <div v-if="false" class="rounded-lg bg-background px-2 text-sm text-muted-foreground">
                  未实名
                </div>
              </div>
              <div v-if="false" class="text-sm">
                关联手机号，同步更多快递包裹
              </div>
            </div>
          </div>
          <div v-if="false" class="i-icon-park-outline-right text-xl" />
        </div>
        <div class="grid grid-cols-4 mb-3 gap-3 card p-4">
          <div v-for="item in orderList" :key="item.id" class="relative" @click="openOrderList(item)">
            <template v-if="item.id === OrderQueryType.ALL">
              <div class="relative flex flex-col items-center justify-center gap-2 pl-4">
                <image class="h-6 w-6" :src="item.imgUrl" />
                <div class="text-3.5">
                  {{ item.name }}
                </div>
                <div class="mt--3 whitespace-nowrap text-secondary-foreground">
                  寄件订单
                </div>
                <div class="absolute left-0 divider-v h-full" />
              </div>
            </template>
            <template v-else>
              <div class="flex flex-col items-center justify-center gap-2">
                <image class="h-6 w-6" :src="item.imgUrl" />
                <TnBadge
                  v-if="OrderQueryType.PENDING_PAYMENT === item.id" absolute-center absolute
                  :custom-style="{ right: '-18px', top: '2px' }" class="top-0" :value="toPayCount" type="danger"
                />
                <div class="text-3.5">
                  {{ item.name }}
                </div>
              </div>
            </template>
          </div>
        </div>
        <div class="flex flex-col gap-2 card">
          <div
            v-for="(item) in othersList" :key="item.id"
            class="relative flex items-center gap-2 border-b border-muted border-b-solid px-4 py-4"
            @click="onClickItem(item)"
          >
            <div class="h-6 w-6" :class="item.imgUrl" />
            <div class="flex-1 text-4">
              {{ item.name }}
            </div>
            <div class="i-icon-park-outline-right text-xl" />
            <CustomerServiceButton v-if="item.id === 'cs'" :behavior="{ paramA: '我的' }" />
          </div>
          <div v-if="version" class="relative flex items-center gap-2 px-4 py-4">
            <div class="i-carbon-information h-6 w-6" />
            <div class="flex-1 text-4">
              版本号
            </div>
            <div class="" @click="debug.call">
              {{ version }}
            </div>
          </div>
        </div>
        <!-- #ifdef MP-WEIXIN || H5 -->
        <div class="mt-3 overflow-hidden card">
          <OfficialAccount />
        </div>
        <!-- #endif -->
      </div>
    </div>
  </MlPage>
</template>

<style lang="scss">
.app {
  @apply bg-muted;
}
</style>

<route lang="yaml">
layout: tab
</route>
