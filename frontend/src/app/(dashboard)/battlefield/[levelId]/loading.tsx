import { SkeletonPhaseCard } from '@/components/ui/Skeleton'

export default function LevelLoading() {
  return (
    <div>
      <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse mb-6" />

      <div className="mb-8 space-y-2">
        <div className="h-4 w-24 bg-white/[0.06] rounded animate-pulse" />
        <div className="h-8 w-64 bg-white/[0.06] rounded animate-pulse" />
        <div className="h-5 w-96 bg-white/[0.06] rounded animate-pulse" />
      </div>

      <div className="space-y-4">
        <SkeletonPhaseCard />
        <SkeletonPhaseCard />
        <SkeletonPhaseCard />
      </div>
    </div>
  )
}
