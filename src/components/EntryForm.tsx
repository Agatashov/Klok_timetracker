'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { parseDuration, timeDiff } from '@/lib/duration'
import { createEntry, updateEntry } from '@/lib/actions'
import { ProjectTagPicker } from './ProjectTagPicker'
import type { Project, Tag, Client } from '@prisma/client'

type ProjectWithClient = Project & { client: Client | null }

interface EntryData {
  id?: string
  description?: string
  date?: string
  startTime?: string | null
  endTime?: string | null
  durationSeconds?: number
  projectId?: string | null
  tagIds?: string[]
}

interface Props {
  projects: ProjectWithClient[]
  tags: Tag[]
  initialData?: EntryData
  onDone?: () => void
  mode?: 'create' | 'edit'
}

export function EntryForm({ projects, tags, initialData, onDone, mode = 'create' }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [description, setDescription] = useState(initialData?.description ?? '')
  const [date, setDate] = useState(initialData?.date ?? todayLocal())
  const [durationInput, setDurationInput] = useState(() => {
    const s = initialData?.durationSeconds
    if (!s) return ''
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    if (h > 0 && m > 0) return `${h}h ${m}m`
    if (h > 0) return `${h}h`
    return `${m}m`
  })
  const [useTimeRange, setUseTimeRange] = useState(!!(initialData?.startTime && initialData?.endTime))
  const [startTime, setStartTime] = useState(initialData?.startTime ?? '')
  const [endTime, setEndTime] = useState(initialData?.endTime ?? '')
  const [projectId, setProjectId] = useState<string | null>(initialData?.projectId ?? null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(initialData?.tagIds ?? [])
  const [durationError, setDurationError] = useState('')

  function computeDuration(): number | null {
    if (useTimeRange) return (!startTime || !endTime) ? null : timeDiff(startTime, endTime)
    return parseDuration(durationInput)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setDurationError('')
    const duration = computeDuration()
    if (!duration || duration <= 0) {
      setDurationError(useTimeRange ? 'Enter valid start and end times.' : 'Enter a valid duration (e.g. "1h 30m", "90m", "1.5h").')
      return
    }
    startTransition(async () => {
      const input = {
        description: description.trim() || undefined,
        date,
        startTime: useTimeRange ? startTime : undefined,
        endTime: useTimeRange ? endTime : undefined,
        durationSeconds: duration,
        projectId,
        tagIds: selectedTagIds,
      }
      if (mode === 'edit' && initialData?.id) {
        await updateEntry(initialData.id, input)
      } else {
        await createEntry(input)
      }
      router.refresh()
      onDone?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="What did you work on? (optional)"
        className="w-full px-3 py-2 text-sm rounded-lg border-2 border-[color:var(--border)] focus:border-[color:var(--accent)] focus:outline-none"
        style={{ background: 'var(--background)', color: 'var(--foreground)' }}
      />

      <div className="flex flex-wrap gap-3 items-start">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border-2 border-[color:var(--border)] focus:border-[color:var(--accent)] focus:outline-none"
            style={{ background: 'var(--background)', color: 'var(--foreground)' }}
          />
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
              {useTimeRange ? 'Time range' : 'Duration'}
            </label>
            <button
              type="button"
              onClick={() => { setUseTimeRange(!useTimeRange); setDurationError('') }}
              className="text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--accent)' }}
            >
              {useTimeRange ? 'Use duration' : 'Use start/end'}
            </button>
          </div>
          {useTimeRange ? (
            <div className="flex items-center gap-2">
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border-2 border-[color:var(--border)] focus:border-[color:var(--accent)] focus:outline-none"
                style={{ background: 'var(--background)', color: 'var(--foreground)' }} />
              <span style={{ color: 'var(--muted)' }}>–</span>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border-2 border-[color:var(--border)] focus:border-[color:var(--accent)] focus:outline-none"
                style={{ background: 'var(--background)', color: 'var(--foreground)' }} />
            </div>
          ) : (
            <input
              type="text"
              value={durationInput}
              onChange={e => { setDurationInput(e.target.value); setDurationError('') }}
              placeholder="1h 30m · 90m · 1.5h"
              className={`w-full px-3 py-2 text-sm rounded-lg border-2 focus:outline-none focus:border-[color:var(--accent)] ${durationError ? 'border-[color:var(--danger)]' : 'border-[color:var(--border)]'}`}
              style={{ background: 'var(--background)', color: 'var(--foreground)' }}
            />
          )}
          {durationError && <p className="text-xs" style={{ color: 'var(--danger)' }}>{durationError}</p>}
        </div>
      </div>

      <ProjectTagPicker
        initialProjects={projects}
        initialTags={tags}
        projectId={projectId}
        selectedTagIds={selectedTagIds}
        onProjectChange={setProjectId}
        onTagsChange={setSelectedTagIds}
      />

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="py-2 px-6 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: 'var(--accent)' }}
        >
          {isPending ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Add entry'}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="py-2 px-4 rounded-lg text-sm border transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800"
            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function todayLocal(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
