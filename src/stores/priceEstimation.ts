import { defineStore } from 'pinia'
import dayjs from 'dayjs/esm'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import type { AddressEntity } from '~/composables/api/address'
import { Address, AddressType } from '~/composables/api/address'
import { SendType } from '~/composables/api/order'

dayjs.extend(customParseFormat)

export const usePriceEstimationStore = defineStore('priceEstimation', () => {
  const sendType = ref<SendType>(SendType.LARGE_ITEM)
  const sender = ref<AddressEntity>(new Address())
  const receiver = ref<AddressEntity>(new Address())
  const pickupStartTime = ref<undefined | string>()
  const pickupEndTime = ref<undefined | string>()
  const cargoInfo = ref<{
    weight: number // 重量
    volume: number // 体积
  }>({
    weight: 5,
    volume: 0.001,
  })

  function setAddress(address: AddressEntity, type: AddressType) {
    if (type === AddressType.SEND) {
      sender.value = address
      ls.set('sender', address) // 保存寄件人信息到本地
    }
    else {
      receiver.value = address
    }
  }

  function getCurrentDate() {
    // 默认取件时间
    let current = dayjs().startOf('hour')
    if (current.hour() < 9) {
      current = current.hour(9)
    }
    else if (current.hour() >= 20) {
      current = current.add(1, 'day').hour(9)
    }
    else {
      current = current.hour(current.hour() + 1)
    }
    return current
  }

  async function setDefaultPickupTime() {
    // 首次打开时使用默认取件时间
    if (!pickupStartTime.value || !pickupEndTime.value || !dayjs().isBefore(pickupStartTime.value)) {
      const current = getCurrentDate()
      pickupStartTime.value = current.format(DATE.FULL_DATE_TIME)
      pickupEndTime.value = current.add(1, 'hour').format(DATE.FULL_DATE_TIME)
    }
  }

  function reset() {
    sendType.value = SendType.LARGE_ITEM
    sender.value = new Address()
    receiver.value = new Address()
    cargoInfo.value = {
      weight: 5,
      volume: 0.001,
    }
    pickupStartTime.value = undefined
    pickupEndTime.value = undefined
    setDefaultPickupTime()
  }

  return {
    sendType,
    sender,
    receiver,
    pickupStartTime,
    pickupEndTime,
    cargoInfo,
    setAddress,
    setDefaultPickupTime,
    reset,
  }
})
