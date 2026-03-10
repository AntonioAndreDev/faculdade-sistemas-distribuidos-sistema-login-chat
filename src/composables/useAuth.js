import { computed, reactive } from 'vue'

const AUTH_STORAGE_KEY = 'sistemas-dist-login-chat:auth'

function readStoredSession() {
  if (typeof window === 'undefined') {
    return { authenticated: false, user: null }
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawSession) {
    return { authenticated: false, user: null }
  }

  try {
    const parsedSession = JSON.parse(rawSession)

    if (!parsedSession?.authenticated) {
      return { authenticated: false, user: null }
    }

    return {
      authenticated: true,
      user: parsedSession.user ?? null,
    }
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)

    return { authenticated: false, user: null }
  }
}

const state = reactive(readStoredSession())

function persistSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({
      authenticated: state.authenticated,
      user: state.user,
    }),
  )
}

export function login(credentials) {
  state.authenticated = true
  state.user = {
    email: credentials.email,
    name: credentials.email.split('@')[0],
  }

  persistSession()
}

export function logout() {
  state.authenticated = false
  state.user = null

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }
}

export function isAuthenticated() {
  return state.authenticated
}

export function useAuth() {
  return {
    isAuthenticated: computed(() => state.authenticated),
    user: computed(() => state.user),
    login,
    logout,
  }
}
