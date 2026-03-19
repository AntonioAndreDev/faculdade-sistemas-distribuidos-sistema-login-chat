const DEFAULT_BACKEND_URL = 'http://localhost:3000'

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '')
}

export const backendUrl = trimTrailingSlash(
  import.meta.env.VITE_BACKEND_URL?.trim() || DEFAULT_BACKEND_URL,
)

export function buildBackendUrl(path = '') {
  if (!path) {
    return backendUrl
  }

  return `${backendUrl}${path.startsWith('/') ? path : `/${path}`}`
}
