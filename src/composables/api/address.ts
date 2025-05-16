export enum AddressType {
  SEND,
  RECEIVE,
}

export interface AddressEntity {
  id?: string
  type: AddressType // 类型
  name: string // 姓名
  phone: string // 电话
  mobile: string // 手机
  address: string // 地址
  province: string // 省
  city: string // 市
  district: string // 区
  street?: string // 街道
  postalCode?: string // 邮编
  defaulted: boolean // 是否默认
}

export class Address implements AddressEntity {
  constructor() {
    this.reset()
  }

  reset() {
    const region = ls.get('region') || []
    this.province = region[0] || ''
    this.city = region[1] || ''
    this.district = region[2] || ''
    this.name = ''
    this.phone = ''
    this.mobile = ''
    this.address = ''
    this.postalCode = ''
    this.street = ''
    this.type = AddressType.SEND
    this.defaulted = false
  }

  id?: string
  name!: string
  phone!: string
  mobile!: string
  address!: string
  city!: string
  district!: string
  postalCode!: string
  province!: string
  street!: string
  type!: AddressType
  defaulted!: boolean // 是否设置为默认地址
}
export function useApiAddress() {
  const { api } = useApi()

  return {
    list: (params?: any): Promise<AddressEntity[]> => {
      return api.query({
        url: 'app/address/list',
        params,
      })
    },
    info: (params?: any): Promise<AddressEntity> => {
      return api.query({
        url: 'app/address/info',
        params,
      })
    },
    getDefault: (type = AddressType.SEND): Promise<AddressEntity> => {
      return api.query({
        url: 'app/address/default',
        params: {
          type,
        },
      })
    },
    add: (data: AddressEntity): Promise<any> => {
      return api.add({
        url: 'app/address/add',
        data,
      })
    },
    update: (data: AddressEntity): Promise<any> => {
      return api.update({
        url: 'app/address/update',
        data,
      })
    },
    delete: (data: any[]): Promise<any> => {
      return api.delete({
        url: 'app/address/del',
        data,
      })
    },
    recognize: (addressText: string): Promise<AddressEntity> => {
      return api.query({
        url: 'app/address/resolution',
        method: 'POST',
        data: {
          addressText,
        },
      })
    },
  }
}
