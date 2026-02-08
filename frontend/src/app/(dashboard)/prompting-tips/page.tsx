'use client'

import { useState } from 'react'
import { CodeScroll } from '@/components/theme'
import { AnimatedCard, PageTransition, TiltCard } from '@/components/motion'
import { useMode } from '@/contexts'
import { getModeConfig } from '@/lib/mode-config'

export default function PromptingTipsPage() {
  const { mode } = useMode()
  const config = getModeConfig(mode)

  return (
    <PageTransition>
      <h1 className="text-3xl font-bold mb-2">{config.headings.promptingTipsTitle}</h1>
      <p className="mb-10" style={{ color: 'var(--silver-muted)' }}>
        {config.headings.promptingTipsSubtitle}
      </p>

      {config.promptingTips.categories.map((category, catIndex) => (
        <section key={category.title} className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
            <span>{category.icon}</span>
            {category.title}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.tips.map((tip, tipIndex) => (
              <AnimatedCard key={tip.title} index={catIndex * 3 + tipIndex}>
                <TiltCard>
                  <TipCard tip={tip} />
                </TiltCard>
              </AnimatedCard>
            ))}
          </div>
        </section>
      ))}
    </PageTransition>
  )
}

function TipCard({
  tip,
}: {
  tip: {
    title: string
    description: string
    why: string
    example?: { good: string; bad: string }
  }
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="scroll-container p-6 flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-3">{tip.title}</h3>
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--silver-muted)' }}>
        {tip.description}
      </p>

      {/* Why it works - collapsible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs font-medium flex items-center gap-1.5 mb-2 transition-colors"
        style={{ color: 'var(--arcane-purple)' }}
      >
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Why it works
      </button>

      {expanded && (
        <div className="mt-1 mb-4">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--silver-faint)' }}>
            {tip.why}
          </p>
        </div>
      )}

      {/* Example comparison */}
      {tip.example && expanded && (
        <div className="mt-auto space-y-3">
          <CodeScroll
            title="Good"
            code={tip.example.good}
          />
          <CodeScroll
            title="Bad"
            code={tip.example.bad}
          />
        </div>
      )}
    </div>
  )
}
