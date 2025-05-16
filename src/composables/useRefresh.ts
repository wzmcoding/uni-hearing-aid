interface RefreshParams {
  data?: any
  force?: boolean
  callback?: Function
}

// 订阅更新事件
export function useRefresh(eventName: string) {
  let refreshParams: RefreshParams | null = null

  const usePicker = usePickerStore()
  uni.$on(eventName, (params = {}) => {
    refreshParams = params
    // 刷新缓存
    const type = eventName.split(':')[1]
    if (refreshParams?.data) {
      usePicker.setCache(type, refreshParams?.data)
    }
  })

  // 事件
  const events: any = {}

  function onRefresh(cb: (params: RefreshParams | null) => void) {
    events.onRefresh = cb
  }

  onShow(async () => {
    if (refreshParams) {
      if (events.onRefresh) {
        events.onRefresh(refreshParams)
      }
      refreshParams = null
    }
  })

  return {
    onRefresh,
  }
}
