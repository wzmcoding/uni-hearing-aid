import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  pages: [],
  globalStyle: {
    'navigationBarTitleText': '飞驴速运',
    'navigationBarBackgroundColor': '@bgSubtitle',
    'navigationBarTextStyle': '@navTxtStyle',
    'backgroundColor': '@textForeground',
    'backgroundTextStyle': '@bgTxtStyle',
    'backgroundColorTop': '@bgMuted',
    'backgroundColorBottom': '@bgSecondary',
    'app-plus': {
      // titleNView: false, // 移除 H5、APP 顶部导航
    },
    'h5': {
      titleNView: {
        titleText: ' ',
      },
    },
  },
})
