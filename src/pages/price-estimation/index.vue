<script setup lang="ts">
import debounce from 'debounce'
import { AddressType } from '~/composables/api/address'
import type { ExpressCompanyQuoteEntity, ExpressProductQuoteEntity } from '~/composables/api/app'

const ui = useUi()
const productsLoading = ref(false) // 询价中
const productList = ref<ExpressProductQuoteEntity[]>([])
const service = useService()
const useStore = usePriceEstimationStore()
const orderStore = useOrderStore()
const activeNames = ref<string[]>([])
const companyList = computed(() => {
  return productList.value.reduce<ExpressCompanyQuoteEntity[]>((acc, product) => {
    if (!product.loading && !product.price) {
      // 询价失败的产品，直接忽略
      return acc
    }
    let company = acc.find((company) => company.companyId === product.companyId)
    if (!company) {
      company = {
        companyId: product.companyId,
        companyName: product.companyName,
        companyLogo: product.companyLogo,
        companyCode: product.companyCode,
        products: [],
        payType: product.payType,
        pickupTime: product.pickupTime,
      }
      acc.push(company)
    }
    company.products.push(product)
    return acc
  }, [])
})
const weight = computed(() => {
  return useStore.cargoInfo?.weight
})
const volume = computed(() => {
  return useStore.cargoInfo?.volume
})

const minWeight = ref(5)

const regionSender = computed({
  get: () => {
    return [useStore.sender?.province, useStore.sender?.city, useStore.sender?.district]
  },
  set: (value) => {
    useStore.sender.province = value[0]
    useStore.sender.city = value[1]
    useStore.sender.district = value[2]
  },
})

const regionReceiver = computed({
  get: () => {
    return [useStore.receiver?.province, useStore.receiver?.city, useStore.receiver?.district]
  },
  set: (value) => {
    useStore.receiver.province = value[0]
    useStore.receiver.city = value[1]
    useStore.receiver.district = value[2]
  },
})

function clearSender() {
  useStore.sender.province = ''
  useStore.sender.city = ''
  useStore.sender.district = ''
}
function clearReceiver() {
  useStore.receiver.province = ''
  useStore.receiver.city = ''
  useStore.receiver.district = ''
}

function openAddAddress(type: AddressType) {
  router.push({
    path: '/pages/price-estimation/address-identify',
    query: {
      type,
    },
  })
}

function formatNumber(e: any) {
  const parsedValue = Number.parseInt(e.detail.value.replace(/\D/g, ''), 10)
  nextTick(() => {
    if (Number.isNaN(parsedValue) || parsedValue < minWeight.value) {
      // 处理非法输入，比如显示错误消息或重置字段
      useStore.cargoInfo.weight = minWeight.value // 假设0是合理的默认值
    }
    else {
      useStore.cargoInfo.weight = parsedValue
    }
  })
}

function formatVolume(e: any) {
  const parsedValue = e.detail.value
  nextTick(() => {
    if (Number.isNaN(parsedValue) || parsedValue < 0.001) {
      // 处理非法输入，比如显示错误消息或重置字段
      useStore.cargoInfo.volume = 0.001
    }
    else {
      useStore.cargoInfo.volume = parsedValue
    }
  })
}

function changeWeight(type: string) {
  if (type === 'add') {
    useStore.cargoInfo.weight += 1
  }
  else if (type === 'reduce') {
    if (useStore.cargoInfo.weight <= minWeight.value) {
      return
    }
    useStore.cargoInfo.weight -= 1
  }
}
function changeVolume(type: string) {
  if (type === 'add') {
    useStore.cargoInfo.volume = math.accurate(useStore.cargoInfo.volume + 1, 3)
  }
  else if (type === 'reduce') {
    useStore.cargoInfo.volume = math.accurate(useStore.cargoInfo.volume - 1, 3)
    if (useStore.cargoInfo.volume <= 0.001) {
      useStore.cargoInfo.volume = 0.001
    }
  }
}

