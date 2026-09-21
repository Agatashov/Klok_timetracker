import { prisma } from '@/lib/db'
import { formatDuration } from '@/lib/duration'
import {
  todayLocal, thisWeekStart, thisMonthStart,
  lastWeekStart, lastWeekEnd, lastMonthStart, lastMonthEnd,
} from '@/lib/date'
import Link from 'next/link'
import { Suspense } from 'react'
import { InsightsPeriodSelector } from '@/components/InsightsPeriodSelector'

type Period = 'week' | 'month' | 'all' | 'custom'

interface PageProps {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>
}

async function getStats(period: Period, customFrom?: string, customTo?: string) {
  let dateFrom: string | undefined
  let dateTo: string | undefined
  let prevFrom: string | undefined
  let prevTo: string | undefined

  const today = todayLocal()

  if (period === 'week') {
    dateFrom = thisWeekStart()
    dateTo = today
    prevFrom = lastWeekStart()
    prevTo = lastWeekEnd()
  } else if (period === 'month') {
    dateFrom = thisMonthStart()
    dateTo = today
    prevFrom = lastMonthStart()
    prevTo = lastMonthEnd()
  } else if (period === 'custom' && customFrom && customTo) {
    dateFrom = customFrom
    dateTo = customTo
  }

  const where = dateFrom ? { date: { gte: dateFrom, lte: dateTo! } } : {}
  const prevWhere = prevFrom ? { date: { gte: prevFrom, lte: prevTo! } } : null

  const [entries, prevEntries] = await Promise.all([
    prisma.timeEntry.findMany({
      where,
      select: { durationSeconds: true, paid: true, date: true },
    }),
    prevWhere
      ? prisma.timeEntry.findMany({ where: prevWhere, select: { durationSeconds: true } })
      : Promise.resolve(null),
  ])

  const totalSeconds = entries.reduce((s, e) => s + e.durationSeconds, 0)
  const paidSeconds = entries.filter(e => e.paid).reduce((s, e) => s + e.durationSeconds, 0)
  const activeDays = new Set(entries.map(e => e.date)).size
  const prevTotalSeconds = prevEntries
    ? prevEntries.reduce((s, e) => s + e.durationSeconds, 0)
    : null

  return { totalSeconds, paidSeconds, activeDays, prevTotalSeconds, dateFrom, dateTo }
}

function delta(current: number, prev: number): string {
  if (prev === 0) return current > 0 ? '+∞% vs prior period' : '—'
  const pct = Math.round(((current - prev) / prev) * 100)
  return pct >= 0 ? `+${pct}% vs prior period` : `${pct}% vs prior period`
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub?: string
  accent?: string
}) {
  return (
    <div
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      {accent && (
        <div
          className="absolute top-0 left-0 bottom-0 w-[3px] rounded-l-2xl"
          style={{ background: accent }}
        />
      )}
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-2"
        style={{ color: 'var(--faint)', letterSpacing: '0.07em' }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-bold tabular-nums"
        style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta, inherit)', letterSpacing: '-0.02em' }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs mt-1.5 font-medium" style={{ color: 'var(--muted)' }}>{sub}</p>
      )}
    </div>
  )
}

export default async function InsightsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const period = (params.period as Period) ?? 'week'
  const customFrom = params.from
  const customTo = params.to
  const stats = await getStats(period, customFrom, customTo)

  const paidPct = stats.totalSeconds > 0
    ? Math.round((stats.paidSeconds / stats.totalSeconds) * 100)
    : 0

  let periodLabel: string
  if (period === 'week') periodLabel = 'This week'
  else if (period === 'month') periodLabel = 'This month'
  else if (period === 'custom' && stats.dateFrom && stats.dateTo) periodLabel = `${stats.dateFrom} – ${stats.dateTo}`
  else periodLabel = 'All time'

  const quickStatementLink = stats.dateFrom
    ? `/statements/new?from=${stats.dateFrom}&to=${stats.dateTo}`
    : '/statements/new'

  return (
    <div className="max-w-2xl mx-auto px-4 py-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta, inherit)', letterSpacing: '-0.02em' }}
          >
            Insights
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{periodLabel}</p>
        </div>
        <Suspense fallback={null}>
          <InsightsPeriodSelector
            currentPeriod={period}
            currentFrom={customFrom}
            currentTo={customTo}
          />
        </Suspense>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard
          label="Total hours"
          value={formatDuration(stats.totalSeconds)}
          sub={stats.prevTotalSeconds !== null ? delta(stats.totalSeconds, stats.prevTotalSeconds) : undefined}
          accent="var(--accent)"
        />
        <StatCard
          label="Paid"
          value={formatDuration(stats.paidSeconds)}
          sub={`${paidPct}% of total`}
          accent="#10B981"
        />
        <StatCard
          label="Active days"
          value={String(stats.activeDays)}
          accent="#F59E0B"
        />
        <StatCard
          label="Avg / active day"
          value={stats.activeDays > 0 ? formatDuration(Math.round(stats.totalSeconds / stats.activeDays)) : '—'}
          accent="#06B6D4"
        />
      </div>

      {stats.totalSeconds === 0 && (
        <div
          className="rounded-2xl border p-8 text-center"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No entries in this period.{' '}
            <Link href="/log" className="font-semibold" style={{ color: 'var(--accent)' }}>
              Log some time →
            </Link>
          </p>
        </div>
      )}

      {stats.dateFrom && (
        <div className="mt-6 flex justify-end">
          <Link
            href={quickStatementLink}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors hover:opacity-90"
            style={{ borderColor: 'var(--accent-border)', color: 'var(--accent)', background: 'var(--accent-bg)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            Create statement for this period
          </Link>
        </div>
      )}
    </div>
  )
}
