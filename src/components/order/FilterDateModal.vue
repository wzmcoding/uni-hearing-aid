<script setup lang="ts">
import dayjs from 'dayjs/esm'
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'
import TnCalendar from '@tuniao/tnui-vue3-uniapp/components/calendar/src/calendar.vue'
import type { FilterDateEntity } from '~/composables/api/order'

const emit = defineEmits(['confirm', 'cancel'])

const visible = ref<boolean>(false)

const dateType = ref([
  { id: 0, name: '全部' },
  { id: 1, name: '今日' },
  { id: 2, name: '昨日' },
  { id: 3, name: '最近七日' },
  { id: 4, name: '自定义' },
])

const currentType = ref<number>(0)
const customDate = ref<string[]>([])

function checkFilter(id: number) {
  currentType.value = id
}

// 取消筛选
function cancelFilter() {
  visible.value = false
}

// 确认筛选
function confirmFilter() {
  let startTime = ''
  let endTime = ''
  switch (currentType.value) {
    case 0:
      startTime = ''
      endTime = ''
      break
    case 1:
      startTime = dayjs().format('YYYY-MM-DD')
      endTime = dayjs().format('YYYY-MM-DD')
      break
    case 2:
      startTime = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      endTime = dayjs().format('YYYY-MM-DD')
      break
    case 3:
      startTime = dayjs().subtract(6, 'day').format('YYYY-MM-DD')
      endTime = dayjs().format('YYYY-MM-DD')
      break
    case 4:
      startTime = dayjs(customDate.value[0], 'YYYY/MM/DD').format('YYYY-MM-DD')
      endTime = dayjs(customDate.value[1], 'YYYY/MM/DD').format('YYYY-MM-DD')
      break
  }
  emit('confirm', { startTime, endTime, filterDateType: currentType.value })
  cancelFilter()
}

// 打开筛选
function show(val: FilterDateEntity) {
  visible.value = true
  currentType.value = val.filterDateType
  // 如果自定义时间 日期回显
  if (currentType.value === 4) {
    customDate.value = [val.startTime, val.endTime]
  }
}

defineExpose({
  show,
})
</script>

<template>
  <div>
    <TnPopup v-model="visible" open-direction="top" :z-index="20101" top="96rpx" :overlay-opacity="0">
      <div class="bg-subtitle px-2 pb-6">
        <div class="py-3">
          时间筛选
        </div>
        <div class="flex justify-between pb-2">
          <button
            v-for="(item, i) in dateType" :key="i"
            :class="item.id === currentType ? 'border-primary color-primary' : null"
            class="h-6 btn-outline border-foreground px-2 text-3.5 color-foreground font-500"
            @click="checkFilter(item.id)"
          >
            {{ item.name }}
          </button>
        </div>
        <div v-if="currentType === 4">
          <TnCalendar
            v-model="customDate" min-date="2020-01-01" :max-date="dayjs().format('YYYY-MM-DD')"
            mode="range"
          />
        </div>
        <div class="mt-6 flex justify-center gap-2">
          <button
            class="m-0 h-7.5 btn-outline border-foreground px-4 px-8 text-4 color-foreground"
            @click="cancelFilter"
          >
            取消
          </button>
          <button class="m-0 h-7.5 btn px-4 px-8 text-4" @click="confirmFilter">
            确定
          </button>
        </div>
      </div>
    </TnPopup>
  </div>
</template>

<style lang="scss" scoped>

</style>