async function getProductPrice(product: ExpressProductQuoteEntity) {
  try {
    const { sender, receiver, cargoInfo, pickupStartTime, pickupEndTime, sendType } = useStore
    const newCargoInfo = { ...cargoInfo, weight: cargoInfo.weight * 1000, volume: math.mul(cargoInfo.volume, 1000000) }
    const res = await service.app.getProductPrice({
      sender: sender!,
      receiver: receiver!,
      cargo: newCargoInfo!,
      pickupStartTime: pickupStartTime!,
      pickupEndTime: pickupEndTime!,
      sendType,
      searchType: 0,
      transportId: product.transportId,
      payer: OrderPayer.SENDER,
      payType: PayWay.MONTHLY_SETTLEMENT,
    })
    if (!res.price) {
      // 价格排序之后选择price最小的，会导致页面样式不对
      throw new Error('询价结果为0')
    }
    product.totalPrice = res.totalPrice
    product.price = res.price
    product.expectedDeliveryTime = res.expectedDeliveryTime
    product.priceDetail = res.priceDetail
  }
  catch (e) {
    console.log(e)
    // 询价失败时将当前产品移除
    productList.value = productList.value.filter((p) => p.transportId !== product.transportId)
  }
  finally {
    product.loading = false
  }
}
function sortProducts(products: ExpressProductQuoteEntity[]) {
  return products.sort((productA, productB) => {
    const companySortA = utils.withDefault(productA.companySort, Number.MAX_SAFE_INTEGER)
    const companySortB = utils.withDefault(productB.companySort, Number.MAX_SAFE_INTEGER)
    // 先按 companySort 排序，如果相同再按 price 排序
    return companySortA - companySortB || (productA.price! - productB.price!)
  })
}
async function getProducts() {
  productsLoading.value = true
  try {
    const { sender, receiver, cargoInfo, pickupStartTime, pickupEndTime, sendType } = useStore
    const newCargoInfo = { ...cargoInfo, weight: cargoInfo.weight * 1000, volume: math.mul(cargoInfo.volume, 1000000) }
    const res = await service.app.productList({
      sender: sender!,
      receiver: receiver!,
      cargoInfo: newCargoInfo!,
      pickupStartTime: pickupStartTime!,
      pickupEndTime: pickupEndTime!,
      sendType,
      searchType: 0,
    })
    res.forEach((product) => {
      product.loading = true
    })
    productList.value = res
    await Promise.allSettled(productList.value.map((product) => getProductPrice(product)))
    await nextTick()
    sortProducts(productList.value)
  }
  catch (e) {
    console.log(e)
  }
  finally {
    // estimating.value = false
    productsLoading.value = false
  }
}
const debouncedGetProducts = debounce(() => {
  getProducts()
}, 1000)
function search() {
  const { sender, receiver } = useStore
  const { province: sProvince, city: sCity, district: sDistrict } = sender
  const { province: rProvince, city: rCity, district: rDistrict } = receiver
  if (!sProvince || !sCity || !sDistrict || !rProvince || !rCity || !rDistrict) {
    ui.showToast('请先选择寄件城市和收件城市')
    return
  }
  debouncedGetProducts()
}

function goSend() {
  const { sender, receiver, cargoInfo } = useStore
  const { province: sProvince, city: sCity, district: sDistrict } = sender
  const { province: rProvince, city: rCity, district: rDistrict } = receiver
  if (sProvince || sCity || sDistrict) {
    orderStore.setAddress(sender, AddressType.SEND)
  }
  if (rProvince || rCity || rDistrict) {
    orderStore.setAddress(receiver, AddressType.RECEIVE)
  }
  const newCargoInfo = { ...cargoInfo, weight: cargoInfo.weight * 1000, volume: math.mul(cargoInfo.volume, 1000000) }
  orderStore.cargoInfo = newCargoInfo
  router.push({
    path: '/pages/send',
  })
  useStore.reset()
}

onShow(() => {
  useStore.setDefaultPickupTime()
})
</script>

