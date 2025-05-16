<script setup lang="ts">
import type { FundFlowsEntity, OrderEntity } from '~/composables/api/order'

withDefaults(defineProps<{ info?: Partial<Pick<OrderEntity, 'payWay' | 'createTime'>>, item?: Partial<FundFlowsEntity> }>(), {
  info: () => ({}),
  item: () => ({}),
})

const isShow = ref(false)
</script>

<template>
  <div>
    <div
      class="my-2 flex items-center justify-between bg-primary/10 px-3 py-1 text-3.5 text-sm font-bold"
      @click="isShow = !isShow"
    >
      <div>
        <span class="mr-1.5">{{ item.fundFlowType && FundFlowType[item.fundFlowType] }}</span>
        <span>{{ item?.createTime }}</span>
      </div>
      <div class="flex gap-1">
        <div v-if="'FREIGHT_PAY' === item.fundFlowType">
          {{ item.fundStatus === FundStatus.PENDING ? "待支付" : "已支付" }}
        </div>
        <div v-if="'FREIGHT_REFUND' === item.fundFlowType">
          {{ item.fundStatus === FundStatus.PENDING ? "未退款" : "已退款" }}
        </div>
        <div v-if="'SUPPLEMENTARY_FREIGHT_PAY' === item.fundFlowType">
          {{ item.fundStatus === FundStatus.PENDING ? "待支付" : "已支付" }}
        </div>
        <div v-show="isShow" i-carbon-chevron-down />
        <div v-show="!isShow" i-carbon-chevron-right />
      </div>
    </div>
    <div v-show="isShow" class="flex flex-col gap-2 px-3">
      <div class="flex items-center justify-between text-3.5 font-bold">
        <div>费用金额</div>
        <div>{{ item?.amount ? utils.renderPrice(item?.amount) : '--' }}元</div>
      </div>
      <div class="flex items-center justify-between text-3.5 font-bold">
        <div>费用说明</div>
        <div>{{ item.fundFlowNotes }}</div>
      </div>
      <MLListItem v-if="info?.payWay" label="付款方式" value="微信支付" />
    </div>
  </div>
</template>
