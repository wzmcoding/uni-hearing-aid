<script setup lang="ts">
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'
import type { OrderEntity } from '~/composables/api/order'

const props = withDefaults(defineProps<{
  id?: string
}>(), {
})
const service = useService()
const ui = useUi()

const info = ref<OrderEntity | undefined>()

const statusText = ref<any>({
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

const visibleEditRemarks = ref(false)

function openEditRemarks() {
  visibleEditRemarks.value = true
}

function openOrder() {
  router.push({
    path: '/pages/order/detail',
    query: {
      id: props.id,
    },
  })
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

function makePhoneCall(mobile: string | undefined) {
  if (!mobile) {
    return
  }
  uni.makePhoneCall({
    phoneNumber: mobile,
  })
}

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
    }
  }
  else {
    ui.showError('页面参数不正确')
  }
}

function openShare() {
  router.push({
    path: '/pages/share/order',
    query: {
      id: props.id,
    },
  })
}
onReady(() => {
  refresh()
})
</script>

<template>
  <MlPage>
    <div class="min-h-[100vh] bg-muted p-2.5">
      <div class="rounded-2.5 bg-background">
        <div class="flex items-center gap-2 px-4 pb-3 pt-4">
          <img class="h-13 w-13 rounded-full" :src="info?.company?.logo" alt="">
          <div class="w-0 flex flex-1 flex-col gap-2">
            <div class="w-full truncate font-500">
              收件人 : {{ info?.receiver.name }}({{ info?.receiver.city }})物品:{{ info?.cargo.name }}
            </div>
            <!-- 修改备注/暂不支持 -->
            <div
              v-if="false"
              class="w-fit flex items-center gap-1 border border-muted-foreground rounded-1 border-solid px-1.5 py-0.5 text-xs"
              @click="openEditRemarks"
            >
              <div class="i-icon-park-outline-edit-two text-muted-foreground" />
              <div class="color-muted-foreground">
                修改备注
              </div>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3.5 border-b border-muted border-b-solid px-4 pb-5 text-sm">
          <div>{{ info?.company?.name }} ></div>
          <div>{{ info?.waybillCode }}</div>
          <div v-if="info?.waybillCode" class="color-primary" @click="copy(info?.waybillCode)">
            复制
          </div>
        </div>
        <div class="px-4">
          <div class="flex items-center justify-between rounded-2.5 bg-muted px-2 py-1.5 text-sm">
            <div class="flex flex-1 items-center gap-2">
              <image v-if="info?.pickupCourierMobile" class="h-7 w-7" src="/static/order/courier.png" />
              <div class="flex-1 whitespace-normal">
                {{ info?.pickupCourierName || info?.company?.customerServiceName }}
              </div>
              <div
                v-if="info?.pickupCourierMobile || info?.supplierPhone || (info?.company?.customerServicePhone && info?.company?.customerServiceName)"
                class="i-carbon-phone bg-muted-foreground"
                @click="makePhoneCall(info?.pickupCourierMobile || info?.supplierPhone || info?.company?.customerServicePhone)"
              />
            </div>
            <div class="flex items-center gap-1.5 color-primary" @click="openOrder">
              <div class="flex-none">
                查看订单
              </div>
              <div class="i-carbon-chevron-right" />
            </div>
          </div>
          <div class="mt-2">
            <ml-empty v-if="info?.tracks?.length === 0">
              <image class="h-45 w-45" src="/static/empty/box.png" />
              <div class="text-sm color-muted-foreground">
                快递信息尚未录入系统，或者单号已经过期
              </div>
            </ml-empty>
            <div v-for="(item, i) in info?.tracks" v-else :key="i" class="mt-1 flex gap-1">
              <div class="flex flex-col items-center gap-1">
                <div
                  class="i-icon-park-outline-arrow-circle-right mt-0.5 h-4.5 w-4.5"
                  :class="i === 0 ? 'bg-primary' : 'bg-muted-foreground'"
                />
                <div class="h-4 w-[1px] border-r border-muted-foreground border-r-dashed" />
              </div>
              <div class="flex flex-1 flex-col gap-1">
                <div class="flex gap-2.5">
                  <div class="flex-1 text-sm" :class="i === 0 ? 'color-primary' : 'color-muted-foreground'">
                    {{ statusText[item.trackType] }}
                  </div>
                  <!-- 暂时隐藏 -->
                  <!-- <button v-if="i === 0" class="flex items-center gap-1 px-3 py-1 btn">
                    <div class="i-carbon-add-large bg-background text-3" />
                    <div class="text-3 color-background">
                      订阅物流
                    </div>
                  </button> -->
                  <!-- #ifndef H5 -->
                  <button
                    v-if="i === 0" class="m-0 h-6 btn-outline border-foreground px-3 py-1 text-3 color-foreground"
                    @click="openShare"
                  >
                    分享
                  </button>
                  <!-- #endif -->
                </div>
                <div class="text-xs color-muted-foreground">
                  {{ item.trackTime }}
                </div>
                <div class="text-xs color-muted-foreground">
                  {{ item.trackDesc }}
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-center pb-3 pt-8">
            对物流有疑问? 点击
            <div class="relative color-primary">
              联系客服
              <CustomerServiceButton :behavior="{ paramA: '订单轨迹', paramB: info?.orderNo, paramC: info?.orderStatus }" />
            </div>
          </div>
        </div>
      </div>
      <!-- 修改备注---暂不支持 -->
      <TnPopup v-model="visibleEditRemarks">
        <view class="tn-p-lg">
          弹框内容
        </view>
      </TnPopup>
    </div>
  </MlPage>
</template>

<style lang="scss" scoped>

</style>

<route lang="yaml">
style:
  navigationBarTitleText: "物流详情"
</route>
