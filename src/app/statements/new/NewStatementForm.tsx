'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createStatement } from '@/lib/actions'
import {
  thisWeekStart, thisMonthStart, thisMonthEnd,
  lastMonthStart, lastMonthEnd, todayLocal,
} from '@/lib/date'

interface Project {
  id: string
  name: string
  client: { name: string } | null
}

interface Props {
  projects: Project[]
  defaultFrom?: string
  defaultTo?: string
}

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function NewStatementForm({ projects, defaultFrom, defaultTo }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [dateFrom, setDateFrom] = useState(defaultFrom ?? thisWeekStart())
  const [dateTo, setDateTo] = useState(defaultTo ?? today())
  const [projectId, setProjectId] = useState<string>('')

  function applyPreset(from: string, to: string) {
    setDateFrom(from)
    setDateTo(to)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !dateFrom || !dateTo) return
    startTransition(async () => {
      const stmt = await createStatement(title, dateFrom, dateTo, projectId || null)
      router.push('/statements')
    })
  }

  const presets = [
    { label: 'This week', from: thisWeekStart(), to: today() },
    { label: 'This month', from: thisMonthStart(), to: thisMonthEnd() },
    { label: 'Last month', from: lastMonthStart(), to: lastMonthEnd() },
  ]

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Title</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="e.g. September 2026 — Acme Corp"
          required
          className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-transparent"
          style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        />
      </div>

      {/* Date range presets */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>Date range</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {presets.map(p => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.from, p.to)}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
              style={
                dateFrom === p.from && dateTo === p.to
                  ? { background: 'var(--accent-bg)', borderColor: 'var(--accent-border)', color: 'var(--accent)' }
                  : { borderColor: 'var(--border)', color: 'var(--muted)' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            required
            className="flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-transparent"
            style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <span className="text-sm" style={{ color: 'var(--muted)' }}>to</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            required
            className="flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-transparent"
            style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Project filter */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted)' }}>
          Project filter <span style={{ color: 'var(--faint)' }}>(optional — leave blank for all projects)</span>
        </label>
        <select
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)] focus:border-transparent"
          style={{ background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <option value="">All projects</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}{p.client ? ` · ${p.client.name}` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="flex-1 py-2 px-4 rounded-lg text-sm font-medium text-white disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {isPending ? 'Creating…' : 'Create statement'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/statements')}
          className="py-2 px-4 rounded-lg text-sm border"
          style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
