'use client'

import { CodeScroll } from '@/components/theme'
import { AnimatedCard, PageTransition } from '@/components/motion'
import { useMode } from '@/contexts'
import { getModeConfig } from '@/lib/mode-config'

export default function CodexPage() {
  const { mode } = useMode()
  const config = getModeConfig(mode)

  return (
    <PageTransition>
      <h1 className="text-3xl font-bold mb-2">{config.headings.codexTitle}</h1>
      <p className="mb-8" style={{ color: 'var(--silver-muted)' }}>
        {config.headings.codexSubtitle}
      </p>

      {/* Terminology - Lore Card Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          {mode === 'mtg' ? "The Grand Artificer's Dictionary" : mode === 'detailed' ? 'Terminology Reference' : 'Key Terms'}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--silver-faint)' }}>Hover or tap a card to reveal its meaning</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {config.dictionary.map((entry, index) => (
            <AnimatedCard key={entry.technical} index={index}>
              <LoreCard {...entry} />
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">{mode === 'mtg' ? 'Quick Start Incantation' : 'Quick Start Guide'}</h2>
        <div className="space-y-4">
          <CodeScroll
            title={config.quickStart.step1Title}
            code={`${config.quickStart.step1Comment}
curl -LsSf https://astral.sh/uv/install.sh | sh

# Initialize your project
uv init my-server
cd my-server

# Add the essential packages
uv add "fastmcp[cli]" httpx`}
          />

          <CodeScroll
            title={config.quickStart.step2Title}
            code={`${config.quickStart.step2Comment}
from fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool()
def greet(name: str) -> str:
    """
    ${mode === 'mtg' ? 'Summon a greeting for the specified entity.' : mode === 'detailed' ? 'Generate a greeting message for the given name.' : 'Say hello to someone.'}

    Args:
        name: The name of the ${mode === 'mtg' ? 'entity' : 'person'} to greet

    Returns:
        A ${mode === 'mtg' ? 'warm greeting message' : 'greeting message'}
    """
    return f"${mode === 'mtg' ? 'Greetings' : 'Hello'}, {name}!"

if __name__ == "__main__":
    mcp.run()`}
          />

          <CodeScroll
            title={config.quickStart.step3Title}
            code={`${config.quickStart.step3Comment}
npx @modelcontextprotocol/inspector uv run server.py`}
          />
        </div>
      </section>

      {/* Key Concepts */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Core Concepts</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {getConcepts(mode).map((card, index) => (
            <AnimatedCard key={card.title} index={index}>
              <ConceptCard title={card.title} description={card.description} />
            </AnimatedCard>
          ))}
        </div>
      </section>
    </PageTransition>
  )
}

function getConcepts(mode: string) {
  if (mode === 'simple') {
    return [
      { title: 'Descriptions Matter', description: 'Every function needs a clear description (docstring) that tells the AI what it does. Without one, the AI won\'t know how to use your tool.' },
      { title: 'Async for I/O', description: 'When your code talks to the internet (API calls, file reads), use async/await so your server stays responsive while waiting.' },
      { title: 'Test First', description: 'Before connecting to Claude Desktop, always test your server with the Inspector. It catches problems early.' },
      { title: 'Two Connection Types', description: 'Stdio (local) for development on your machine. SSE (remote) for deploying to the internet.' },
    ]
  }
  if (mode === 'detailed') {
    return [
      { title: 'Docstrings as Schema', description: 'Tool docstrings serve as the function schema consumed by the LLM. They define parameter descriptions, return types, and usage constraints. Incomplete docstrings lead to poor tool invocation.' },
      { title: 'Async I/O Pattern', description: 'All I/O-bound operations (HTTP requests, file system access) should use async/await to prevent blocking the event loop. This maintains server throughput under concurrent requests.' },
      { title: 'Inspector Debugging', description: 'The MCP Inspector provides a REPL-like interface for testing tools, resources, and prompts. Always validate your implementation before integrating with a host application.' },
      { title: 'Transport Protocols', description: 'Stdio transport uses process pipes for local development. SSE (Server-Sent Events) transport enables remote HTTP-based connections for production deployments.' },
    ]
  }
  // MTG
  return [
    { title: 'Oracle Text (Docstrings)', description: "Every Sorcery must have Oracle Text - a detailed docstring that tells the Planeswalker how to use it. Without Oracle Text, your spell is incomplete." },
    { title: 'Async Incantations', description: 'When performing I/O operations (API calls, file reads), use async/await to prevent blocking the Stack. This keeps your server responsive.' },
    { title: 'The Inspector', description: 'Before connecting to a Player (client), always test your Decklist with the Inspector. It reveals issues before they become problems.' },
    { title: 'Transport Layers', description: 'Kitchen Table (stdio) for local development, Tournament Hall (SSE) for production deployments.' },
  ]
}

function LoreCard({
  technical,
  metaphor,
  description,
  icon,
}: {
  technical: string
  metaphor: string
  description: string
  icon: string
}) {
  return (
    <div className="group [perspective:600px]">
      <div className="relative h-40 transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front */}
        <div className="absolute inset-0 glass-card p-4 flex flex-col items-center justify-center text-center [backface-visibility:hidden]">
          <span className="text-3xl mb-2">{icon}</span>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--arcane-purple)' }}>{metaphor}</h3>
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--silver-faint)' }}>{technical}</p>
        </div>
        {/* Back */}
        <div className="absolute inset-0 glass-card p-4 flex flex-col items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)]" style={{ backgroundColor: 'rgba(var(--arcane-purple-rgb, 139,92,246), 0.1)', borderColor: 'rgba(var(--arcane-purple-rgb, 139,92,246), 0.2)' }}>
          <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--arcane-purple)' }}>{metaphor}</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--silver-muted)' }}>{description}</p>
        </div>
      </div>
    </div>
  )
}

function ConceptCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="scroll-container p-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p style={{ color: 'var(--silver-muted)' }}>{description}</p>
    </div>
  )
}
