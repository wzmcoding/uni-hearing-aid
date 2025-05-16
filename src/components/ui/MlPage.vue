<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { TnModalInstance } from '@tuniao/tnui-vue3-uniapp'
import type { ModalOptions } from '@tuniao/tnui-vue3-uniapp/components/modal/src/modal'
import TnModal from '@tuniao/tnui-vue3-uniapp/components/modal/src/modal.vue'

// const { refs, setRefs } = useRefs()

const env = useEnvStore()

const modalRef = ref<TnModalInstance>()

// 加载器
const loader = reactive({
  loading: false,
  text: '加载中',
})

// 显示加载框
function showLoading(text: string) {
  loader.loading = true
  loader.text = text
}

// 隐藏加载框
function hideLoading() {
  loader.loading = false
}

// 提示框
function showToast(options: UniNamespace.ShowToastOptions | string) {
  // refs.toast?.open(options)
  if (typeof options === 'string') {
    options = {
      title: options,
      icon: 'none',
    }
  }
  uni.showToast(options)
}

// 确认框
function showConfirm(options: ModalOptions) {
  // refs.confirm?.open(options)
  modalRef.value?.showModal({
    showCancel: true,
    ...options,
  })
}

// 提示框
function showTips(content: string, title: string = '操作提示', callback?: () => Promise<boolean>) {
  modalRef.value?.showModal({
    title,
    content,
    showCancel: false,
    confirm: () => {
      return callback ? callback() : true
    },
  } as ModalOptions)
}

const errorMessage = ref('')
const errorVisible = ref(false)
const retryCallback = ref<Function | undefined>(undefined)

function showError(message: string, callback?: () => void) {
  errorMessage.value = message
  errorVisible.value = true
  retryCallback.value = callback
}

function retry() {
  if (retryCallback.value) {
    errorVisible.value = false
    retryCallback.value()
    errorMessage.value = ''
    retryCallback.value = undefined
  }
}

// 追加方法
const page = router.currentPage()

if (page) {
  page['ml-page'] = {
    loaded: false,
    showLoading,
    hideLoading,
    showToast,
    showConfirm,
    showTips,
    showError,
  }

  onMounted(() => {
    page['ml-page'].loaded = true
  })
}
</script>

<template>
  <view class="">
    <!-- 遮罩层 -->
    <MlLoadingMask
      fullscreen
      :loading="loader.loading"
      :text="loader.text"
    />

    <!-- 提示 -->
    <!--    <cl-toast :ref="setRefs('toast')" /> -->

    <!-- 确认框 -->
    <TnModal ref="modalRef" />

    <view
      v-if="errorVisible"
      class="h-screen flex flex-col items-center pt-42 text-muted"
    >
      <div>
        <image class="h-35 w-35" src="/static/error.png" alt="错误页" />
      </div>
      <view class="my-5 text-center">
        <view class="text-xl text-secondary-foreground">
          页面加载错误!
        </view>
        <view class="mt-2 text-xs text-foreground">
          {{ errorMessage }}
        </view>
      </view>
      <view class="box-border flex items-center px-5">
        <button
          v-if="!!retryCallback"
          class="h-11 w-41 btn flex-1 p-3 text-4"
          @tap="retry"
        >
          重试
        </button>
      </view>
    </view>
    <!-- 内容插槽 -->
    <slot v-else />

    <!-- 底部安全区域 -->
    <view class="safe-area-bottom" />

    <!-- 开发环境提示 -->
    <view v-if="env.isDev" class="pointer-events-none fixed inset-0 z-99999 border-accent border-solid text-right">
      开发环境
    </view>
  </view>
</template>
