<template>
    <view class="login-container">
        <!-- 背景装饰 -->
        <view class="bg-decoration">
            <view class="bg-circle bg-circle-1"></view>
            <view class="bg-circle bg-circle-2"></view>
            <view class="bg-circle bg-circle-3"></view>
            <view class="bg-shape bg-shape-1"></view>
            <view class="bg-shape bg-shape-2"></view>
        </view>

        <!-- 顶部Logo区域 -->
        <view class="logo-area">
            <view class="logo-wrapper">
                <view class="logo-icon">🚗</view>
                <view class="logo-glow"></view>
            </view>
            <view class="app-name">
                <text class="app-name-main">Uni.app摸板</text>
            </view>
        </view>

        <!-- 登录卡片 -->
        <view class="login-card">
            <!-- 登录方式选择器 -->
            <view class="login-tabs">
                <view v-for="tab in loginTabs" :key="tab.key" class="tab-item"
                    :class="{ active: activeTab === tab.key }" @click="switchTab(tab.key)">
                    <view class="tab-icon-wrapper">
                        <text class="tab-icon">{{ tab.icon }}</text>
                    </view>
                    <text class="tab-text">{{ tab.label }}</text>
                </view>
            </view>

            <!-- 登录表单区域 -->
            <view class="form-area">
                <!-- 账号密码登录 -->
                <view v-if="activeTab === 'account'" class="login-form">
                    <view class="input-group">
                        <view class="input-label">
                            <wd-icon name="user" size="20"></wd-icon>
                            <text>账号</text>
                        </view>
                        <view class="input-wrapper">
                            <input v-model="accountForm.username" class="account-input" type="text"
                                placeholder="请输入用户名或邮箱" />
                            <view class="input-border"></view>
                        </view>
                    </view>

                    <view class="input-group">
                        <view class="input-label">
                            <wd-icon name="lock-on" size="20"></wd-icon>
                            <text>密码</text>
                        </view>
                        <view class="input-wrapper">
                            <input v-model="accountForm.password" :type="showPassword ? 'text' : 'password'"
                                placeholder="请输入密码" />
                            <view class="eye-icon" @click="togglePasswordVisibility">
                                <wd-icon :name="showPassword ? 'view' : 'eye-close'" size="24" color="#999"></wd-icon>
                            </view>
                            <view class="input-border"></view>
                        </view>
                    </view>
                </view>

                <!-- 手机号验证码登录 -->
                <view v-if="activeTab === 'phone'" class="login-form">
                    <view class="input-group">
                        <view class="input-label">
                            <wd-icon name="phone" size="20"></wd-icon>
                            <text>手机号</text>
                        </view>
                        <view class="input-wrapper phone-wrapper">
                            <view class="area-code-selector">
                                <text class="area-code">+86</text>
                                <wd-icon name="arrow-down" size="20" color="#999"></wd-icon>
                            </view>
                            <input v-model="phoneForm.phoneNumber" class="phone-input" type="number"
                                placeholder="请输入手机号码" maxlength="11" @input="handlePhoneInput" />
                            <view class="input-border"></view>
                        </view>
                    </view>

                    <view class="input-group">
                        <view class="input-label">
                            <wd-icon name="chat" size="20"></wd-icon>
                            <text>验证码</text>
                        </view>
                        <view class="input-wrapper verify-wrapper">
                            <input v-model="phoneForm.verificationCode" class="verify-input" type="number"
                                placeholder="请输入6位验证码" maxlength="6" />
                            <view class="send-code-wrapper">
                                <button class="send-code-btn" :disabled="countdown > 0" @click="sendVerificationCode">
                                    {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                                </button>
                            </view>
                            <view class="input-border"></view>
                        </view>
                    </view>
                </view>


                <!-- 登录按钮 -->
                <view class="button-area">
                    <button class="login-btn" :disabled="!canLogin || isLoading" @click="handleLogin">
                        <view v-if="isLoading" class="loading-wrapper">
                            <view class="loading-spinner"></view>
                            <text class="loading-text">登录中...</text>
                        </view>
                        <view v-else class="login-content">
                            <text class="login-text">{{ activeTab === 'wechat' ? '微信一键登录' : '立即登录' }}</text>
                        </view>
                    </button>
                </view>
            </view>
        </view>

        <!-- 底部协议区域 -->
        <view class="agreement-area">
            <text class="agreement-text">登录即表示您同意</text>
            <text class="agreement-link" @click="showUserAgreement">《用户协议》</text>
            <text class="agreement-text">和</text>
            <text class="agreement-link" @click="showPrivacyPolicy">《隐私政策》</text>
        </view>

        <!-- 提示弹窗 -->
        <wd-popup v-model="popup" position="center" @close="handleClose">
            <view class="popup-content">
                <view class="popup-title">{{ popupTitle }}</view>
                <view class="popup-text">{{ popupMessage }}</view>
                <button class="popup-btn" @click="handleClose">确定</button>
            </view>
        </wd-popup>
    </view>
</template>

<script setup lang="ts">
import {
    ref,
    computed
} from 'vue'

import {
    onUnload,
} from "@dcloudio/uni-app";

import {
    loginByAccount,
    loginByPhone,
    sendVerificationCode as sendCodeAPI
} from '@/api/login'
import type { ILoginRes } from '@/api/login.types'
import { ILoginByPhoneReq, ILoginReq } from '@/api/login.types';

import { useUserStore,useTokenStore } from '@/store';


// 登录方式配置
const loginTabs = [
    { key: 'account', label: '账号登录', icon: '👤' },
    { key: 'phone', label: '验证码登录', icon: '📱' },
]

// 响应式数据
const activeTab = ref<string>('phone') // 默认选择手机号登录
const accountForm = ref<ILoginReq>({
    username: '',
    password: ''
})
const phoneForm = ref<ILoginByPhoneReq>({
    phoneNumber: '',
    verificationCode: ''
})
const showPassword = ref(false)
const countdown = ref(0)
const popup = ref<boolean>(false)
const isLoading = ref(false)
const popupTitle = ref('')
const popupMessage = ref('')
let countdownTimer: NodeJS.Timeout | null = null

// 计算属性
const canLogin = computed(() => {
    if (activeTab.value === 'account') {
        return accountForm.value.username.trim() && accountForm.value.password.trim()
    } else if (activeTab.value === 'phone') {
        return phoneForm.value.phoneNumber.length === 11 &&
            /^1[3-9]\d{9}$/.test(phoneForm.value.phoneNumber) &&
            phoneForm.value.verificationCode.length === 6
    } else if (activeTab.value === 'wechat') {
        return true // 微信登录按钮总是可点击
    }
    return false
})


const clearTimer = () => {
    if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
    }
}

