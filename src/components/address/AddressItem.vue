<script setup lang="ts">
import TnCheckbox from '@tuniao/tnui-vue3-uniapp/components/checkbox/src/checkbox.vue'
import type { AddressEntity } from '~/composables/api/address'

const props = withDefaults(defineProps<{
  item: AddressEntity
  selected?: boolean
  disabled?: boolean
  selectable?: boolean
}>(), {
  selected: false,
  disabled: false,
  selectable: false,
})

const emit = defineEmits<{
  share: [AddressEntity]
  select: [AddressEntity]
  refresh: []
}>()

const env = useEnvStore()

const ui = useUi()
const service = useService()

const privacy = ref(true)
// const phone = computed(() => {
//   return utils.renderPhone(props.item, privacy.value)
// })
const viewAction = ref(false)

function edit() {
  router.push({
    path: '/pages/address-book/edit',
    query: {
      id: props.item.id,
    },
  })
  viewAction.value = false
}
function share() {
  emit('share', props.item)
  viewAction.value = false
}
function copy() {
  const { name, address, province, city, district } = props.item
  const copyText = `${name} ${utils.renderPhone(props.item)} ${province} ${city} ${district} ${address}`
  uni.setClipboardData({
    data: copyText,
    success() {
      viewAction.value = false
    },
  })
}
function del() {
  ui.showConfirm({
    title: '提示',
    content: `您确定要删除 '${props.item?.name}' 么？`,
    confirm: () => {
      return new Promise<boolean>(async (resolve) => {
        ui.showLoading()
        try {
          await service.address.delete([props.item.id])
          viewAction.value = false
          ui.showToast({
            title: '删除成功',
            icon: 'success',
          })
          emit('refresh')
          resolve(true)
        }
        catch (err) {
        }
        finally {
          ui.hideLoading()
        }
      })
    },
  })
}
function onClickItem() {
  if (props.disabled) {
    return
  }
  if (props.selectable) {
    emit('select', props.item)
  }
  else {
    viewAction.value = true
  }
}
</script>

<template>
  <div class="relative overflow-hidden" :class="{ 'bg-subtitle': selected }">
    <div class="flex items-center px-6 py-3" @click="onClickItem">
      <div v-if="selectable" class="mr-2">
        <TnCheckbox :model-value="selected" checked-shape="circle" />
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-2 text-4 text-title font-bold">
          <div>{{ item?.name }}</div>
          <div>{{ utils.renderPhone(item, privacy) }}</div>
          <div
            v-if="item.defaulted"
            class="flex flex-none items-center justify-center"
          >
            <div
              class="rounded-full bg-accent/10 px-2 py-1 text-3 text-accent"
            >
              默认
            </div>
          </div>
        </div>
        <div class="mt-1 text-3 text-secondary-foreground">
          {{ item?.province }} {{ item?.city }} {{ item?.district }} {{ item?.address }}
        </div>
      </div>
      <div class="ml-6 flex items-center gap-2 text-4 text-muted-foreground">
        <div v-if="privacy" i-icon-park-outline-preview-open @click.stop="privacy = false" />
        <div v-else i-icon-park-outline-preview-close @click.stop="privacy = true" />
        <div>|</div>
        <div i-icon-park-outline-edit @click.stop="viewAction = true" />
      </div>
    </div>
    <div class="mx-4 divider" />
    <template v-if="viewAction">
      <div class="fixed inset-0 z-1" @click.stop="viewAction = false" />
    </template>
    <div
      :class="{ 'animate-slide-in': viewAction }"
      class="item-menu absolute inset-0 z-10 flex items-center justify-center gap-7 bg-foreground/80 text-background"
      @click.stop="viewAction = false"
    >
      <div class="flex flex-col" @click.stop="edit">
        <div class="h-8 w-8 flex items-center justify-center rounded-full bg-background text-4 text-foreground">
          <div i-icon-park-outline-edit />
        </div>
        <div class="mt-2 text-center">
          编辑
        </div>
      </div>
      <div v-if="env.platform !== AppPlatform.H5" class="relative flex flex-col" @click.stop="share">
        <div class="h-8 w-8 flex items-center justify-center rounded-full bg-background text-4 text-foreground">
          <div i-icon-park-outline-share />
        </div>
        <div class="mt-2 text-center">
          分享
        </div>
        <ShareButton :params="{ id: item.id }" />
      </div>
      <div class="flex flex-col" @click.stop="copy">
        <div class="h-8 w-8 flex items-center justify-center rounded-full bg-background text-4 text-foreground">
          <div i-icon-park-outline-copy />
        </div>
        <div class="mt-2 text-center">
          复制
        </div>
      </div>
      <div class="flex flex-col" @click.stop="del">
        <div class="h-8 w-8 flex items-center justify-center rounded-full bg-background text-4 text-foreground">
          <div i-icon-park-outline-delete />
        </div>
        <div class="mt-2 text-center">
          删除
        </div>
      </div>
      <div class="absolute bottom-0 right-4 top-0 w-8 flex items-center">
        <div class="text-4">
          <div i-icon-park-outline-close />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.item-menu {
  transition: all .2s  ease-out;
  transform: translateX(100%);

  &.animate-slide-in {
    transform: translateX(0);
  }
}
</style>
