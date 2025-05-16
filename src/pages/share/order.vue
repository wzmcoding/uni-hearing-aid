<script setup lang="ts">
import dayjs from 'dayjs/esm'
import { commonShare, orderShare } from '~/utils/share'
import type { OrderEntity } from '~/composables/api/order'

const props = withDefaults(defineProps<{
  id?: string
}>(), {
})

const service = useService()
const ui = useUi()
const info = ref<OrderEntity | undefined>()
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

onShareAppMessage((res: Page.ShareAppMessageOption) => {
  if (res.from === 'button') {
    const id = res.target?.dataset?.params?.id
    return orderShare(id, '您的包裹正在路上')
  }
  return commonShare()
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
    }
  }
  else {
    ui.showError('页面参数不正确')
  }
}

onReady(() => {
  refresh()
})
</script>

<template>
  <div class="px-2 pt-5">
    <div class="border border-primary rounded-2 border-solid bg-background p-2">
      <div class="flex gap-1 color-primary">
        <div>{{ info?.company?.name }}:</div>
        <div>{{ info?.waybillCode }}</div>
      </div>
      <div class="flex justify-center gap-10 py-5">
        <div class="flex flex-col items-center">
          <div class="font-500">
            {{ info?.sender.city }}
          </div>
          <div class="color-muted-foreground">
            {{ info?.sender.name }}
          </div>
        </div>
        <div class="">
          <div class="mt-1 flex items-center justify-center">
            <div class="gradient-line-left-bg h-[1px] w-12" />
            <div class="i-carbon-send" />
            <div class="gradient-line-right-bg h-[1px] w-12" />
          </div>
          <div class="text-center text-xs color-primary">
            {{ OrderStatusText[info?.orderStatus!] }}
          </div>
        </div>
        <div class="flex flex-col items-center">
          <div class="font-500">
            {{ info?.receiver.city }}
          </div>
          <div class="color-muted-foreground">
            {{ info?.receiver.name }}
          </div>
        </div>
      </div>
      <div v-if="info?.pickupTime" class="flex justify-center text-3 color-muted-foreground">
        寄出日期 {{ dayjs(info?.pickupTime).format("YYYY/MM/DD") }}
      </div>
    </div>
    <div class="fixed bottom-0 left-0 right-0 flex bg-background px-2.5 pb-2.5 pt-3">
      <div class="w-full btn py-3.5">
        分享
        <ShareButton :params="{ id: props.id }" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>

<route lang="yaml">
style:
  navigationBarTitleText: "分享包裹"
</route>
