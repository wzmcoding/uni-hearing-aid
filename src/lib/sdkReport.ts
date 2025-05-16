// #ifndef H5
import WdhSuyunSdk from '@/lib/wdhSuyunSdk.js'

// #endif
const appKey = import.meta.env.VITE_REPORT_APP_KEY

export function useSDKReport() {
  const userStore = useUserStore()
  // 用户激活
  async function userActive() {
    // #ifdef H5

    interface WdhBaiduSdk {
      init(options: { appKey?: string }): void
      reportActive(options: { uid?: string }): void
      md5(str: string): string
    }

    await import('@/lib/wdhBaidu.js') // 修改了源码，暴露了其中的md5加密方法，避免重复引入
    const wdhBaiduSdk = (window as any as { wdhBaidu: WdhBaiduSdk }).wdhBaidu
    wdhBaiduSdk.init({ appKey })
    // 加签 详见：https://doc.apipost.net/docs/detail/313d9b1a2c64000?target_id=13d4032b7c4001
    const params: any = { uid: userStore.info?.openId, time: Math.floor(new Date().getTime() / 1000) }
    // 服务端key，目前固定值(放在前端似乎没有意义)
    const serverKey = '688bcfad4b7109269e1929343560c14d'
    const raw = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
      .join('&')
    const sign = wdhBaiduSdk.md5(raw + serverKey)
    params.sign = sign
    wdhBaiduSdk.reportActive(params)
    // #endif
    // #ifndef H5
    const WdhSuyunSdkClass = (WdhSuyunSdk as { default: any }).default
    const wdhSuyunSdk = new WdhSuyunSdkClass({ appKey })
    wdhSuyunSdk.reportActive({ openId: userStore.info?.openId })
    // #endif
  }
  // 订单上报
  // function reportOrder() {
  //   wdhSuyunSdk.reportActive({ openId: '123456' })
  // }

  return {
    userActive,
    // reportOrder,
  }
}
