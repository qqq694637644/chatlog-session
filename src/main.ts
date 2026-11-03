import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import App from './App.vue'
import router from './router'
import './assets/styles/index.scss'
import { db } from './utils/db'
import { initializeAuthorization } from './utils/auth'

function renderAuthorizationError(error: unknown) {
  const root = document.getElementById('app')
  if (!root) return

  root.replaceChildren()
  const main = document.createElement('main')
  main.style.cssText = 'min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#f5f7fa;font-family:Arial,sans-serif'
  const section = document.createElement('section')
  section.style.cssText = 'max-width:440px;padding:32px;border-radius:16px;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,.08);text-align:center'
  const title = document.createElement('h2')
  title.textContent = 'Chatlog Session'
  title.style.cssText = 'margin:0 0 16px;color:#303133'
  const detail = document.createElement('p')
  detail.textContent = error instanceof Error ? error.message : '授权失败，请重新打开网页。'
  detail.style.cssText = 'line-height:1.8;color:#606266'
  const hint = document.createElement('p')
  hint.textContent = '请使用桌面上的 Chatlog 启动 BAT 打开隐私窗口。'
  hint.style.cssText = 'margin-top:20px;color:#909399;font-size:13px'
  section.append(title, detail, hint)
  main.append(section)
  root.append(main)
}

function mountApplication() {
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)
  app.use(ElementPlus)
  app.use(VueVirtualScroller)

  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  db.init().catch((err) => {
    console.error('IndexedDB 初始化失败:', err)
  })

  app.mount('#app')

  if (import.meta.env.DEV) {
    console.log('Chatlog Session v' + import.meta.env.VITE_APP_VERSION)
    console.log('API requests use the same-origin authorized proxy.')
    console.log('Debug Mode:', import.meta.env.VITE_ENABLE_DEBUG)
  }

  window.addEventListener('beforeunload', () => {
    db.close()
  })
}

// Do not initialize the app or issue data requests until the server has authorized
// this private-window session.
initializeAuthorization()
  .then(mountApplication)
  .catch(renderAuthorizationError)