// 切换登录方式
const switchTab = (tabKey: string) => {
    activeTab.value = tabKey
    // 重置表单数据
    if (tabKey === 'account') {
        accountForm.value = { username: '', password: '' }
    } else if (tabKey === 'phone') {
        phoneForm.value = { phoneNumber: '', verificationCode: '' }
        countdown.value = 0
        clearTimer();
    }
}

// 密码可见性切换
const togglePasswordVisibility = () => {
    showPassword.value = !showPassword.value
}

// 手机号输入处理
const handlePhoneInput = () => {
    // 只保留数字
    phoneForm.value.phoneNumber = phoneForm.value.phoneNumber.replace(/\D/g, '')
}

// 发送验证码
const sendVerificationCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phoneForm.value.phoneNumber)) {
        showPopup('提示', '请输入正确的手机号码')
        return
    }

    try {
        // 调用API发送验证码
        const result = await sendCodeAPI({ phoneNumber: phoneForm.value.phoneNumber })
        if (result) {
            showPopup('提示', '验证码已发送，请注意查收')
            // 启动倒计时
            countdown.value = 60

            clearTimer()
            countdownTimer = setInterval(() => {
                countdown.value--
                if (countdown.value <= 0) {
                    clearTimer();
                }
            }, 1000)
        }
    } catch (error) {
        console.error('发送验证码失败:', error)
        const errorMessage = error instanceof Error ? error.message : '发送验证码失败，请稍后重试'
        showPopup('提示', errorMessage)
    }
}

// 统一登录处理
const handleLogin = async () => {
    if (!canLogin.value || isLoading.value) return

    isLoading.value = true
    try {
        let result: ILoginRes
        if (activeTab.value === 'account') {
            // 账号密码登录
            result = await loginByAccount(accountForm.value)
        } else if (activeTab.value === 'phone') {
            // 手机号验证码登录
            result = await loginByPhone(phoneForm.value)
        } else {
            return
        }

        // 登录成功
        console.log(`${activeTab.value}登录成功:`, result)

        // 保存登录状态
        const tokenStore = useTokenStore()
        tokenStore.setToken(result.access_token)
        const userStore = useUserStore()
        userStore.setUserInfo(result.user)

        // 跳转到首页
        uni.reLaunch({
            url: '/pages/index/index'
        })
    } catch (error) {
        console.error('登录失败:', error)
        const errorMessage = error instanceof Error ? error.message : '登录失败，请稍后重试'
        showPopup('提示', errorMessage)
    } finally {
        isLoading.value = false
    }
}


