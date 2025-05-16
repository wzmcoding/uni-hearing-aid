<script setup lang="ts">
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'

const visible = ref(false)
const servicesList = ref<any[]>([
  {
    title: '运费估算',
    content: '快速计算运费',
    icon: '/static/order/server1.png',
    path: '/pages/price-estimation/index',
  },
  {
    title: '在线客服',
    content: '专属客服为您服务',
    icon: '/static/order/server2.png',
    path: '',
    isCustomer: true,
  },
])
function close() {
  visible.value = false
}

function show() {
  visible.value = true
}

function handleSelectServicer(val: any) {
  if (val.isCustomer) {
    return
  }
  router.push({
    path: val.path,
  })
}
</script>

<template>
  <div class="relative flex items-center card px-2 py-3.5 text-3.5" @click="show">
    <!-- <div class="i-carbon-customer-service relative text-4 text-primary font-500" /> -->
    <image class="h-4 w-4" src="/static/mine/customer.png" />
    <div class="ml-1 mr-2 text-4 font-500">
      寄件咨询
    </div>
    <div class="flex-1 text-muted-foreground">
      运费估算/什么时候到/能不能寄
    </div>
    <div class="i-icon-park-outline-right text-4 text-muted-foreground" />
  </div>
  <TnPopup v-model="visible" open-direction="bottom" @close="close">
    <div class="min-h-30vh overflow-y-auto bg-muted">
      <div class="py-4 text-center text-4">
        请选择想要咨询的服务
      </div>
      <div class="flex flex-col gap-3 px-3">
        <div v-for="(item, i) in servicesList" :key="i" class="relative flex items-center gap-5 card rounded bg-background px-6 py-4.5" @click="handleSelectServicer(item)">
          <div class="flex-1">
            <div class="text-4">
              {{ item.title }}
            </div>
            <div class="text-3">
              {{ item.content }}
            </div>
          </div>
          <CustomerServiceButton v-if="item.isCustomer" :behavior="{ paramA: '寄件' }" />
          <image class="h-8 w-8" :src="item.icon" />
        </div>
      </div>
    </div>
  </TnPopup>
</template>

<style lang="scss" scoped>

</style>
