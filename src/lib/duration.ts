// Parses human-readable duration strings into total seconds.
// Accepted formats: "1h 30m", "1h30m", "90m", "1.5h", "1:30", "2h", "45m", "0:45"
export function parseDuration(input: string): number | null {
  const s = input.trim().toLowerCase()
  if (!s) return null

  // HH:MM or H:MM
  const colonMatch = s.match(/^(\d{1,2}):(\d{2})$/)
  if (colonMatch) {
    const h = parseInt(colonMatch[1], 10)
    const m = parseInt(colonMatch[2], 10)
    if (m >= 60) return null
    return h * 3600 + m * 60
  }

  // Mixed: 1h30m, 1h 30m, 1 h 30 m
  const mixedMatch = s.match(/^(\d+(?:\.\d+)?)\s*h(?:ours?)?\s*(?:(\d+)\s*m(?:in(?:utes?)?)?)?$/)
  if (mixedMatch) {
    const h = parseFloat(mixedMatch[1])
    const m = mixedMatch[2] ? parseInt(mixedMatch[2], 10) : 0
    return Math.round(h * 3600 + m * 60)
  }

  // Minutes only: 90m, 90min
  const minMatch = s.match(/^(\d+)\s*m(?:in(?:utes?)?)?$/)
  if (minMatch) {
    return parseInt(minMatch[1], 10) * 60
  }

  // Hours only: 2h, 1.5h
  const hourMatch = s.match(/^(\d+(?:\.\d+)?)\s*h(?:ours?)?$/)
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) * 3600)
  }

  return null
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0 && m > 0) return `${h}h ${m}m`
  if (h > 0) return `${h}h`
  if (m > 0 && s > 0) return `${m}m ${s}s`
  if (m > 0) return `${m}m`
  return `${s}s`
}

export function formatDurationHHMMSS(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

// Computes duration in seconds between two HH:mm times, handling midnight crossing.
export function timeDiff(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  let startMins = sh * 60 + sm
  let endMins = eh * 60 + em
  if (endMins <= startMins) endMins += 24 * 60 // midnight crossing
  return (endMins - startMins) * 60
}
