import { getStatements } from '@/lib/actions'
import { formatDateShort } from '@/lib/date'
import Link from 'next/link'
import { DeleteStatementButton, CopyLinkButton, MarkStatementPaidButton } from './StatementActions'

export default async function StatementsPage() {
  const statements = await getStatements()

  return (
    <div className="max-w-2xl mx-auto px-4 py-7">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-xl font-bold tracking-tight"
          style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta, inherit)', letterSpacing: '-0.02em' }}
        >
          Statements
        </h1>
        <Link
          href="/statements/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--accent)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New statement
        </Link>
      </div>

      {statements.length === 0 ? (
        <div
          className="rounded-2xl border p-12 text-center"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
        >
          <div
            className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'var(--accent-bg)' }}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" style={{ color: 'var(--accent)' }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="13" y2="17" />
            </svg>
          </div>
          <h3
            className="font-semibold mb-1.5"
            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta, inherit)' }}
          >
            No statements yet
          </h3>
          <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--muted)' }}>
            Create a shareable time statement to send clients. No login required to view.
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
        >
          {statements.map((stmt, i) => (
            <div key={stmt.id}>
              {i > 0 && <div className="border-t mx-4" style={{ borderColor: 'var(--border)' }} />}
              <div className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                {/* File icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--accent-bg)' }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ color: 'var(--accent)' }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                    {stmt.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                    {formatDateShort(stmt.dateFrom)} – {formatDateShort(stmt.dateTo)}
                    {stmt.project && <span> · {stmt.project.name}</span>}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <MarkStatementPaidButton dateFrom={stmt.dateFrom} dateTo={stmt.dateTo} projectId={stmt.projectId} />
                  <CopyLinkButton slug={stmt.slug} />
                  <Link
                    href={`/s/${stmt.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    style={{ color: 'var(--muted)' }}
                    title="View public link"
                    aria-label="Open statement"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Link>
                  <DeleteStatementButton id={stmt.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
