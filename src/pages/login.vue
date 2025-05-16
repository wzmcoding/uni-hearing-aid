<script setup lang="ts">
async function handleWxLogin() {
  const res = await uni.login()
  if (res.code) {
    router.replace({
      url: '/pages/index',
    })
  }
  console.log('%c [ loginRes ]-5', 'font-size:13px; background:pink; color:#bf2c9f;', res)
}
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center gap-15 pt-10">
    <img src="/static/login.png" class="h-23.5 w-22.5" alt="">
    <div class="w-82">
      <button class="w-full btn px-12 py-3 text-4" @click="handleWxLogin">
        微信授权一键登录
      </button>
    </div>
  </div>
</template>

<route lang="yaml">
style:
  navigationBarTitleText: ""
</route>
