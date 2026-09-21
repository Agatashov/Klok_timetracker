'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createProject } from '@/lib/actions'
import { findOrCreateTag } from '@/lib/actions'
import { getProjectColor, cn } from '@/lib/utils'
import type { Project, Tag, Client } from '@prisma/client'

type ProjectWithClient = Project & { client: Client | null }

interface Props {
  initialProjects: ProjectWithClient[]
  initialTags: Tag[]
  projectId: string | null
  selectedTagIds: string[]
  onProjectChange: (id: string | null) => void
  onTagsChange: (ids: string[]) => void
}

export function ProjectTagPicker({
  initialProjects,
  initialTags,
  projectId,
  selectedTagIds,
  onProjectChange,
  onTagsChange,
}: Props) {
  const router = useRouter()
  const [projects, setProjects] = useState<ProjectWithClient[]>(initialProjects)
  const [tags, setTags] = useState<Tag[]>(initialTags)
  const [openDropdown, setOpenDropdown] = useState<'project' | 'tags' | null>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const [projectSearch, setProjectSearch] = useState('')
  const [newTagInput, setNewTagInput] = useState('')

  const projectBtnRef = useRef<HTMLButtonElement>(null)
  const tagsBtnRef = useRef<HTMLButtonElement>(null)
  const projectDropRef = useRef<HTMLDivElement>(null)
  const tagsDropRef = useRef<HTMLDivElement>(null)

  function openDrop(type: 'project' | 'tags') {
    const btn = type === 'project' ? projectBtnRef.current : tagsBtnRef.current
    if (btn) {
      const r = btn.getBoundingClientRect()
      setDropdownPos({ top: r.bottom + 6, left: r.left })
    }
    setOpenDropdown(prev => (prev === type ? null : type))
  }

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const t = e.target as Node
      if (openDropdown === 'project' && projectDropRef.current && !projectDropRef.current.contains(t) && !projectBtnRef.current?.contains(t)) {
        setOpenDropdown(null); setProjectSearch('')
      }
      if (openDropdown === 'tags' && tagsDropRef.current && !tagsDropRef.current.contains(t) && !tagsBtnRef.current?.contains(t)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [openDropdown])

  async function handleCreateProject(name: string) {
    if (!name.trim()) return
    const p = await createProject(name.trim(), 'violet')
    setProjects(prev => [...prev, { ...p, client: null }])
    onProjectChange(p.id)
    setOpenDropdown(null)
    setProjectSearch('')
    router.refresh()
  }

  async function handleAddTag() {
    const name = newTagInput.trim()
    if (!name) return
    const existing = tags.find(t => t.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      if (!selectedTagIds.includes(existing.id)) onTagsChange([...selectedTagIds, existing.id])
    } else {
      const tag = await findOrCreateTag(name)
      setTags(prev => [...prev, tag])
      onTagsChange([...selectedTagIds, tag.id])
    }
    setNewTagInput('')
    router.refresh()
  }

  const toggleTag = (id: string) =>
    onTagsChange(selectedTagIds.includes(id) ? selectedTagIds.filter(t => t !== id) : [...selectedTagIds, id])

  const selectedProject = projects.find(p => p.id === projectId)
  const pc = selectedProject ? getProjectColor(selectedProject.color) : null
  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
    p.client?.name.toLowerCase().includes(projectSearch.toLowerCase())
  )
  const selectedTags = tags.filter(t => selectedTagIds.includes(t.id))

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        {/* Project chip */}
        <button
          ref={projectBtnRef}
          type="button"
          onClick={() => openDrop('project')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors',
            projectId && pc ? `${pc.bg} ${pc.text}` : 'border-[color:var(--border)] text-[color:var(--muted)]'
          )}
          style={projectId && pc ? { borderColor: 'transparent' } : {}}
        >
          {projectId && pc
            ? <span className={cn('w-2 h-2 rounded-full', pc.dot)} />
            : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" /></svg>
          }
          {selectedProject ? selectedProject.name : 'Project'}
          <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>

        {/* Tags chip */}
        <button
          ref={tagsBtnRef}
          type="button"
          onClick={() => openDrop('tags')}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors',
            selectedTagIds.length > 0
              ? 'bg-[color:var(--accent-bg)] text-[color:var(--accent)]'
              : 'border-[color:var(--border)] text-[color:var(--muted)]'
          )}
          style={selectedTagIds.length > 0 ? { borderColor: 'transparent' } : {}}
        >
          {selectedTagIds.length > 0
            ? <span className="w-2 h-2 rounded-full bg-[color:var(--accent)]" />
            : <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              </svg>
          }
          {selectedTagIds.length > 0
            ? (selectedTags.map(t => t.name).join(', ').length > 20 ? `${selectedTagIds.length} tags` : selectedTags.map(t => t.name).join(', '))
            : 'Tags'}
          <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>
      </div>

      {/* Project dropdown */}
      {openDropdown === 'project' && dropdownPos && createPortal(
        <div
          ref={projectDropRef}
          style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: 264, zIndex: 9999, background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
          className="rounded-xl border overflow-hidden"
        >
          <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'var(--background)' }}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ color: 'var(--muted)' }}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                autoFocus
                type="text"
                value={projectSearch}
                onChange={e => setProjectSearch(e.target.value)}
                placeholder="Find project…"
                className="flex-1 bg-transparent text-xs focus:outline-none"
                style={{ color: 'var(--foreground)' }}
              />
            </div>
          </div>
          {projectId && (
            <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--faint)' }}>Selected</span>
              <button type="button" onClick={() => { onProjectChange(null); setOpenDropdown(null); setProjectSearch('') }} className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                Clear
              </button>
            </div>
          )}
          <div className="max-h-44 overflow-y-auto py-1">
            {filteredProjects.length === 0 && (
              <p className="px-3 py-2 text-xs" style={{ color: 'var(--faint)' }}>No projects found</p>
            )}
            {filteredProjects.map(p => {
              const c = getProjectColor(p.color)
              const selected = projectId === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { onProjectChange(p.id); setOpenDropdown(null); setProjectSearch('') }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  style={selected ? { background: 'var(--accent-bg)', color: 'var(--accent)' } : { color: 'var(--foreground)' }}
                >
                  <span className={cn('w-2 h-2 rounded-full shrink-0', c.dot)} />
                  <span className="flex-1 truncate font-medium">{p.name}</span>
                  {p.client && <span className="shrink-0 opacity-50">{p.client.name}</span>}
                  {selected && (
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
          <div className="border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              disabled={!projectSearch.trim()}
              onClick={() => handleCreateProject(projectSearch)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 disabled:opacity-35 disabled:cursor-default"
              style={{ color: 'var(--accent)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {projectSearch.trim() ? `Create "${projectSearch.trim()}"` : 'Create a project'}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Tags dropdown */}
      {openDropdown === 'tags' && dropdownPos && createPortal(
        <div
          ref={tagsDropRef}
          style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: 220, zIndex: 9999, background: 'var(--surface)', borderColor: 'var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}
          className="rounded-xl border overflow-hidden"
        >
          <div className="p-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'var(--background)' }}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ color: 'var(--muted)' }}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                autoFocus
                type="text"
                value={newTagInput}
                onChange={e => setNewTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
                placeholder="Find or create tag…"
                className="flex-1 bg-transparent text-xs focus:outline-none"
                style={{ color: 'var(--foreground)' }}
              />
            </div>
          </div>
          {selectedTagIds.length > 0 && (
            <div className="flex items-center justify-between px-3 py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--faint)' }}>Selected</span>
              <button type="button" onClick={() => { onTagsChange([]); setOpenDropdown(null) }} className="text-xs font-semibold transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
                Clear
              </button>
            </div>
          )}
          <div className="max-h-44 overflow-y-auto py-1">
            {tags.filter(t => t.name.toLowerCase().includes(newTagInput.toLowerCase())).length === 0 && !newTagInput.trim() && (
              <p className="px-3 py-2 text-xs" style={{ color: 'var(--faint)' }}>No tags yet</p>
            )}
            {tags.filter(t => t.name.toLowerCase().includes(newTagInput.toLowerCase())).map(tag => {
              const active = selectedTagIds.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  style={{ color: active ? 'var(--accent)' : 'var(--foreground)' }}
                >
                  <span
                    className="w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center"
                    style={active ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : { borderColor: 'var(--border)' }}
                  >
                    {active && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
                  </span>
                  {tag.name}
                </button>
              )
            })}
          </div>
          <div className="border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              disabled={!newTagInput.trim()}
              onClick={handleAddTag}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 disabled:opacity-35 disabled:cursor-default"
              style={{ color: 'var(--accent)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {newTagInput.trim() ? `Create "${newTagInput.trim()}"` : 'Create a tag'}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
