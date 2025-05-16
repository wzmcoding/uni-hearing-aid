<script setup lang="ts">

</script>

<template>
  <MlPage>
    <div class="h-screen flex flex-col items-center justify-start gap-4 px-8 pt-18.5">
      <div class="flex flex-col items-center justify-center">
        <img class="h-11 w-11" src="/static/order/pay-success.png" alt="支付成功">
        <div class="my-3 text-2xl">
          支付成功
        </div>
      </div>
      <div class="mt-2 flex gap-3">
        <button class="h-8.75 w-30 btn-outline px-6 py-3 text-sm" @click="router.replace('/pages/index')">
          返回首页
        </button>
        <button class="h-8.75 w-30 btn-accent px-6 py-3 text-sm" @click="router.replace('/pages/order/list')">
          查看订单
        </button>
      </div>
    </div>
  </MlPage>
</template>

<route lang="yaml">
style:
  navigationBarTitleText: "支付成功"
  enablePullDownRefresh: false
  backgroundColorTop: "@bgPrimary/5"
  backgroundColor: "@bgPrimary/5"
</route>
