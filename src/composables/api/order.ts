import { cloneDeep } from 'lodash-es'
import type { AddressEntity } from '~/composables/api/address'
import { Address } from '~/composables/api/address'

export enum CancelReason {
  DISCARD = 'DISCARD', // 暂时不想寄快递了
  EXPENSIVE = 'EXPENSIVE', // 运费过高
  WRONG_INFORMATION = 'WRONG_INFORMATION', // 信息填写错误
  COURIER = 'COURIER', // 快递员原因
  UNDELIVERABLE = 'UNDELIVERABLE', // 无法送达目的地
  WRONG_ORDER = 'WRONG_ORDER', // 下错单了
  SUPPLIER_REASON = 'SUPPLIER_REASON', // 服务商取消
  OTHER_REASON = 'OTHER_REASON', // 其他原因
}

export enum PayWay {
  SENDER_CASH_PAY = 'sender_cash_pay', // 寄付现结
  RECEIVER_CASH_PAY = 'receiver_cash_pay', // 到付现结
  MONTHLY_SETTLEMENT = 'monthly_settlement', // 月结
}
export enum SendType {
  EXPRESS, // 快递
  LARGE_ITEM, // 大件
}
// 付款方
export enum OrderPayer {
  SENDER = 'SENDER',
  RECEIVER = 'RECEIVER',
}
export enum PayStatus {
  CANCEL = -99, // 已取消
  NOT_PAY = -1, // 无需支付
  BILLING = 0, // 账单获取中
  PAY_SUCCESS = 1, // 支付成功
  PAYING = 2, // 待支付
  SUPPLEMENTARY_FREIGHT_PAYING = 3, // 补缴中
  THIRD_PARTY_PAYING = 4, // 待第三方支付
}

export enum OrderStatus {
  CREATE = 'CREATE', // 已创建
  PICKUP = 'PICKUP', // 待揽收
  PICKED_UP = 'PICKED_UP', // 已揽件
  TRANSPORTING = 'TRANSPORTING', // 运输中
  DISPATCHING = 'DISPATCHING', // 派件中
  SIGNED = 'SIGNED', // 已签收
  CANCEL = 'CANCEL', // 已取消
  PROBLEM = 'PROBLEM', // 问题件
  REJECT = 'REJECT', // 拒签
  GOBACK = 'GOBACK', // 已退回
  ACCEPT = 'ACCEPT', // 已接单
}

export enum OrderQueryType {
  ALL = 0, // 全部
  IN_PROGRESS = 1, // 进行中
  PENDING_PAYMENT = 2, // 待付款
  COMPLETED = 3, // 已完成
}

export interface FilterDateEntity {
  startTime: string
  endTime: string
  filterDateType: number
}

export interface CargoEntity {
  name?: string // 物品名称/类型
  weight: number // 重量
  length?: number // 长度
  width?: number // 宽度
  height?: number // 高度
  volume?: number // 体积
  count?: number // 数量
}

export enum SendStatus {
  CREATE = 0, // 下单成功
  PICKUP = 100, // 待揽收
  PICKED_UP = 101, // 已揽收
  PAYING = 300, // 待支付
  PAYED = 301, // 已支付
  SEND_SUCCESS = 888, // 寄件成功
}

export interface TrackEntity {
  trackDesc: string
  trackTime: string
  trackType: string
}

export interface PriceDetailEntity {
  feeName: string // 费用名称
  fee: string // 费用(单位分)
}

export interface CompanyEntity {
  code: string // 快递公司编码
  name: string // 快递公司名称
  logo: string // 快递公司logo
  customerServicePhone?: string // 客服电话
  customerServiceName?: string // 客服名字
}

export interface ProductEntity {
  code: string // 产品编码
  name: string // 产品类型
}

// 资金流水类型
export enum FundFlowType {
  FREIGHT_PAY = '下单寄件',
  SUPPLEMENTARY_FREIGHT_PAY = '运费补缴',
  FREIGHT_REFUND = '运费退款',
}

export enum FundStatus {
  PENDING, // 待处理
  FINISHED, // 已完成
}
// 流水
export interface FundFlowsEntity {
  id: string
  createTime: string
  orderId: string // 订单id
  amount: number // 金额
  fundFlowType: string // 资金流水类型
  fundFlowNotes: number // 资金流水备注
  fundStatus: FundStatus // 资金流处理状态 0 待处理 1 已完成
  successPaymentId: string // 支付成功的paymentId
}
// 支付单
export interface PaymentFlowEntity {
  id: string
  createTime: string
  orderId: string // 订单id
  amount: number // 金额
  fundFlowType: string // 资金流水类型
  fundFlowNotes: number // 资金流水备注
  fundStatus: FundStatus // 资金流处理状态 0 待处理 1 已完成
  successPaymentId: string // 支付成功的paymentId
}

