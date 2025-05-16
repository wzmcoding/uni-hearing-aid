<script setup lang="ts">
import AddressItem from '~/components/address/AddressItem.vue'
import type { AddressEntity, AddressType } from '~/composables/api/address'
import { addressShare, commonShare } from '~/utils/share'
import SearchBar from '~/components/address/SearchBar.vue'

const service = useService()
const ui = useUi()

function add() {
  router.push('/pages/address-book/edit')
}

const list = ref<AddressEntity[]>([])

const keyword = ref('')
const type = ref<null | AddressType>(null)

function search(e: { keyword: string, type: AddressType }) {
  keyword.value = e.keyword
  type.value = e.type
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

onShareAppMessage((res: Page.ShareAppMessageOption) => {
  if (res.from === 'button') {
    const id = res.target?.dataset?.params?.id
    return addressShare(id)
  }
  return commonShare()
})

// 使用ready而不是mounted，因为ready时ui组件才初始化完毕
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
        :selected="item.defaulted"
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
