import { merge } from 'lodash-es'

interface DebugOptions {
  times?: number
  timeout?: number
  callback?: () => void
}

const defaultOptions: DebugOptions = { times: 10, timeout: 5000, callback: () => {} }

export function useDebug(options?: DebugOptions) {
  let count = 0
  let timer: any

  const ui = useUi()

  onUnmounted(() => {
    clearTimeout(timer)
  })

  async function call() {
    const { times, timeout, callback } = merge({}, defaultOptions, options)
    clearTimeout(timer)
    timer = setTimeout(() => {
      count = 0
    }, timeout)
    count += 1
    if (count > times! - 5) {
      if (count === times) {
        clearTimeout(timer)
        count = 0
        if (callback) {
          callback()
        }
      }
      else {
        ui.showToast(`再按${times! - count}次打开调试模式`)
      }
    }
  }

  return { call }
}