// 显示协议
const showUserAgreement = () => {
    showPopup('用户协议', '用户协议内容...')
}

const showPrivacyPolicy = () => {
    showPopup('隐私政策', '隐私政策内容...')
}


// 显示弹窗
const showPopup = (title: string, message: string) => {
    popupTitle.value = title
    popupMessage.value = message
    setTimeout(() => {
        //popup.value.open()
        popup.value = true
    }, 100)
}

const handleClose = () => {
    popup.value = false;
}

onUnload(() => {
    // 组件卸载时清理定时器
    clearTimer();
})
</script>

<style lang="scss" scoped>
/* 主容器样式 */
.login-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    flex-direction: column;
    padding: 0 30rpx;
    box-sizing: border-box;
    position: relative;
    overflow: hidden;
}

/* 背景装饰元素 */
.bg-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.bg-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float 6s ease-in-out infinite;
}

.bg-circle-1 {
    width: 300rpx;
    height: 300rpx;
    top: 100rpx;
    right: -100rpx;
    animation-delay: 0s;
}

.bg-circle-2 {
    width: 200rpx;
    height: 200rpx;
    top: 400rpx;
    left: -80rpx;
    animation-delay: 2s;
}

.bg-circle-3 {
    width: 150rpx;
    height: 150rpx;
    bottom: 200rpx;
    right: 50rpx;
    animation-delay: 4s;
}

.bg-shape {
    position: absolute;
    background: rgba(255, 255, 255, 0.05);
    animation: rotate 20s linear infinite;
}

.bg-shape-1 {
    width: 100rpx;
    height: 100rpx;
    top: 300rpx;
    left: 100rpx;
    border-radius: 20rpx;
    transform: rotate(45deg);
    animation-delay: 0s;
}

.bg-shape-2 {
    width: 80rpx;
    height: 80rpx;
    bottom: 300rpx;
    left: 200rpx;
    border-radius: 50% 0 50% 50%;
    animation-delay: 5s;
}

/* Logo区域样式 */
.logo-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 120rpx;
    margin-bottom: 80rpx;
    animation: fadeInUp 0.8s ease-out;
    position: relative;
    z-index: 2;
}

.logo-wrapper {
    position: relative;
    margin-bottom: 32rpx;
}

.logo-icon {
    font-size: 120rpx;
    filter: drop-shadow(0 8rpx 24rpx rgba(0, 0, 0, 0.2));
    animation: bounceIn 1s ease-out;
}

.logo-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 180rpx;
    height: 180rpx;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
}

.app-name {
    text-align: center;
    margin-bottom: 16rpx;
}

.app-name-main {
    display: block;
    font-size: 48rpx;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
    margin-bottom: 8rpx;
}

.app-name-sub {
    display: block;
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 300;
    letter-spacing: 2rpx;
}

.slogan {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.2);
    font-weight: 400;
}

/* 登录卡片 */
.login-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20rpx);
    border-radius: 32rpx;
    padding: 60rpx 40rpx;
    margin: 0 20rpx;
    box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.1);
    position: relative;
    z-index: 3;
    animation: slideUp 0.8s ease-out;
}

/* 登录方式选择器样式 */
.login-tabs {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 60rpx;
    background: rgba(249, 250, 251, 0.8);
    border-radius: 24rpx;
    padding: 8rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.tab-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 28rpx 20rpx;
    border-radius: 20rpx;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.tab-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.tab-item:hover::before {
    opacity: 1;
}

.tab-item.active {
    background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
    color: #fff;
    box-shadow: 0 8rpx 32rpx rgba(7, 193, 96, 0.4);
    transform: translateY(-2rpx);
}

.tab-item.active::before {
    opacity: 0;
}

.tab-item:not(.active) {
    color: #666;
}

.tab-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    margin-bottom: 12rpx;
    transition: all 0.3s ease;
}

