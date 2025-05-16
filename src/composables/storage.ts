export const ls = {
  // 后缀标识
  suffix: '_deadtime',
  // 前缀，避免与其他插件冲突
  prefix: STORAGE_PREFIX,

  /**
   * 获取
   * @param {string} key 关键字
   */
  get(key: string) {
    key = this.prefix + key
    return uni.getStorageSync(key)
  },

  /**
   * 获取全部
   */
  info() {
    const { keys } = uni.getStorageInfoSync()
    const d: any = {}

    keys.forEach((e: string) => {
      const k = e.replace(this.prefix, '')
      d[k] = uni.getStorageSync(e)
    })

    return d
  },

  /**
   * 设置
   * @param {string} key 关键字
   * @param {*} value 值
   * @param {number} expires 过期时间
   */
  set(key: string, value: any, expires?: any) {
    key = this.prefix + key
    uni.setStorageSync(key, value)

    if (expires) {
      uni.setStorageSync(`${key}${this.suffix}`, Date.parse(String(new Date())) + expires * 1000)
    }
  },

  /**
   * 是否过期
   * @param {string} key 关键字
   */
  isExpired(key: string) {
    key = this.prefix + key
    return (this.getExpiration(key) || 0) - Date.parse(String(new Date())) <= 2000
  },

  /**
   * 获取到期时间
   * @param {string} key 关键字
   */
  getExpiration(key: string) {
    key = this.prefix + key
    return this.get(key + this.suffix)
  },

  /**
   * 移除
   * @param {string} key 关键字
   */
  remove(key: string) {
    key = this.prefix + key
    uni.removeStorageSync(key)
    this.removeExpiration(key)
  },

  /**
   * 移除到期时间
   * @param {string} key 关键字
   */
  removeExpiration(key: string) {
    key = this.prefix + key
    uni.removeStorageSync(key + this.suffix)
  },

  /**
   * 清理
   */
  clearAll() {
    uni.clearStorageSync()
  },
}
