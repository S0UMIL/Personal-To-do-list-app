import { Capacitor } from '@capacitor/core'

/** Deep-link callback registered in AndroidManifest for native OAuth. */
export const NATIVE_AUTH_SCHEME = 'com.north.productivity'
export const NATIVE_AUTH_HOST = 'login'
export const NATIVE_AUTH_REDIRECT = `${NATIVE_AUTH_SCHEME}://${NATIVE_AUTH_HOST}`

export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform()
}

/** OAuth redirect URL: deep link on Capacitor, browser origin on web. */
export function getAuthRedirectUrl(): string {
  if (isNativePlatform()) {
    return NATIVE_AUTH_REDIRECT
  }
  return `${window.location.origin}/login`
}

export function isNativeAuthCallback(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === `${NATIVE_AUTH_SCHEME}:` && parsed.host === NATIVE_AUTH_HOST
  } catch {
    return url.startsWith(`${NATIVE_AUTH_REDIRECT}`)
  }
}

/** Matches Supabase auth-js `PKCE_FLOW_ID_PARAM`. */
export const PKCE_FLOW_ID_PARAM = 'sb_flow_id'

export interface NativeOAuthCallbackParams {
  code: string | null
  flowId: string | null
  error: string | null
  errorDescription: string | null
}

/** Parse OAuth callback query params from a native deep-link URL. */
export function parseNativeOAuthCallback(url: string): NativeOAuthCallbackParams {
  try {
    const parsed = new URL(url)
    const fromQuery = (key: string) => parsed.searchParams.get(key)
    const fromHash = (key: string) => {
      if (!parsed.hash || parsed.hash === '#') return null
      const hash = parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash
      return new URLSearchParams(hash).get(key)
    }
    const pick = (key: string) => fromQuery(key) ?? fromHash(key)
    const errorDescription = pick('error_description')
    return {
      code: pick('code'),
      flowId: pick(PKCE_FLOW_ID_PARAM),
      error: pick('error'),
      errorDescription: errorDescription
        ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
        : null,
    }
  } catch {
    return { code: null, flowId: null, error: null, errorDescription: null }
  }
}
