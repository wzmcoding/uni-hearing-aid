<script setup lang="ts">
import TnTabs from '@tuniao/tnui-vue3-uniapp/components/tabs/src/tabs.vue'
import TnTabsItem from '@tuniao/tnui-vue3-uniapp/components/tabs/src/tabs-item.vue'
import debounce from 'debounce'
import type { ExpressCompanyQuoteEntity, ExpressProductDto, ExpressProductQuoteEntity } from '~/composables/api/app'
import { AddressType } from '~/composables/api/address'
import { APIError } from '~/composables/api/api'

// import MoreServices from '~/components/send/MoreServices.vue'

const props = withDefaults(defineProps<{
  type?: string
}>(), {
})

const productsLoading = ref(true) // 加载运力中
const service = useService()
// const ui = useUi()
const isAgree = ref(!!ls.get('agreement'))
watch(isAgree, (val) => {
  ls.set('agreement', val)
})
const userAgreement = ref()
const orderSubmit = ref()
const orderStore = useOrderStore()
orderStore.sendType = props.type ? Number.parseInt(props.type) : SendType.LARGE_ITEM
const tabsData = [
  { label: '寄大件', value: 1 },
  { label: '寄快递', value: 0 },
]
const tabIndex = computed({
  get() {
    return tabsData.findIndex((tab) => tab.value === orderStore.sendType)
  },
  set(val) {
    orderStore.sendType = tabsData[val]?.value
  },
})
const productList = ref<ExpressProductQuoteEntity[]>([])
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
const currentCompany = computed(() => {
  return companyList.value.find((company) => company.companyId === orderStore.transport?.companyId)
})
const sortedProducts = computed(() => {
  return sortProducts(currentCompany.value?.products as ExpressProductQuoteEntity[])
})
const isShowPriceDetail = ref(false)
const estimating = ref(false) // 预估价格中

watch(productList, (list) => {
  // 已选择的产品不在列表时，重新选择
  // if (!orderStore.transport && list.length) {
  //   onSelectProduct(sortedProducts.value[0])
  // }
  if (orderStore.transport && !list.some((product) => product.transportId === orderStore.transport!.transportId)) {
    onSelectProduct(sortProducts(productList.value)[0])
  }
})

function openAddressBook(type: AddressType) {
  router.push({
    path: '/pages/address-book/picker',
    query: {
      type,
    },
  })
}

function tempCreateAddress(type: AddressType) {
  router.push({
    path: '/pages/address-book/edit',
    query: {
      type,
      temporary: 'true',
    },
  })
}

