'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMode } from '@/contexts'
import { getModeConfig } from '@/lib/mode-config'

interface MobileSidebarProps {
  email: string
}

export function MobileSidebar({ email }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { mode } = useMode()
  const config = getModeConfig(mode)

  const navItems = [
    { href: '/dashboard', label: config.nav.dashboard },
    { href: '/battlefield', label: config.nav.battlefield },
    { href: '/codex', label: config.nav.codex },
    { href: '/inspector', label: config.nav.inspector },
  ]

  return (
    <>
      {/* Hamburger button - mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg border"
        style={{ backgroundColor: 'var(--void-light)', borderColor: 'var(--obsidian-border)', color: 'var(--silver)' }}
        aria-label="Open navigation menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay backdrop */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`
          md:hidden fixed inset-y-0 left-0 z-50 w-64 flex flex-col
          border-r
          transform transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ borderColor: 'var(--obsidian-border)', backgroundColor: 'var(--void-light)' }}
      >
        <div className="p-4 mb-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xl font-bold"
            style={{ color: 'var(--luminescent)' }}
            onClick={() => setOpen(false)}
          >
            The Academy
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1"
            style={{ color: 'var(--silver-faint)' }}
            aria-label="Close navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode badge */}
        <div className="px-4 mb-2">
          <span
            className="inline-block px-2 py-1 text-xs rounded-full"
            style={{ backgroundColor: 'var(--obsidian)', color: 'var(--arcane-purple)', border: '1px solid var(--obsidian-border)' }}
          >
            {mode === 'simple' ? 'Simple' : mode === 'detailed' ? 'Detailed' : 'MTG'} Mode
          </span>
        </div>

        <nav aria-label="Main navigation" className="flex-1 px-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={pathname === item.href || pathname.startsWith(item.href + '/') ? 'page' : undefined}
              className={`block px-4 py-2.5 rounded-lg transition-all duration-200 min-h-[44px] flex items-center ${
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-[var(--obsidian-hover)]'
                  : ''
              }`}
              style={{
                color: pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'var(--silver)'
                  : 'var(--silver-muted)',
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Switch mode link */}
        <div className="px-4 py-2">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="text-sm flex items-center gap-2"
            style={{ color: 'var(--silver-faint)' }}
          >
            Switch Mode
          </Link>
        </div>

        <div className="p-4 border-t" style={{ borderColor: 'var(--obsidian-border)' }}>
          <p className="text-sm truncate" style={{ color: 'var(--silver-faint)' }}>{email}</p>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm transition-colors mt-2 min-h-[44px]"
              style={{ color: 'var(--silver-faint)' }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
