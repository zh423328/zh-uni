<template>
  <view class="content flex flex-col items-center justify-center">
    <image class="logo w-32 h-32 rounded-full shadow-lg" src="/static/logo.png"></image>
    <view class="text-area mt-8">
      <text class="title text-2xl font-bold text-blue-600">{{ title }}</text>
    </view>
    <view class="mt-12 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl">
      <text class="text-white text-lg font-semibold">UnoCSS 正常工作！</text>
    </view>
    
    <!-- 更多测试样式 -->
    <view class="mt-8 flex flex-wrap gap-4">
      <view class="px-6 py-3 bg-red-500 text-white rounded-lg">
        <text>红色按钮</text>
      </view>
      <view class="px-6 py-3 bg-green-500 text-white rounded-lg">
        <text>绿色按钮</text>
      </view>
      <view class="px-6 py-3 bg-blue-500 text-white rounded-lg shadow-md">
        <text>蓝色按钮带阴影</text>
      </view>
    </view>
    
    <view class="mt-8 w-64 h-24 bg-gradient-to-r from-pink-400 to-purple-400 rounded-xl center">
      <text class="text-white font-bold text-xl">渐变卡片</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('欢迎来到zh-uni-tempalte')
</script>

<style lang="scss" scoped>
.content {
  .logo {
    height: 200rpx;
    width: 200rpx;
    margin-top: 200rpx;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 50rpx;
  }

  .text-area {
    display: flex;
    justify-content: center;
  }

  .title {
    font-size: 36rpx;
    color: #8f8f94;
  }
}
</style>
