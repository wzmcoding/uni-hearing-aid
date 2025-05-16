import { defineStore } from 'pinia'
import dayjs from 'dayjs/esm'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import type { AddressEntity } from '~/composables/api/address'
import { AddressType } from '~/composables/api/address'
import type { CargoEntity, OrderEntity } from '~/composables/api/order'
import { OrderPayer, SendType } from '~/composables/api/order'
import type { ExpressProductPickupTime, ExpressProductQuoteEntity } from '~/composables/api/app'

dayjs.extend(customParseFormat)

const service = useService()
export const useOrderStore = defineStore('order', () => {
  const sender = ref<undefined | AddressEntity>(ls.get('sender'))
  const receiver = ref<undefined | AddressEntity>()
  const cargoInfo = ref<undefined | CargoEntity>()
  const pickupStartTime = ref<undefined | string>()
  const pickupEndTime = ref<undefined | string>()
  const notes = ref<undefined | string>()
  const transport = ref<undefined | ExpressProductQuoteEntity>()
  const payer = ref<undefined | OrderPayer>(OrderPayer.SENDER)
  const sendType = ref<SendType>(SendType.EXPRESS)
  const countWaitingPay = ref<undefined | number>()
  const isPay = ref<undefined | boolean>(true)
  const pickupTime = ref<ExpressProductPickupTime>({
    today: [],
    tomorrow: [],
    viewModel: 0,
    tips: '',
    text: '',
  })

  const ready = computed(() => {
    return !!(sender.value && receiver.value && cargoInfo.value)
  })

  async function queryOverView() {
    const res = await service.order.overView()
    if (res.countWaitingPay && res.countWaitingPay > 0) {
      countWaitingPay.value = res.countWaitingPay
    }
    else {
      countWaitingPay.value = '' as any
    }
  }

  async function toPay(info: Pick<OrderEntity, 'id' | 'paymentFlow'>) {
    const { data: orderInfo } = await service.order.pay({
      orderId: info?.id,
      paymentFlowId: info?.paymentFlow?.id,
      payAmount: info?.paymentFlow?.amount,
    })
    const { packageValue, ...others } = orderInfo
    const params = {
      package: packageValue,
      ...others,
    }
    return new Promise((resolve, reject) => {
      uni.requestPayment({
        provider: 'wxpay',
        ...params,
        success(res: any) {
          resolve(res)
        },
        fail(e: any) {
          reject(new Error('支付失败'))
        },
      })
    })
  }

  /**
   * 顺心捷达去支付
   * @param info
   * @returns
   */
  function pay(info: string) {
    if (!info) {
      return
    }
    try {
      const { appId, url } = JSON.parse(info)
      uni.navigateToMiniProgram({
        appId,
        path: url,
        success(res: any) {
          console.log('跳转成功', res)
        },
        fail(err: any) {
          throw new Error(err.errMsg)
        },
      })
    }
    catch (e: any) {
      console.log(e.errMsg)
    }
  }

  function setAddress(address: AddressEntity, type: AddressType) {
    if (type === AddressType.SEND) {
      sender.value = address
      ls.set('sender', address) // 保存寄件人信息到本地
    }
    else {
      receiver.value = address
    }
  }

  function equalsAddress(address: AddressEntity, type: AddressType) {
    if (type === AddressType.SEND) {
      return sender.value?.id === address.id
    }
    else {
      return receiver.value?.id === address.id
    }
  }

  function setDefaultTime() {
    if (pickupTime.value.today.length) {
      pickupStartTime.value = dayjs().startOf('day').add(dayjs(pickupTime.value.today[0].split('-')[0], 'HH:mm').hour(), 'hour').format(DATE.FULL_DATE_TIME)
      pickupEndTime.value = dayjs().startOf('day').add(dayjs(pickupTime.value.today[0].split('-')[1], 'HH:mm').hour(), 'hour').format(DATE.FULL_DATE_TIME)
    }
    else {
      if (pickupTime.value.viewModel === 0 && pickupTime.value.tomorrow.length > 0) {
        pickupStartTime.value = dayjs().add(1, 'day').startOf('day').add(dayjs(pickupTime.value.tomorrow[0].split('-')[0], 'HH:mm').hour(), 'hour').format(DATE.FULL_DATE_TIME)
        pickupEndTime.value = dayjs().add(1, 'day').startOf('day').add(dayjs(pickupTime.value.tomorrow[0].split('-')[1], 'HH:mm').hour(), 'hour').format(DATE.FULL_DATE_TIME)
      }
    }
  }
  async function setDefaultPickupTime() {
    if (!pickupStartTime.value || !pickupEndTime.value) {
      // 没有取件时间，设置默认取件时间
      setDefaultTime()
    }
    else {
      const startTime = dayjs(pickupStartTime.value).format('HH:mm')
      const endTime = dayjs(pickupEndTime.value).format('HH:mm')
      const str = `${startTime}-${endTime}`
      if (dayjs().isSame(dayjs(pickupStartTime.value), 'day')) {
        if (!pickupTime.value.today.includes(str)) {
          setDefaultTime()
        }
      }
      else {
        if (!pickupTime.value.tomorrow.includes(str)) {
          setDefaultTime()
        }
      }
    }
  }

  function reset() {
    receiver.value = undefined
    cargoInfo.value = undefined
    pickupStartTime.value = undefined
    pickupEndTime.value = undefined
    notes.value = undefined
    transport.value = undefined
    payer.value = OrderPayer.SENDER
    sendType.value = SendType.EXPRESS
    countWaitingPay.value = undefined
    setDefaultPickupTime()
    pickupTime.value = {
      today: [],
      tomorrow: [],
      viewModel: 0,
      tips: '',
      text: '',
    }
  }

  return {
    sender,
    receiver,
    setAddress,
    equalsAddress,
    cargoInfo,
    pickupStartTime,
    pickupEndTime,
    notes,
    transport,
    payer,
    sendType,
    ready,
    reset,
    countWaitingPay,
    isPay,
    queryOverView,
    toPay,
    pay,
    setDefaultPickupTime,
    pickupTime,
  }
})
