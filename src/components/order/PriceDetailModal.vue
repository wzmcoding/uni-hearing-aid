<script setup lang="ts">
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'
import type { OrderEntity } from '~/composables/api/order'

const orderStore = useOrderStore()
const ui = useUi()
const visible = ref(false)
const info = ref<OrderEntity | undefined>()
function cancel() {
  visible.value = false
}

function show(val: OrderEntity) {
  visible.value = true
  info.value = val
}

const preferentialPrice = computed(() => {
  const fee = info.value?.priceDetail?.filter((v: any) => v?.feeType !== 'BASE').reduce((acc, cur: any) => acc + cur?.fee, 0) || 0
  const totalFee = fee + Number(utils.withDefault(info.value?.originalFreightPrice, 0))
  if (info.value?.salePrice) {
    return totalFee - Number(utils.withDefault(info.value?.salePrice, 0))
  }
  else {
    return totalFee - Number(utils.withDefault(info.value?.estimatePrice, 0))
  }
})

const filterPriceDetail = computed(() => {
  if (!info.value?.priceDetail) {
    return []
  }
  return info.value?.priceDetail?.filter((v: any) => v?.feeType !== 'BASE')
})

const isShow = ref(true)
// 去补缴
async function handlePay() {
  try {
    await orderStore.toPay(info.value!)
    ui.showToast('支付成功')
    router.push({ path: '/pages/order/paySuccess' })
  }
  catch (e: any) {
    ui.showToast(e.message)
  }
}

defineExpose({
  show,
})
</script>

<template>
  <div>
    <TnPopup v-model="visible" width="95%" open-direction="bottom" @close="cancel">
      <div class="pb-3 pt-3">
        <div class="mb-2 border-b border-b-[1px] border-secondary border-b-solid px-3 pb-3 text-center text-lg font-500">
          详情
        </div>
        <div class="my-2 flex items-center justify-between bg-accent/10 px-3 py-1 text-3.5 text-sm color-accent font-bold" @click="isShow = !isShow">
          <div>费用明细</div>
          <div>
            <div v-if="isShow" i-carbon-chevron-down />
            <div v-else i-carbon-chevron-right />
          </div>
        </div>
        <template v-if="isShow">
          <div class="flex items-center justify-between px-3 text-3.5 font-bold">
            <div>{{ `${!info?.salePrice ? '预估运费' : '计费运费'}` }}</div>
            <div class="color-accent">
              {{ !info?.salePrice ? utils.renderPrice(info?.estimatePrice) : utils.renderPrice(info?.salePrice) }}元
            </div>
          </div>
          <div class="flex flex-col gap-2 px-3 pb-3 pt-2">
            <div class="flex items-center justify-between text-3.5 font-bold">
              <div>基础运费</div>
              <div v-if="preferentialPrice > 0">
                {{ info?.originalFreightPrice ? utils.renderPrice(info?.originalFreightPrice) : '--' }}元
              </div>
              <div v-else>
                {{ !info?.salePrice ? utils.renderPrice(info?.estimatePrice) : utils.renderPrice(info?.salePrice) }}元
              </div>
            </div>
            <MLListItem v-for="(item, i) in filterPriceDetail" :key="i" :label="item.feeName" :value="`${utils.renderPrice(item.fee)}元`" />
            <div class="flex items-center justify-between text-3">
              <div>{{ `${!info?.salePrice ? '预估类型' : '计费类型'}` }}</div>
              <div>{{ `${!info?.salePrice ? '按重量预估' : '按重量计费'}` }}</div>
            </div>
            <div class="flex items-center justify-between text-3 text-secondary-foreground">
              <div>重量</div>
              <div>{{ info?.cargo?.weight ? `${math.div(info?.cargo?.weight!, 1000)}kg` : '请填写物品重量' }}</div>
            </div>
            <div v-if="preferentialPrice > 0" class="flex items-center justify-between text-3.5 font-bold">
              <div>优惠金额</div>
              <div class="text-destructive">
                {{ utils.renderPrice(preferentialPrice) }}元
              </div>
            </div>
          </div>
        </template>
        <!-- 费用详情 -->
        <template v-if="info && info?.fundFlows">
          <div class="mb-1 ml-3 color-primary font-semibold">
            费用详情
          </div>
          <FeeItem v-for="item in info?.fundFlows" :key="item?.id" :item="item" :info="info" />
        </template>
        <div class="mt-1 px-3">
          合计: ￥{{ !info?.salePrice ? utils.renderPrice(info?.estimatePrice) : utils.renderPrice(info?.salePrice) }}元
        </div>
        <div v-if="PayStatus.PAYING === info?.payStatus || PayStatus.SUPPLEMENTARY_FREIGHT_PAYING === info?.payStatus" class="px-3">
          <button class="mt-2 h-11 w-full btn-accent text-4" @click="handlePay">
            需补缴￥{{ utils.renderPrice(info?.paymentFlow?.amount) }}元  立即支付
          </button>
        </div>
        <div v-else class="px-3">
          <button class="mt-2 h-11 w-full btn-accent text-4" @click="cancel">
            我知道了
          </button>
        </div>
      </div>
    </TnPopup>
  </div>
</template>
