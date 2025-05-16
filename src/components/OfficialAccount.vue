<script setup lang="ts">
import officialAccount from '~/static/officialAccount.jpeg'

const env = useEnvStore()

declare const wx: {
  openOfficialAccountArticle?: (params: { url: string }) => void
}
const url = 'https://mp.weixin.qq.com/s?__biz=MzkzNjc0MDM0Nw==&mid=2247483687&idx=1&sn=18ca6c0b281262a130483392497a8e6b&chksm=c29b55b3f5ecdca5e0124e7c692a6ecab22b4f06e1f031de04fbd1404929bd3b7af7a5077855#rd'
function handleClick() {
  // #ifdef MP-WEIXIN

  if (wx.openOfficialAccountArticle) {
    wx.openOfficialAccountArticle({
      url,
    })
  }
  else {
    router.push(url)
  }
  // #endif
  // #ifndef MP-WEIXIN
  router.push(url)
  // #endif
}
</script>

<template>
  <div v-if="env.platform !== AppPlatform.MP_ALIPAY" class="flex items-center gap-3 bg-background p-2">
    <image h-8 w-8 rounded-full :src="officialAccount" />
    <div class="flex flex-1 flex-col text-3 text-foreground">
      <div class="text-3.5">
        飞驴速运
      </div>
      <div>关注公众号，下单返红包</div>
    </div>
    <button class="h-8 btn px-3.5 text-3.5" @click="handleClick">
      关注
    </button>
  </div>
</template>

<style lang="scss" scoped>

</style>
