<script setup lang="ts">
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'
import TnSwitch from '@tuniao/tnui-vue3-uniapp/components/switch/src/switch.vue'
import { SendType } from '~/composables/api/order'

const props = withDefaults(defineProps<{
  modelValue: number
}>(), {
  modelValue: 5000,
})
const ui = useUi()

const visible = ref(false)
const orderStore = useOrderStore()
const minWeight = computed(() => {
  return orderStore.sendType === SendType.LARGE_ITEM ? 5 : 1
})
const form = ref<{
  name: string // 物品名称/类型
  weight: number // 重量
  length?: number // 长度
  width?: number // 宽度
  height?: number // 高度
  notes: string // 备注
}>({
  name: '',
  weight: 1,
  notes: '',
})
const showVolume = ref(false)
const volume = ref<number>(0.001)
// 关闭时清空体积信息
watch(showVolume, (newVal) => {
  if (!showVolume.value) {
    form.value.length = undefined
    form.value.width = undefined
    form.value.height = undefined
    volume.value = 0.001
  }
})

const typeList = ref([
  { name: '日用品', id: 0 },
  { name: '文件', id: 1 },
  { name: '食品', id: 2 },
  { name: '证件', id: 3 },
  { name: '数码家电', id: 4 },
  { name: '药品', id: 5 },
  { name: '护肤品', id: 6 },
  { name: '电瓶车', id: 7 },
  { name: '衣服', id: 8 },
])
const remarkList = ref([
  { name: '地址封闭管理，请电话与我联系', id: 0 },
  { name: '包裹会放在保卫处', id: 1 },
  { name: '包裹会放在前台', id: 2 },
  { name: '包裹会放在小区门口', id: 3 },
  { name: '包裹会放在指定地点', id: 4 },
  { name: '需要爬楼梯', id: 5 },
  { name: '带防水袋', id: 6 },
  { name: '带纸箱', id: 7 },
  { name: '带文件封', id: 8 },
  { name: '到了打电话', id: 9 },
  { name: '无法接电话', id: 10 },
])

function selectType(item: any) {
  form.value.name = item.name
  if (item.id === 7) {
    ui.showConfirm({
      title: '温馨提示',
      content: '普通物流寄电瓶车需要拆卸电瓶，如需整车托运，请点击【立即前往】',
      cancelText: '我知道了',
      confirmText: '立即前往',
      confirm: () => {
        return new Promise((resolve) => {
          utils.handleBatteryCar()
          resolve(true)
        })
      },
    })
  }
}

function clearType() {
  nextTick(() => {
    form.value.name = ''
  })
}
function selectRemark(item: any) {
  form.value.notes += `${item.name} `
  changeRemark({
    target: {
      value: form.value.notes,
    },
  })
}
function clearRemark() {
  nextTick(() => {
    form.value.notes = ''
  })
}
function changeRemark(e: any) {
  if (e.target.value.length > 30) {
    nextTick(() => {
      form.value.notes = e.target.value.slice(0, 30)
    })
  }
}

function formatNumber(e: any) {
  const parsedValue = Number(e.detail.value)
  const isInt = /^[1-9]\d*$/.test(String(parsedValue))
  nextTick(() => {
    if (Number.isNaN(parsedValue) || parsedValue < minWeight.value || !isInt) {
      // 处理非法输入，比如显示错误消息或重置字段
      if (!isInt) {
        ui.showToast('请输入正整数~')
      }
      form.value.weight = minWeight.value // 假设0是合理的默认值
    }
    else {
      form.value.weight = parsedValue
    }
  })
}

function formatLWH(e: any, key: 'length' | 'width' | 'height', defaultValue: number = 10) {
  const parsedValue = Number(e.detail.value)
  nextTick(() => {
    if (Number.isNaN(parsedValue) || !/^[1-9]\d*$/.test(String(parsedValue))) {
      form.value[key] = defaultValue
      ui.showToast('请输入正整数~')
    }
    else {
      form.value[key] = parsedValue
    }
  })
}

