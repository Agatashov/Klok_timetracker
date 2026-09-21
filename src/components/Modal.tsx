'use client'

import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, onClose, children }: Props) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
      <div
        className="relative w-full max-w-lg rounded-2xl p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--surface)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta, inherit)' }}
          >
            {title}
          </h2>
          <button onClick={onClose} className="p-1 rounded-md transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800" style={{ color: 'var(--muted)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  )
}
