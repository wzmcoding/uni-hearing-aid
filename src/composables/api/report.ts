import dayjs from 'dayjs'

export interface ReportConfig {
  biTengyouhyKey: 'GDT' | 'TENGYOUHY'
  biReportChannel: string
}

export function useApiReport() {
  const { api } = useApi()
  function report(actionType?: string): Promise<any> {
    const env = useEnvStore()
    const userStore = useUserStore()

    const { query } = uni.getLaunchOptionsSync()
    console.log('launch query', query)
    return api.request({
      url: 'bi/report/v2/gdt',
      method: 'POST',
      data: {
        actions: [
          {
            outerActionId: utils.randomStr(), // 客户唯一行为id
            actionTime: dayjs().unix(), // 时间戳，单位秒
            userId: { // user_id，可采集到的设备标示
              wechatOpenid: userStore.info?.openId, // wechat_openid 和 wechat_unionid 二者必填一
              wechatAppId: env.appId, // 微信类上报必填，且必须通过授权。授权请参考微信数据接入
            },
            actionType, // 必填 行为类型
            // trace: query, // 参数全部传递给后台
            // actionParam: {
            //   value: 10000,
            // },
          },
        ],
        clientQuery: query,
      },
    })
  }

  return {
    // 获取应用配置
    config: () => {
      return api.request({
        url: 'app/application/config',
        method: 'POST',
      })
    },
    // 注册
    register: async (): Promise<any> => {
      // 仅新用户时上报
      const userStore = useUserStore()
      if (userStore.info?.newUser) {
        await report('REGISTER')
        userStore.info.newUser = false
        userStore.set(userStore.info)
      }
    },
    // 激活App
    activeApp: async (): Promise<any> => {
      return await report('ACTIVATE_APP')
    },
    // 行为上报
    userBehavior: (val: any): Promise<any> => {
      return api.request({
        url: 'event/userBehavior',
        method: 'POST',
        data: {
          event: 'open_custom_service',
          ...val,
        },
      })
    },
  }
}
