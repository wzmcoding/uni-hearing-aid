import {
  defineConfig,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { presetUni } from '@uni-helper/unocss-preset-uni'

export default defineConfig({
  presets: [
    // 由 Iconify 提供支持的纯 CSS 图标解决方案
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
    /**
     * unocss uni-app 小程序预设
     * @see https://github.com/uni-helper/unocss-preset-uni
     */
    presetUni({
      remRpx: true,
      uno: {
        dark: 'class',
      },
      attributify: {
        ignoreAttributes: ['underline', 'fixed', 'top', 'size', 'text-align'],
      },
    }),
  ],
  rules: [
    ['bottom-0-safe', { bottom: 'env(safe-area-inset-bottom)' }],
    ['pb-0-safe', { 'padding-bottom': 'env(safe-area-inset-bottom)' }],
    ['h-safe', { height: 'env(safe-area-inset-bottom)' }],
  ],
  /**
   * 自定义快捷语句
   * @see https://github.com/unocss/unocss#shortcuts
   */
  shortcuts: [
    ['fixed-bottom-container', 'fixed bottom-0 left-0 right-0 bg-background pb-0-safe'],
    ['center', 'flex justify-center items-center'],
    ['card', 'rounded-xl bg-background'],
    ['divider', 'h-1px bg-secondary'],
    ['divider-v', 'w-1px bg-secondary h-full'],
    ['btn', 'leading-none rounded-full inline-flex items-center justify-center cursor-pointer bg-primary text-primary-foreground border border-primary border-solid'],
    ['btn-default', 'btn border-muted-foreground bg-background text-foreground'],
    ['btn-accent', 'btn border-accent bg-accent'],
    ['btn-outline', 'btn bg-transparent text-primary'],
    ['btn-accent-outline', 'btn-accent bg-transparent text-accent'],
  ],
  transformers: [
    transformerDirectives(), // 启用 @apply 功能
    transformerVariantGroup(), // 启用 () 分组功能
  ],
  safelist: 'prose prose-sm m-auto text-left visible invisible'.split(' '),
  theme: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      input: 'hsl(var(--input))',
      title: 'hsl(var(--title))',
      subtitle: 'hsl(var(--subtitle))',
      primary: {
        DEFAULT: 'hsl(var(--primary))',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      muted: {
        DEFAULT: 'hsl(var(--muted))',
        foreground: 'hsl(var(--muted-foreground))',
      },
      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
    },
    // breakpoints: {
    // lg: '960px',
    // },
  },
})
