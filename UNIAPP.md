# Uni.app + Vue3 + TypeScript + Pinia 模板生成器

## 简介

`@zayn919/create-zh-uni` 是一个用于快速创建 Uni.app 项目的脚手架工具，集成了 Vue3、TypeScript、UnoCSS、Pinia 状态管理等现代化技术栈。

## 技术栈

- **框架**: Uni.app (基于 Vue3)
- **语言**: TypeScript
- **状态管理**: Pinia + pinia-plugin-persistedstate
- **样式**: Sass + UnoCSS
- **构建工具**: Vite
- **UI组件库**: uni-ui / Wot Design Uni

## 安装使用

### 1. 创建项目

```bash
支持的命令格式：
✅ npx @zayn/create-zh-uni - 交互式创建
✅ npx @zayn/create-zh-uni my-app - 使用默认模板创建
✅ npx @zayn/create-zh-uni my-app --template base-wotui - 指定wot-ui模板创建
✅ npx @zayn/create-zh-uni my-app --template base-uniui - 使用uni-ui模板
```

### 2. 选择模板

运行命令后，会进入交互式选择界面：

1. **输入项目名称**: 默认为 `my-uni-app`
2. **选择模板类型**:
   - `基础模板-wotui` - 使用 Wot Design Uni 组件库
   - `基础模板-uniui` - 使用 uni-ui 组件库
   - `基础模板-uViewPro` - 使用 uViewPro 组件库

### 3. 项目初始化

创建成功后，按照提示进行后续操作：

```bash
cd your-project-name
pnpm i  # 安装依赖
pnpm dev:h5  # 启动 H5 开发服务器
```

## 可用命令

### 开发命令

```bash
# H5 端
pnpm dev:h5

# 微信小程序
pnpm dev:mp-weixin

# 支付宝小程序
pnpm dev:mp-alipay

# 百度小程序
pnpm dev:mp-baidu

# QQ小程序
pnpm dev:mp-qq

# 抖音小程序
pnpm dev:mp-toutiao

# 快手小程序
pnpm dev:mp-kuaishou

# 飞书小程序
pnpm dev:mp-lark

# 京东小程序
pnpm dev:mp-jd

# 小红书小程序
pnpm dev:mp-xhs

# 快应用
pnpm dev:quickapp-webview

# 鸿蒙应用
pnpm dev:mp-harmony
```

### 构建命令

```bash
# H5 端构建
pnpm build:h5

# 微信小程序构建
pnpm build:mp-weixin

# 其他平台构建命令类似，只需将 dev 替换为 build
```

### 其他命令

```bash
# TypeScript 类型检查
pnpm type-check
```

## 项目结构

```
your-project/
├── src/
│   ├── api/          # API 接口
│   ├── components/   # 公共组件
│   ├── pages/        # 页面文件
│   ├── static/       # 静态资源
│   ├── store/        # Pinia 状态管理
│   ├── utils/        # 工具函数
│   ├── App.vue       # 应用入口组件
│   └── main.ts       # 应用入口文件
├── pages.json        # 页面配置
├── manifest.json     # 应用配置
├── uni.scss          # 全局样式
├── package.json      # 项目依赖
├── tsconfig.json     # TypeScript 配置
├── vite.config.ts    # Vite 配置
└── uno.config.ts     # UnoCSS 配置
```

## 特色功能

### 1. Pinia 状态管理

集成了 Pinia 和持久化插件，支持状态自动持久化：

```typescript
// store/token.ts
import { defineStore } from 'pinia'

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

```

### 2. TypeScript 支持

完整的 TypeScript 类型支持，包括：
- Vue3 组件类型
- Uniapp API 类型
- 路径别名 `@/*` 指向 `src/*`

### 3. UnoCSS 原子化 CSS

集成了 UnoCSS，提供原子化 CSS 开发体验：

```vue
<template>
  <view class="flex items-center justify-center p-4">
    <text class="text-lg text-blue-500">Hello Uniapp</text>
  </view>
</template>
```

### 4. 多端适配

支持编译到多个平台：
- H5
- 微信小程序
- 支付宝小程序
- 百度小程序
- QQ小程序
- 抖音小程序
- 快手小程序
- 飞书小程序
- 京东小程序
- 小红书小程序
- 快应用
- 鸿蒙应用

## 开发建议

1. **使用组合式 API**: 推荐使用 Vue3 的 `<script setup>` 语法
2. **TypeScript 优先**: 充分利用 TypeScript 的类型检查
3. **模块化开发**: 合理拆分组件和业务逻辑
4. **状态管理**: 复杂状态使用 Pinia 管理
5. **样式规范**: 使用 UnoCSS 原子化类名，保持代码简洁

## 常见问题

### Q: 如何添加新的页面？
A: 在 `pages.json` 中配置页面路由，然后在 `src/pages/` 目录下创建对应的页面文件。

### Q: 如何使用 Pinia？
A: 在 `src/store/` 目录下创建 store 文件，在组件中使用 `useStore` 方法调用。

### Q: 如何配置环境变量？
A: 在项目根目录创建 `.env` 文件，使用 `import.meta.env` 访问。

### Q: 更新uni.app内核
A: 在项目npx @dcloudio/uvm@latest 对应HbuilderX 4.87

## 许可证

MIT