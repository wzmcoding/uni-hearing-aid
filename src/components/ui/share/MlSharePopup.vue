<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import TnPopup from '@tuniao/tnui-vue3-uniapp/components/popup/src/popup.vue'

export default defineComponent({
  name: 'MlSharePopup',
  components: { TnPopup },

  setup() {
    // 是否显示
    const visible = ref(false)

    // 配置
    const conf = reactive<any>({})

    // 打开
    function open(options: MlShare.Options) {
      Object.assign(conf, { qq: true, wx: true, type: 0 }, options)
      visible.value = true
    }

    // 关闭
    function close() {
      visible.value = false
    }

    // 分享成功
    function onSuccess() {
      if (conf.success) {
        conf.success()
      }
    }

    // 分享失败
    function onFail(err: any) {
      if (conf.fail) {
        console.error('分享失败', err)
        conf.fail(err)
      }
    }

    return {
      visible,
      conf,
      open,
      close,
      onSuccess,
      onFail,
    }
  },
})
</script>

<template>
  <TnPopup v-model="visible" open-direction="bottom">
    <view class="ml-share-popup">
      <ml-share
        :qq="conf.qq"
        :wx="conf.wx"
        :text="conf.text"
        :type="conf.type"
        :title="conf.title"
        :summary="conf.summary"
        :href="conf.href"
        :image-url="conf.imageUrl"
        :media-url="conf.mediaUrl"
        :mini-program="conf.miniProgram"
        @success="onSuccess"
        @fail="onFail"
        @choose="close"
      />
    </view>
  </TnPopup>
</template>

<style lang="scss">
/*
.ml-share-popup {
  .ml-share {
    border-radius: 0;

    .item {
      height: 300rpx;
    }
  }
}*/
</style>
