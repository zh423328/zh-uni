import { defineStore } from 'pinia'
import { ref } from 'vue'
import { logout as _logout } from '@/api/login';
import { useUserStore } from './user'

export const useTokenStore = defineStore(
  'token',
  () => {
    const token = ref<string>('');

    const setToken = (val:string)=>{
        token.value = val
    }

        /**
     * 退出登录 并 删除用户信息
     */
    const logout = async () => {
      try {
        // TODO 实现自己的退出登录逻辑
        await _logout()
      }
      catch (error) {
        console.error('退出登录失败:', error)
      }
      finally {
        console.log('退出登录-清除用户信息')
        token.value = ''
        uni.removeStorageSync('token')
        const userStore = useUserStore()
        userStore.clearUserInfo()
      }
    }

    return {
        token,
        setToken,
        logout
    }
  },
  {
    persist: true,
  },
)
