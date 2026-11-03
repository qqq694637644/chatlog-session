const CHATLOG_PATH_PREFIXES = ['/api/', '/image/', '/video/', '/voice/', '/file/', '/data/']

export function normalizeChatlogMediaUrl(value: string): string {
  if (!value) return value
  if (value.startsWith('/')) return value

  try {
    const parsed = new URL(value, window.location.origin)
    if (
      parsed.port === '5030' &&
      CHATLOG_PATH_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix))
    ) {
      return parsed.pathname + parsed.search + parsed.hash
    }
  } catch {
    // Keep non-URL message content unchanged.
  }

  return value
}