.tab-item.active .tab-icon-wrapper {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

.tab-icon {
    font-size: 32rpx;
    line-height: 1;
}

.tab-text {
    font-size: 26rpx;
    font-weight: 600;
    letter-spacing: 0.5rpx;
}

/* 表单区域样式 */
.form-area {
    width: 100%;
    animation: fadeInUp 0.8s ease-out 0.2s both;
}

.login-form {
    animation: fadeIn 0.4s ease-out;
}

/* 微信登录描述区域样式 */
.wechat-desc {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 40rpx;
    background: #fff;
    border-radius: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    margin-bottom: 40rpx;
}

.desc-text {
    text-align: center;
    margin-top: 24rpx;
}

.desc-title {
    display: block;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 12rpx;
}

.desc-subtitle {
    display: block;
    font-size: 26rpx;
    color: #666;
}

/* 微信登录描述区域样式 */
.wechat-desc {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 40rpx;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(249, 250, 251, 0.8) 100%);
    border-radius: 24rpx;
    box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    margin-bottom: 40rpx;
    position: relative;
    overflow: hidden;
}

.wechat-desc::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200rpx;
    height: 200rpx;
    background: radial-gradient(circle, rgba(7, 193, 96, 0.1) 0%, transparent 70%);
    border-radius: 50%;
}

.wechat-avatar {
    position: relative;
    margin-bottom: 20rpx;
}

.avatar-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120rpx;
    height: 120rpx;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(7, 193, 96, 0.3) 0%, transparent 70%);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
}

.desc-text {
    text-align: center;
    margin-top: 24rpx;
    position: relative;
    z-index: 1;
}

.desc-title {
    display: block;
    font-size: 32rpx;
    font-weight: 700;
    color: #333;
    margin-bottom: 12rpx;
    text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

.desc-subtitle {
    display: block;
    font-size: 26rpx;
    color: #666;
    font-weight: 400;
    line-height: 1.4;
}

/* 微信登录按钮区域样式 */
.wechat-login-section {
    margin-top: 20rpx;
}

.button-area {
    margin-top: 20rpx;
}

.loading-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-spinner {
    width: 32rpx;
    height: 32rpx;
    border: 3rpx solid rgba(255, 255, 255, 0.3);
    border-top: 3rpx solid #fff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 16rpx;
}

.login-content {
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-text {
    font-weight: 600;
    margin-right: 12rpx;
}

.input-group {
    margin-bottom: 40rpx;
}

.input-label {
    display: flex;
    align-items: center;
    font-size: 28rpx;
    color: #333;
    margin-bottom: 16rpx;
    font-weight: 600;
    letter-spacing: 0.5rpx;
}

.input-label uni-icons {
    margin-right: 8rpx;
}

.input-wrapper {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20rpx;
    padding: 0 20rpx;
    height: 100rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    border: 2rpx solid transparent;
    position: relative;
    transition: all 0.3s ease;
    backdrop-filter: blur(10rpx);
}

.input-wrapper:focus-within {
    border-color: #409eff;
    box-shadow: 0 8rpx 32rpx rgba(64, 158, 255, 0.2);
    transform: translateY(-2rpx);
}

.input-wrapper.phone-wrapper {
    padding-left: 0;
}

.area-code-selector {
    display: flex;
    align-items: center;
    padding: 0 20rpx;
    height: 100%;
    border-right: 1rpx solid rgba(0, 0, 0, 0.1);
    min-width: 120rpx;
}

.area-code {
    font-size: 28rpx;
    color: #666;
    font-weight: 600;
    margin-right: 8rpx;
}

.account-input,
.password-input,
.phone-input {
    flex: 1;
    height: 100%;
    font-size: 28rpx;
    padding-left: 16rpx;
    border: none;
    background: transparent;
    outline: none;
    color: #333;
    font-weight: 500;
}

.account-input::placeholder,
.password-input::placeholder,
.phone-input::placeholder {
    color: #ccc;
    font-weight: 400;
}

.eye-icon {
    position: absolute;
    right: 28rpx;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    padding: 8rpx;
    border-radius: 50%;
    transition: background-color 0.3s ease;
}

.eye-icon:hover {
    background: rgba(0, 0, 0, 0.05);
}

.verify-wrapper {
    display: flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 20rpx;
    height: 100rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
    border: 2rpx solid transparent;
    position: relative;
    transition: all 0.3s ease;
    backdrop-filter: blur(10rpx);
}

.verify-wrapper:focus-within {
    border-color: #409eff;
    box-shadow: 0 8rpx 32rpx rgba(64, 158, 255, 0.2);
    transform: translateY(-2rpx);
}

.verify-input {
    flex: 1;
    height: 100%;
    font-size: 28rpx;
    padding: 0 28rpx;
    border: none;
    background: transparent;
    outline: none;
    color: #333;
    font-weight: 500;
    letter-spacing: 4rpx;
    text-align: center;
}

.verify-input::placeholder {
    color: #ccc;
    font-weight: 400;
    letter-spacing: 0;
    text-align: left;
}

.send-code-wrapper {
    padding: 0 20rpx;
    height: 100%;
    display: flex;
    align-items: center;
}

.send-code-btn {
    min-width: 180rpx;
    height: 68rpx;
    line-height: 68rpx;
    font-size: 26rpx;
    background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
    color: #fff;
    border: none;
    border-radius: 34rpx;
    padding: 0 20rpx;
    font-weight: 600;
    transition: all 0.3s ease;
    box-shadow: 0 4rpx 16rpx rgba(7, 193, 96, 0.3);
}

.send-code-btn:hover {
    transform: translateY(-2rpx);
    box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.4);
}

.send-code-btn:active {
    transform: translateY(0);
}

.send-code-btn[disabled] {
    background: #f5f5f5;
    color: #ccc;
    box-shadow: none;
    transform: none;
}

/* 登录按钮样式 */
.login-btn {
    width: 100%;
    height: 96rpx;
    line-height: 96rpx;
    background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
    color: #fff;
    font-size: 32rpx;
    border-radius: 48rpx;
    margin-top: 20rpx;
    box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
    border: none;
    position: relative;
    overflow: hidden;
}

.login-btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
}

