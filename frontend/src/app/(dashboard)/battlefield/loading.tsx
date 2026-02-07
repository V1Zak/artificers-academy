import { SkeletonCard } from '@/components/ui/Skeleton'

export default function BattlefieldLoading() {
  return (
    <div>
      <div className="h-8 w-40 bg-white/[0.06] rounded animate-pulse mb-2" />
      <div className="h-5 w-80 bg-white/[0.06] rounded animate-pulse mb-8" />

      <div className="grid gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
