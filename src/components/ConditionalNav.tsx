'use client'

import { usePathname } from 'next/navigation'
import { Nav } from './Nav'

export function ConditionalNav() {
  const pathname = usePathname()
  if (pathname.startsWith('/s/')) return null
  return <Nav />
}
