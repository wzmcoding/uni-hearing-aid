<script setup lang="ts">
</script>

<template>
  <div
    class="relative mr-2 min-w-[280rpx] flex flex-none flex-col overflow-hidden border border-secondary rounded-lg border-solid"
  >
    <div class="company-banner flex items-center gap-1 bg-secondary px-2 py-1 text-foreground">
      <!-- #ifdef MP-ALIPAY -->
      <div class="h-4 w-4 overflow-hidden rounded-full">
        <MlSkeleton />
      </div>
      <div class="h-4 flex-1">
        <MlSkeleton />
      </div>
      <!-- #endif -->
      <!-- #ifndef MP-ALIPAY -->
      <MlSkeleton class="h-4 w-4 overflow-hidden rounded-full" />
      <MlSkeleton class="h-4 flex-1" />
      <!-- #endif -->
    </div>
    <!-- #ifdef MP-ALIPAY -->
    <div class="mx-auto mt-3 h-6 w-[200rpx]">
      <MlSkeleton />
    </div>
    <div class="mx-auto my-1 h-4 w-[100rpx]">
      <MlSkeleton />
    </div>
    <div class="mx-auto mb-3 mt-1 h-4 w-[200rpx]">
      <MlSkeleton />
    </div>
    <!-- #endif -->
    <!-- #ifndef MP-ALIPAY -->
    <MlSkeleton class="mx-auto mt-3 h-6 w-[200rpx]" />
    <MlSkeleton class="mx-auto my-1 h-4 w-[100rpx]" />
    <MlSkeleton class="mx-auto mb-3 mt-1 h-4 w-[200rpx]" />
    <!-- #endif -->
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