export interface OrderEntity {
  id?: string
  updateTime?: string
  payWay: PayWay // 支付方式
  payStatus: PayStatus // 付款状态
  sendStatus?: SendStatus // 寄件状态
  orderStatus: OrderStatus // 订单状态
  orderNo: string // 订单编号
  waybillCode: string // 运单号
  pickupStartTime: string // 预约取件开始时间
  pickupEndTime: string // 预约取件结束时间
  siteCode: string // 接单网点编码
  siteName: string // 接单网点名称
  sitePhone: string // 接单网点手机号
  pickupCode: string // 取件码
  pickupCourierCode: string // 取件快递员编号
  pickupCourierName: string // 取件快递员名字
  pickupCourierMobile: string // 取件快递员手机号
  pickupTime: string // 快递揽件时间
  createTime?: string // 当单创建时间
  cancelCode: CancelReason // 取消编号
  cancelReason: string // 取消原因
  cancelTime: string // 取消时间
  arrivalSignTime: string // 签收时间
  sender: AddressEntity // 寄件人地址信息
  notes: string // 寄件人备注
  receiver: AddressEntity // 收件人地址信息
  cargo: CargoEntity // 物品信息
  salePrice?: string // 销售价格
  tracks?: TrackEntity[] // 物流轨迹信息
  priceDetail?: PriceDetailEntity[] // 价格详情
  company?: CompanyEntity // 快递公司信息
  product?: ProductEntity // 快递公司产品信息
  expectArrivalTime?: string // 预计送达时间
  estimatePrice?: number // 预估价格
  originalFreightPrice?: number // 基础运费
  fundFlows?: FundFlowsEntity[] // 流水
  paymentFlow?: PaymentFlowEntity // 支付单
  thirdPartyPayInfo?: string // 第三方支付信息
  supplierPhone?: string // 服务商电话
}

export interface CreateOrderDto {
  sender: AddressEntity
  receiver: AddressEntity
  cargo: CargoEntity
  notes: string
  transportId: string
  pickupStartTime: string
  pickupEndTime: string
  payer: OrderPayer
  payType?: PayWay
}

export class Order implements OrderEntity {
  constructor() {
    this.payWay = PayWay.SENDER_CASH_PAY
    this.payStatus = PayStatus.PAYING
    this.orderStatus = OrderStatus.CREATE
    this.orderNo = ''
    this.waybillCode = ''
    this.pickupStartTime = ''
    this.pickupEndTime = ''
    this.siteCode = ''
    this.siteName = ''
    this.sitePhone = ''
    this.pickupCode = ''
    this.pickupCourierCode = ''
    this.pickupCourierName = ''
    this.pickupCourierMobile = ''
    this.pickupTime = ''
    this.cancelCode = CancelReason.OTHER_REASON
    this.cancelReason = ''
    this.cancelTime = ''
    this.arrivalSignTime = ''
    this.sender = new Address()
    this.notes = ''
    this.receiver = new Address()
    this.cargo = {
      name: '',
      weight: 0,
      count: 1,
    }
    this.supplierPhone = ''
  }

  id?: string
  payStatus: PayStatus
  payWay: PayWay
  orderStatus: OrderStatus
  sendStatus?: SendStatus
  orderNo: string
  waybillCode: string
  pickupStartTime: string
  pickupEndTime: string
  siteCode: string
  siteName: string
  sitePhone: string
  pickupCode: string
  pickupCourierCode: string
  pickupCourierName: string
  pickupCourierMobile: string
  pickupTime: string
  createTime?: string
  cancelCode: CancelReason
  cancelReason: string
  cancelTime: string
  arrivalSignTime: string
  sender: AddressEntity
  notes: string
  receiver: AddressEntity
  cargo: CargoEntity
  salePrice?: string
  priceDetail?: PriceDetailEntity[]
  supplierPhone?: string
}

export interface OrderQueryDto {
  startTime?: string
  endTime?: string
  queryType: OrderQueryType
  size?: number
  waybillCode?: string | number
}

export interface ConfirmInfoDto {
  orderId: string
  needConfirm?: boolean
  confirmTips?: string
}

export function useApiOrder() {
  const { api } = useApi()

  return {
    list: (params?: OrderQueryDto): Promise<OrderEntity[]> => {
      return api.query({
        url: 'order/list',
        params,
      })
    },
    detail: (params?: any): Promise<OrderEntity> => {
      return api.query({
        url: 'order/detail',
        params,
      })
    },
    add: (val: CreateOrderDto): Promise<any> => {
      const data = setCity(val)
      return api.add({
        url: 'order/create',
        data,
      })
    },
    update: (data: OrderEntity): Promise<any> => {
      return api.update({
        url: 'order/update',
        data,
      })
    },
    cancel: (data: any): Promise<any> => {
      return api.update({
        url: 'order/cancel',
        data,
      })
    },
    overView: (): Promise<any> => {
      return api.query({
        url: 'order/overview',
      })
    },
    // 获取微信小程序支付
    pay: (data: any): Promise<any> => {
      return api.update({
        url: 'order/pay/wechat/miniapp',
        data,
      })
    },
    confirmInfo: (params: ConfirmInfoDto): Promise<ConfirmInfoDto> => {
      return api.query({
        url: 'order/confirm/info',
        params,
      })
    },
    confirm: (params: ConfirmInfoDto): Promise<any> => {
      return api.request({
        url: 'order/confirm',
        method: 'POST',
        data: params,
      })
    },
  }
}

function setCity(data: CreateOrderDto) {
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
