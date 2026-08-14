/** True when the URL is a Supabase OAuth/PKCE or error callback. */
export function hasAuthCallback(search = window.location.search, hash = window.location.hash) {
  const query = new URLSearchParams(search)
  const fromHash = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
  return (
    query.has('code') ||
    query.has('error') ||
    query.has('error_description') ||
    fromHash.has('access_token') ||
    fromHash.has('error')
  )
}

export function authCallbackError(search = window.location.search, hash = window.location.hash) {
  const query = new URLSearchParams(search)
  const fromHash = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash)
  const description =
    query.get('error_description') ||
    fromHash.get('error_description') ||
    query.get('error') ||
    fromHash.get('error')
  return description ? decodeURIComponent(description.replace(/\+/g, ' ')) : null
}
