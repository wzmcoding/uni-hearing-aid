import { defineStore } from 'pinia'
import { merge } from 'lodash-es'

interface Token {
  uid: string
  secret: string
}
interface UserInfo {
  openId: string
  name: string
  avatar?: string
  newUser?: boolean // 是否新用户
  phone?: string // 下单人手机号
}

// 本地缓存
const data = ls.info()

// 强制更新token
if (data.userInfo && !data.userInfo.openId) {
  data.userInfo = undefined
  data.token = ''
}
// #ifdef H5
// 地址中存在openId时，使用openId登录
const openId = new URL(location.href).searchParams.get('o')
if (openId) {
  data.userInfo = undefined
  data.token = ''
}
// #endif

export const useUserStore = defineStore('user', () => {
  // 标识
  const token = ref(data.token || '')

  // 设置标识
  function setToken(data: Token) {
    token.value = data

    // 访问
    ls.set('token', data)
  }

  // 用户信息
  const info = ref<UserInfo | undefined>(data.userInfo)

  // 设置用户信息
  function set(value: UserInfo) {
    info.value = value
    ls.set('userInfo', value)
  }

  // 更新用户信息
  async function update(data: { [key: string]: any }) {
    set(merge(info.value, data))
    // return service.user.update(data)
  }

  // 清除用户
  function clear() {
    ls.remove('userInfo')
    ls.remove('token')
    token.value = ''
    info.value = undefined
  }

  // 获取用户信息
  async function get() {
    // return service.user.info()
    //   .then((res) => {
    //     if (res) {
    //       set(res)
    //     }
    //     return res
    //   })
  }

  return {
    token,
    setToken,
    info,
    get,
    set,
    update,
    clear,
  }
})
