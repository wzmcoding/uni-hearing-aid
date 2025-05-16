import { isEmpty } from 'lodash-es'
import { isMobile, isPhone, isPhoneOrMobile } from './validate'

export function phoneValidator(rule: any, value: any, callback: Function) {
  if (!isPhone(value)) {
    callback('电话号码格式不正确！')
  }
  callback()
}

export function mobileValidator(rule: any, value: any, callback: Function) {
  if (value && !isMobile(value)) {
    callback('手机号码格式不正确！')
  }
  callback()
}

export function phoneOrMobileValidator(
  rule: any,
  value: any,
  callback: Function,
) {
  if (value && !isPhoneOrMobile(value)) {
    callback(new Error(rule.message))
  }
  callback()
}

export function amountValidator(rule: any, value: any, callback: Function) {
  if (isEmpty(value)) {
    callback() // 空值不校验
  }
  if (!/^(\d|([1-9]\d+))(\.\d{0,2})?$/.test(value)) {
    callback('请输入有效金额!')
  }
  else {
    callback()
  }
}

export function positiveIntegerValidator(
  rule: any,
  value: any,
  callback: Function,
) {
  if (!/^\d+$/.test(value)) {
    callback('请输入有效正整数!')
  }
  else {
    callback()
  }
}

export function greaterThanZeroValidator(
  rule: any,
  value: any,
  callback: Function,
) {
  if (value && +value < 0) {
    callback('应该大于等于0!')
  }
  else {
    callback()
  }
}
