'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMode } from '@/contexts'
import { getModeConfig } from '@/lib/mode-config'

export function DesktopNav() {
  const pathname = usePathname()
  const { mode } = useMode()
  const config = getModeConfig(mode)

  const navItems = [
    { href: '/dashboard', label: config.nav.dashboard },
    { href: '/battlefield', label: config.nav.battlefield },
    { href: '/codex', label: config.nav.codex },
    { href: '/inspector', label: config.nav.inspector },
    { href: '/prompting-tips', label: config.nav.promptingTips },
  ]

  return (
    <nav aria-label="Main navigation" className="flex-1 px-2 space-y-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={pathname === item.href || pathname.startsWith(item.href + '/') ? 'page' : undefined}
          className={`block px-4 py-2.5 rounded-lg transition-all duration-200 ${
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
  )
}

export function DesktopModeBadge() {
  const { mode } = useMode()

  const modeLabel = mode === 'simple' ? 'Simple' : mode === 'detailed' ? 'Detailed' : 'MTG'

  return (
    <div className="px-4 mb-2">
      <span
        className="inline-block px-2 py-1 text-xs rounded-full"
        style={{ backgroundColor: 'var(--obsidian)', color: 'var(--arcane-purple)', border: '1px solid var(--obsidian-border)' }}
      >
        {modeLabel} Mode
      </span>
    </div>
  )
}

export function DesktopBranding() {
  const { mode } = useMode()
  const config = getModeConfig(mode)

  return (
    <Link href="/dashboard" className="text-xl font-bold transition-colors" style={{ color: 'var(--luminescent)' }}>
      {config.appTitle}
    </Link>
  )
}
