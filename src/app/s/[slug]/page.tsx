import { notFound } from 'next/navigation'
import { getStatementBySlug, getStatementEntries } from '@/lib/actions'
import { formatDuration } from '@/lib/duration'
import { formatDateShort, formatDate } from '@/lib/date'
import { getProjectColor } from '@/lib/utils'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const stmt = await getStatementBySlug(slug)
  if (!stmt) return { title: 'Not found' }
  return { title: stmt.title }
}

export default async function PublicStatementPage({ params }: PageProps) {
  const { slug } = await params
  const stmt = await getStatementBySlug(slug)
  if (!stmt) notFound()

  const entries = await getStatementEntries(stmt.dateFrom, stmt.dateTo, stmt.projectId)

  const totalSeconds = entries.reduce((s, e) => s + e.durationSeconds, 0)
  const paidSeconds = entries.filter(e => e.paid).reduce((s, e) => s + e.durationSeconds, 0)
  const unpaidSeconds = totalSeconds - paidSeconds
  const activeDays = new Set(entries.map(e => e.date)).size
  const avgDaily = activeDays > 0 ? Math.round(totalSeconds / activeDays) : 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Accent header bar */}
      <div className="h-[4px] w-full" style={{ background: 'var(--accent)' }} />

      <div className="max-w-3xl mx-auto px-5 py-10 md:py-14">
        {/* Document header */}
        <div className="mb-10">
          <p
            className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4"
            style={{ color: 'var(--accent)' }}
          >
            Time Statement
          </p>
          <h1
            className="text-2xl md:text-3xl font-bold mb-3"
            style={{
              color: 'var(--foreground)',
              fontFamily: 'var(--font-jakarta, inherit)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {stmt.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full border font-medium"
              style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--surface)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {formatDateShort(stmt.dateFrom)} – {formatDateShort(stmt.dateTo)}
            </span>
            {stmt.project && (
              <span
                className="text-sm px-3 py-1 rounded-full border font-medium"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--surface)' }}
              >
                {stmt.project.name}
                {stmt.project.client && (
                  <span style={{ color: 'var(--muted)' }}> / {stmt.project.client.name}</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: 'Total hours', value: formatDuration(totalSeconds), accent: 'var(--accent)' },
            { label: 'Paid', value: formatDuration(paidSeconds), accent: '#10B981' },
            { label: 'Unpaid', value: formatDuration(unpaidSeconds), accent: '#F59E0B' },
            { label: 'Active days', value: String(activeDays), accent: '#06B6D4' },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="rounded-2xl border p-4 relative overflow-hidden"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
            >
              <div className="absolute top-0 left-0 bottom-0 w-[3px] rounded-l-2xl" style={{ background: accent }} />
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: 'var(--faint)', letterSpacing: '0.08em' }}
              >
                {label}
              </p>
              <p
                className="text-xl font-bold tabular-nums"
                style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta, inherit)', letterSpacing: '-0.02em' }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Entries table */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'var(--border)', boxShadow: 'var(--shadow-card)' }}
        >
          {/* Table header */}
          <div
            className="px-5 py-3.5 border-b flex items-center justify-between"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h2
              className="text-sm font-semibold"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta, inherit)' }}
            >
              Entries
              <span
                className="ml-2 text-xs font-normal px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
              >
                {entries.length}
              </span>
            </h2>
            <span
              className="text-xs font-mono tabular-nums font-semibold"
              style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono), monospace' }}
            >
              {formatDuration(totalSeconds)} total
            </span>
          </div>

          {entries.length === 0 ? (
            <div className="p-10 text-center" style={{ background: 'var(--surface)' }}>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>No entries in this period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ background: 'var(--surface)' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-raised)' }}>
                    {['Date', 'Description', 'Project', 'Tags', 'Time', 'Status', 'Duration'].map(h => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-[10px] font-bold uppercase"
                        style={{ color: 'var(--faint)', letterSpacing: '0.08em' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, i) => {
                    const pc = entry.project ? getProjectColor(entry.project.color) : null
                    return (
                      <tr
                        key={entry.id}
                        style={{
                          borderBottom: i < entries.length - 1 ? '1px solid var(--border)' : 'none',
                          background: i % 2 === 1 ? 'var(--surface-raised)' : 'var(--surface)',
                        }}
                      >
                        <td className="px-5 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--muted)' }}>
                          {formatDateShort(entry.date)}
                        </td>
                        <td className="px-5 py-3 max-w-[180px]">
                          <span style={{ color: 'var(--foreground)' }}>
                            {entry.description || <span style={{ color: 'var(--faint)' }}>—</span>}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {entry.project ? (
                            <span className={`text-xs font-medium ${pc?.text ?? ''}`}>
                              {entry.project.name}
                              {entry.project.client && (
                                <span className="font-normal opacity-60"> / {entry.project.client.name}</span>
                              )}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--faint)' }}>—</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {entry.tags.map(te => (
                              <span
                                key={te.tagId}
                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
                              >
                                {te.tag.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--muted)', fontFamily: 'var(--font-geist-mono), monospace' }}>
                          {entry.startTime && entry.endTime ? `${entry.startTime}–${entry.endTime}` : '—'}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={
                              entry.paid
                                ? { background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' }
                                : { background: 'rgba(245,158,11,0.1)', color: '#D97706', border: '1px solid rgba(245,158,11,0.25)' }
                            }
                          >
                            {entry.paid ? '✓ Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td
                          className="px-5 py-3 whitespace-nowrap text-right font-semibold tabular-nums"
                          style={{ color: 'var(--foreground)', fontFamily: 'var(--font-geist-mono), monospace' }}
                        >
                          {formatDuration(entry.durationSeconds)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--border-strong)', background: 'var(--surface-raised)' }}>
                    <td colSpan={6} className="px-5 py-3.5 text-sm font-bold" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta, inherit)' }}>
                      Total
                    </td>
                    <td
                      className="px-5 py-3.5 text-right font-bold tabular-nums"
                      style={{ color: 'var(--accent)', fontFamily: 'var(--font-geist-mono), monospace' }}
                    >
                      {formatDuration(totalSeconds)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-center mt-10" style={{ color: 'var(--faint)' }}>
          Generated with TrackTime · Read-only view
        </p>
      </div>
    </div>
  )
}
