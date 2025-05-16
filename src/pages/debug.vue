<script setup lang="ts">
import { useEnvStore } from '~/stores/env'

const env = useEnvStore()
const appName = import.meta.env.VITE_APP_NAME
const { version } = useEnvStore()
</script>

<template>
  <MlPage>
    <div class="h-100vh flex flex-col items-center justify-center gap-4 px-8">
      <div>
        当前小程序：
        {{ appName }}
      </div>
      <div>
        当前版本号：
        {{ version }}
      </div>
      <div>
        当前环境：
        {{ env.isDev ? '开发环境' : '生产环境' }}
      </div>
      <div class="text-secondary-foreground">
        切换环境在清除本地缓存前始终有效
      </div>
      <button
        class="w-full btn px-6 py-3 text-4"
        :class="{ disabled: env.isDev }"
        :disabled="env.isDev"
        @click="env.toggle('dev')"
      >
        切换到开发环境
      </button>
      <button
        class="w-full btn px-6 py-3 text-4"
        :class="{ disabled: env.isProd }"
        :disabled="env.isProd"
        @click="env.toggle('prod')"
      >
        切换到生产环境
      </button>
      <!-- #ifdef H5 -->
      <button
        class="w-full btn px-6 py-3 text-4"
        @click="env.toggleDebug"
      >
        {{ env.debug ? '关闭调试' : '打开调试' }}
      </button>
      <!-- #endif -->
      <button class="w-full btn-accent px-6 py-3 text-4" @click="router.replace('/pages/index')">
        回到首页
      </button>
    </div>
  </MlPage>
</template>
