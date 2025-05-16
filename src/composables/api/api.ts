import { merge } from 'lodash-es'

export interface ResponseData {
  status?: string
  errMsg: string
  data?: any
}

export interface RequestConfig {
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  baseURL?: string
  headers?: any
  params?: any
  data?: any
  successCode?: number | string // 后台返回表示成功的状态码
  auth?: boolean // 是否需要登录
  _retry?: number // 重试次数
  loading?: {
    enable?: boolean
    text?: string
    lock?: boolean
  }
  message?: {
    success?: {
      enable?: boolean
      text?: string
      title?: string
      type?: 'toast' | 'alert'
    }
    error?: {
      enable?: boolean
      text?: string
      title?: string
      type?: 'toast' | 'alert'
    }
  }
  resultHandler?: (res: any) => any // 查询结果处理
  logoutHandler?: Function // 登录失效处理
  appendData?: Function // 添加公共参数
  returnResponse?: boolean // 不解析response返回data，直接视为成功并返回
}

export interface UploadRequestConfig extends RequestConfig {
  data: {
    file?: File
    filename?: string
    filePath?: string
    [key: string]: any
  }
}

export class APIError extends Error {
  data?: any
  code?: number | string

  constructor(result: { errMsg: string, status?: string, data?: any }) {
    if (typeof result === 'string') {
      super(result)
      return
    }
    super(result.errMsg)
    if ('status' in result) {
      this.code = result.status
    }
    if ('data' in result) {
      this.data = result.data
    }
    this.name = 'APIError'
  }
}

