'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteStatement, markStatementEntriesPaid } from '@/lib/actions'

export function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(`${window.location.origin}/s/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-sm px-3 py-2 rounded-lg border transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
      style={copied
        ? { borderColor: 'var(--success)', color: 'var(--success)', background: 'var(--success-bg)' }
        : { borderColor: 'var(--border)', color: 'var(--muted)' }}
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}

export function DeleteStatementButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('Delete this statement? The shared link will stop working.')) return
    setLoading(true)
    await deleteStatement(id)
    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 rounded-md transition-colors hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-40"
      style={{ color: 'var(--danger)' }}
      title="Delete statement"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
      </svg>
    </button>
  )
}

export function MarkStatementPaidButton({ dateFrom, dateTo, projectId }: { dateFrom: string; dateTo: string; projectId?: string | null }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handle(paid: boolean) {
    startTransition(async () => {
      await markStatementEntriesPaid(dateFrom, dateTo, projectId, paid)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => handle(true)} disabled={isPending} title="Mark all entries as paid"
        className="p-1.5 rounded-lg transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-950 disabled:opacity-40" style={{ color: '#10B981' }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      <button onClick={() => handle(false)} disabled={isPending} title="Mark all entries as unpaid"
        className="p-1.5 rounded-lg transition-colors hover:bg-amber-50 dark:hover:bg-amber-950 disabled:opacity-40" style={{ color: '#D97706' }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  )
}
