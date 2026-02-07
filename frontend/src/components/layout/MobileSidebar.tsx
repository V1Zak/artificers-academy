'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MobileSidebarProps {
  email: string
}

export function MobileSidebar({ email }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/battlefield', label: 'The Battlefield' },
    { href: '/codex', label: 'The Codex' },
    { href: '/inspector', label: 'The Inspector' },
  ]

  return (
    <>
      {/* Hamburger button - mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-void-light border border-white/[0.08] text-silver"
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
          border-r border-white/[0.06] bg-void-light
          transform transition-transform duration-200 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="p-4 mb-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xl font-bold text-luminescent"
            onClick={() => setOpen(false)}
          >
            The Academy
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1 text-silver/50 hover:text-silver"
            aria-label="Close navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
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
                  ? 'text-silver bg-white/[0.08]'
                  : 'text-silver/70 hover:text-silver hover:bg-white/[0.05]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/[0.06]">
          <p className="text-sm text-silver/50 truncate">{email}</p>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-silver/50 hover:text-silver transition-colors mt-2 min-h-[44px]"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
