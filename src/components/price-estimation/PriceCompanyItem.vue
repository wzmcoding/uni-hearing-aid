<script setup lang="ts">
import type { ExpressCompanyQuoteEntity } from '~/composables/api/app'

const props = defineProps<{
  company: ExpressCompanyQuoteEntity
}>()

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
</script>

<template>
  <div
    class="relative mr-2 min-w-[280rpx] flex flex-none flex-col overflow-hidden card rounded-lg"
  >
    <div class="flex items-center gap-4 px-4.5 py-3">
      <image class="h-10 w-10 rounded-full" :src="company.companyLogo" />
      <div class="flex-1 text-4 font-500">
        {{ company.companyName }}
      </div>
      <template v-if="loading">
        <!-- #ifdef MP-ALIPAY -->
        <div class="mx-2.5 h-6 w-[150rpx]">
          <MlSkeleton />
        </div>
        <div class="h-6 w-[150rpx]">
          <MlSkeleton />
        </div>
        <!-- #endif -->
        <!-- #ifndef MP-ALIPAY -->
        <MlSkeleton class="mx-2.5 h-6 w-[150rpx]" />
        <MlSkeleton class="h-6 w-[150rpx]" />
        <!-- #endif -->
      </template>
      <template v-else>
        <div
          v-if="minPriceProduct?.price! < minPriceProduct?.totalPrice!"
          class="mx-2.5 text-3 text-secondary-foreground line-through"
        >
          原价{{ utils.renderPrice(minPriceProduct?.totalPrice) }}起
        </div>
        <div class="text-4 color-accent font-500">
          ¥{{ utils.renderPrice(minPriceProduct?.price) }}起
        </div>
      </template>
    </div>
    <div class="absolute right-0 top-0 w-16 rounded-bl-2.5 rounded-tr-2.5 bg-[#FA5230] text-center text-3 text-background">
      {{ minPriceProduct?.price! >= minPriceProduct?.totalPrice! ? '性价比高'
        : `${utils.calcDiscount(minPriceProduct?.price!, minPriceProduct?.totalPrice!)}折` }}
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