function formatVolume(e: any) {
  const parsedValue = e.detail.value
  nextTick(() => {
    if (Number.isNaN(parsedValue) || parsedValue < 0.001) {
      // 处理非法输入，比如显示错误消息或重置字段
      volume.value = 0.001
    }
    else {
      volume.value = parsedValue
    }
    resetLwh()
  })
}

function resetLwh() {
  form.value.length = undefined
  form.value.width = undefined
  form.value.height = undefined
}

function changeWeight(type: string) {
  if (type === 'add') {
    form.value.weight += 1
  }
  else if (type === 'reduce') {
    if (form.value.weight <= minWeight.value) {
      return
    }
    form.value.weight -= 1
  }
}
function changeVolume(type: string) {
  if (type === 'add') {
    volume.value = math.accurate(volume.value + 1, 3)
  }
  else if (type === 'reduce') {
    volume.value = math.accurate(volume.value - 1, 3)
    if (volume.value <= 0.001) {
      volume.value = 0.001
      return
    }
  }
  resetLwh()
}
function confirm() {
  const { name, weight, length, width, height, notes } = form.value
  if (showVolume.value && volume.value < 0.001) {
    ui.showToast('体积不能小于0.001m³')
    return
  }
  if (!name) {
    ui.showToast('请输入物品类型')
    return
  }
  if (!weight) {
    ui.showToast('请输入物品重量')
    return
  }
  orderStore.cargoInfo = {
    name,
    weight: weight * 1000,
    length,
    width,
    height,
    count: 1,
    volume: showVolume.value ? math.mul(volume.value, 1000000) : undefined,
  }
  orderStore.notes = notes
  close()
}

function close() {
  visible.value = false
}
function show() {
  // 回填信息
  const { cargoInfo, notes = '' } = orderStore
  if (cargoInfo) {
    const { name, weight, length, width, height, volume: volumes } = cargoInfo
    form.value = {
      name,
      weight: weight / 1000,
      notes,
      length,
      width,
      height,
    }
    volume.value = volumes ? math.div(volumes, 1000000) : 0.001
    showVolume.value = !!volumes
  }
  if (form.value.weight < minWeight.value) {
    form.value.weight = minWeight.value
  }
  visible.value = true
}

watch(() => [
  orderStore.sender,
  orderStore.receiver,
], (value, oldValue) => {
  if (value[0] && value[1] && (!oldValue[0] || !oldValue[1]) && !orderStore.cargoInfo) {
    // 首次填写完寄件信息
    show()
  }
})
watch(() => orderStore.sendType, (value, oldValue) => {
  if (orderStore.cargoInfo) {
    if (orderStore.cargoInfo.weight < minWeight.value * 1000) {
      orderStore.cargoInfo.weight = minWeight.value * 1000
    }
  }
})
watch(() => [
  form.value.length,
  form.value.width,
  form.value.height,
], (value, oldValue) => {
  if (value[0] && value[1] && value[2]) {
    const newVolume = utils.calcVolume(value[0], value[1], value[2], 'm')
    if (newVolume < 0.001 && visible.value && showVolume.value && form.value.length && form.value.width && form.value.height) {
      ui.showToast('体积不能小于0.001m³')
    }
    volume.value = newVolume < 0.001 ? 0.001 : newVolume
  }
})

const content = computed(() => {
  return `生活用品 / ${Number(props.modelValue) / 1000}kg`
})
const showPopover = ref(true)
function handleChange() {
  orderStore.cargoInfo = {
    name: '生活用品',
    weight: props.modelValue,
  }
  showPopover.value = false
}

defineExpose({
  show,
})
</script>

