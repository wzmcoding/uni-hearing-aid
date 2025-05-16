<script lang="ts" setup>
import debounce from 'debounce'
import { AddressType } from '~/composables/api/address'

const emit = defineEmits(['search'])
const keyword = ref('')

const type = ref<null | AddressType>(null)
const tabs = ref([
  {
    label: '全部',
    value: null,
  },
  {
    label: '寄件人',
    value: AddressType.SEND,
  },
  {
    label: '收件人',
    value: AddressType.RECEIVE,
  },

])

const debouncedSearch = debounce(() => {
  onChange()
}, 1000)

function passiveSearch() {
  debouncedSearch()
}

function activeSearch() {
  onChange()
  // 避免input事件导致重复触发
  nextTick(() => {
    debouncedSearch.cancel()
  })
}

// watch(keyword, () => {
//   passiveSearch()
// })
watch(type, () => {
  activeSearch()
})

async function onChange() {
  emit('search', {
    keyword: keyword.value,
    type: type.value,
  })
}
</script>

<template>
  <div class="flex items-center justify-center gap-3 px-5 py-2">
    <div class="flex flex-1 items-center gap-1 rounded-lg bg-background text-sm">
      <MLInput
        v-model="keyword"
        class="flex-1"
        placeholder="输入姓名、地址进行搜索"
        :border="false"
        clearable
        @clear="activeSearch"
        @confirm="activeSearch"
        @input="passiveSearch"
      >
        <template #prefix>
          <div i-icon-park-outline-search class="text-secondary-foreground" />
        </template>
      </MLInput>
    </div>
    <div v-if="false" class="flex items-center gap-2 text-secondary-foreground">
      <div
        v-for="(tab, index) in tabs" :key="index" class="text-3.5" :class="{ 'text-primary': type === tab.value }"
        @click="type = tab.value"
      >
        {{ tab.label }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>
