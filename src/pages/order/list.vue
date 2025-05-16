<script setup lang="ts">
import debounce from 'debounce'
import TnTabs from '@tuniao/tnui-vue3-uniapp/components/tabs/src/tabs.vue'
import TnTabsItem from '@tuniao/tnui-vue3-uniapp/components/tabs/src/tabs-item.vue'
import { OrderQueryType } from '~/composables/api/order'
import type { FilterDateEntity, OrderEntity, OrderQueryDto } from '~/composables/api/order'

const props = withDefaults(defineProps<{
  type?: string
}>(), {
})

const orderStore = useOrderStore()
const service = useService()
const orderQuery = ref<OrderQueryDto>({
  queryType: props.type ? Number.parseInt(props.type) : OrderQueryType.ALL,
  waybillCode: '',
})

const confirmPayEl = ref()
const filterDateEl = ref()
const filterDateType = ref<number>(0)

const tabsList = ref([
  { name: '全部', id: OrderQueryType.ALL },
  { name: '进行中', id: OrderQueryType.IN_PROGRESS },
  { name: '待支付', id: OrderQueryType.PENDING_PAYMENT, badgeConfig: {} },
  { name: '已完成', id: OrderQueryType.COMPLETED },
])

function changeTabs() {
  refresh()
}

function query(data: any) {
  if (!data?.cursor) {
    orderStore.queryOverView()
  }
  return service.order.list(data)
}

const list = ref()

async function refresh() {
  list.value?.refresh(
    orderQuery.value,
    { clear: true },
  )
  if (orderStore.countWaitingPay && orderStore.countWaitingPay > 0) {
    // 待支付订单数量，设置了自动加上角标
    tabsList.value[2].badgeConfig = {
      value: orderStore.countWaitingPay,
    }
  }
}

const visibleFilter = ref<boolean>(false)

function openFilterDate() {
  const params = {
    filterDateType: filterDateType.value,
    startTime: orderQuery.value.startTime,
    endTime: orderQuery.value.endTime,
  }
  filterDateEl.value.show(params)
}

function confirmFilterDate(val: FilterDateEntity) {
  orderQuery.value.startTime = val.startTime
  orderQuery.value.endTime = val.endTime
  filterDateType.value = val.filterDateType
  refresh()
}

function openPay(item: OrderEntity) {
  confirmPayEl.value.show(item)
}
function confirmPay() { }

function openDetail(item: OrderEntity) {
  router.push({
    path: '/pages/order/detail',
    query: {
      id: item.id,
    },
  })
}

const debouncedSearch = debounce(() => {
  refresh()
}, 1000)

function activeSearch() {
  debouncedSearch()
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

// 首次刷新
onReady(() => {
  refresh()
})

onShow(async () => {})
// 必须有，否则首次打开时不触发
onReachBottom(() => {})
</script>

<template>
  <MlPage>
    <div class="relative">
      <!-- 筛选 -->
      <div
        class="sticky top-0 z-100 box-border h-12 flex items-center justify-center gap-8 bg-subtitle bg-subtitle p-2"
      >
        <div class="z-1 h-full flex flex-1 rounded-full bg-background text-sm">
          <MLInput
            v-model="orderQuery.waybillCode" height="100%" class="flex-1" placeholder="请输入运单号" :border="false"
            clearable @clear="activeSearch" @confirm="activeSearch"
          >
            <template #prefix>
              <div i-icon-park-outline-search class="text-secondary-foreground" />
            </template>
          </MLInput>
        </div>
        <button class="h-full btn-outline gap-1 border-foreground px-2 py-1 color-foreground" @click="openFilterDate">
          <div :class="visibleFilter ? 'i-carbon-caret-up' : 'i-carbon-caret-down'" />
          <div class="text-3.5">
            筛选
          </div>
        </button>
      </div>
      <!-- tabs -->
      <div class="h-12 w-full bg-subtitle">
        <!-- #ifdef MP-TOUTIAO -->
        <MlTabs v-model="orderQuery.queryType" :tabs="tabsList.map((item) => item.name)" @change="changeTabs">
          <template #item="{ item }">
            <view class="relative">
              {{ item }}
              <view
                v-if="item === tabsList[2].name && tabsList[2].badgeConfig && tabsList[2].badgeConfig.value > 0"
                class="absolute right-0 top-0 flex translate-x-1/2 items-center justify-center rounded-full bg-[red] px-[8rpx] py-[4rpx] text-[20rpx] text-[#ffffff] -translate-y-1/2"
              >
                <label class="leading-none">{{ tabsList[2].badgeConfig?.value }}</label>
              </view>
            </view>
          </template>
        </MlTabs>
        <!-- #endif -->
        <!-- #ifndef MP-TOUTIAO -->
        <TnTabs
          v-model="orderQuery.queryType" bg-color="transparent" :bottom-shadow="false" :scroll="false"
          @change="changeTabs"
        >
          <TnTabsItem
            v-for="(item, index) in tabsList" :key="index" :title="item.name"
            :badge-config="item.badgeConfig"
          />
        </TnTabs>
        <!-- #endif -->
      </div>
      <div class="px-2.5">
        <!-- 公众号提示 -->
        <div v-if="false" class="flex items-center justify-between rounded-2.5 bg-background px-3 py-2.5">
          <div class="font-500">
            关注公众号 实时推送物流状态
          </div>
          <div class="h-7.5 w-16 flex items-center justify-center rounded-1 bg-primary text-sm color-background">
            关注
          </div>
        </div>
        <!-- 订单列表 -->
        <MlPagerList ref="list" :query="query">
          <template #listItem="{ item }">
            <OrderItem :item="item" @open-detail="openDetail(item)" @open-pay="openPay" />
          </template>
          <template #empty>
            <MlEmpty>
              <image class="h-45 w-45" src="/static/empty/list.png" />
              <div class="mt-4 text-3.5 text-muted-foreground">
                没有您的寄件订单
              </div>
              <div class="mt-1 text-3.5 text-muted-foreground">
                马上寄个快递让我排上用场吧
              </div>
              <button class="mt-4 btn px-12 py-3 text-4" @click="router.push('/pages/send')">
                去寄件
              </button>
            </MlEmpty>
          </template>
        </MlPagerList>
      </div>
      <!-- 筛选 -->
      <FilterDateModal ref="filterDateEl" @confirm="confirmFilterDate" />
      <!-- 确认支付 -->
      <ConfirmPayModal ref="confirmPayEl" @confirm="confirmPay" />
    </div>
  </MlPage>
</template>

<style lang="scss">
.app {
  @apply bg-muted;
}
</style>

<route lang="yaml">
style:
  navigationBarTitleText: "订单列表"
  enablePullDownRefresh: true
  backgroundColorTop: "@bgPrimary/5"
  backgroundColor: "@bgPrimary/5"
</route>
