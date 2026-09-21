'use client'

import { useEffect, useState } from 'react'
import { Timer } from './Timer'
import { EntryList } from './EntryList'
import { NewEntryModal } from './NewEntryModal'
import type { Project, Tag, Client, TimeEntry, TagEntry } from '@prisma/client'

type EntryWithRelations = TimeEntry & {
  project: (Project & { client: Client | null }) | null
  tags: (TagEntry & { tag: Tag })[]
}

interface Props {
  groups: Record<string, EntryWithRelations[]>
  projects: (Project & { client: Client | null })[]
  tags: Tag[]
}

export function LogShell({ groups, projects, tags }: Props) {
  const hasEntries = Object.keys(groups).length > 0
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const check = () => {
      if (window.scrollY > 1) setScrolled(true)
      else if (window.scrollY === 0) setScrolled(false)
    }
    window.addEventListener('scroll', check, { passive: true })
    check()
    return () => window.removeEventListener('scroll', check)
  }, [])

  return (
    <div>
      {/* Spacer: centers the timer vertically on first load */}
      <div style={{ height: 'calc((100svh - 56px - 130px) / 2)' }} />

      {/* Timer — sticks just below the nav on scroll */}
      <div style={{ position: 'sticky', top: '56px', zIndex: 30, background: 'var(--background)' }}>
        <div
          className="mx-auto w-full px-4"
          style={{
            maxWidth: scrolled ? '640px' : '860px',
            transition: 'max-width 350ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Timer projects={projects} tags={tags} />
        </div>
      </div>

      {/* Log section
          marginTop creates the peek gap and is STATIC (never changes → no page-height shifts → no jank).
          transform slides the section up visually without touching document flow. */}
      <div
        className="max-w-[640px] mx-auto px-4 pb-8"
        style={{
          marginTop: hasEntries ? 'calc(40svh - 93px)' : '0',
          paddingTop: scrolled ? '16px' : '40px',
          transform: hasEntries && scrolled ? 'translateY(calc(-40svh + 93px))' : 'translateY(0)',
          transition: 'transform 350ms cubic-bezier(0.4, 0, 0.2, 1), padding-top 350ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'var(--faint)', letterSpacing: '0.08em' }}
          >
            Time log
          </h2>
          <NewEntryModal projects={projects} tags={tags} />
        </div>
        <EntryList groups={groups} projects={projects} tags={tags} />
      </div>
    </div>
  )
}
