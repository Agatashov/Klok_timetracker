'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createProject, updateProject, deleteProject, createClient, updateClient, deleteClient, createTag, updateTag, deleteTag } from '@/lib/actions'
import { getProjectColor, cn } from '@/lib/utils'
import type { Project, Client, Tag } from '@prisma/client'

// ─── Projects Panel ──────────────────────────────────────────────────────────

const COLORS = ['slate', 'red', 'orange', 'amber', 'emerald', 'cyan', 'violet', 'pink']
const COLOR_DOTS: Record<string, string> = {
  slate: 'bg-slate-400', red: 'bg-red-500', orange: 'bg-orange-500', amber: 'bg-amber-500',
  emerald: 'bg-emerald-500', cyan: 'bg-cyan-500', violet: 'bg-violet-500', pink: 'bg-pink-500',
}

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-1.5">
      {COLORS.map(c => (
        <button key={c} type="button" onClick={() => onChange(c)}
          className={cn('w-5 h-5 rounded-full transition-transform', COLOR_DOTS[c], value === c ? 'scale-125 ring-2 ring-offset-1 ring-[color:var(--accent)]' : '')}
          title={c} />
      ))}
    </div>
  )
}

type ProjectFull = Project & { client: Client | null; _count: { entries: number } }

export function ProjectsPanel({ projects }: { projects: ProjectFull[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [color, setColor] = useState('violet')
  const [clientName, setClientName] = useState('')

  function startEdit(p: ProjectFull) { setEditing(p.id); setName(p.name); setColor(p.color); setClientName(p.client?.name ?? '') }
  function cancelEdit() { setEditing(null); setName(''); setColor('violet'); setClientName('') }

  function handleCreate() {
    if (!name.trim()) return
    startTransition(async () => {
      await createProject(name, color, clientName || undefined)
      setShowNew(false); setName(''); setColor('violet'); setClientName('')
      router.refresh()
    })
  }

  function handleUpdate(id: string) {
    startTransition(async () => {
      await updateProject(id, name, color, clientName || undefined)
      cancelEdit(); router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this project? Time entries will be kept but unlinked.')) return
    startTransition(async () => { await deleteProject(id); router.refresh() })
  }

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]'
  const inputStyle = { background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }

  function EditForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
    return (
      <div className="p-4 flex flex-col gap-2" style={{ background: 'var(--surface)' }}>
        <input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus className={inputCls} style={inputStyle} />
        <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client (optional)" className={inputCls} style={inputStyle} />
        <ColorPicker value={color} onChange={setColor} />
        <div className="flex gap-2">
          <button onClick={onSave} disabled={!name.trim() || isPending} className="text-sm px-3 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-40 transition-opacity" style={{ background: 'var(--accent)' }}>Save</button>
          <button onClick={onCancel} className="text-sm px-3 py-2 rounded-lg border transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Projects</h2>
        <button onClick={() => { setShowNew(true); setName(''); setColor('violet'); setClientName('') }}
          className="text-sm px-3 py-2 rounded-lg border transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>+ New</button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        {showNew && (
          <div className="border-b" style={{ borderColor: 'var(--border)' }}>
            <EditForm onSave={handleCreate} onCancel={() => setShowNew(false)} />
          </div>
        )}
        {projects.length === 0 && !showNew ? (
          <div className="p-6 text-center" style={{ background: 'var(--surface)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No projects yet.</p>
          </div>
        ) : (
          projects.map((p, i) => (
            <div key={p.id}>
              {i > 0 && <div className="border-t" style={{ borderColor: 'var(--border)' }} />}
              {editing === p.id ? (
                <EditForm onSave={() => handleUpdate(p.id)} onCancel={cancelEdit} />
              ) : (
                <div className="group flex items-center gap-3 px-4 py-3" style={{ background: 'var(--surface)' }}>
                  <span className={cn('w-3 h-3 rounded-full flex-shrink-0', getProjectColor(p.color).dot)} />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{p.name}</span>
                    {p.client && <span className="text-xs ml-1.5" style={{ color: 'var(--muted)' }}>· {p.client.name}</span>}
                  </div>
                  <span className="text-xs" style={{ color: 'var(--faint)' }}>{p._count.entries} entries</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(p)} className="p-1.5 rounded-md transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800" style={{ color: 'var(--muted)' }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-md transition-colors hover:bg-red-50 dark:hover:bg-red-950" style={{ color: 'var(--danger)' }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

// ─── Clients Panel ───────────────────────────────────────────────────────────

type ClientFull = Client & { _count: { projects: number } }

export function ClientsPanel({ clients }: { clients: ClientFull[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')

  const inputCls = 'flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]'
  const inputStyle = { background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }

  function handleCreate() {
    if (!name.trim()) return
    startTransition(async () => { await createClient(name); setShowNew(false); setName(''); router.refresh() })
  }

  function handleUpdate(id: string) {
    startTransition(async () => { await updateClient(id, name); setEditing(null); setName(''); router.refresh() })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this client? Projects will be kept but unlinked.')) return
    startTransition(async () => { await deleteClient(id); router.refresh() })
  }

  function EditForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
    return (
      <div className="p-4 flex flex-col gap-2" style={{ background: 'var(--surface)' }}>
        <input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus placeholder="Client name"
          onKeyDown={e => e.key === 'Enter' && onSave()} className={inputCls} style={inputStyle} />
        <div className="flex gap-2">
          <button onClick={onSave} disabled={!name.trim() || isPending} className="text-sm px-3 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-40 transition-opacity" style={{ background: 'var(--accent)' }}>Save</button>
          <button onClick={onCancel} className="text-sm px-3 py-2 rounded-lg border transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Clients</h2>
        <button onClick={() => { setShowNew(true); setName('') }} className="text-sm px-3 py-2 rounded-lg border transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>+ New</button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        {showNew && (
          <div className="border-b" style={{ borderColor: 'var(--border)' }}>
            <EditForm onSave={handleCreate} onCancel={() => { setShowNew(false); setName('') }} />
          </div>
        )}
        {clients.length === 0 && !showNew ? (
          <div className="p-6 text-center" style={{ background: 'var(--surface)' }}><p className="text-sm" style={{ color: 'var(--muted)' }}>No clients yet.</p></div>
        ) : (
          clients.map((c, i) => (
            <div key={c.id}>
              {i > 0 && <div className="border-t" style={{ borderColor: 'var(--border)' }} />}
              {editing === c.id ? (
                <EditForm onSave={() => handleUpdate(c.id)} onCancel={() => { setEditing(null); setName('') }} />
              ) : (
                <div className="group flex items-center gap-3 px-4 py-3" style={{ background: 'var(--surface)' }}>
                  <span className="flex-1 text-sm font-medium" style={{ color: 'var(--foreground)' }}>{c.name}</span>
                  <span className="text-xs" style={{ color: 'var(--faint)' }}>{c._count.projects} projects</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(c.id); setName(c.name) }} className="p-1.5 rounded-md transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800" style={{ color: 'var(--muted)' }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-md transition-colors hover:bg-red-50 dark:hover:bg-red-950" style={{ color: 'var(--danger)' }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

// ─── Tags Panel ──────────────────────────────────────────────────────────────

type TagFull = Tag & { _count: { entries: number } }

export function TagsPanel({ tags }: { tags: TagFull[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')

  const inputCls = 'flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]'
  const inputStyle = { background: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }

  function handleCreate() {
    if (!name.trim()) return
    startTransition(async () => { await createTag(name); setShowNew(false); setName(''); router.refresh() })
  }

  function handleUpdate(id: string) {
    startTransition(async () => { await updateTag(id, name); setEditing(null); setName(''); router.refresh() })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this tag? It will be removed from all entries.')) return
    startTransition(async () => { await deleteTag(id); router.refresh() })
  }

  function EditForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
    return (
      <div className="p-4 flex flex-col gap-2" style={{ background: 'var(--surface)' }}>
        <input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus placeholder="Tag name"
          onKeyDown={e => e.key === 'Enter' && onSave()} className={inputCls} style={inputStyle} />
        <div className="flex gap-2">
          <button onClick={onSave} disabled={!name.trim() || isPending} className="text-sm px-3 py-2 rounded-lg text-white hover:opacity-90 disabled:opacity-40 transition-opacity" style={{ background: 'var(--accent)' }}>Save</button>
          <button onClick={onCancel} className="text-sm px-3 py-2 rounded-lg border transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Tags</h2>
        <button onClick={() => { setShowNew(true); setName('') }} className="text-sm px-3 py-2 rounded-lg border transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>+ New</button>
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
        {showNew && (
          <div className="border-b" style={{ borderColor: 'var(--border)' }}>
            <EditForm onSave={handleCreate} onCancel={() => { setShowNew(false); setName('') }} />
          </div>
        )}
        {tags.length === 0 && !showNew ? (
          <div className="p-6 text-center" style={{ background: 'var(--surface)' }}><p className="text-sm" style={{ color: 'var(--muted)' }}>No tags yet.</p></div>
        ) : (
          tags.map((tag, i) => (
            <div key={tag.id}>
              {i > 0 && <div className="border-t" style={{ borderColor: 'var(--border)' }} />}
              {editing === tag.id ? (
                <EditForm onSave={() => handleUpdate(tag.id)} onCancel={() => { setEditing(null); setName('') }} />
              ) : (
                <div className="group flex items-center gap-3 px-4 py-3" style={{ background: 'var(--surface)' }}>
                  <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{tag.name}</span>
                  <span className="flex-1" />
                  <span className="text-xs" style={{ color: 'var(--faint)' }}>{tag._count.entries} entries</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(tag.id); setName(tag.name) }} className="p-1.5 rounded-md transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800" style={{ color: 'var(--muted)' }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(tag.id)} className="p-1.5 rounded-md transition-colors hover:bg-red-50 dark:hover:bg-red-950" style={{ color: 'var(--danger)' }}>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
