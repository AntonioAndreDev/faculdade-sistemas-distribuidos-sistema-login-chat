import { computed, reactive } from 'vue'
import { buildBackendUrl } from '../config/backend'

const AUTH_STORAGE_KEY = 'sistemas-dist-login-chat:auth'

function readStoredSession() {
  if (typeof window === 'undefined') {
    return { authenticated: false, token: null, user: null }
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!rawSession) {
    return { authenticated: false, token: null, user: null }
  }

  try {
    const parsedSession = JSON.parse(rawSession)

    if (!parsedSession?.authenticated || !parsedSession?.token) {
      return { authenticated: false, token: null, user: null }
    }

    return {
      authenticated: true,
      token: parsedSession.token,
      user: parsedSession.user ?? null,
    }
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)

    return { authenticated: false, token: null, user: null }
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
      token: state.token,
      user: state.user,
    }),
  )
}

function applySession(token, user) {
  state.authenticated = true
  state.token = token
  state.user = user

  persistSession()
}

function extractToken(payload) {
  if (typeof payload === 'string') {
    return payload
  }

  return payload?.token ?? payload?.accessToken ?? payload?.access_token ?? null
}

function buildUser(payload, credentials) {
  if (payload?.user) {
    return payload.user
  }

  return {
    email: credentials.email,
    name: credentials.email.split('@')[0],
  }
}

async function parseError(response) {
  try {
    const payload = await response.json()

    if (typeof payload?.message === 'string') {
      return payload.message
    }
  } catch {
    // Ignore malformed error payloads and fall back to a generic message.
  }

  return 'Nao foi possivel concluir a autenticacao.'
}

async function requestAuth(path, credentials) {
  const response = await fetch(buildBackendUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    throw new Error(await parseError(response))
  }

  return response.json()
}

export async function login(credentials) {
  const payload = await requestAuth('/auth/login', credentials)
  const token = extractToken(payload)

  if (!token) {
    throw new Error('A resposta de login nao trouxe um token.')
  }

  const user = buildUser(payload, credentials)
  applySession(token, user)

  return {
    token,
    user,
  }
}

export async function register(credentials) {
  const payload = await requestAuth('/auth/register', credentials)
  const token = extractToken(payload)
  const user = buildUser(payload, credentials)

  if (token) {
    applySession(token, user)
  }

  return {
    token,
    user,
    authenticated: Boolean(token),
  }
}

export function logout() {
  state.authenticated = false
  state.token = null
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
    token: computed(() => state.token),
    user: computed(() => state.user),
    login,
    logout,
  }
}
