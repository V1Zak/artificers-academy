'use client'

import { CodeScroll } from '@/components/theme'
import { AnimatedCard, PageTransition } from '@/components/motion'

const DICTIONARY_ENTRIES = [
  { technical: 'LLM (Claude)', metaphor: 'Planeswalker', description: 'The intelligent entity that invokes your tools', icon: '🧙' },
  { technical: 'MCP Server', metaphor: 'Deck / Library', description: 'Your collection of tools and resources', icon: '📚' },
  { technical: 'MCP Client', metaphor: 'Player', description: 'The interface (Claude Desktop, etc.)', icon: '🎮' },
  { technical: 'Tool', metaphor: 'Sorcery / Instant', description: 'Executable functions', icon: '⚡' },
  { technical: 'Resource', metaphor: 'Permanent', description: 'Read-only data addressable by URI', icon: '🏔️' },
  { technical: 'Prompt', metaphor: 'Tutor', description: 'Pre-configured context templates', icon: '📜' },
  { technical: 'uv', metaphor: 'Mana Source', description: 'The package manager that powers your spells', icon: '💎' },
  { technical: 'Error', metaphor: 'Counterspell', description: 'When a spell fails or is invalid', icon: '🚫' },
]

export default function CodexPage() {
  return (
    <PageTransition>
      <h1 className="text-3xl font-bold mb-2">The Codex</h1>
      <p className="text-silver/60 mb-8">
        The Grand Artificer&apos;s compendium of knowledge
      </p>

      {/* Terminology - Lore Card Grid */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          The Grand Artificer&apos;s Dictionary
        </h2>
        <p className="text-silver/50 text-sm mb-6">Hover or tap a card to reveal its meaning</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {DICTIONARY_ENTRIES.map((entry, index) => (
            <AnimatedCard key={entry.technical} index={index}>
              <LoreCard {...entry} />
            </AnimatedCard>
          ))}
        </div>
      </section>

      {/* Quick Start */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Quick Start Incantation</h2>
        <div className="space-y-4">
          <CodeScroll
            title="1. Prepare your mana base"
            code={`# Install the Mana Source (uv)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Initialize your Decklist
uv init my-server
cd my-server

# Add the essential components
uv add "fastmcp[cli]" httpx`}
          />

          <CodeScroll
            title="2. Craft your first Sorcery"
            code={`# server.py
from fastmcp import FastMCP

mcp = FastMCP("my-server")

@mcp.tool()
def greet(name: str) -> str:
    """
    Summon a greeting for the specified entity.

    Args:
        name: The name of the entity to greet

    Returns:
        A warm greeting message
    """
    return f"Greetings, {name}!"

if __name__ == "__main__":
    mcp.run()`}
          />

          <CodeScroll
            title="3. Summon the Inspector"
            code={`# Test your Decklist with the Inspector
npx @modelcontextprotocol/inspector uv run server.py`}
          />
        </div>
      </section>

      {/* Key Concepts */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Core Concepts</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: "Oracle Text (Docstrings)", description: "Every Sorcery must have Oracle Text - a detailed docstring that tells the Planeswalker how to use it. Without Oracle Text, your spell is incomplete." },
            { title: "Async Incantations", description: "When performing I/O operations (API calls, file reads), use async/await to prevent blocking the Stack. This keeps your server responsive." },
            { title: "The Inspector", description: "Before connecting to a Player (client), always test your Decklist with the Inspector. It reveals issues before they become problems." },
            { title: "Transport Layers", description: "Kitchen Table (stdio) for local development, Tournament Hall (SSE) for production deployments." },
          ].map((card, index) => (
            <AnimatedCard key={card.title} index={index}>
              <ConceptCard title={card.title} description={card.description} />
            </AnimatedCard>
          ))}
        </div>
      </section>
    </PageTransition>
  )
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
          <h3 className="font-semibold text-arcane-purple text-sm">{metaphor}</h3>
          <p className="text-xs text-silver/40 mt-1 font-mono">{technical}</p>
        </div>
        {/* Back */}
        <div className="absolute inset-0 glass-card p-4 flex flex-col items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)] bg-arcane-purple/10 border-arcane-purple/20">
          <h3 className="font-semibold text-arcane-purple text-sm mb-2">{metaphor}</h3>
          <p className="text-xs text-silver/70 leading-relaxed">{description}</p>
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
      <p className="text-silver/60">{description}</p>
    </div>
  )
}
