import { defineStore } from 'pinia'
import { AppPlatform } from '~/composables/constants/app'

export const useEnvStore = defineStore('env', () => {
  const apiEnv = ref('prod')
  const isLocal = ref(false)

  let envType // 小程序环境类型
  let mpVersion // 小程序版本
  let appId // 小程序appId
  let platform: AppPlatform // 平台类型
  // #ifdef H5
  const host = location.host
  if (host === 'test.app.mulelink.com') {
    envType = 'trial'
  }
  else if (host === 'app.mulelink.com') {
    envType = 'release'
  }
  // url是局域网或本地ip
  else if (host.includes('localhost') || host.includes('192.168.')) {
    envType = 'develop'
  }
  mpVersion = import.meta.env.VITE_APP_VERSION
  appId = 'h5'
  platform = AppPlatform.H5 as AppPlatform
  // #endif
  // #ifdef MP-TOUTIAO
  const { microapp } = uni.getEnvInfoSync()
  envType = microapp.envType
  mpVersion = microapp.mpVersion
  appId = microapp.appId
  platform = AppPlatform.MP_TOUTIAO as AppPlatform
  // #endif
  // #ifdef MP-WEIXIN || MP-ALIPAY
  const { miniProgram } = uni.getAccountInfoSync()
  envType = miniProgram.envVersion
  mpVersion = miniProgram.version
  appId = miniProgram.appId
  // #endif
  // #ifdef MP-WEIXIN
  platform = AppPlatform.MP_WEIXIN as AppPlatform // 避免TS识别为唯一类型
  // #endif
  // #ifdef MP-ALIPAY
  platform = AppPlatform.MP_ALIPAY as AppPlatform
  // #endif
  // 版本号
  const version = import.meta.env.VITE_APP_VERSION || mpVersion
  switch (envType) {
    case 'develop' || 'development': // 开发版
      isLocal.value = true
      apiEnv.value = import.meta.env.VITE_API_DEVELOP_ENV
      break
    case 'trial' || 'preview': // 体验版
      apiEnv.value = import.meta.env.VITE_API_TRAIL_ENV
      break
    case 'release' || 'production': // 正式版
      apiEnv.value = import.meta.env.VITE_API_RELEASE_ENV
      break
    default:
      break
  }
  // 如果手动定义了环境，就使用定义
  if (ls.get('apiEnv')) {
    apiEnv.value = ls.get('apiEnv')
  }

  const isDev = computed(() => apiEnv.value === 'dev')
  const isProd = computed(() => apiEnv.value === 'prod')

  const ui = useUi()
  function toggle(env: 'dev' | 'prod') {
    apiEnv.value = env
    ls.set('apiEnv', env)
    useApiAuth().reset() // 清空登录状态
    ui.showToast(`已切换到${env === 'dev' ? '开发' : '生产'}`)
  }

  const debug = ref(!!ls.get('debug'))
  // #ifdef H5
  let vConsole: any
  watch(debug, async (val) => {
    if (val) {
      const { default: VConsole } = await import('vconsole')
      vConsole = new VConsole()
      ui.showToast(`调试已开启`)
    }
    else {
      if (vConsole) {
        vConsole.destroy()
        vConsole = undefined
        ui.showToast(`调试已关闭`)
      }
    }
  }, {
    immediate: true,
  })
  // #endif
  async function toggleDebug() {
    debug.value = !debug.value
    ls.set('debug', debug.value)
  }

  console.log('初始化环境', unref({
    appId,
    envType,
    version,
    platform,
    isLocal: isLocal.value,
    isDev: isDev.value,
    isProd: isProd.value,
    apiEnv: isProd.value,
    debug: debug.value,
  }))
  console.log(import.meta.env)

  return {
    isLocal,
    isDev,
    isProd,
    apiEnv,
    version,
    platform,
    appId,
    envType,
    toggle,
    debug,
    toggleDebug,
  }
})
