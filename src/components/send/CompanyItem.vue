<script setup lang="ts">
import type { ExpressCompanyQuoteEntity } from '~/composables/api/app'
import { ExpressCompanyQuotePayType } from '~/composables/api/app'

const props = defineProps<{
  company: ExpressCompanyQuoteEntity
}>()
const emit = defineEmits<{
  select: []
}>()
const orderStore = useOrderStore()
const loading = computed(() => {
  return props.company.products.some((product) => product.loading)
})
const minPriceProduct = computed(() => {
  const availableProducts = props.company.products.filter((product) => !product.loading)
  if (!availableProducts.length) {
    return undefined
  }
  return availableProducts.reduce((acc, current) => {
    return current.price! < acc.price! ? current : acc
  }, availableProducts[0])
})

function onSelect() {
  if (loading.value) {
    return
  }
  emit('select')
}
</script>

<template>
  <div
    :class="{ 'active-company': orderStore.transport?.companyId === company.companyId }"
    class="relative mr-2 min-w-[280rpx] flex flex-none flex-col overflow-hidden border border-secondary rounded-lg border-solid"
    @click="onSelect"
  >
    <div class="company-banner flex items-center gap-1 bg-secondary px-2 py-1 text-foreground">
      <image class="h-4 w-4 rounded-full" :src="company.companyLogo" />
      <div class="flex-none">
        {{ company.companyName }}
      </div>
      <div class="flex-1" />
      <div
        :class="{ invisible: orderStore.transport?.companyId !== company.companyId }"
        class="h-3.5 w-3.5 flex items-center justify-center rounded-full bg-background text-2 text-primary"
      >
        <div i-carbon-checkmark />
      </div>
    </div>
    <template v-if="loading">
      <!-- #ifdef MP-ALIPAY -->
      <div class="mx-auto mt-3 h-6 w-[200rpx]">
        <MlSkeleton />
      </div>
      <div class="mx-auto my-1 h-4 w-[100rpx]">
        <MlSkeleton />
      </div>
      <!-- #endif -->
      <!-- #ifndef MP-ALIPAY -->
      <MlSkeleton class="mx-auto mt-3 h-6 w-[200rpx]" />
      <MlSkeleton class="mx-auto my-1 h-4 w-[100rpx]" />
      <!-- #endif -->
    </template>
    <template v-else>
      <div class="mt-3 flex items-end justify-center">
        <div class="flex translate-y-[5rpx] items-center gap-0.5">
          <div class="text-3">
            ¥
          </div>
          <div class="text-4.5 font-600">
            {{ utils.renderPrice(minPriceProduct?.price) }}
          </div>
          <div class="mr-2 text-4">
            起
          </div>
        </div>
        <div
          v-if="minPriceProduct?.price! < minPriceProduct?.totalPrice!"
          class="text-3.5 text-secondary-foreground line-through"
        >
          ￥{{ utils.renderPrice(minPriceProduct?.totalPrice) }}
        </div>
      </div>
      <div v-if="minPriceProduct" class="my-1 text-center text-3 color-accent font-500">
        {{ minPriceProduct?.price! >= minPriceProduct?.totalPrice! ? '性价比高'
          : `${utils.calcDiscount(minPriceProduct.price!, minPriceProduct.totalPrice!)}折起` }}
      </div>
    </template>
    <div v-if="'SXJD' === company.companyCode" class="mb-3 mt-1 text-center text-3 text-secondary-foreground">
      运费支付给快递公司
    </div>
    <div v-else class="mb-3 mt-1 text-center text-3 text-secondary-foreground">
      运费支付给{{ company.payType === ExpressCompanyQuotePayType.OFFLINE ? '快递员' : '平台' }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.active-company {
  @apply text-primary border-primary;

  .company-banner {
    @apply bg-primary text-primary-foreground;
  }
}
</style>
