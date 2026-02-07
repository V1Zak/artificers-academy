'use client'

import { CodeScroll } from '@/components/theme'
import { AnimatedCard, PageTransition } from '@/components/motion'

export default function CodexPage() {
  return (
    <PageTransition>
      <h1 className="text-3xl font-bold mb-2">The Codex</h1>
      <p className="text-silver/60 mb-8">
        The Grand Artificer&apos;s compendium of knowledge
      </p>

      {/* Terminology */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">
          The Grand Artificer&apos;s Dictionary
        </h2>
        <div className="scroll-container overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/[0.03] border-b border-white/[0.06]">
              <tr>
                <th className="text-left p-4 font-semibold">Technical Term</th>
                <th className="text-left p-4 font-semibold">Metaphorical Term</th>
                <th className="text-left p-4 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              <TermRow
                technical="LLM (Claude)"
                metaphor="Planeswalker"
                description="The intelligent entity that invokes your tools"
              />
              <TermRow
                technical="MCP Server"
                metaphor="Deck / Library"
                description="Your collection of tools and resources"
              />
              <TermRow
                technical="MCP Client"
                metaphor="Player"
                description="The interface (Claude Desktop, etc.)"
              />
              <TermRow
                technical="Tool"
                metaphor="Sorcery / Instant"
                description="Executable functions"
              />
              <TermRow
                technical="Resource"
                metaphor="Permanent"
                description="Read-only data addressable by URI"
              />
              <TermRow
                technical="Prompt"
                metaphor="Tutor"
                description="Pre-configured context templates"
              />
              <TermRow
                technical="uv"
                metaphor="Mana Source"
                description="The package manager that powers your spells"
              />
              <TermRow
                technical="Error"
                metaphor="Counterspell"
                description="When a spell fails or is invalid"
              />
            </tbody>
          </table>
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

function TermRow({
  technical,
  metaphor,
  description,
}: {
  technical: string
  metaphor: string
  description: string
}) {
  return (
    <tr className="border-b border-white/[0.06]">
      <td className="p-4 font-mono text-sm">{technical}</td>
      <td className="p-4 text-arcane-purple font-semibold">{metaphor}</td>
      <td className="p-4 text-silver/60">{description}</td>
    </tr>
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
