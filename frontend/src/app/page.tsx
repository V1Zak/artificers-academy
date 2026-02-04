import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-scroll-text mb-4">
          The Artificer&apos;s Academy
        </h1>
        <p className="text-xl text-scroll-text/80 mb-2">
          Master the art of crafting MCP servers
        </p>
        <p className="text-lg text-arcane-purple mb-8">
          Where Planeswalkers learn to build their Decklists
        </p>

        {/* Call to Action */}
        <div className="flex gap-4 justify-center mb-12">
          <Link href="/login" className="btn-arcane">
            Begin Your Journey
          </Link>
          <Link href="/codex" className="btn-mana">
            Browse the Codex
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
        <FeatureCard
          title="The Sanctum"
          subtitle="Level 1"
          description="Learn the fundamentals by building an MTG card oracle server."
          manaColor="blue"
        />
        <FeatureCard
          title="The Archive"
          subtitle="Level 2"
          description="Master filesystem access with the Librarian server."
          manaColor="black"
        />
        <FeatureCard
          title="The Aether"
          subtitle="Level 3"
          description="Connect to external APIs with the Weather Seer."
          manaColor="green"
        />
      </div>

      {/* Progress Preview */}
      <div className="scroll-container p-6 mt-12 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-3">Your Mana Pool</h3>
        <div className="mana-bar">
          <div className="mana-fill" style={{ width: '0%' }} />
        </div>
        <p className="text-sm text-scroll-text/60 mt-2">
          Sign in to track your progress
        </p>
      </div>
    </main>
  )
}

function FeatureCard({
  title,
  subtitle,
  description,
  manaColor,
}: {
  title: string
  subtitle: string
  description: string
  manaColor: 'white' | 'blue' | 'black' | 'red' | 'green'
}) {
  const colorClasses = {
    white: 'border-t-mana-white',
    blue: 'border-t-mana-blue',
    black: 'border-t-mana-black',
    red: 'border-t-mana-red',
    green: 'border-t-mana-green',
  }

  return (
    <div className={`scroll-container p-6 border-t-4 ${colorClasses[manaColor]}`}>
      <p className="text-sm text-arcane-purple font-semibold">{subtitle}</p>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-scroll-text/70">{description}</p>
    </div>
  )
}
