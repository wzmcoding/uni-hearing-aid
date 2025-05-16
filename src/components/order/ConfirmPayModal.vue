<script setup lang="ts">
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'
import type { OrderEntity } from '~/composables/api/order'

const emit = defineEmits(['confirm', 'cancel'])

const visible = ref(false)
const info = ref<OrderEntity | undefined>()
const payWayText = ref<any>({
  sender_cash_pay: '寄付现结',
  receiver_cash_pay: '到付现结',
  monthly_settlement: '月结',
})

function cancel() {
  visible.value = false
  emit('cancel')
}
function confirm() {
  visible.value = false
  emit('confirm')
}

function show(val: OrderEntity) {
  visible.value = true
  info.value = val
}

defineExpose({
  show,
})
</script>

<template>
  <div>
    <TnPopup v-model="visible" open-direction="bottom" :z-index="20101" @close="cancel">
      <div class="pb-3 pt-6">
        <div class="text-center text-sm">
          确认账单
        </div>
        <!-- 费用明细 -->
        <div class="flex flex-col gap-2 border-b-[1px] border-secondary border-b-solid px-2.5 pb-3 pt-2">
          <MLListItem v-if="info?.payWay" label="支付方式" :value="payWayText[info?.payWay]" />
          <MLListItem v-for="(item, i) in info?.priceDetail" :key="i" :label="item.feeName" :value="`¥${utils.renderPrice(item.fee)}`" />
        </div>
        <div class="px-2.5">
          <!-- 费用合计 -->
          <div class="flex justify-end gap-1 text-sm">
            <div class="leading-7.5">
              合计
            </div>
            <div class="color-accent leading-7.5">
              ¥{{ info?.salePrice ? utils.renderPrice(info?.salePrice) : '-' }}
            </div>
          </div>
          <!-- 物品明细  暂时隐藏 -->
          <div v-if="false" class="flex flex-col gap-3 bg-muted px-2.5 py-3">
            <MLListItem title="实际重量" label="包裹体积与重量取重计算, 查看计费规则" value="0.08Kg" />
            <MLListItem title="计费重量" label="不足1kg按照1kg计算" value="1.0Kg" />
            <MLListItem title="费用计算" label="首重1.00kg*8.00元+续重" value="8元" />
          </div>
          <!-- 确认支付 -->
          <button class="mt-3 w-full py-3 text-4 btn-accent" @click="confirm">
            确认支付
          </button>
        </div>
      </div>
    </TnPopup>
  </div>
</template>

<style lang="scss" scoped>

</style>
