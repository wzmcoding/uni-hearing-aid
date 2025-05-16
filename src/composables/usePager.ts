import { computed, getCurrentInstance, onUnmounted, reactive } from 'vue'
import { onPullDownRefresh, onReachBottom, onUnload } from '@dcloudio/uni-app'
import { last } from 'lodash-es'

export interface PagerRes {
  list: any[]
  pagination: {
    total: number
    page: number
    size: number
    [key: string]: any
  }
  [key: string]: any
}
// 游标形式的分页
export interface CursorRes {
  list: any[]
  pagination: {
    cursor?: string
    size: number
    [key: string]: any
  }
  [key: string]: any
}

export function usePager<T = any>(data: T[] = []) {
  const { proxy }: any = getCurrentInstance()
  const ui = useUi()

  // 分页信息
  const pager = reactive<{
    params: any
    pagination: {
      cursor?: string
      size: number
      [key: string]: any
    }
    list: T[]
    loading: boolean
    finished: boolean
  }>({
    params: {}, // 查询条件
    pagination: {
      cursor: undefined,
      size: 20,
    },
    list: data, // 列表
    loading: false,
    finished: false,
  })

  // 事件
  const events: any = {}

  // 列表
  const list = computed(() => pager.list)

  // 刷新
  async function refresh(params?: any, options?: { clear?: boolean, loading?: boolean }) {
    if (pager.loading) {
      return false
    }

    if (proxy.refresh) {
      await proxy.refresh(params, options)
    }
    else if (proxy.$.exposed.refresh) {
      await proxy.$.exposed.refresh(params, options)
    }
    else {
      console.log('use defineExpose({ refresh })')
    }
  }

  // 数据
  function onData(cb: (list: T[]) => void) {
    events.onData = cb
  }

  // 刷新
  function onRefresh(params: any = {}, options?: { clear?: boolean, loading?: boolean }) {
    const { clear, loading = true } = options || {}

    // 是否清空
    if (clear) {
      pager.list = []
      pager.finished = false
      delete pager.pagination.cursor
    }

    // 合并请求参数
    Object.assign(pager.params, params)

    const data = {
      ...pager.pagination,
      ...pager.params,
    }

    // 是否显示加载动画
    if (!data.cursor && loading) {
      ui.showLoading()
    }

    pager.loading = true

    // 完成
    function done() {
      ui.hideLoading()
      pager.loading = false
    }

    return {
      data,
      done,
      next: (req: Promise<T[]>) => {
        return new Promise((resolve, reject) => {
          req.then((res: T[]) => {
            // 设置列表数据
            if (!data.cursor) {
              (pager.list as T[]) = res
            }
            else {
              (pager.list as T[]).push(...res)
            }

            // 追加事件
            if (events.onData) {
              events.onData(res)
            }

            // 是否加载完成
            pager.finished = pager.list.length < pager.pagination.size
            // 更新分页信息
            pager.pagination.cursor = last(res as { id: string }[])?.id

            done()
            resolve(res)
          }).catch((err) => {
            done()
            reject(err)
          })
        })
      },
    }
  }

  // 是否注册，避免在组件中重复注入事件问题
  let isReg = true
  // 关闭
  function close() {
    isReg = false
    ui.hideLoading()
  }

  // 上拉加载
  onReachBottom(() => {
    if (isReg) {
      if (!pager.finished) {
        refresh()
      }
    }
  })

  // 下拉刷新
  onPullDownRefresh(async () => {
    if (isReg) {
      await refresh({}, { clear: true })
      uni.stopPullDownRefresh()
    }
  })

  // 组件销毁
  onUnmounted(close)

  // 离开页面
  onUnload(close)

  return {
    pager,
    list,
    onData,
    onRefresh,
    onPullDownRefresh,
    onReachBottom,
  }
}
