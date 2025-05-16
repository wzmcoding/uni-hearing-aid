import { useSDKReport } from '@/lib/sdkReport'
import type { ReportConfig } from '~/composables/api/report'

export function useReport() {
  const userStore = useUserStore()
  const unwatch = watch(() => userStore.info, (newVal) => {
    if (newVal) {
      userActive()
      nextTick(() => {
        unwatch()
      })
    }
  }, { immediate: true })
  // 用户激活
  async function userActive() {
    const service = useService()
    let channel
    try {
      const config = await service.report.config() as ReportConfig
      channel = config.biReportChannel
    }
    catch (e) {
    }
    try {
      service.report.activeApp()
    }
    catch (e) {
      console.log('激活app事件上报失败', e)
    }

    if (channel === 'GDT') {
      try {
        service.report.register()
      }
      catch (e) {
        console.log('注册事件上报失败', e)
      }
    }
    else {
      const sdkReport = useSDKReport()
      sdkReport.userActive()
    }
  }

  return {
    userActive,
    // reportOrder,
  }
}
