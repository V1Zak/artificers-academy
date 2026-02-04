import Link from 'next/link'
import { ManaProgress } from '@/components/theme'

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Welcome, Artificer</h1>
      <p className="text-scroll-text/70 mb-8">
        Continue your journey through the Academy
      </p>

      {/* Progress Overview */}
      <div className="scroll-container p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Journey</h2>
        <ManaProgress
          current={0}
          total={4}
          label="Levels Completed"
          manaType="gold"
        />
      </div>

      {/* Level Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <LevelCard
          level={1}
          title="The Sanctum"
          subtitle="MTG Oracle Server"
          description="Learn the fundamentals of MCP by building a Magic: The Gathering card oracle."
          status="available"
          href="/battlefield/level1"
        />
        <LevelCard
          level={2}
          title="The Archive"
          subtitle="Filesystem Access"
          description="Master local file operations with the Librarian server."
          status="locked"
          href="/battlefield/level2"
        />
        <LevelCard
          level={3}
          title="The Aether"
          subtitle="External APIs"
          description="Connect to the outside world with the Weather Seer."
          status="locked"
          href="/battlefield/level3"
        />
        <LevelCard
          level={4}
          title="The Blind Eternities"
          subtitle="Deployment"
          description="Deploy your server to the Tournament Hall (production)."
          status="locked"
          href="/battlefield/level4"
        />
      </div>
    </div>
  )
}

interface LevelCardProps {
  level: number
  title: string
  subtitle: string
  description: string
  status: 'completed' | 'available' | 'locked'
  href: string
}

function LevelCard({
  level,
  title,
  subtitle,
  description,
  status,
  href,
}: LevelCardProps) {
  const isLocked = status === 'locked'
  const isCompleted = status === 'completed'

  return (
    <div
      className={`scroll-container p-6 ${isLocked ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-sm text-arcane-purple font-semibold">
            Level {level}
          </span>
          <h3 className="text-xl font-bold">{title}</h3>
          <p className="text-sm text-scroll-text/60">{subtitle}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <p className="text-scroll-text/70 mb-4">{description}</p>
      {!isLocked && (
        <Link
          href={href}
          className={isCompleted ? 'btn-mana inline-block' : 'btn-arcane inline-block'}
        >
          {isCompleted ? 'Review' : 'Begin'}
        </Link>
      )}
      {isLocked && (
        <span className="text-sm text-scroll-text/50">
          Complete previous levels to unlock
        </span>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: 'completed' | 'available' | 'locked' }) {
  if (status === 'completed') {
    return (
      <span className="px-2 py-1 bg-mana-green/20 text-mana-green text-xs rounded-full">
        Completed
      </span>
    )
  }
  if (status === 'available') {
    return (
      <span className="px-2 py-1 bg-arcane-gold/20 text-arcane-gold text-xs rounded-full">
        Available
      </span>
    )
  }
  return (
    <span className="px-2 py-1 bg-gray-200 text-gray-500 text-xs rounded-full">
      Locked
    </span>
  )
}