<template>
  <div class="my-2 flex items-center gap-1" @click="show">
    <div class="text-4 text-secondary-foreground">
      物品信息
    </div>
    <div class="rounded-sm bg-red/20 px-1 text-xs text-red">
      必填
    </div>
    <div class="flex-1" />
    <div class="flex items-center gap-1 text-4 text-muted-foreground">
      <div v-if="orderStore.cargoInfo" class="text-foreground font-bold">
        <span v-if="orderStore.cargoInfo.name">{{ orderStore.cargoInfo.name }}</span>
        <span v-else class="text-[#FA5230]">请补全物品类型</span>
        <span>/{{ orderStore.cargoInfo.weight / 1000 }}kg</span>
        <template v-if="orderStore.cargoInfo.volume">
          <span>/{{ math.accurate(math.div(orderStore.cargoInfo.volume, 1000000), 3) }}m³</span>
        </template>
      </div>
      <div v-else class="relative">
        请选择物品信息
        <div v-show="showPopover" class="absolute right-0 top-8.25 box-border rounded bg-muted-foreground px-2.5 py-1.5 text-3.25 text-background opacity-95" @click.stop="handleChange">
          <div class="flex items-center justify-between">
            <div class="flex-none whitespace-nowrap">
              {{ content }}
            </div>
          </div>
          <div class="absolute right-6 top-0 h-0 w-0 border-b-12 border-l-6 border-r-6 border-t-0 border-transparent border-b-muted-foreground border-solid opacity-95 -translate-y-1/2" />
        </div>
      </div>
      <div i-icon-park-outline-right />
    </div>
  </div>
  <TnPopup v-model="visible" open-direction="bottom" @close="close">
    <div class="mb-2.5 bg-background px-2.5 pb-2.5 pt-3.5 text-lg font-500">
      物品信息
    </div>
    <div class="max-h-80vh overflow-y-auto">
      <div class="mb-2.5 flex flex-col gap-3 bg-background px-2.5 pb-2.5 pt-3">
        <div class="flex items-center gap-2">
          <div class="font-500">
            物品信息
          </div>
          <div class="rounded-1.5 bg-destructive/12 px-1 py-0.5 text-xs color-destructive">
            必填
          </div>
          <div class="flex-1" />
          <div
            class="text-xs color-primary"
            @click="router.push(`${WEB_PREFIX}/wx/prohibitedDirectory.html`)"
          >
            哪些物品不能寄?
          </div>
        </div>
        <div class="flex items-center rounded-1 bg-muted px-2 py-4">
          <input v-model="form.name" :maxlength="10" class="flex-1 bg-muted" type="text" placeholder="请输入物品类型">
          <div class="p-2" @click="clearType">
            <div v-if="form.name" class="i-icon-park-outline-close-one bg-muted-foreground" />
          </div>
        </div>
        <div v-if="!form.name" class="grid grid-cols-3 gap-x-5 gap-y-4">
          <div
            v-for="(item, i) in typeList" :key="i" class="truncate rounded-1.5 bg-muted px-1 py-1.5 text-center"
            @click="selectType(item)"
          >
            {{ item.name }}
          </div>
        </div>
        <div v-else class="flex flex-col gap-1 bg-accent/10 px-2.5 py-2">
          <div class="text-xs font-500">
            温馨提示:
          </div>
          <div class="text-xs">
            1、请自行包装。<text class="color-destructive">
              如需包装，请及时与快递员沟通费用问题;
            </text>
          </div>
          <div class="text-xs">
            2、
            <text class="color-destructive">
              体积较大物品，
            </text>
            请咨询快递员
            <text class="color-destructive">
              是否体积重收费。
            </text>
          </div>
        </div>
      </div>
      <div class="mb-2.5 flex flex-col gap-3 bg-background px-2.5 pb-2.5 pt-3">
        <div class="flex items-center gap-2">
          <div class="font-500">
            预估重量
          </div>
          <div class="rounded-1.5 bg-destructive/12 px-1 py-0.5 text-xs color-destructive">
            必填
          </div>
          <div class="flex-1" />
          <div
            class="text-xs color-primary"
            @click.stop="router.push(`${WEB_PREFIX}/billing-rules?t=${new Date().getTime()}`)"
          >
            计费规则
          </div>
        </div>
        <div class="px-8.5">
          <div class="h-9 flex items-center rounded-full bg-muted-foreground/20">
            <div class="h-full w-15 flex items-center justify-center" @click="changeWeight('reduce')">
              <div class="i-icon-park-outline-minus" />
            </div>
            <div class="h-full flex flex-1 items-center justify-center gap-2 bg-muted px-3">
              <input
                v-model="form.weight" class="flex justify-center bg-muted text-center text-xl font-500"
                type="number" @blur="formatNumber"
              >
              <div>
                Kg
              </div>
            </div>
            <div class="h-full w-15 flex items-center justify-center" @click="changeWeight('add')">
              <div class="i-icon-park-outline-plus" />
            </div>
          </div>
        </div>
        <div class="text-center text-xs color-muted-foreground">
          体积较大物品涉及体积重计费，实际重量以快递员测量核重为准。
        </div>
      </div>
      <div class="mb-2.5 flex flex-col gap-3 bg-background px-2.5 pb-2.5 pt-3">
        <div class="flex items-center gap-2">
          <div class="font-500">
            体积
          </div>
          <div class="flex-1 text-right text-muted-foreground">
            补充体积预估费用更准确
          </div>
          <TnSwitch v-model="showVolume" class="flex" />
        </div>
        <div v-if="showVolume" class="flex items-center px-8.5">
          <!-- {{ volume }}m³ -->
          <div class="h-9 flex items-center rounded-full bg-muted-foreground/20">
            <div class="h-full w-15 flex items-center justify-center" @click="changeVolume('reduce')">
              <div class="i-icon-park-outline-minus" />
            </div>
            <div class="h-full flex flex-1 items-center justify-center gap-2 bg-muted px-3">
              <input
                v-model.number="volume" class="flex justify-center bg-muted text-center text-xl font-500"
                type="number" @blur="formatVolume"
              >
              <div>
                m³
              </div>
            </div>
            <div class="h-full w-15 flex items-center justify-center" @click="changeVolume('add')">
              <div class="i-icon-park-outline-plus" />
            </div>
          </div>
        </div>
        <div v-if="showVolume" class="flex items-center justify-center">
          <div v-if="volume > 1" class="mr-4 text-destructive">
            体积较大，请确认体积单位为m³
          </div>
        </div>
        <div v-if="showVolume" class="flex items-center justify-center gap-2">
          <div class="rounded bg-muted">
            <MLInput
              v-model="form.length" clearable type="number" text-align="center" :border="false"
              placeholder="长(cm)" @blur="(e) => formatLWH(e, 'length')"
            />
          </div>
          <div class="i-carbon-close text-lg" />
          <div class="rounded bg-muted">
            <MLInput
              v-model="form.width" clearable type="number" text-align="center" :border="false"
              placeholder="宽(cm)" @blur="(e) => formatLWH(e, 'width')"
            />
          </div>
          <div class="i-carbon-close text-lg" />
          <div class="rounded bg-muted">
            <MLInput
              v-model="form.height" clearable type="number" text-align="center" :border="false"
              placeholder="高(cm)" @blur="(e) => formatLWH(e, 'height')"
            />
          </div>
        </div>
      </div>
      <div class="flex flex-col gap-3 bg-background px-2.5 pb-20 pt-3">
        <div class="font-500">
          上门备注
        </div>
        <div class="items-center rounded-1 bg-muted px-2 py-2">
          <textarea
            v-model="form.notes" :show-count="false" class="h-15 bg-muted" type="textArea" placeholder="请输入上门备注"
            @input="changeRemark"
          />
          <div class="mt-1 flex justify-end gap-3.5 text-sm">
            <div class="color-primary" @click="clearRemark">
              清空
            </div>
            <div class="color-muted-foreground">
              {{ form.notes.length }} / 30
            </div>
          </div>
        </div>
        <div class="flex flex-wrap gap-2.5">
          <div
            v-for="(item, i) in remarkList" :key="i"
            class="truncate border-1 rounded-1.5 border-solid px-2.5 py-1.5 text-center" @click="selectRemark(item)"
          >
            {{ item.name }}
          </div>
        </div>
      </div>
      <div class="fixed left-0 right-0 z-100 flex bg-background px-2.5 pb-2.5 pt-3 bottom-0-safe">
        <button class="w-full btn py-3.5" @click="confirm">
          确定
        </button>
      </div>
    </div>
  </TnPopup>
</template>

<style lang="scss" scoped>

</style>
