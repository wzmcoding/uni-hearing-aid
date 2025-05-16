<script setup lang="ts">
import dayjs from 'dayjs'

const useStore = usePriceEstimationStore()

const visible = ref(false)

const oldActiveDate = ref([0, 0])
const activeDate = ref([0, 0])
const currentHour = ref(dayjs().hour())

const dayList = computed(() => {
  const list = []
  if (currentHour.value < 20) { // 超过18点就只能选明天
    list.push({ label: '今天', value: 0 })
  }
  list.push({ label: '明天', value: 1 })
  list.push({ label: '后天', value: 2 })
  return list
})
const hourList = computed(() => {
  const list = []
  let start = 9
  if (activeDate.value[0] === 0) { // 今天
    if (currentHour.value >= 9 && currentHour.value < 20) {
      start = currentHour.value + 1
    }
  }
  for (let i = start; i <= 20; i += 1) {
    list.push({ label: `${i}:00-${i + 1}:00`, value: i })
  }
  return list
})

const dateList = computed(() => {
  return [dayList.value.map((item) => item.label), hourList.value.map((item) => item.label)]
})

const renderPickupTime = computed(() => {
  if (useStore.pickupStartTime && useStore.pickupEndTime) {
    const startTime = dayjs(useStore.pickupStartTime, DATE.FULL_DATE_TIME)
    const endTime = dayjs(useStore.pickupEndTime, DATE.FULL_DATE_TIME)
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
  currentHour.value = dayjs().hour()
}

function confirm() {
  // close()
  setPickupTime()
  oldActiveDate.value = activeDate.value
  visible.value = false
}

// watch(activeDate, setPickupTime)

function setPickupTime() {
  const [dayIndex, hourIndex] = activeDate.value
  const day = dayList.value[dayIndex].value
  const hour = hourList.value[hourIndex].value
  const pickupStartTime = dayjs().add(day, 'day').hour(hour).startOf('hour')
  const pickupEndTime = pickupStartTime.add(1, 'hour')
  useStore.pickupStartTime = pickupStartTime.format(DATE.FULL_DATE_TIME)
  useStore.pickupEndTime = pickupEndTime.format(DATE.FULL_DATE_TIME)
}

defineExpose({
  show,
})
</script>

<template>
  <div class="my-2 flex items-center">
    <div class="text-4 text-secondary-foreground">
      期望上门时间
    </div>
    <div class="flex-1" />
    <div class="flex items-center gap-1 text-4 text-muted-foreground" @click="show">
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
        期望上门时间
      </div>
      <!-- <div class="text-sm">
        请至少提前半小时预约上门时间，若是紧急件请与快递员沟通，实际上门时间以协商后的为准
      </div> -->
      <!-- <div class="mt-1 text-sm color-destructive">
        实际上门时间，以快递员电话沟通为准!
      </div> -->
      <MLPickerView v-model="activeDate" :options="dateList" />
      <div class="flex bg-background px-2.5 pb-2.5 pt-3">
        <button class="w-full btn py-3.5" @click="confirm">
          确定
        </button>
      </div>
    </div>
  </MLPopup>
</template>

<style lang="scss" scoped></style>
