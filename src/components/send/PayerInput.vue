<script setup lang="ts">
import { OrderPayer } from '~/composables/api/order'

const orderStore = useOrderStore()

const list = computed(() => {
  const offlinePayType = orderStore.transport?.offlinePayType
  if (offlinePayType === 0) {
    return [
      {
        name: '寄付',
        value: OrderPayer.SENDER,
      },
      {
        name: '到付',
        value: OrderPayer.RECEIVER,
      },
    ]
  }
  else if (offlinePayType === 1) {
    return [
      {
        name: '寄付',
        value: OrderPayer.SENDER,
      },
    ]
  }
  else if (offlinePayType === 2) {
    return [
      {
        name: '到付',
        value: OrderPayer.RECEIVER,
      },
    ]
  }
})

function changeHandle(val: OrderPayer) {
  orderStore.payer = val
}

watch(
  () => list.value,
  (val) => {
    if (val?.length) {
      const index = val.findIndex((item) => item.value === orderStore.payer)
      if (index === -1) {
        changeHandle(val[0].value)
      }
    }
  },
)
</script>

<template>
  <div class="my-2 flex items-center gap-1">
    <div class="text-4 text-secondary-foreground">
      付款方式
    </div>
    <div class="flex-1" />
    <div class="flex items-center gap-1 text-4">
      <template v-if="ExpressCompanyQuotePayType.ONLINE === orderStore.transport?.payType">
        <div class="font-extrabold">
          微信支付
        </div>
        <div class="i-icon-park-outline-right text-4 text-muted-foreground" />
      </template>
      <div v-else>
        <div class="flex items-center gap-2">
          <div v-for="item in list" :key="item.value" class="flex items-center gap-1" @click="changeHandle(item.value)">
            <div
              v-if="item.value === orderStore.payer"
              class="i-carbon-radio-button-checked bg-primary"
            />
            <div v-else class="i-carbon-radio-button" />
            <div class="transition-all" :class="[item.value === orderStore.payer ? 'color-primary' : '']">
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
