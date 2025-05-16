<script setup lang="ts">
import AddressItem from '~/components/address/AddressItem.vue'
import type { AddressEntity } from '~/composables/api/address'
import { addressShare, commonShare } from '~/utils/share'
import { useOrderStore } from '~/stores/order'

const props = defineProps<{ type: string }>()

uni.setNavigationBarTitle({
  title: Number.parseInt(props.type) === 1 ? '收件地址' : '寄件地址',
})

const service = useService()
const ui = useUi()

function add() {
  router.push({
    path: '/pages/address-book/edit',
    query: {
      type: props.type,
    },
  })
}

const list = ref<AddressEntity[]>([])

const keyword = ref('')

function search(e: { keyword: string }) {
  keyword.value = e.keyword
  refresh()
}

async function refresh() {
  ui.showLoading('加载中...')
  try {
    const res = await service.address.list({
      keyword: keyword.value,
      // type: type.value,
    })
    list.value = res
  }
  catch (e) {
    console.log(e)
  }
  finally {
    ui.hideLoading()
  }
}

const addressRefresh = useRefresh('refresh:address')
addressRefresh.onRefresh(async (params) => {
  if (params) {
    if (params.data && !params.force) {
      // 只更新单行
      const index = list.value.findIndex(
        (x: AddressEntity) => x.id === params.data.id,
      )
      if (index !== -1) {
        list.value.splice(index, 1, params.data)
      }
    }
    else {
      // 重新刷新
      refresh()
    }
    if (params.callback) {
      params.callback()
      params.callback = undefined // 只需要最先接收者执行一次，否则可能冲突
    }
  }
})

onPullDownRefresh(async () => {
  await refresh()
  uni.stopPullDownRefresh()
})

const orderStore = useOrderStore()

function onSelectAddress(item: AddressEntity) {
  orderStore.setAddress(item, Number.parseInt(props.type))
  router.back()
}

function isSelected(item: AddressEntity) {
  return orderStore.equalsAddress(item, Number.parseInt(props.type))
}

onShareAppMessage((res: Page.ShareAppMessageOption) => {
  if (res.from === 'button') {
    const id = res.target?.dataset?.params?.id
    return addressShare(id)
  }
  return commonShare()
})

onReady(async () => {
  await refresh()
})
</script>

<template>
  <MlPage>
    <div class="sticky top-0 z-10">
      <SearchBar
        @search="search"
      />
    </div>
    <div class="list pb-30">
      <AddressItem
        v-for="item in list"
        :key="item.id"
        :item="item"
        selectable
        :selected="isSelected(item)"
        @select="onSelectAddress(item)"
        @refresh="refresh"
      />
      <MlEmpty v-if="!list.length">
        <image class="h-45 w-45" src="/static/empty/chat.png" />
        <view class="mt-4 text-4 text-muted-foreground">
          {{ keyword ? '没有找到相关地址' : '暂无地址' }}
        </view>
        <view class="mt-2 text-4 text-primary" @click="refresh">
          点击刷新
        </view>
      </MlEmpty>
    </div>
    <div class="fixed-bottom-container">
      <div class="flex items-center p-3">
        <button class="btn flex-1 p-3 text-4" @click="add">
          新建地址
        </button>
      </div>
    </div>
  </MlPage>
</template>

<style lang="scss">
.app {
  @apply bg-primary/5;
}
</style>

<route lang="yaml">
style:
  navigationBarTitleText: "地址簿"
  enablePullDownRefresh: true
  backgroundColorTop: "@bgPrimary/5"
  backgroundColor: "@bgPrimary/5"
</route>
