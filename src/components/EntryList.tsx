'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from './Modal'
import { formatDuration } from '@/lib/duration'
import { formatDate, isToday, isYesterday } from '@/lib/date'
import { deleteEntry, toggleEntryPaid } from '@/lib/actions'
import { getProjectColor, cn } from '@/lib/utils'
import { EntryForm } from './EntryForm'
import type { Project, Tag, Client, TimeEntry, TagEntry } from '@prisma/client'

type EntryWithRelations = TimeEntry & {
  project: (Project & { client: Client | null }) | null
  tags: (TagEntry & { tag: Tag })[]
}

type ProjectWithClient = Project & { client: Client | null }

interface Props {
  groups: Record<string, EntryWithRelations[]>
  projects: ProjectWithClient[]
  tags: Tag[]
}

function dayLabel(date: string): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return formatDate(date)
}

function dayTotal(entries: EntryWithRelations[]): string {
  return formatDuration(entries.reduce((sum, e) => sum + e.durationSeconds, 0))
}

export function EntryList({ groups, projects, tags }: Props) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingPaidId, setTogglingPaidId] = useState<string | null>(null)

  const dates = Object.keys(groups).sort((a, b) => b.localeCompare(a))

  if (dates.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div
          className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'var(--accent-bg)' }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor" style={{ color: 'var(--accent)' }}>
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 15" />
          </svg>
        </div>
        <h3 className="font-semibold mb-1.5" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta, inherit)' }}>
          No entries yet
        </h3>
        <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--muted)' }}>
          Start the timer above or tap &quot;+ Log time&quot; to record your first entry.
        </p>
      </div>
    )
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await deleteEntry(id)
    router.refresh()
    setDeletingId(null)
  }

  async function handleTogglePaid(id: string, currentPaid: boolean) {
    setTogglingPaidId(id)
    await toggleEntryPaid(id, !currentPaid)
    router.refresh()
    setTogglingPaidId(null)
  }

  const editingEntry = editingId
    ? dates.flatMap(d => groups[d]).find(e => e.id === editingId)
    : null

  return (
    <div className="flex flex-col gap-7">
      {editingEntry && (
        <Modal title="Edit entry" onClose={() => setEditingId(null)}>
          <EntryForm
            projects={projects}
            tags={tags}
            initialData={{
              id: editingEntry.id,
              description: editingEntry.description,
              date: editingEntry.date,
              startTime: editingEntry.startTime,
              endTime: editingEntry.endTime,
              durationSeconds: editingEntry.durationSeconds,
              projectId: editingEntry.projectId,
              tagIds: editingEntry.tags.map(t => t.tagId),
            }}
            mode="edit"
            onDone={() => setEditingId(null)}
          />
        </Modal>
      )}

      {dates.map(date => (
        <div key={date}>
          {/* Day header */}
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h3
              className="text-sm font-semibold"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta, inherit)', letterSpacing: '-0.01em' }}
            >
              {dayLabel(date)}
            </h3>
            <span
              className="text-xs tabular-nums font-mono font-medium px-2 py-0.5 rounded-full"
              style={{
                color: 'var(--muted)',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-geist-mono), monospace',
              }}
            >
              {dayTotal(groups[date])}
            </span>
          </div>

          {/* Entry group card */}
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', boxShadow: 'var(--shadow-card)' }}
          >
            {groups[date].map((entry, i) => (
              <div key={entry.id}>
                {i > 0 && <div className="border-t mx-4" style={{ borderColor: 'var(--border)' }} />}
                <EntryRow
                  entry={entry}
                  onEdit={() => setEditingId(entry.id)}
                  onDelete={() => handleDelete(entry.id)}
                  isDeleting={deletingId === entry.id}
                  onTogglePaid={() => handleTogglePaid(entry.id, entry.paid)}
                  isTogglingPaid={togglingPaidId === entry.id}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EntryRow({
  entry,
  onEdit,
  onDelete,
  isDeleting,
  onTogglePaid,
  isTogglingPaid,
}: {
  entry: EntryWithRelations
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
  onTogglePaid: () => void
  isTogglingPaid: boolean
}) {
  const pc = entry.project ? getProjectColor(entry.project.color) : null

  return (
    <div
      className="group relative flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
    >
      {/* Project color rail */}
      {pc && (
        <div
          className={cn('mt-1.5 w-[3px] self-stretch rounded-full flex-shrink-0', pc.dot)}
          style={{ minHeight: '16px' }}
        />
      )}
      {!pc && <div className="w-[3px] shrink-0" />}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium leading-snug" style={{ color: entry.description ? 'var(--foreground)' : 'var(--faint)', fontSize: '14px' }}>
          {entry.description || 'No description'}
        </p>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1">
          {entry.project && (
            <span className={cn('text-xs font-medium', pc?.text)}>
              {entry.project.name}
              {entry.project.client && (
                <span className="font-normal opacity-60"> · {entry.project.client.name}</span>
              )}
            </span>
          )}
          {entry.tags.map(te => (
            <span
              key={te.tagId}
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}
            >
              {te.tag.name}
            </span>
          ))}
          <button
            onClick={onTogglePaid}
            disabled={isTogglingPaid}
            className="text-xs font-semibold px-2 py-0.5 rounded-full transition-colors hover:opacity-80 disabled:opacity-50"
            style={
              entry.paid
                ? { background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)' }
                : { background: 'rgba(245,158,11,0.1)', color: '#D97706', border: '1px solid rgba(245,158,11,0.25)' }
            }
            title={entry.paid ? 'Mark as unpaid' : 'Mark as paid'}
          >
            {entry.paid ? '✓ Paid' : 'Unpaid'}
          </button>
        </div>
      </div>

      {/* Duration + time */}
      <div className="flex flex-col items-end gap-0.5 shrink-0">
        <span
          className="text-sm tabular-nums font-semibold"
          style={{ fontFamily: 'var(--font-geist-mono), monospace', color: 'var(--foreground)' }}
        >
          {formatDuration(entry.durationSeconds)}
        </span>
        {entry.startTime && entry.endTime && (
          <span className="text-xs" style={{ color: 'var(--faint)' }}>
            {entry.startTime}–{entry.endTime}
          </span>
        )}
      </div>

      {/* Actions (appear on hover) */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1 shrink-0 self-start mt-0.5">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
          style={{ color: 'var(--muted)' }}
          title="Edit"
          aria-label="Edit entry"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          disabled={isDeleting}
          className="p-1.5 rounded-lg transition-colors hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-40"
          style={{ color: 'var(--danger)' }}
          title="Delete"
          aria-label="Delete entry"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
        </button>
      </div>
    </div>
  )
}
