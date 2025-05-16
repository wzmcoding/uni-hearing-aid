<script setup lang="ts">
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'
import TnInput from '@tuniao/tnui-vue3-uniapp/components/input/src/input.vue'
import { CancelReason } from '@/composables/api/order'

const props = withDefaults(defineProps<{
  id?: string
}>(), {
})
const ui = useUi()
const service = useService()
const showPopup = ref(false)

const list = ref([
  { name: '暂时不想寄快递了', code: CancelReason.DISCARD, isCheck: false },
  { name: '运费过高', code: CancelReason.EXPENSIVE, isCheck: false },
  { name: '信息填写错误', code: CancelReason.WRONG_INFORMATION, isCheck: false },
  { name: '快递员原因', code: CancelReason.COURIER, isCheck: false },
  { name: '无法送达目的地', code: CancelReason.UNDELIVERABLE, isCheck: false },
  { name: '下错单了', code: CancelReason.WRONG_ORDER, isCheck: false },
  { name: '服务商取消', code: CancelReason.SUPPLIER_REASON, isCheck: false },
  { name: '其他原因', code: CancelReason.OTHER_REASON, isCheck: false },
])
const activeCode = ref<string>(CancelReason.DISCARD)

function checkCancel(item: any) {
  activeCode.value = item.code
  // 如果是其他原因，弹出输入框
  if (item.code === CancelReason.OTHER_REASON) {
    showPopup.value = true
  }
}
interface ICancelForm {
  orderId: string
  cancelReasonCode: string
  cancelReason?: string
}
const form = ref<ICancelForm>({
  orderId: '',
  cancelReasonCode: '',
})
const cancelReason = ref('')
function cancel() {
  showPopup.value = false
}
async function submit() {
  ui.showLoading('订单取消中...')
  try {
    form.value = {
      orderId: props.id!,
      cancelReasonCode: activeCode.value,
    }
    if (activeCode.value === CancelReason.OTHER_REASON) {
      form.value.cancelReason = cancelReason.value
    }
    await service.order.cancel(form.value)
    uni.$emit('refresh:order-cancel', {
      callback: () => {
        uni.showToast({
          title: '订单取消成功',
          icon: 'success',
        })
      },
    })
    router.back()
  }
  catch (err: any) {
  }
  finally {
    ui.hideLoading()
  }
}
</script>

<template>
  <MlPage>
    <div class="h-[100vh] flex flex-col items-center">
      <div class="mb-1 mt-7 text-xl">
        请告诉我们取消的原因
      </div>
      <div class="text-sm color-muted-foreground">
        我们努力做的更好
      </div>
      <div class="mt-3 flex flex-col gap-4">
        <div v-for="(item, i) in list" :key="i" class="flex items-center gap-2" @click="checkCancel(item)">
          <div
            :class="item.code === activeCode ? 'i-carbon-circle-solid color-primary' : 'i-carbon-radio-button color-muted-foreground'"
          />
          <div :class="item.code === activeCode ? 'color-foreground' : 'color-muted-foreground'">
            {{ item.name }}
          </div>
        </div>
      </div>
      <TnPopup v-model="showPopup" width="98%">
        <div class="p-3">
          <TnInput v-model="cancelReason" :focus="true" type="textarea" show-word-limit :maxlength="200" clearable placeholder="请输入取消原因" />
          <div class="text-right">
            <button class="mt-2 h-9 w-24 btn-accent text-4" @click="cancel">
              确定
            </button>
          </div>
        </div>
      </TnPopup>
      <div class="fixed bottom-3 w-full px-2.5">
        <button class="w-full btn py-3 text-4" @click="submit">
          提交
        </button>
      </div>
    </div>
  </MlPage>
</template>

<style lang="scss" scoped>

</style>

<route lang="yaml">
style:
  navigationBarTitleText: "取消订单"
</route>
