let _instance: Promise<any> | null = null

export function useApiAuth() {
  const userStore = useUserStore()

  const { api } = useApi()
  function _login() {
    return new Promise(async (resolve, reject) => {
      try {
        let url: string
        let loginRes: any
        // #ifdef H5
        url = 'login/by-h5'
        // #endif
        // #ifdef MP-WEIXIN
        url = 'login/by-wechat'
        // #endif
        // #ifdef MP-TOUTIAO
        url = 'login/by-douyin'
        // #endif
        // #ifdef MP-ALIPAY
        url = 'login/by-alipay'
        // #endif

        // #ifdef H5
        const code = new URL(location.href).searchParams.get('o') || ls.get('openId') || utils.randomStr()
        ls.set('openId', code)
        loginRes = {
          code,
        }
        // #endif
        // #ifndef H5
        loginRes = await uni.login()
        // #endif
        // #ifdef MP-ALIPAY
        loginRes = { code: loginRes.code }
        // #endif

        // 获取启动参数用于确定新用户来源
        const { query } = uni.getLaunchOptionsSync()
        loginRes.clientQuery = query

        const res = await api.request({
          url,
          auth: false,
          params: loginRes,
        })
        console.log('登录成功', res)
        // newUser用于注册事件上报，上报完成后会被置为false
        const { authorization, user, newUser } = res
        userStore.setToken({
          secret: authorization,
          uid: user.uid,
        })
        userStore.set({
          name: user.username,
          openId: user.openId,
          phone: user.phone,
          newUser,
        })
        resolve(res)
      }
      catch (e) {
        _instance = null
        reject(e)
      }
    })
  }

  return {
    reset: () => {
      _instance = null
    },
    login: () => {
      if (!_instance) {
        _instance = _login()
      }
      return _instance
    },
    check: () => {
      return api.query({
        url: 'login/check',
      })
    },
    bindPhone: (params: any) => {
      return api.add({
        url: '/app/user/bind-phone',
        method: 'GET',
        params,
      })
    },
  }
}
