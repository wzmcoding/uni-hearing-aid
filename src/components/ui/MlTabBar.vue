<script setup lang="ts">
const tabs = ref([
  {
    name: '首页',
    path: '/pages/index',
    icon: '/static/tab/default/home.png',
    activeIcon: '/static/tab/active/home.png',
  },
  {
    name: '分类',
    path: '/pages/category',
    icon: '/static/tab/default/category.png',
    activeIcon: '/static/tab/active/home.png',
  },
  {
    name: '挚听小天地',
    path: '/pages/delivery',
    icon: '/static/tab/default/little-world.png',
    activeIcon: '/static/tab/active/home.png',
  },
  {
    name: '购物车',
    path: '/pages/cart',
    icon: '/static/tab/default/cart.png',
    activeIcon: '/static/tab/active/home.png',
  },
  {
    name: '个人中心',
    path: '/pages/mine',
    icon: '/static/tab/default/mine.png',
    activeIcon: '/static/tab/active/mine.png',
  },
])
const pages = getCurrentPages()
const currentPage = pages[pages.length - 1]
const path = currentPage.route

const currentTab = computed({
  get() {
    return `/${path}`
  },
  set(value) {
    if (value !== `/${path}`) {
      console.log(value)
      router.replace(value)
    }
  },
})
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 bg-background pb-0-safe">
    <div class="h-1px bg-secondary" />
    <div class="flex justify-around py-2">
      <div
        v-for="(item, index) in tabs"
        :key="index"
        class="flex flex-1 flex-col items-center justify-center gap-2" :class="{ 'text-primary': currentTab === item.path }"
        @click="currentTab = item.path"
      >
        <div class="h-4 w-4">
          <image class="h-full w-full" :src="currentTab === item.path ? item.activeIcon : item.icon" />
        </div>
        <div :class="{ 'text-secondary-foreground': currentTab !== item.path }">
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>
