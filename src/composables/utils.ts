import dayjs from 'dayjs/esm'
import * as url from '~/utils/url'
import type { AddressEntity } from '~/composables/api/address'

export const WEB_PREFIX = import.meta.env.VITE_WEB_PREFIX

export const utils = {
  randomStr(length = 16) {
    let result = ''
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const charactersLength = characters.length
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  },
  // 向下兼容??语法
  withDefault(val: any, defaultVal: any) {
    return (val !== null && val !== undefined) ? val : defaultVal
  },
  // 将ISO 8601字符串或者unix毫秒时间戳渲染为当地时间
  renderDate(timestamp: string | number, format = DATE.FULL_DATE_TIME) {
    return dayjs(timestamp).format(format)
  },
  // 计算体积，长宽高单位cm
  calcVolume(width?: number, height?: number, length?: number, unit = 'cm') {
    if (!width || !height || !length) {
      return 0
    }
    const volume = math.accurate(width * height * length, 3)
    if (unit === 'm') {
      return math.accurate(math.div(volume, 1000000), 3)
    }
    else {
      return volume
    }
  },
  // 渲染联系电话，隐私模式下使用星号代替
  renderPhone(address?: AddressEntity, privacy = false) {
    if (!address) {
      return ''
    }
    const { phone, mobile } = address
    const raw = mobile || phone
    return privacy ? raw.replace(/(.{3}).{4}(.*)/, '$1****$2') : raw
  },
  // 将价格分渲染为元
  renderPrice(fen?: number | string | null) {
    if (fen === undefined || fen === null) {
      return '-'
    }
    fen = Number(fen)
    return math.accurate(fen / 100, 2)
  },
  // 日期格式化
  renderFormatDate(date: string | undefined) {
    if (!date) {
      return
    }
    if (dayjs().isSame(date, 'day')) {
      return dayjs(date, 'YYYY-MM-DD HH-mm-ss').format('HH:mm')
    }
    else if (dayjs().subtract(1, 'day').isSame(date, 'day')) {
      return '昨天'
    }
    else if (dayjs().subtract(2, 'day').isSame(date, 'day')) {
      return '前天'
    }
    else if (dayjs().isSame(date, 'year')) {
      return dayjs(date, 'YYYY-MM-DD HH-mm-ss').format('MM-DD')
    }
    else {
      return dayjs(date, 'YYYY-MM-DD HH-mm-ss').format('YYYY-MM-DD')
    }
  },
  calcDiscount(price?: number, totalPrice?: number) {
    const ratio = math.accurate(price! / totalPrice!, 2)
    if (Number.isNaN(ratio)) {
      return '--'
    }
    return math.mul(ratio, 10)
  },
  // 内容超出隐藏
  renderOverflow(text: string | undefined, maxLength = 3) {
    if (!text || text.length <= maxLength) {
      return text
    }
    return `${text.slice(0, maxLength)}...`
  },
  // 电瓶车托运 拉起半屏小程序
  handleBatteryCar(appId: string = 'wx37ff6a12f991bef8', path: string = 'pages/index/index?source_signs=h5i8j3cuiugrd3r5nd709q8n8v') {
    console.log('appId & path', appId, path)
    // #ifdef MP-WEIXIN
    uni.openEmbeddedMiniProgram({
      appId,
      path,
    })
    // #endif
    // #ifndef MP-WEIXIN
    useUi().showToast('敬请期待')
    // #endif
  },
  ...url,
}
