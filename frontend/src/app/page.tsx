'use client'

import { useRouter } from 'next/navigation'
import type { LearningMode } from '@/lib/api'
import { getModeConfig } from '@/lib/mode-config'

const MODE_CARDS: Array<{
  mode: LearningMode
  icon: string
  title: string
  description: string
  audience: string
  previewBg: string
  previewText: string
  previewBorder: string
}> = [
  {
    mode: 'simple',
    icon: '📘',
    title: 'Simple Mode',
    description: 'Learn MCP in plain English. No jargon, no metaphors.',
    audience: 'Best for: beginners, PMs, non-developers',
    previewBg: 'bg-white',
    previewText: 'text-gray-800',
    previewBorder: 'border-blue-500',
  },
  {
    mode: 'detailed',
    icon: '💻',
    title: 'Detailed Mode',
    description: 'Technical deep-dive with industry terminology.',
    audience: 'Best for: developers, engineers',
    previewBg: 'bg-[#1E1E1E]',
    previewText: 'text-[#D4D4D4]',
    previewBorder: 'border-[#569CD6]',
  },
  {
    mode: 'mtg',
    icon: '✨',
    title: 'MTG Mode',
    description: 'The original experience with Magic: The Gathering lore.',
    audience: 'Best for: MTG fans, creative learners',
    previewBg: 'bg-[#0B0C15]',
    previewText: 'text-[#E8E6E3]',
    previewBorder: 'border-[#D4A843]',
  },
]

export default function Home() {
  const router = useRouter()

  const selectMode = (mode: LearningMode) => {
    localStorage.setItem('learning-mode', mode)

    // Set theme immediately
    const themeMap: Record<LearningMode, string> = {
      simple: 'simple',
      detailed: 'detailed',
      mtg: 'dark',
    }
    document.documentElement.setAttribute('data-theme', themeMap[mode])

    router.push('/login')
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8" style={{ backgroundColor: 'var(--void)' }}>
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--silver)' }}>
          The Artificer&apos;s Academy
        </h1>
        <p className="text-lg sm:text-xl mb-2" style={{ color: 'var(--silver-muted)' }}>
          Master the art of crafting MCP servers
        </p>
        <p className="text-base sm:text-lg" style={{ color: 'var(--arcane-purple)' }}>
          Choose your learning path
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
        {MODE_CARDS.map((card) => (
          <button
            key={card.mode}
            onClick={() => selectMode(card.mode)}
            className="group text-left rounded-xl border border-[var(--obsidian-border)] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg focus-visible:ring-2 focus-visible:ring-[var(--arcane-purple)]"
            style={{ backgroundColor: 'var(--obsidian)' }}
          >
            {/* Theme preview strip */}
            <div className={`h-2 ${card.previewBg} ${card.previewBorder} border-b-2`} />

            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{card.icon}</span>
                <h2 className="text-xl font-bold" style={{ color: 'var(--silver)' }}>
                  {card.title}
                </h2>
              </div>

              <p className="mb-3" style={{ color: 'var(--silver-muted)' }}>
                {card.description}
              </p>

              <p className="text-sm" style={{ color: 'var(--silver-faint)' }}>
                {card.audience}
              </p>

              {/* Preview card mock */}
              <div className={`mt-4 p-3 rounded-lg ${card.previewBg} ${card.previewText} border ${card.previewBorder} text-xs`}>
                <div className="font-semibold mb-1">Preview</div>
                <div className="opacity-70">
                  {getModeConfig(card.mode).landingPreview}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-8 text-sm" style={{ color: 'var(--silver-faint)' }}>
        You can switch modes anytime from the sidebar
      </p>
    </main>
  )
}
