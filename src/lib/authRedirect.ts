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
