import { ref, computed } from 'vue'

const GUEST_ID_KEY = 'syncyard_guest_id'
const GUEST_NAME_KEY = 'syncyard_guest_name'

const guestId = ref<string | null>(localStorage.getItem(GUEST_ID_KEY))
const guestName = ref<string | null>(localStorage.getItem(GUEST_NAME_KEY))

export function useGuestSession() {
  const isGuest = computed(() => !!(guestId.value && guestName.value))

  function setGuest(name: string) {
    const id = `guest_${crypto.randomUUID()}`
    guestId.value = id
    guestName.value = name
    localStorage.setItem(GUEST_ID_KEY, id)
    localStorage.setItem(GUEST_NAME_KEY, name)
  }

  function clear() {
    guestId.value = null
    guestName.value = null
    localStorage.removeItem(GUEST_ID_KEY)
    localStorage.removeItem(GUEST_NAME_KEY)
  }

  return { guestId, guestName, isGuest, setGuest, clear }
}
