<script setup lang="ts">
const ui = useUi()

interface MenuItem {
  name: string
  imgUrl: string
  id: string | number
}
const deliveryList = ref<MenuItem[]>([
  {
    name: '寄快递',
    imgUrl: '/static/entry/package.png',
    id: 'package',
  },
  {
    name: '寄大件',
    imgUrl: '/static/entry/bulky.png',
    id: 'bulky',
  },
  {
    name: '电瓶车托运',
    imgUrl: '/static/entry/battery.png',
    id: 'battery',
  },
])

function onClickEntry(item: MenuItem) {
  console.log(item)
  switch (item.id) {
    case 'package':
      router.push({
        path: '/pages/send',
        query: {
          type: '0',
        },
      })
      break
    case 'bulky':
      router.push({
        path: '/pages/send',
        query: {
          type: '1',
        },
      })
      break
    case 'battery':
      utils.handleBatteryCar()
      break
    default :
      break
  }
}
</script>

<template>
  <MlPage>
    <div class="relative z-0">
      <div class="gradient-page-top-bg absolute left-0 right-0 top-0 z--1 h-80 p-2" />
      <div class="p-3">
        <div class="grid grid-cols-3 gap-3 card">
          <div v-for="item in deliveryList" :key="item.id" class="entry-item" @click="onClickEntry(item)">
            <image class="h-12 w-12" :src="item.imgUrl" />
            <div class="text-4">
              {{ item.name }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </MlPage>
</template>

<style lang="scss">
.app {
  @apply bg-muted;
}
</style>

<style lang="scss" scoped>
.entry-item {
  @apply flex flex-col items-center justify-center gap-2  p-3;

  & + .entry-item {
    @apply border-l border-secondary border-l-solid;
  }
}
</style>

<route lang="yaml">
layout: tab
</route>
