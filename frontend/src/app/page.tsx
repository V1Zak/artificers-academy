import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-void">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-bold text-silver mb-4">
          The Artificer&apos;s Academy
        </h1>
        <p className="text-lg sm:text-xl text-silver/70 mb-2">
          Master the art of crafting MCP servers
        </p>
        <p className="text-base sm:text-lg text-arcane-purple mb-8">
          Where Planeswalkers learn to build their Decklists
        </p>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12">
          <Link href="/login" className="btn-arcane min-h-[44px] flex items-center justify-center">
            Begin Your Journey
          </Link>
          <Link href="/login?next=/codex" className="btn-mana min-h-[44px] flex items-center justify-center">
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
      <div className="glass-card p-6 mt-12 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-3 text-silver">Your Mana Pool</h3>
        <div className="mana-bar">
          <div className="mana-fill" style={{ width: '0%' }} />
        </div>
        <p className="text-sm text-silver/50 mt-2">
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
  const borderColors = {
    white: 'border-t-mana-white',
    blue: 'border-t-mana-blue',
    black: 'border-t-white/20',
    red: 'border-t-mana-red',
    green: 'border-t-mana-green',
  }

  return (
    <div className={`glass-card p-6 border-t-2 ${borderColors[manaColor]}`}>
      <p className="text-sm text-arcane-purple font-semibold">{subtitle}</p>
      <h3 className="text-xl font-bold mb-2 text-silver">{title}</h3>
      <p className="text-silver/60">{description}</p>
    </div>
  )
}
