'use client'

import { useState } from 'react'
import { Modal } from './Modal'
import { EntryForm } from './EntryForm'
import type { Project, Tag, Client } from '@prisma/client'

type ProjectWithClient = Project & { client: Client | null }

interface Props {
  projects: ProjectWithClient[]
  tags: Tag[]
}

export function NewEntryModal({ projects, tags }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors hover:bg-[color:var(--accent-bg)]"
        style={{ border: '1.5px solid var(--accent)', color: 'var(--accent)', background: 'transparent' }}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Log time
      </button>
      {open && (
        <Modal title="Log time" onClose={() => setOpen(false)}>
          <EntryForm projects={projects} tags={tags} onDone={() => setOpen(false)} />
        </Modal>
      )}
    </>
  )
}
