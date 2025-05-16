import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import App from './App.vue'
import '@tuniao/tn-style/dist/uniapp/index.css'
import 'uno.css'
import './styles/main.css'

export function createApp() {
  const app = createSSRApp(App)
  app.use(Pinia.createPinia())
  return {
    app,
    Pinia,
  }
}
