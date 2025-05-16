<script setup lang="ts">
import dayjs from 'dayjs/esm'
import type { ExpressProductQuoteEntity } from '~/composables/api/app'

const props = defineProps<{
  product: ExpressProductQuoteEntity
}>()
const emit = defineEmits<{
  select: []
}>()
const orderStore = useOrderStore()

function renderDeliveryTime(time?: string) {
  if (!time) {
    return ''
  }
  const deliveryDate = dayjs(time, DATE.FULL_DATE_TIME)
  const dayOffset = deliveryDate.day() - dayjs().day()
  let renderStr = '预计'
  if (dayOffset === 0) {
    renderStr += '今天'
  }
  else if (dayOffset === 1) {
    renderStr += '明天'
  }
  else if (dayOffset === 2) {
    renderStr += '后天'
  }
  else {
    renderStr += `${deliveryDate.format('MM月DD日')}`
  }
  renderStr += `${deliveryDate.format('HH:mm')}`
  renderStr += '前'
  return renderStr
}

function onSelect() {
  if (props.product.loading) {
    return
  }
  emit('select')
}
</script>

<template>
  <div
    :class="{ 'active-product': orderStore.transport?.transportId === product.transportId }"
    class="relative mr-2 min-w-[280rpx] flex flex-none flex-col overflow-hidden border border-secondary rounded-lg border-solid"
    @click="onSelect"
  >
    <div class="product-banner flex items-center gap-1 bg-secondary px-2 py-1 text-foreground">
      <div class="flex-1">
        {{ product.productName }}
      </div>
      <div
        :class="{ invisible: orderStore.transport?.transportId !== product.transportId }"
        class="h-3.5 w-3.5 flex items-center justify-center rounded-full bg-background text-2 text-primary"
      >
        <div i-carbon-checkmark />
      </div>
    </div>
    <template v-if="product.loading">
      <!-- #ifdef MP-ALIPAY -->
      <div class="mx-auto my-2 h-4 w-[200rpx]">
        <MlSkeleton />
      </div>
      <div class="mx-auto my-2 h-4 w-[200rpx]">
        <MlSkeleton />
      </div>
      <!-- #endif -->
      <!-- #ifndef MP-ALIPAY -->
      <MlSkeleton class="mx-auto my-2 h-4 w-[200rpx]" />
      <div class="divider" />
      <MlSkeleton class="mx-auto my-2 h-4 w-[200rpx]" />
      <!-- #endif -->
    </template>
    <template v-else>
      <div v-if="product.expectedDeliveryTime" class="whitespace-nowrap px-4 py-2 text-center text-3">
        {{ renderDeliveryTime(product.expectedDeliveryTime) }}
      </div>
      <div class="divider" />
      <div class="flex items-end justify-center p-2">
        <div class="flex translate-y-[5rpx] items-center gap-0.5">
          <div class="text-3">
            ¥
          </div>
          <div class="text-4.5 font-600">
            {{ utils.renderPrice(product.price) }}
          </div>
          <div class="mr-2 text-4">
            起
          </div>
        </div>
        <div v-if="product?.totalPrice! > product?.price!" class="text-3.5 text-secondary-foreground line-through">
          ￥{{ utils.renderPrice(product.totalPrice) }}
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.active-product {
  @apply text-primary border-primary;

  .product-banner {
    @apply bg-primary text-primary-foreground;
  }
}
</style>
