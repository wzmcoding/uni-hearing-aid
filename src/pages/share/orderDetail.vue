<script setup lang="ts">
import type { OrderEntity } from '~/composables/api/order'

const props = withDefaults(defineProps<{
  id?: string
}>(), {
})
const service = useService()
const ui = useUi()

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
const info = ref<OrderEntity | undefined>()

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
  <div class="relative z-0">
    <div class="absolute left-0 right-0 top-0 z--1 h-40 rounded-b-5 bg-primary p-2" />
    <div class="p-2">
      <div class="text-5 color-background">
        @好友"{{ info?.sender.name }}"给您寄了一个快递
      </div>
      <div class="text-4 color-background">
        {{ info?.sender.city }} - {{ info?.receiver.city }}
      </div>
      <div class="mt-4 rounded-2 bg-background px-2 py-1">
        <div class="flex gap-1 border-b border-b-muted border-b-solid py-2">
          <div>{{ info?.company?.name }}</div>
          <div>{{ info?.waybillCode }}</div>
          <div class="text-primary" @click="copy(info?.waybillCode)">
            复制
          </div>
        </div>
        <div v-if="!info?.tracks || info?.tracks?.length === 0">
          暂无物流信息
        </div>
        <div v-else>
          <div v-for="(item, i) in info?.tracks" :key="i" class="mt-1 flex gap-1">
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
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>

<route lang="yaml">
style:
  navigationBarTitleText: "包裹详情"
  navigationBarBackgroundColor: "@bgPrimary"
</route>