export interface API {
  defaults: RequestConfig
  request(config: RequestConfig): Promise<any>
  query(config: RequestConfig): Promise<any>
  page(config: RequestConfig, pageInfo: { pageSize: number, currentPage: number, simple: boolean }): Promise<any>
  add(config: RequestConfig): Promise<any>
  update(config: RequestConfig): Promise<any>
  delete(config: RequestConfig): Promise<any>
  upload(config: UploadRequestConfig): Promise<any>
  download(config: RequestConfig): void
  [key: string]: any
}
export function useApi() {
  const env = useEnvStore()
  const userStore = useUserStore()

  const BASE_URL = computed(() => env.isDev ? import.meta.env.VITE_API_URL_DEV : import.meta.env.VITE_API_URL_PROD)
  const APP_MARK = computed(() => env.isDev ? import.meta.env.VITE_APP_MARK_DEV : import.meta.env.VITE_APP_MARK_PROD)

  const { buildURL, combineURLs, isAbsoluteURL } = utils

  const DEFAULTS: RequestConfig = {
    successCode: '00', // 后台返回表示成功的状态码
    auth: true, // 是否需要登录
    loading: {
      enable: false,
      text: '加载中...',
      lock: true,
    },
    message: {
      success: {
        enable: false,
        type: 'toast',
      },
      error: {
        enable: true,
        type: 'toast',
      },
    },
    returnResponse: false, // 不解析response返回data，直接视为成功并返回
  }

  function showLoading({ text = '加载中...', lock = true }) {
    return uni.showLoading(
      {
        title: text,
        mask: lock,
      },
    )
  }

  function hideLoading() {
    return uni.hideLoading()
  }

  function showError({ title, text, type }: { title?: string, text?: string, type?: 'toast' | 'alert' } = { title: '', text: '', type: 'toast' }) {
    switch (type) {
      case 'alert':
        uni.showModal({
          title,
          content: text || title,
          showCancel: false,
        })
        break
      case 'toast':
      default:
        uni.showToast({
          title: text || title,
          icon: 'none',
        })
        break
    }
  }

  function showSuccess({ title, text, type }: { title?: string, text?: string, type?: 'toast' | 'alert' } = { title: '', text: '', type: 'toast' }) {
    switch (type) {
      case 'alert':
        uni.showModal({
          title,
          content: text || title,
          showCancel: false,
        })
        break
      case 'toast':
      default:
        uni.showToast({
          title,
          icon: 'success',
        })
        break
    }
  }

  // 删除空参数
  function deleteEmptyData(data: any) {
    if (data) {
      for (const key in data) {
        const val = data[key]
        if (typeof val === 'undefined' || val === '' || val === null) {
          delete data[key]
        }
      }
    }
    return data
  }

  // 添加通用参数
  function appendData(config: RequestConfig) {
    if (!config.params) {
      config.params = {}
    }

    // 添加公共参数
    if (config.appendData) {
      config.appendData(config)
    }

    // 添加用户token
    if (config.auth) {
      config.params = merge(config.params, userStore.token)
    }

    return config
  }
  // const debouncedShowError = debounce((config, e) => {
  //   showError({
  //     ...config.message?.error,
  //     text: e?.data?.errMsg || e.message,
  //   })
  // }, 300)
  function createApi(apiConfig: RequestConfig) {
    const defaults = merge({}, DEFAULTS, apiConfig)
    return {
      defaults,

      action(config: RequestConfig): Promise<any> {
        function _action(sourceConfig: RequestConfig): Promise<any> {
          return new Promise((resolve, reject) => {
            // 删除空参数
            deleteEmptyData(config.params)
            deleteEmptyData(config.data)
            // 添加公共参数
            appendData(config)

            if (config.loading?.enable) {
              showLoading(config.loading)
            }
            let { url, data, params, method, headers } = config
            if (config.baseURL && !isAbsoluteURL(url!)) {
              url = combineURLs(config.baseURL, url!)
            }
            if (method === 'POST' || method === 'PUT') {
              if (params) {
                url = buildURL(url!, params)
              }
            }
            const uniOptions: UniNamespace.RequestOptions = {
              url: url!,
              method,
              header: headers,
            }
            if (method === 'POST' || method === 'PUT') {
              uniOptions.data = data
            }
            else {
              uniOptions.data = params
            }
            const requestKey = Math.random()
            console.log('request', requestKey, uniOptions)
            uni.request({
              ...uniOptions,
              success(res) {
                console.log('success', url, requestKey, res)
                if (config.returnResponse) {
                  if (config.message?.success?.enable) {
                    showSuccess(config.message?.success)
                  }
                  resolve(res)
                }
                else {
                  const result = res.data as ResponseData
                  let { status, data } = result
                  if (res.statusCode === 200) {
                    // 请求成功且业务成功
                    if (status === config.successCode) {
                      if (config.message?.success?.enable) {
                        showSuccess({
                          ...config.message?.success,
                          text: result.errMsg,
                        })
                      }
                      if (config.resultHandler) {
                        data = config.resultHandler(data)
                      }
                      resolve(data)
                    }
                    else {
                      // 请求成功但业务失败
                      const e = new APIError(result)
                      if (config.message?.error?.enable) {
                        showError({
                          ...config.message?.error,
                          text: e.message,
                        })
                      }
                      reject(e)
                    }
                  }
                  else {
                    // 请求失败
                    if (res.statusCode === 401) {
                      if (sourceConfig._retry && sourceConfig._retry > 1) {
                        userStore.clear()
                        router.push({
                          path: '/pages/error',
                        })
                      }
                      else {
                        sourceConfig._retry = sourceConfig._retry || 0
                        sourceConfig._retry++
                        useApiAuth().login()
                          .then(() => {
                            resolve(_action(sourceConfig))
                          })
                          .catch((err: any) => {
                            reject(err)
                          })
                      }
                    }
                    else {
                      if (config.message?.error?.enable) {
                        showError({
                          ...config.message?.error,
                          text: result?.errMsg,
                        })
                      }
                      reject(new APIError(result))
                    }
                  }
                }
              },
              fail(e: UniApp.GeneralCallbackResult) {
                console.log('fail', url, requestKey, e)
                // #ifdef MP-ALIPAY
                // 支付宝小程序特殊处理，请求失败会进入fail回调
                const res = e as UniApp.RequestSuccessCallbackResult & { statusCode?: number, data?: any }
                if (res.statusCode === 401) {
                  if (sourceConfig._retry && sourceConfig._retry > 1) {
                    userStore.clear()
                    router.push({
                      path: '/pages/error',
                    })
                  }
                  else {
                    sourceConfig._retry = sourceConfig._retry || 0
                    sourceConfig._retry++
                    useApiAuth().login()
                      .then(() => {
                        resolve(_action(sourceConfig))
                      })
                      .catch((err: any) => {
                        reject(err)
                      })
                  }
                }
                else {
                  if (config.message?.error?.enable) {
                    showError({
                      ...config.message?.error,
                      text: e.errMsg,
                    })
                  }
                  const error = new APIError(e)
                  reject(error)
                }
                // #endif
                // #ifndef MP-ALIPAY
                if (config.message?.error?.enable) {
                  showError({
                    ...config.message?.error,
                    text: e.errMsg,
                  })
                }
                const error = new APIError(e)
                reject(error)
                // #endif
              },
              complete() {
                if (config.loading?.enable) {
                  hideLoading()
                }
              },
            })
          })
        }
        return _action(config)
      },

      request(config: RequestConfig) {
        config = merge(
          {
            message: {
              success: {
                enable: false,
                title: '操作成功',
              },
              error: {
                enable: false,
                title: '操作失败',
              },
            },
          },
          config,
        )
        config = merge({}, this.defaults, config)
        return this.action(config)
      },

      query(config: RequestConfig) {
        config = merge(
          {
            method: 'GET',
            message: {
              success: {
                enable: false,
              },
              error: {
                enable: true,
                title: '查询失败',
              },
            },
          },
          config,
        )
        return this.request(config)
      },

      // 传统分页接口 目前已改用游标形式，该接口暂时无用
      page(config: RequestConfig, { pageSize = 10, currentPage = 1, simple = false }) {
        return new Promise((resolve, reject) => {
          config = merge(
            {
              method: 'GET',
              message: {
                success: {
                  enable: false,
                },
                error: {
                  enable: true,
                  title: '查询失败',
                },
              },
            },
            config,
            {
              params: {
                pageLimit: pageSize,
                pageIndex: currentPage,
              },
            },
          )
          this.action(config)
            .then((res: any) => {
              let pagingData
              if (simple) {
                // 后端不返回分页信息
                pagingData = {
                  list: res, // 分页数据(required)
                  total: 0, // 总数(required)
                  currentPage: 1, // 当前页码(required)
                  pageSize: 0, // 分页数设定值
                  length: 0, // 分页数实际值(比如设定pageSize为10，但最后一页只有7条记录，size为7)
                  pages: 1, // 总页数
                  startRow: 0, // 当前起始索引
                  endRow: 0, // 当前结尾索引
                }
              }
              else {
                const list = res.records
                const total = res.total
                const currentPage = res.current || 1
                const pageSize = res.size
                const length = list.length
                const pages = res.pages || 1
                const startRow = (currentPage - 1) * pageSize + 1
                const endRow = startRow + length - 1

                pagingData = {
                  list, // 分页数据(required)
                  total, // 总数(required)
                  currentPage, // 当前页码(required)
                  pageSize, // 分页数设定值
                  length, // 分页数实际值(比如设定pageSize为10，但最后一页只有7条记录，size为7)
                  pages, // 总页数
                  startRow, // 当前起始索引
                  endRow, // 当前结尾索引
                }
              }
              if (config.resultHandler) {
                pagingData.list = config.resultHandler(pagingData.list)
              }

              resolve(pagingData)
            })
            .catch((error: any) => {
              reject(error)
            })
        })
      },

      add(config: RequestConfig) {
        config = merge(
          {
            method: 'POST',
            message: {
              success: {
                enable: false,
                title: '添加成功',
              },
              error: {
                enable: true,
                title: '添加失败',
              },
            },
          },
          config,
        )
        return this.request(config)
      },

      update(config: RequestConfig) {
        config = merge(
          {
            method: 'POST',
            message: {
              success: {
                enable: false,
                title: '修改成功',
              },
              error: {
                enable: true,
                title: '修改失败',
              },
            },
          },
          config,
        )
        return this.request(config)
      },

      delete(config: RequestConfig) {
        config = merge(
          {
            method: 'POST',
            message: {
              success: {
                enable: false,
                title: '删除成功',
              },
              error: {
                enable: true,
                title: '删除失败',
              },
            },
          },
          config,
        )
        return this.request(config)
      },

      download(config: RequestConfig) {
        config = merge({}, this.defaults, config)

        // 删除空参数
        deleteEmptyData(config.params)
        deleteEmptyData(config.data)
        // 添加公共参数
        appendData(config)
        let { url, params } = config
        if (config.baseURL && !isAbsoluteURL(url!)) {
          url = combineURLs(config.baseURL, url!)
        }

        const headers = this.defaults.headers
        params = merge(
          {},
          headers,
          params,
        )
        uni.downloadFile({
          url: buildURL(url!, params),
        })
      },

      upload(config: UploadRequestConfig) {
        config = merge(
          {},
          this.defaults,
          {
            lock: false,
            showSuccess: false,
            // showError: false,
            method: 'POST',
            successMessage: '上传成功',
            errorMessage: '上传失败',
          },
          config,
        )
        let { url, params } = config
        if (config.baseURL && !isAbsoluteURL(url!)) {
          url = combineURLs(config.baseURL, url!)
        }
        if (params) {
          url = buildURL(url!, params)
        }
        const { file, filename, filePath, ...formData } = config.data
        const uniOptions: UniNamespace.UploadFileOption = {
          url: url!,
          file,
          name: filename,
          filePath,
          formData,
          header: config.headers,
        }
        return new Promise((resolve, reject) => {
          uni.uploadFile({
            ...uniOptions,
          })
            .then((result) => {
              if (config.returnResponse) {
                resolve(result)
              }
              else {
                resolve(result.data)
              }
            })
            .catch((error) => {
              reject(error)
            })
        })
      },
    } as API
  }

  const api = createApi({
    // baseURL: BASE_URL.value,
    successCode: '00',
    appendData: (config: any) => {
      config.params._t = +new Date()
      config.params.a = APP_MARK.value
      config.baseURL = BASE_URL.value
      config.params.v = env.version
      config.params.c = env.platform
    },
  })
  return {
    api,
    BASE_URL,
    APP_MARK,
  }
}
