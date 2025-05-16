import { cloneDeep } from 'lodash-es'
import type { AddressEntity } from '~/composables/api/address'
import type { CargoEntity, OrderPayer, PayWay } from '~/composables/api/order'
import type { BaseEntity } from '~/composables/api/common'

export interface ExpressProductDto {
  sender: AddressEntity
  receiver: AddressEntity
  pickupStartTime: string
  pickupEndTime: string
  cargoInfo?: CargoEntity
  cargo?: CargoEntity
  sendType: number
  searchType: number
  transportId?: string
  payer?: OrderPayer
  payType?: PayWay
}
// 根据下单信息获取的报价
export interface ExpressProductQuoteEntity {
  transportId: string // 运力Id
  companyId: string // 快递公司ID
  companyCode: string // 快递公司编码
  companyName: string // 快递公司名称
  companyLogo: string // 快递公司logo
  productId: string // 快递产品ID
  productCode: string // 快递产品编码
  productName: string // 快递产品名称
  payType: ExpressCompanyQuotePayType
  totalPrice?: number // 包含其他费用的价格
  price?: number // 价格
  expectedDeliveryTime?: string // 预期送达时间
  priceDetail?: PriceDetailEntity[]
  loading?: boolean // 是否正在询价
  companySort?: number // 排序
  discount?: number // 折扣
  placeholder?: boolean // 占位用，非真实数据
  pickupTime?: ExpressProductPickupTime
  offlinePayType: number // 线下支付类型
  startWeight?: number // 起重
}
export interface ExpressProductPickupTime {
  today: string[]
  tomorrow: string[]
  viewModel: 0 | 1
  tips?: string
  text?: string
}

export enum ExpressCompanyQuotePayType {
  ONLINE,
  OFFLINE,
}
export interface ExpressCompanyQuoteEntity {
  companyId: string // 快递公司ID
  companyCode: string // 快递公司编码
  companyName: string // 快递公司名称
  companyLogo: string // 快递公司logo
  products: ExpressProductQuoteEntity[]
  payType: ExpressCompanyQuotePayType
  pickupTime?: ExpressProductPickupTime
}
export interface PriceDetailEntity {
  fee: number
  feeName: string
  feeType: string
}
export interface ExpressProductEntity extends BaseEntity {
  companyId: string // 快递公司ID
  productCode: string // 快递产品编码
  productName: string // 快递产品名称
  note: string // 备注
}
export interface ExpressCompanyEntity extends BaseEntity {
  companyCode: string // 快递公司编码
  companyName: string // 快递公司名称
  companyType: number // 公司类型 0 快递 1 物流
  companyLogo: string // logo
  products: ExpressProductEntity[] // 快递产品
}
export function useApiExpressApp() {
  const { api } = useApi()
  return {
    productList: (data: ExpressProductDto): Promise<ExpressProductQuoteEntity[]> => {
      return api.query({
        url: 'app/application/list',
        method: 'POST',
        data,
      })
    },
    companyList: (): Promise<ExpressCompanyEntity[]> => {
      return api.query({
        url: 'app/application/list/company',
      })
    },
    getProductPrice: (val: ExpressProductDto): Promise<ExpressProductQuoteEntity> => {
      const data = setCity(val)
      return api.query({
        url: 'app/application/price',
        method: 'POST',
        data,
        message: {
          error: {
            enable: false,
          },
        },
      })
    },
  }
}

function setCity(data: ExpressProductDto) {
  const val = cloneDeep(data)
  const { receiver, sender } = val
  if (receiver.city === '市辖区') {
    receiver.city = receiver.province
  }
  if (sender.city === '市辖区') {
    sender.city = sender.province
  }
  return val
}
