<script lang="ts" setup>
import { cloneDeep } from 'lodash-es'
import type { AddressEntity } from '~/composables/api/address'
import { AddressType } from '~/composables/api/address'
import { addressShare } from '~/utils/share'

const props = withDefaults(defineProps<{
  id?: string
}>(), {
})
const ui = useUi()
const service = useService()

const source = ref<AddressEntity | undefined>()

const loading = ref(false)

async function refresh() {
  if (props.id) {
    loading.value = true
    try {
      source.value = await service.address.info({ id: props.id })
    }
    catch (err: any) {
      ui.showError(err?.message, () => {
        refresh()
      })
      return
    }
    if (!source.value) {
      ui.showError('未找到地址信息', () => {
        refresh()
      })
    }
    else {
      loading.value = false
    }
  }
  else {
    ui.showError('页面参数不正确')
  }
}

onReady(() => {
  refresh()
})

const orderStore = useOrderStore()

function send() {
  orderStore.setAddress(source.value!, AddressType.RECEIVE)
  router.push('/pages/send')
}
function copy() {
  const { name, address, province, city, district } = source.value!
  const copyText = `${name} ${utils.renderPhone(source.value)} ${province} ${city} ${district} ${address}`
  uni.setClipboardData({
    data: copyText,
  })
}
async function save() {
  const model = cloneDeep(source.value!)
  delete model.id
  const res = await service.address.add(model)
  model.id = res.id
  uni.$emit('refresh:address', {
    data: model,
    force: !props.id || model.defaulted !== source.value?.defaulted,
    callback: () => {
      uni.showToast({
        title: '保存成功',
        icon: 'success',
      })
    },
  })
  router.push('/pages/address-book/list')
}
onShareAppMessage((res: Page.ShareAppMessageOption) => {
  return addressShare(source.value?.id)
})
</script>

<template>
  <MlPage>
    <div class="detail-list">
      <div class="detail-list-item">
        <div class="detail-list-label">
          姓名
        </div>
        <div class="detail-list-value">
          {{ source?.name }}
        </div>
      </div>
      <div class="detail-list-item">
        <div class="detail-list-label">
          联系方式
        </div>
        <div class="detail-list-value">
          {{ utils.renderPhone(source) }}
        </div>
      </div>
      <div class="detail-list-item">
        <div class="detail-list-label">
          地址
        </div>
        <div class="detail-list-value">
          {{ source?.province }} {{ source?.city }} {{ source?.district }} {{
            source?.address }}
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-3 px-3 py-6">
      <button class="w-full p-3 text-4 btn-accent" @click="send">
        给Ta寄件
      </button>
      <button class="w-full p-3 text-4 btn-default" @click="save">
        保存到地址簿
      </button>
      <button class="w-full p-3 text-4 btn-default" @click="copy">
        复制地址
      </button>
    </div>
  </MlPage>
</template>

<style lang="scss">
.app {
  @apply bg-primary/5;
}
</style>

<style lang="scss" scoped>
.detail-list {
  @apply bg-background text-4 px-4;

  .detail-list-item {
    @apply flex items-center py-3;

    & + .detail-list-item {
      @apply border-t border-t-solid border-secondary;
    }

    .detail-list-label {
      @apply w-20 text-muted-foreground;
    }
    .detail-list-value {
      @apply min-w-0 flex-1;
    }
  }

}
</style>

<route lang="yaml">
style:
  navigationBarTitleText: "地址详情"
  backgroundColorTop: "@bgPrimary/5"
  backgroundColor: "@bgPrimary/5"
</route>
