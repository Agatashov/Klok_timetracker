// All date operations use local time to avoid UTC off-by-one-day bugs.

export function todayLocal(): string {
  const d = new Date()
  return localDateString(d)
}

export function localDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function localTimeString(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

// Parse a YYYY-MM-DD string as a local midnight Date (never converts through UTC).
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function formatDate(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(dateStr: string): string {
  const d = parseLocalDate(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayLocal()
}

export function isYesterday(dateStr: string): boolean {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return dateStr === localDateString(d)
}

// Returns YYYY-MM-DD for start of current week (Monday).
export function thisWeekStart(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday
  d.setDate(d.getDate() + diff)
  return localDateString(d)
}

// Returns YYYY-MM-DD for start of last week.
export function lastWeekStart(): string {
  const d = parseLocalDate(thisWeekStart())
  d.setDate(d.getDate() - 7)
  return localDateString(d)
}

export function lastWeekEnd(): string {
  const d = parseLocalDate(thisWeekStart())
  d.setDate(d.getDate() - 1)
  return localDateString(d)
}

// Returns YYYY-MM-DD for start of current month.
export function thisMonthStart(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

// Returns YYYY-MM-DD for end of current month.
export function thisMonthEnd(): string {
  const d = new Date()
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return localDateString(last)
}

// Returns YYYY-MM-DD for start of last month.
export function lastMonthStart(): string {
  const d = new Date()
  const first = new Date(d.getFullYear(), d.getMonth() - 1, 1)
  return localDateString(first)
}

// Returns YYYY-MM-DD for end of last month.
export function lastMonthEnd(): string {
  const d = new Date()
  const last = new Date(d.getFullYear(), d.getMonth(), 0)
  return localDateString(last)
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} – ${end}`
}
