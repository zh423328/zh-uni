

import { presetUni } from '@uni-helper/unocss-preset-uni'

import {
  defineConfig,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUni({
      attributify: false,
    }),
    presetIcons({
      scale: 1.2,
      warn: false,
      extraProperties: {
        'display': 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  
  // 自定义规则
  rules: [
    ['glass', {
      'background': 'rgba(255, 255, 255, 0.1)',
      'backdrop-filter': 'blur(20px)',
      'border': '1px solid rgba(255, 255, 255, 0.2)'
    }],
    ['border-gradient', {
      'border': '2px solid transparent',
      'background': 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box'
    }]
  ],
  
  shortcuts: {
    'btn-primary': 'bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-6 rounded-xl',
    'card-glass': 'bg-white/10 backdrop-blur-xl rounded-2xl p-6',
    'center': 'flex justify-center items-center',
  },
  
  // 主题配置，适配小程序
  theme: {
    fontSize: {
      '2xs': ['20rpx', '28rpx'],
      '3xs': ['18rpx', '26rpx'],
    },
  }
})