const errorArr = ref<APIError[]>([])
const ERROR_CODES = ['605', '603', '01', '602']
const errorMessage = computed(() => {
  errorArr.value.sort((a, b) => {
    const indexA = ERROR_CODES.indexOf(String(a.code))
    const indexB = ERROR_CODES.indexOf(String(b.code))
    return indexA - indexB
  })
  return errorArr.value.length ? errorArr.value[0]?.message : ''
})
async function getProducts() {
  if (!orderStore.ready) {
    return
  }
  errorArr.value = []
  estimating.value = true
  productList.value.forEach((product) => {
    product.loading = true
  })
  try {
    const { sender, receiver, cargoInfo, pickupStartTime, pickupEndTime, sendType } = orderStore
    const res = await service.app.productList({
      sender: sender!,
      receiver: receiver!,
      cargoInfo: cargoInfo!,
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
    const sortedProducts = sortProducts(productList.value)
    const selectedProduct = productList.value.find((product) => product.transportId === orderStore.transport?.transportId)
    // 如果选择的是占位运力，或者没有选择运力，或者已选择的运力已经不存在，则默认选择最便宜的运力
    if (!orderStore.transport || orderStore.transport.placeholder || !selectedProduct) {
      onSelectProduct(sortedProducts[0])
    }
    else {
      // 替换掉id相同但数据过期的运力
      onSelectProduct(selectedProduct)
    }
  }
  catch (e) {
    console.log(e)
  }
  finally {
    estimating.value = false
    productsLoading.value = false
  }
}
const debouncedGetProducts = debounce(() => {
  getProducts()
}, 1000)
watch(() => [
  orderStore.sender,
  orderStore.receiver,
  orderStore.cargoInfo,
  orderStore.pickupStartTime,
], debouncedGetProducts, {
  deep: true,
})
watch(() => orderStore.sendType, () => {
  refresh()
})
watch(() => orderStore.transport?.pickupTime, (val) => {
  if (val) {
    orderStore.pickupTime = {
      today: val?.today || [],
      tomorrow: val?.tomorrow || [],
      viewModel: val?.viewModel || 0,
      tips: val?.tips || '',
      text: val?.text || '',
    }
    orderStore.setDefaultPickupTime()
  }
})
// 获取占位用的信息
const minPriceProduct = ref<ExpressProductQuoteEntity>()
async function getProductsPlaceholder() {
  productsLoading.value = true
  try {
    const { sendType } = orderStore
    const res = await service.app.productList({
      sendType,
      searchType: 0,
    } as ExpressProductDto)
    productList.value = res
    productList.value.forEach((product) => {
      product.placeholder = true
    })
    await nextTick()
    minPriceProduct.value = sortByStartWeight(productList.value)[0]
    onSelectProduct(sortProducts(productList.value)[0])
  }
  catch (e) {
    console.log(e)
  }
  finally {
    // estimating.value = false
    productsLoading.value = false
  }
}

async function getProductPrice(product: ExpressProductQuoteEntity) {
  try {
    const { sender, receiver, cargoInfo, pickupStartTime, pickupEndTime, sendType } = orderStore
    const res = await service.app.getProductPrice({
      sender: sender!,
      receiver: receiver!,
      cargo: cargoInfo!,
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
    if (e instanceof APIError) {
      errorArr.value.push(e)
    }
  }
  finally {
    product.loading = false
  }
}

function sortByStartWeight(products: ExpressProductQuoteEntity[]) {
  return products.sort((productA, productB) => {
    return productA.startWeight! - productB.startWeight!
  })
}

function sortProducts(products: ExpressProductQuoteEntity[]) {
  return products.sort((productA, productB) => {
    const companySortA = utils.withDefault(productA.companySort, Number.MAX_SAFE_INTEGER)
    const companySortB = utils.withDefault(productB.companySort, Number.MAX_SAFE_INTEGER)
    // 先按 companySort 排序，如果相同再按 price 排序
    return companySortA - companySortB || (productA.price! - productB.price!)
  })
}

function onSelectCompany(company: ExpressCompanyQuoteEntity) {
  if (!orderStore.transport || orderStore.transport.companyId !== company.companyId) {
    orderStore.transport = sortProducts(company.products)[0]
  }
}
function onSelectProduct(product?: ExpressProductQuoteEntity) {
  if (!product) {
    orderStore.transport = undefined
    return
  }
  orderStore.transport = product
  const company = companyList.value.find((company) => company.companyId === product.companyId)
  if (company) {
    onSelectCompany(company)
  }
}

async function setDefaultAddress() {
  // 首次打开时使用默认地址
  if (!orderStore.sender) {
    const res = await service.address.getDefault(AddressType.SEND)
    if (res) {
      orderStore.setAddress(res, AddressType.SEND)
    }
  }
}

async function refresh() {
  uni.setNavigationBarTitle({
    title: orderStore.sendType === SendType.LARGE_ITEM ? '寄大件' : '寄快递',
  })
  orderStore.transport = undefined
  await getProductsPlaceholder()
  if (orderStore.ready) {
    getProducts()
  }
}

onShow(() => {
  setDefaultAddress()
  orderStore.setDefaultPickupTime()
  refresh()
})
onUnmounted(() => {
  // 销毁页面时清除取件时间
  orderStore.pickupStartTime = undefined
  orderStore.pickupEndTime = undefined
})

const filterPriceDetail = computed(() => {
  if (!orderStore.transport?.priceDetail) {
    return []
  }
  return orderStore.transport?.priceDetail?.filter((v: any) => v?.feeType !== 'BASE')
})
const filterBasePrice = computed(() => {
  if (!orderStore.transport?.priceDetail) {
    return 0
  }
  const val = orderStore.transport?.priceDetail?.find((v: any) => v?.feeType === 'BASE')
  return val?.fee || 0
})

function showAgreement() {
  userAgreement.value?.show(true)
}
function submit() {
  orderSubmit.value?.submit()
}
</script>

<template>
  <MlPage>
    <div class="relative z-0 px-2 pb-[270rpx]">
      <div class="gradient-page-top-bg absolute left-0 right-0 top-0 z--1 h-80 p-2" />
      <!-- #ifdef MP-TOUTIAO -->
      <view class="w-[320rpx] text-4.5">
        <MlTabs v-model="tabIndex" :tabs="tabsData.map((item) => item.label)" />
      </view>
      <!-- #endif -->
      <!-- #ifndef MP-TOUTIAO -->
      <TnTabs v-model="tabIndex" bg-color="transparent" :bottom-shadow="false" bar-width="80" class="text-4.5">
        <TnTabsItem v-for="(item, index) in tabsData" :key="index" :title="item.label" />
      </TnTabs>
      <!-- #endif -->
      <div v-if="false" class="mt-2.5 box-border flex items-center gap-1.5 rounded-lg bg-background py-3 pl-3 text-xs text-primary">
        <wd-icon class="text-lg" name="sound" />
        <div>春节期间，快递员收件和派件会有延迟，感谢理解~</div>
      </div>
      <div class="mt-2.5 h-11.75 card py-2">
        <div class="box-border h-full flex items-center justify-between px-4 text-xs" @click="utils.handleBatteryCar()">
          <div class="flex items-center">
            <image class="h-7 w-7" src="/static/order/battery.png" mode="aspectFill" />
            <div class="ml-3">
              寄电瓶车，不拆电瓶，整车托运
            </div>
          </div>
          <div class="h-full flex items-center gap-1 color-primary">
            <div>前往托运</div>
            <div class="i-icon-park-outline-right text-xs" />
          </div>
        </div>
      </div>

      <div class="my-2 card py-2">
        <div class="flex">
          <div class="flex items-center self-stretch p-3">
            <div class="h-5 w-5 flex items-center justify-center rounded bg-primary text-primary-foreground">
              寄
            </div>
          </div>

          <div class="flex flex-1 flex-col gap-1" @click="tempCreateAddress(AddressType.SEND)">
            <div class="flex gap-1 text-4">
              <template v-if="orderStore.sender">
                <template v-if="orderStore.sender?.name && utils.renderPhone(orderStore.sender)">
                  <div>{{ orderStore.sender?.name }}</div>
                  <div>{{ utils.renderPhone(orderStore.sender) }}</div>
                </template>
                <div v-else class="text-[#FA5230]">
                  请补全寄件人信息
                </div>
              </template>
              <template v-else>
                <div>寄件人信息</div>
              </template>
              <div class="flex-1" />
              <div
                v-if="orderStore.sender" i-carbon-close-outline class="flex-none text-secondary-foreground"
                @click.stop="orderStore.sender = undefined"
              />
            </div>
            <div class="text-3 text-secondary-foreground">
              <template v-if="orderStore.sender">
                {{ orderStore.sender?.province }} {{ orderStore.sender?.city }} {{ orderStore.sender?.district }} {{
                  orderStore.sender?.address }}
              </template>
              <template v-else>
                复制完整信息，自动智能填写
              </template>
            </div>
          </div>
          <div class="ml-3 self-stretch py-3">
            <div class="divider-v" />
          </div>

          <div class="flex items-center self-stretch p-3" @click="openAddressBook(AddressType.SEND)">
            地址簿
          </div>
        </div>
        <div class="my-2 divider" />
        <div class="flex">
          <div class="flex items-center self-stretch p-3">
            <div class="h-5 w-5 flex items-center justify-center rounded bg-accent text-primary-foreground">
              收
            </div>
          </div>
          <div class="flex flex-1 flex-col gap-1" @click="tempCreateAddress(AddressType.RECEIVE)">
            <div class="flex gap-1 text-4">
              <template v-if="orderStore.receiver">
                <template v-if="orderStore.receiver?.name && utils.renderPhone(orderStore.receiver)">
                  <div>{{ orderStore.receiver?.name }}</div>
                  <div>{{ utils.renderPhone(orderStore.receiver) }}</div>
                </template>
                <div v-else class="text-[#FA5230]">
                  请补全收件人信息
                </div>
              </template>
              <template v-else>
                <div>收件人信息</div>
              </template>
              <div class="flex-1" />
              <div
                v-if="orderStore.receiver" i-carbon-close-outline class="flex-none text-secondary-foreground"
                @click.stop="orderStore.receiver = undefined"
              />
            </div>
            <div class="text-3 text-secondary-foreground">
              <template v-if="orderStore.receiver">
                {{ orderStore.receiver?.province }} {{ orderStore.receiver?.city }} {{ orderStore.receiver?.district
                }} {{
                  orderStore.receiver?.address }}
              </template>
              <template v-else>
                复制完整信息，自动智能填写
              </template>
            </div>
          </div>
          <div class="ml-3 self-stretch py-3">
            <div class="divider-v" />
          </div>
          <div class="flex items-center self-stretch p-3" @click="openAddressBook(AddressType.RECEIVE)">
            地址簿
          </div>
        </div>
      </div>

      <div class="my-2 card p-2">
        <CargoInfoInput v-if="minPriceProduct?.startWeight" v-model="minPriceProduct.startWeight" />
      </div>

      <div class="my-2 card p-2">
        <div class="mb-2 flex items-center gap-2">
          <div class="text-4 text-secondary-foreground">
            快递公司
          </div>
          <div class="flex items-center gap-2 text-3">
            <div class="rounded-full bg-primary px-2 text-primary-foreground">
              推荐
            </div>
            <!-- <div class="rounded-full bg-muted px-2 text-muted-foreground">
              价格
            </div>
            <div class="rounded-full bg-muted px-2 text-muted-foreground">
              时效
            </div> -->
          </div>
        </div>
        <div class="my-4 flex overflow-x-auto">
          <template v-if="productsLoading">
            <ComPanyItemLoading v-for="i in 3" :key="i" />
          </template>
          <template v-else>
            <CompanyItem
              v-for="(company, index) in companyList" :key="index" :company="company"
              @select="onSelectCompany(company)"
            />
            <div v-if="!productList.length" class="w-full px-3 py-6 text-center text-muted-foreground">
              {{ errorMessage }}
            </div>
          </template>
        </div>
      </div>
      <div class="my-2 card p-2">
        <PickupTimeInput />

        <template v-if="currentCompany && orderStore.ready">
          <div class="my-3 divider" />
          <div class="my-2 flex items-center gap-2">
            <div class="text-4 text-secondary-foreground">
              预计送达
            </div>
          </div>
          <div class="my-4 flex overflow-x-auto">
            <ProductItem
              v-for="(product, index) in sortedProducts" :key="index" :product="product"
              @select="onSelectProduct(product)"
            />
          </div>
          <div class="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <div class="i-carbon-warning" />以上为基础运费的预估价格，实际价格以快递员称重为准
          </div>
        </template>
      </div>

      <div class="my-2 card p-2">
        <PayerInput />
        <InsuredInput v-if="false" />
      </div>

      <div
        v-if="orderStore.ready && !estimating && orderStore.transport && orderStore.transport?.totalPrice! > orderStore.transport?.price!"
        class="my-2 card p-2"
      >
        <div class="my-2 flex items-center gap-1">
          <div class="text-4 text-secondary-foreground">
            优惠金额
          </div>
          <div class="flex-1" />
          <div class="flex items-center gap-2 text-4 text-destructive">
            <div class="rounded-br-lg rounded-tl-lg bg-destructive px-1 text-3.5 text-destructive-foreground">
              平台折扣
            </div>
            <div>
              -{{ utils.renderPrice(orderStore.transport.totalPrice! - orderStore.transport.price!) }}元
            </div>
          </div>
        </div>
      </div>
      <MoreServices />
      <UserAgreement ref="userAgreement" v-model="isAgree" @submit="submit" />
      <div>
        <div
          v-if="isShowPriceDetail" class="fixed bottom-0 left-0 h-100vh w-full bg-muted-foreground/80"
          @click="isShowPriceDetail = false"
        />
        <div class="fixed-bottom-container" :class="isShowPriceDetail ? 'flex flex-col justify-end rounded-t-2.5' : ''">
          <div v-if="isShowPriceDetail" class="rounded-t-2.5 bg-background px-2 pb-2 pt-4">
            <div class="mb-2 text-center text-lg">
              费用明细
            </div>
            <div
              class="mb-5 text-center text-3.5"
              @click.stop="router.push(`${WEB_PREFIX}/billing-rules?t=${new Date().getTime()}`)"
            >
              实际费用以快递员称重为准，了解<span class="text-primary">计费规则</span>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between text-3.5 font-bold">
                <div>基础运费</div>
                <div>
                  {{ `${filterBasePrice === 0 ? '--' : utils.renderPrice(filterBasePrice)}` }}元
                </div>
              </div>
              <MLListItem
                v-for="(item, i) in filterPriceDetail" :key="i" :label="item.feeName"
                :value="`${utils.renderPrice(item.fee)}元`"
              />
              <div class="flex items-center justify-between text-3">
                <div>预估类型</div>
                <div>按重量预估</div>
              </div>
              <div class="flex items-center justify-between text-3 text-secondary-foreground">
                <div>重量</div>
                <div>{{ orderStore.ready ? `${orderStore.cargoInfo?.weight! / 1000}kg` : '请填写物品重量' }}</div>
              </div>
              <div
                v-if="orderStore.transport && orderStore.transport?.totalPrice! > orderStore.transport?.price!"
                class="flex items-center justify-between text-3.5 font-bold"
              >
                <div>优惠金额</div>
                <div class="text-destructive">
                  -{{ utils.renderPrice(orderStore.transport.totalPrice! - orderStore.transport.price!) }}元
                </div>
              </div>
            </div>
          </div>
          <!-- <div
            v-if="['DBKD', 'DBKD-F'].includes(orderStore.transport?.companyCode!)"
            class="flex items-center gap-1.5 bg-accent/10 p-2 text-xs color-accent"
          >
            <div class="i-carbon-warning" />1月3日-2月4日期间，将加收资源调节费，具体以快递员取件为准
          </div> -->
          <div
            v-if="'KYE' === orderStore.transport?.companyCode"
            class="flex items-center gap-1.5 bg-accent/10 p-2 text-xs color-accent"
          >
            <div class="i-carbon-warning" />跨越物流默认收取2元保费
          </div>
          <div
            v-if="'SXJD' === orderStore.transport?.companyCode"
            class="flex items-center gap-1.5 bg-accent/10 p-2 text-xs color-accent"
          >
            <div class="i-carbon-warning" />顺心捷达不符合理赔标准，二手货物与退货不予理赔
          </div>
          <div class="flex items-center bg-background p-2">
            <div class="flex flex-1 flex-col gap-1 text-sm">
              <!-- #ifdef MP-ALIPAY -->
              <div v-if="estimating" class="h-7 w-45">
                <MlSkeleton />
              </div>
              <!-- #endif -->
              <!-- #ifndef MP-ALIPAY -->
              <MlSkeleton v-if="estimating" class="h-7 w-45" />
              <!-- #endif -->
              <div v-else class="flex items-center gap-2">
                <div class="flex items-center gap-1 text-4">
                  预计:<text class="color-accent">
                    {{ orderStore.transport ? utils.renderPrice(orderStore.transport?.price) : '--' }}元
                  </text>
                </div>
                <div
                  v-if="orderStore.transport && orderStore.transport?.totalPrice! > orderStore.transport?.price!"
                  class="mr-3 text-3.5 text-secondary-foreground line-through"
                >
                  ￥{{ utils.renderPrice(orderStore.transport?.totalPrice) }}
                </div>
                <div class="flex items-center gap-1 text-foreground" @click="isShowPriceDetail = !isShowPriceDetail">
                  <div>明细</div>
                  <div :class="isShowPriceDetail ? 'i-icon-park-outline-up' : 'i-icon-park-outline-down'" />
                </div>
              </div>
              <div class="text-xs text-secondary-foreground">
                {{ orderStore.ready ? `按${orderStore.cargoInfo?.weight! / 1000}kg内计算` : '请填写收寄件地址后预估运费' }}
              </div>
            </div>
            <div class="h-10">
              <OrderSubmit ref="orderSubmit" :loading="estimating" :is-agree="isAgree" @agreement="showAgreement" />
            </div>
          </div>
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

<route lang="yaml">
style:
  navigationBarTitleText: "寄快递"
</route>
