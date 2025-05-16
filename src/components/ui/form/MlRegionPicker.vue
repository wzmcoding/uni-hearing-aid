<script lang="ts" setup>
import TnInput from '@tuniao/tnui-vue3-uniapp/components/input/src/input.vue'
import cityPca from '~/static/city/city-pca.json'

defineProps({
  placeholder: {
    type: String,
    default: '请选择地区',
  },
})

const modelValue = defineModel<string[]>({
  type: Array,
})

function onRegionChange(e: any) {
  modelValue.value = e.detail.value
}

const label = computed(() => {
  if (!modelValue.value || !modelValue.value.length) {
    return null
  }
  else {
    return modelValue.value.filter((item) => !!item).join(' ')
  }
})

function clear() {
  modelValue.value = ['', '', '']
}

// toutiao h5适配
// #ifdef H5 || MP-TOUTIAO
const regionSelect = ref([0, 0, 0])
const provinceList: any = computed(() => {
  return cityPca
})
const cityList: any = computed(() => {
  const index = regionSelect.value[0]
  return provinceList.value[index].children
})
const areaList: any = computed(() => {
  const index = regionSelect.value[1]
  return cityList.value[index].children
})
const regionList = computed(() => {
  return [provinceList.value, cityList.value, areaList.value]
})
function onRegionOtherChange(e: any) {
  let value = e.detail.value
  value = value.map((item: any, i: number) => {
    return regionList.value[i][item].name
  })
  modelValue.value = value
}

function onRegionColumnChange(e: any) {
  const column = e.detail.column
  const value = e.detail.value
  regionSelect.value[column] = value
  if (column === 0) {
    regionSelect.value[1] = 0
    regionSelect.value[2] = 0
  }
  else if (column === 1) {
    regionSelect.value[2] = 0
  }
}
function clearOther() {
  modelValue.value = ['', '', '']
  regionSelect.value = [0, 0, 0]
}
watch(() => modelValue.value, (val: any) => {
  val.forEach((item: any, i: number) => {
    const index = regionList.value[i].findIndex((val: any) => val.name === item)
    regionSelect.value[i] = index >= 0 ? index : 0
  })
}, {
  immediate: true,
})
// #endif
</script>

<template>
  <!-- #ifdef MP-TOUTIAO || H5 -->
  <picker
    mode="multiSelector" :value="regionSelect" :range="regionList" range-key="name" @change="onRegionOtherChange"
    @columnchange="onRegionColumnChange"
  >
    <div class="flex items-center">
      <slot>
        <TnInput
          class="flex-1" type="select" :model-value="label" :placeholder="placeholder" clearable underline
          @clear="clearOther"
        >
          <template #suffix>
            <div i-icon-park-outline-local-two class="text-muted-foreground" />
          </template>
        </TnInput>
      </slot>
    </div>
  </picker>
  <!-- #endif -->
  <!-- #ifdef MP-WEIXIN -->
  <picker mode="region" :value="modelValue" @change="onRegionChange">
    <div class="flex items-center">
      <slot>
        <TnInput
          class="flex-1" type="select" :model-value="label" :placeholder="placeholder" clearable underline
          @clear="clear"
        >
          <template #suffix>
            <div i-icon-park-outline-local-two class="text-muted-foreground" />
          </template>
        </TnInput>
      </slot>
    </div>
  </picker>
  <!-- #endif -->
  <!-- #ifdef MP-ALIPAY -->
  <MLRegionPickerAlipay v-model="modelValue" :placeholder="placeholder" />
  <!-- #endif -->
</template>

<style lang="scss" scoped>

</style>