.login-btn:active::after {
    width: 300rpx;
    height: 300rpx;
}

.login-btn[disabled] {
    background: #ccc;
    box-shadow: none;
}

.loading-text {
    display: inline-block;
    position: relative;
}

/* 分割线样式 */
.divider {
    display: flex;
    align-items: center;
    margin: 60rpx 0;
}

.divider-line {
    flex: 1;
    height: 1rpx;
    background: #eee;
}

.divider-text {
    padding: 0 20rpx;
    font-size: 24rpx;
    color: #999;
}

/* 微信登录按钮样式 */
.wechat-login-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 96rpx;
    line-height: 96rpx;
    background: #fff;
    color: #07c160;
    font-size: 32rpx;
    border-radius: 48rpx;
    border: 1rpx solid #07c160;
    box-shadow: 0 2rpx 12rpx rgba(7, 193, 96, 0.1);
}

.wechat-icon {
    width: 44rpx;
    height: 44rpx;
    margin-right: 12rpx;
}

/* 协议区域样式 */
.agreement-area {
    margin-top: 80rpx;
    margin-bottom: 40rpx;
    text-align: center;
    font-size: 24rpx;
    color: #999;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    animation: fadeInUp 0.8s ease-out 0.4s both;
}

.agreement-link {
    color: #07c160;
    margin: 0 8rpx;
    cursor: pointer;
}

/* 弹窗样式 */
.popup-content {
    background: #fff;
    border-radius: 24rpx;
    padding: 48rpx 40rpx;
    width: 560rpx;
    text-align: center;
}

.popup-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 24rpx;
}

.popup-text {
    font-size: 28rpx;
    color: #666;
    line-height: 44rpx;
    margin-bottom: 36rpx;
}

.popup-btn {
    background: #07c160;
    color: #fff;
    border-radius: 40rpx;
    margin: 0;
}

/* 动画效果 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30rpx);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(50rpx);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0rpx);
    }

    50% {
        transform: translateY(-20rpx);
    }
}

@keyframes rotate {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@keyframes bounceIn {
    0% {
        opacity: 0;
        transform: scale(0.3);
    }

    50% {
        opacity: 1;
        transform: scale(1.05);
    }

    70% {
        transform: scale(0.9);
    }

    100% {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes pulse {

    0%,
    100% {
        opacity: 0.3;
        transform: scale(1);
    }

    50% {
        opacity: 0.6;
        transform: scale(1.1);
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

/* 适配不同屏幕尺寸 */
@media screen and (max-height: 600px) {
    .logo-area {
        margin-top: 80rpx;
        margin-bottom: 60rpx;
    }

    .logo {
        width: 160rpx;
        height: 160rpx;
    }
}

@media screen and (min-height: 800px) {
    .login-container {
        justify-content: center;
    }

    .logo-area {
        margin-top: 0;
        margin-bottom: 100rpx;
    }
}
</style>
