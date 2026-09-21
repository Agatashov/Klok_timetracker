'use client'

import { useState, useEffect, useRef } from 'react'
import { formatDurationHHMMSS } from '@/lib/duration'
import { localDateString, localTimeString } from '@/lib/date'
import { createEntry } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import type { Project, Tag, Client } from '@prisma/client'
import { ProjectTagPicker } from './ProjectTagPicker'

const STORAGE_KEY = 'tracktime_timer'

type ProjectWithClient = Project & { client: Client | null }

interface TimerState {
  startedAt: number
  description: string
  projectId: string | null
  tagIds: string[]
}

interface Props {
  projects: ProjectWithClient[]
  tags: Tag[]
}

export function Timer({ projects, tags }: Props) {
  const router = useRouter()
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [state, setState] = useState<TimerState | null>(null)
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [focused, setFocused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved: TimerState = JSON.parse(raw)
        setState(saved)
        setRunning(true)
        setDescription(saved.description)
        setProjectId(saved.projectId)
        setSelectedTagIds(saved.tagIds)
        setElapsed(Math.floor((Date.now() - saved.startedAt) / 1000))
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (running && state) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - state.startedAt) / 1000))
      }, 1000)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running, state])

  useEffect(() => {
    if (running && state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, description, projectId, tagIds: selectedTagIds }))
    }
  }, [description, projectId, selectedTagIds]) // eslint-disable-line

  function handleStart() {
    const newState: TimerState = { startedAt: Date.now(), description, projectId, tagIds: selectedTagIds }
    setState(newState)
    setElapsed(0)
    setRunning(true)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState))
  }

  async function handleStop() {
    if (!state) return
    setSaving(true)
    const stopTime = new Date()
    const startTime = new Date(state.startedAt)
    try {
      await createEntry({
        description,
        date: localDateString(startTime),
        startTime: localTimeString(startTime),
        endTime: localTimeString(stopTime),
        durationSeconds: Math.floor((stopTime.getTime() - startTime.getTime()) / 1000),
        projectId,
        tagIds: selectedTagIds,
      })
      localStorage.removeItem(STORAGE_KEY)
      setRunning(false)
      setState(null)
      setElapsed(0)
      setDescription('')
      setProjectId(null)
      setSelectedTagIds([])
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  function handleDiscard() {
    localStorage.removeItem(STORAGE_KEY)
    setRunning(false)
    setState(null)
    setElapsed(0)
  }

  return (
    <div
      className="rounded-2xl border-2 overflow-hidden transition-colors"
      style={{
        background: running ? 'var(--accent-bg)' : 'var(--surface)',
        borderColor: focused ? 'var(--accent-border)' : 'var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="text"
            placeholder="What are you working on?"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="flex-1 min-w-0 bg-transparent font-medium placeholder:text-[color:var(--faint)]"
            style={{ color: 'var(--foreground)', fontSize: '15px', outline: 'none' }}
          />
          <div
            className="font-mono tabular-nums font-semibold text-[18px] min-w-[96px] text-right shrink-0 select-none"
            style={{ fontFamily: 'var(--font-geist-mono), monospace', color: running ? 'var(--accent)' : 'var(--faint)' }}
          >
            {formatDurationHHMMSS(elapsed)}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {running && (
              <button onClick={handleDiscard} className="px-3 py-2 text-sm rounded-lg border font-medium transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800" style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: 'var(--surface)' }}>
                Discard
              </button>
            )}
            <button
              onClick={running ? handleStop : handleStart}
              disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: running ? 'var(--danger)' : 'var(--accent)' }}
            >
              {saving ? '…' : running ? 'Stop' : 'Start'}
            </button>
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

        {running && state && (
          <p className="text-xs mt-2.5" style={{ color: 'var(--faint)' }}>
            Started at {new Date(state.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
