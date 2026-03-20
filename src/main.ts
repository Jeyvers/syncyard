import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import '@/assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize theme immediately (applies dark class to <html>)
useThemeStore()

// Initialize auth session before mounting so route guards have correct state
const auth = useAuthStore()
auth.init().then(() => {
  app.mount('#app')
})
