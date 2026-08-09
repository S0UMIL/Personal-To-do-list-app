const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateFriendCode(): string {
  let suffix = ''
  for (let i = 0; i < 6; i++) {
    suffix += CHARSET[Math.floor(Math.random() * CHARSET.length)]
  }
  return `N-${suffix}`
}

export function normalizeFriendCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '')
}
