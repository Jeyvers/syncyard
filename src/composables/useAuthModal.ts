import { ref } from 'vue'

export type AuthTab = 'login' | 'signup' | 'guest'

const isOpen = ref(false)
const activeTab = ref<AuthTab>('login')

export function useAuthModal() {
  function openModal(tab: AuthTab = 'login') {
    activeTab.value = tab
    isOpen.value = true
  }
  function closeModal() {
    isOpen.value = false
  }
  return { isOpen, activeTab, openModal, closeModal }
}