<template>
  <MlPage>
    <div class="relative z-0 px-2 pb-[270rpx]">
      <div class="gradient-page-top-bg absolute left-0 right-0 top-0 z--1 h-80 p-2" />
      <div class="mb-2 card py-2">
        <div class="flex items-center">
          <div class="flex items-center self-stretch p-3">
            <div class="h-5 w-5 flex items-center justify-center rounded bg-primary text-primary-foreground">
              寄
            </div>
          </div>

          <div class="flex flex-1 flex-col gap-1">
            <div class="flex gap-1 text-4">
              <MlRegionPicker v-model="regionSender" placeholder="请选择地区">
                <div class="flex-1 font-500">
                  <template v-if="useStore.sender?.province && useStore.sender?.city && useStore.sender?.district">
                    {{ useStore.sender?.province }} {{ useStore.sender?.city }} {{ useStore.sender?.district }}
                  </template>
                  <template v-else>
                    点击选择寄件城市
                  </template>
                </div>
              </MlRegionPicker>
              <div class="flex-1" />
              <div
                v-if="useStore.sender?.province && useStore.sender?.city && useStore.sender?.district"
                i-carbon-close-outline class="flex-none text-secondary-foreground" @click.stop="clearSender"
              />
            </div>
          </div>
          <div class="ml-3 self-stretch py-3">
            <div class="divider-v" />
          </div>

          <div class="flex items-center self-stretch p-3" @click="openAddAddress(AddressType.SEND)">
            地址识别
          </div>
        </div>
        <div class="my-2 divider" />
        <div class="flex items-center">
          <div class="flex items-center self-stretch p-3">
            <div class="h-5 w-5 flex items-center justify-center rounded bg-accent text-primary-foreground">
              收
            </div>
          </div>
          <div class="flex flex-1 flex-col gap-1">
            <div class="flex gap-1 text-4">
              <MlRegionPicker v-model="regionReceiver" placeholder="请选择地区">
                <div class="flex-1 font-500">
                  <template
                    v-if="useStore.receiver?.province && useStore.receiver?.city && useStore.receiver?.district"
                  >
                    {{ useStore.receiver?.province }} {{ useStore.receiver?.city }} {{ useStore.receiver?.district }}
                  </template>
                  <template v-else>
                    点击选择收件城市
                  </template>
                </div>
              </MlRegionPicker>
              <div class="flex-1" />
              <div
                v-if="useStore.receiver?.province && useStore.receiver?.city && useStore.receiver?.district"
                i-carbon-close-outline class="flex-none text-secondary-foreground" @click.stop="clearReceiver"
              />
            </div>
          </div>
          <div class="ml-3 self-stretch py-3">
            <div class="divider-v" />
          </div>
          <div class="flex items-center self-stretch p-3" @click="openAddAddress(AddressType.RECEIVE)">
            地址识别
          </div>
        </div>
        <div class="my-2 divider" />
        <div class="px-3">
          <PickupTimeSelect />
        </div>
      </div>
      <div class="my-2.5 flex gap-2.5">
        <div class="flex flex-1 flex-col gap-6 card p-2.5">
          <div class="flex items-center gap-4.5">
            <div>重量</div>
            <div class="h-8.5 flex flex-1 items-center rounded-full bg-muted-foreground/20">
              <div class="h-full w-8 flex items-center justify-center" @click="changeWeight('reduce')">
                <div class="i-icon-park-outline-minus" />
              </div>
              <div class="h-full flex flex-1 items-center justify-center gap-2 bg-muted px-3">
                <input
                  v-model.number="weight" class="flex justify-center bg-muted text-center text-xl font-500"
                  type="number" @blur="formatNumber"
                >
                <div>
                  Kg
                </div>
              </div>
              <div class="h-full w-8 flex items-center justify-center" @click="changeWeight('add')">
                <div class="i-icon-park-outline-plus" />
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4.5">
            <div>体积</div>
            <div class="flex flex-1 flex-col gap-1">
              <div class="h-8.5 flex items-center rounded-full bg-muted-foreground/20">
                <div class="h-full w-8 flex items-center justify-center" @click="changeVolume('reduce')">
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
                <div class="h-full w-8 flex items-center justify-center" @click="changeVolume('add')">
                  <div class="i-icon-park-outline-plus" />
                </div>
              </div>
              <div v-if="volume > 1" class="flex items-center gap-0.5 text-2.5 text-secondary-foreground">
                <div class="i-carbon-warning-hex-filled" />
                <div>体积过大，请确认体积单位为㎡</div>
              </div>
            </div>
          </div>
        </div>
        <div class="w-28 btn rounded-2.5 text-2xl" @click="search">
          查询
        </div>
      </div>
      <div class="overflow-hidden card">
        <wd-collapse v-model="activeNames">
          <wd-collapse-item title="温馨提示" name="item1">
            <div>1.计费规则采取重量和体积（体积会换算成重量）对比计费，两者谁大取谁。体积换算重量规则：重量=(长*宽*高)cm/计泡系数。德邦计泡系数是6000；跨越计泡系数是5000。</div>
            <div>2.本页面计算出的费用未包含包装费，保价费等其他增值费用，价格仅供参考，实际重量以快递员确定为准，物品在包装后重量可能会发生变化！</div>
          </wd-collapse-item>
        </wd-collapse>
      </div>
      <div class="mt-3 flex flex-col gap-3">
        <template v-if="productsLoading">
          <PriceCompanyItemLoading v-for="i in 3" :key="i" />
        </template>
        <template v-else>
          <PriceCompanyItem v-for="(company, index) in companyList" :key="index" :company="company" />
          <!-- <div v-if="!productList.length" class="w-full px-3 py-6 text-center text-muted-foreground">
            平台暂无可提供服务的快递公司
          </div> -->
        </template>
      </div>
      <div class="fixed-bottom-container bg-background">
        <div class="flex items-center p-3">
          <button class="btn-accent flex-1 p-3 text-4" @click="goSend">
            去寄件
          </button>
        </div>
      </div>
    </div>
  </MlPage>
</template>

<style lang="scss">
.app {
  @apply bg-muted;
}
</style>
