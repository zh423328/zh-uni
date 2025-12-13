import { createSSRApp } from "vue";
import App from "./App.vue";
import store from './store'

// 导入 UnoCSS 样式（虚拟模块）
import 'uno.css'
import uViewPro from 'uview-pro'

export function createApp() {
  const app = createSSRApp(App);
  app.use(store)
  app.use(uViewPro)
  return {
    app,
  };
}
