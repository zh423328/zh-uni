import { createSSRApp } from "vue";
import App from "./App.vue";
import store from './store'

// 导入 UnoCSS 样式（虚拟模块）
import 'uno.css'

export function createApp() {
  const app = createSSRApp(App);
  app.use(store)
  return {
    app,
  };
}
