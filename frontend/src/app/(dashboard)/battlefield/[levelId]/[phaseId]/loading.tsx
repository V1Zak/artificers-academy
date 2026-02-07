import { SkeletonText } from '@/components/ui/Skeleton'

export default function PhaseLoading() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-32 bg-white/[0.06] rounded animate-pulse" />
        <div className="h-4 w-20 bg-white/[0.06] rounded animate-pulse" />
      </div>

      <div className="mb-8 space-y-2">
        <div className="h-4 w-20 bg-white/[0.06] rounded animate-pulse" />
        <div className="h-8 w-80 bg-white/[0.06] rounded animate-pulse" />
      </div>

      <div className="glass-card p-8 mb-8">
        <SkeletonText lines={8} />
      </div>
    </div>
  )
}
