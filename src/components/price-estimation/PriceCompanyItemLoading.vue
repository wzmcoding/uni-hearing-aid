<script setup lang="ts">
</script>

<template>
  <div class="relative mr-2 min-w-[280rpx] flex flex-none flex-col overflow-hidden card rounded-lg">
    <div class="flex items-center gap-4 px-4.5 py-3">
      <!-- #ifdef MP-ALIPAY -->
      <div class="h-10 w-10 overflow-hidden rounded-full">
        <MlSkeleton />
      </div>
      <div class="h-8 w-[150rpx]">
        <MlSkeleton />
      </div>
      <div class="mx-2.5 h-6 w-[150rpx]">
        <MlSkeleton />
      </div>
      <div class="h-6 w-[150rpx]">
        <MlSkeleton />
      </div>
      <!-- #endif -->
      <!-- #ifndef MP-ALIPAY -->
      <MlSkeleton class="h-10 w-10 overflow-hidden rounded-full" />
      <MlSkeleton class="h-8 w-[150rpx]" />
      <MlSkeleton class="mx-2.5 h-6 w-[150rpx]" />
      <MlSkeleton class="h-6 w-[150rpx]" />
      <!-- #endif -->
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
