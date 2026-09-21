'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/log', label: 'Log', icon: ClockIcon },
  { href: '/insights', label: 'Insights', icon: ChartIcon },
  { href: '/statements', label: 'Statements', icon: FileIcon },
]

export function Nav() {
  const path = usePathname()
  const isActive = (href: string) => path === href || path.startsWith(href + '/')

  return (
    <>
      {/* Desktop top nav */}
      <header
        className="hidden md:flex items-center h-[56px] px-5 sticky top-0 z-40 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Logo */}
        <Link
          href="/log"
          className="flex items-center gap-2 mr-8 shrink-0"
          style={{ textDecoration: 'none' }}
        >
          <span
            className="w-6 h-6 rounded-[6px] flex items-center justify-center text-white text-[11px] font-bold shrink-0"
            style={{ background: 'var(--accent)', fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }}
            aria-hidden
          >
            T
          </span>
          <span
            className="text-[15px] font-semibold tracking-tight"
            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }}
          >
            TrackTime
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5 flex-1">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                isActive(href)
                  ? 'text-[color:var(--accent)]'
                  : 'text-[color:var(--muted)] hover:text-[color:var(--foreground)]'
              )}
              style={isActive(href) ? { background: 'var(--accent-bg)' } : {}}
            >
              {label}
              {isActive(href) && (
                <span
                  className="absolute inset-x-3 bottom-0.5 h-[2px] rounded-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            'ml-auto p-2 rounded-lg transition-colors shrink-0',
            isActive('/settings')
              ? 'text-[color:var(--accent)] bg-[color:var(--accent-bg)]'
              : 'text-[color:var(--muted)] hover:text-[color:var(--foreground)] hover:bg-zinc-100 dark:hover:bg-zinc-800'
          )}
          aria-label="Settings"
        >
          <SettingsIcon />
        </Link>
      </header>

      {/* Mobile top bar */}
      <header
        className="flex md:hidden items-center justify-between h-12 px-4 sticky top-0 z-40 border-b"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <Link href="/log" className="flex items-center gap-1.5">
          <span
            className="w-5 h-5 rounded-[5px] flex items-center justify-center text-white text-[10px] font-bold"
            style={{ background: 'var(--accent)', fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }}
            aria-hidden
          >
            T
          </span>
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: 'var(--foreground)', fontFamily: 'var(--font-jakarta), system-ui, sans-serif' }}
          >
            TrackTime
          </span>
        </Link>
        <Link
          href="/settings"
          className={cn(
            'p-1.5 rounded-lg transition-colors',
            isActive('/settings') ? 'text-[color:var(--accent)]' : 'text-[color:var(--muted)] hover:bg-zinc-100 dark:hover:bg-zinc-800'
          )}
          aria-label="Settings"
        >
          <SettingsIcon />
        </Link>
      </header>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <span
                className={cn(
                  'flex items-center justify-center w-10 h-[26px] rounded-full transition-colors',
                  active ? 'text-white' : 'text-[color:var(--muted)]'
                )}
                style={active ? { background: 'var(--accent)' } : {}}
              >
                <Icon className="w-[18px] h-[18px]" />
              </span>
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: active ? 'var(--accent)' : 'var(--muted)' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="7" width="4" height="14" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </svg>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}
