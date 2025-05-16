const corpId = import.meta.env.VITE_CORP_ID
const defaultUrl = import.meta.env.VITE_CS_URL

let currentUrl: string

export function getCustomerServiceUrl(params: any) {

}

// 调用接口打开客服
export function openCustomerServiceChat() {
  // #ifdef H5
  router.push(`https://work.weixin.qq.com/kfid/kfcb2a9f70e4c02c5f4`)
  // #endif
  // #ifdef MP-WEIXIN
  uni.openCustomerServiceChat({
    extInfo: {
      url: currentUrl || defaultUrl,
    },
    corpId,
    success(res) {
      console.log('客服成功')
    },
    fail(err) {
      console.log('客服失败', err)
    },
  })
  // #endif
}
export const aliTntInstId = import.meta.env.VITE_ALI_TNT_INST_ID
export const aliScene = import.meta.env.VITE_ALI_SCENE
