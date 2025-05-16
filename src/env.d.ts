/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare namespace UniNamespace {
  interface MicroApp {
    mpVersion: string
    envType: 'development' | 'preview' | 'production'
    appId: string
  }
  interface Common {
    USER_DATA_PATH: string
  }

  /**
   * 抖音头条系小程序专用方法
   */
  interface EnvInfo {
    /**
     * 小程序环境信息
     */
    microapp: MicroApp
    /**
     * 其他一般信息
     */
    common: Common
  }
}

interface Uni {
  getEnvInfoSync(): UniNamespace.EnvInfo
}
