<script setup lang="ts">
import dayjs from 'dayjs/esm'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)
const orderStore = useOrderStore()

const visible = ref(false)

const oldActiveDate = ref([0, 0])
const activeDate = ref([0, 0])

const dayList = computed(() => {
  const list = []
  if (orderStore.pickupTime.today.length > 0) {
    list.push({ label: '今天', value: 0 })
  }
  list.push({ label: '明天', value: 1 })
  list.push({ label: '后天', value: 2 })
  return list
})
const hourList = computed(() => {
  if (orderStore.pickupTime.viewModel === 0) {
    if (activeDate.value[0] === 0 && orderStore.pickupTime.today.length > 0) {
      return orderStore.pickupTime.today.map((item) => ({ label: item, value: dayjs(item.split('-')[0], 'HH:mm').hour() }))
    }
    else if (orderStore.pickupTime.tomorrow.length > 0) {
      return orderStore.pickupTime.tomorrow.map((item) => ({ label: item, value: dayjs(item.split('-')[0], 'HH:mm').hour() }))
    }
  }
  return []
})

const dateList = computed(() => {
  return [dayList.value.map((item) => item.label), hourList.value.map((item) => item.label)]
})

const renderPickupTime = computed(() => {
  if (orderStore.pickupStartTime && orderStore.pickupEndTime) {
    const startTime = dayjs(orderStore.pickupStartTime, DATE.FULL_DATE_TIME)
    const endTime = dayjs(orderStore.pickupEndTime, DATE.FULL_DATE_TIME)
    const today = dayjs()
    let renderStr = ''
    if (startTime.isSame(today, 'day')) {
      renderStr += '今天'
    }
    else if (startTime.isSame(today.add(1, 'day'), 'day')) {
      renderStr += '明天'
    }
    else if (startTime.isSame(today.add(2, 'day'), 'day')) {
      renderStr += '后天'
    }
    else {
      renderStr += `${startTime.format('MM月DD日')}`
    }
    renderStr += ` ${startTime.format('HH:mm')}-${endTime.format('HH:mm')}`
    return renderStr
  }
  return ''
})

function close() {
  visible.value = false
  activeDate.value = oldActiveDate.value
}

function show() {
  visible.value = true
  oldActiveDate.value = activeDate.value
}

function confirm() {
  setPickupTime()
  oldActiveDate.value = activeDate.value
  visible.value = false
}

function setPickupTime() {
  const [dayIndex, hourIndex] = activeDate.value
  const day = dayList.value[dayIndex].value
  const hour = hourList.value[hourIndex].value
  const pickupStartTime = dayjs().add(day, 'day').hour(hour).startOf('hour')
  const pickupEndTime = pickupStartTime.add(1, 'hour')
  orderStore.pickupStartTime = pickupStartTime.format(DATE.FULL_DATE_TIME)
  orderStore.pickupEndTime = pickupEndTime.format(DATE.FULL_DATE_TIME)
}

function setActiveDate(val: [number, number]) {
  activeDate.value = val
}
defineExpose({
  show,
  setActiveDate,
})
</script>

<template>
  <div class="my-2 flex items-center">
    <div class="text-4 text-secondary-foreground">
      预计上门时间
    </div>
    <div class="flex-1" />
    <div
      v-if="orderStore.pickupTime.viewModel === 1"
      class="flex items-center gap-1 text-4 text-foreground font-bold"
    >
      {{ orderStore.pickupTime.text }}
    </div>
    <div v-else class="flex items-center gap-1 text-4 text-muted-foreground" @click="show">
      <div v-if="renderPickupTime" class="text-foreground font-bold">
        {{ renderPickupTime }}
      </div>
      <div v-else>
        请选择上门时间
      </div>
      <div i-icon-park-outline-right />
    </div>
  </div>
  <MLPopup v-model="visible" @close="close">
    <div class="px-2.5 py-3">
      <div class="mb-5 text-4 font-500">
        预计上门时间
      </div>
      <!-- <div class="text-sm">
        请至少提前半小时预约上门时间，若是紧急件请与快递员沟通，实际上门时间以协商后的为准
      </div> -->
      <div class="mt-1 text-sm color-destructive">
        {{ orderStore.pickupTime.tips }}
      </div>
      <MLPickerView v-model="activeDate" :options="dateList" />
      <div class="flex bg-background px-2.5 pb-2.5 pt-3">
        <button class="w-full btn py-3.5" @click="confirm">
          确定
        </button>
      </div>
    </div>
  </MLPopup>
</template>

<style lang="scss" scoped>

</style>
