<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'MlShare',

  props: {
    type: {
      type: null,
      default: 0,
    },
    imageUrl: String,
    title: String,
    summary: String,
    href: String,
    mediaUrl: String,
    miniProgram: Object,
    text: {
      type: String,
      default: '分享至',
    },
    qq: {
      type: Boolean,
      default: true,
    },
    wx: {
      type: Boolean,
      default: true,
    },
  },

  emits: ['choose', 'success', 'error'],

  setup(props, { emit }) {
    function share() {
      uni.shareWithSystem({
        type: props.type,
        href: props.href,
        summary: props.summary,
        imageUrl: props.imageUrl,
        success: () => {
          emit('success')
        },
        fail: (err: any) => {
          emit('error', err)
        },
      })
    }

    function shareWx(scene: any) {
      choose('wx')

      uni.share({
        provider: 'weixin',
        type: props.type,
        title: props.title,
        scene,
        summary: props.summary,
        href: props.href,
        imageUrl: props.imageUrl,
        mediaUrl: props.mediaUrl,
        miniProgram: props.miniProgram,
        success: () => {
          emit('success')
        },
        fail: (err) => {
          console.error(err)
          share()
        },
      })
    }

    function shareQQ() {
      choose('qq')

      uni.share({
        provider: 'qq',
        type: props.type,
        title: props.title,
        summary: props.summary,
        href: props.href,
        imageUrl: props.imageUrl,
        mediaUrl: props.mediaUrl,
        miniProgram: props.miniProgram,
        success: () => {
          emit('success')
        },
        fail: () => {
          share()
        },
      })
    }

    function choose(name: string) {
      emit('choose', name)
    }

    return {
      shareWx,
      shareQQ,
      share,
    }
  },
})
</script>

<template>
  <view class="ml-share">
    <view class="ml-share__title">
      {{ text }}
    </view>

    <view class="ml-share__container">
      <!-- #ifdef APP -->
      <button v-if="qq" class="item" @tap="shareQQ">
        <image src="./qq.png" mode="aspectFit" />
        <text>QQ好友</text>
      </button>

      <button v-if="wx" class="item" @tap="shareWx('WXSceneTimeline')">
        <image src="./wx2.png" mode="aspectFit" />
        <text>朋友圈</text>
      </button>
      <!-- #endif -->

      <button v-if="wx" class="item" open-type="share" @tap="shareWx('WXSceneSession')">
        <image src="./wx.png" mode="aspectFit" />
        <text>微信好友</text>
      </button>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.ml-share {
  position: relative;

  &__title {
    font-size: 32rpx;
    text-align: center;
    padding-top: 30rpx;
  }

  &__container {
    display: flex;

    .item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      padding: 0;
      margin: 0;
      border: 0;
      height: 200rpx;
      line-height: normal;

      &::after {
        border: 0;
      }

      image {
        height: 100rpx;
        width: 100rpx;
      }

      text {
        font-size: 26rpx;
        margin-top: 20rpx;
      }

      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style>
