<script lang="ts" setup>
const props = defineProps({
  query: {
    type: Function,
    required: true,
  },
  indexKey: {
    type: String,
    default: 'id',
  },
})
const emit = defineEmits(['tapItem'])
const { pager, list, onData, onRefresh, onPullDownRefresh, onReachBottom }
  = usePager()
pager.pagination.size = 10
// 刷新方法
function refresh(params?: any, options?: any) {
  // 获取值
  const { data, next } = onRefresh(params, options)
  // 绑定对应的服务
  next(props.query(data))
}

function onTapItem(item: any, index: number) {
  emit('tapItem', { item, index })
}

function updateItem(item: any) {
  const index = list.value.findIndex(
    (x: any) => x[props.indexKey] === item[props.indexKey],
  )
  if (index !== -1) {
    list.value.splice(index, 1, item)
  }
}

function removeItem(item: any) {
  const index = list.value.findIndex(
    (x: any) => x[props.indexKey] === item[props.indexKey],
  )
  if (index !== -1) {
    list.value.splice(index, 1)
  }
}

defineExpose({
  list,
  refresh,
  updateItem,
  removeItem,
})
</script>

<template>
  <view class="list-container">
    <template v-if="!list.length">
      <slot name="empty">
        <MlEmpty mode="list" />
      </slot>
    </template>
    <template v-else>
      <view v-for="(item, index) in list" :key="item[indexKey]">
        <slot name="listItem" :item="item" :index="index" />
      </view>
      <MlLoadmore :finished="pager.finished" />
    </template>
  </view>
</template>

<style lang="scss" scoped></style>
