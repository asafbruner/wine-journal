const WINDOW_MS = 60_000
const MAX_REQUESTS = 10

const userHits = new Map<string, { count: number; expires: number }>()

export function rateLimit(key: string) {
  const now = Date.now()
  const entry = userHits.get(key)

  if (entry && entry.expires > now) {
    if (entry.count >= MAX_REQUESTS) {
      return false
    }
    entry.count += 1
    return true
  }

  userHits.set(key, { count: 1, expires: now + WINDOW_MS })
  return true
}

export function resetRateLimit(key: string) {
  userHits.delete(key)
}



