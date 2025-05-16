<script setup lang="ts">
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

const label = computed(() => {
  if (!modelValue.value || !modelValue.value.length) {
    return null
  }
  else {
    return modelValue.value.filter((item) => !!item).join(' ')
  }
})

const regionSelect = ref([cityPca[0].code, cityPca[0].children[0].code, cityPca[0].children[0].children[0].code])

const regionList = ref([cityPca, cityPca[0].children, cityPca[0].children[0].children])

function onChangeDistrict(pickerView: any, value: any, columnIndex: any, resolve: any) {
  const item = value[columnIndex]
  if (columnIndex === 0) {
    pickerView.setColumnData(1, item.children)
    pickerView.setColumnData(2, item.children[0].children)
  }
  else if (columnIndex === 1) {
    pickerView.setColumnData(2, item.children)
  }
  resolve()
}

function clear() {
  modelValue.value = ['', '', '']
  regionSelect.value = [cityPca[0].code, cityPca[0].children[0].code, cityPca[0].children[0].children[0].code]
}
function confirm(e: any) {
  modelValue.value = e.selectedItems.map((item: any) => item.name)
}

function initColumns(val: any) {
  const index = cityPca.findIndex((value: any) => value.name === val[0])
  const selectList = index >= 0 ? cityPca[index] : cityPca[0]
  val.forEach((item: any, i: number) => {
    if (i === 0) {
      regionSelect.value[i] = selectList.code
      regionList.value[1] = selectList.children
    }
    else {
      const index = selectList.children.findIndex((value: any) => value.name === val[1])
      const selectList1 = index >= 0 ? selectList.children[index] : selectList.children[0]
      if (i === 1) {
        regionSelect.value[i] = selectList1.code
        regionList.value[2] = selectList1.children
      }
      else if (i === 2) {
        const index = selectList1.children.findIndex((val: any) => val.name === item)
        regionSelect.value[i] = index >= 0 ? selectList1.children[index].code : selectList1.children[0].code
      }
    }
  })
}

watch(() => modelValue.value, (val: any) => {
  initColumns(val)
}, {
  immediate: true,
})
</script>

<template>
  <wd-picker
    v-model="regionSelect" :column-change="onChangeDistrict" :columns="regionList" label-key="name"
    value-key="code" use-default-slot @confirm="confirm"
  >
    <slot>
      <div class="flex items-center gap-3">
        <div
          :class="label ? 'text-foreground' : 'text-muted-foreground'"
          class="flex-1 border-b border-[#e6e6e6] border-b-solid py-2.5 pl-4.5 text-4"
        >
          {{ label ? label : placeholder }}
        </div>
        <div v-if="label" class="i-icon-park-outline-close-one text-muted-foreground" @click.stop="clear" />
        <div i-icon-park-outline-local-two class="text-muted-foreground" />
      </div>
    </slot>
  </wd-picker>
</template>

<style lang="scss" scoped>

</style>
