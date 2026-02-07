import { SkeletonCard, SkeletonProgress } from '@/components/ui/Skeleton'

export default function DashboardLoading() {
  return (
    <div>
      <div className="h-8 w-48 bg-white/[0.06] rounded animate-pulse mb-2" />
      <div className="h-5 w-72 bg-white/[0.06] rounded animate-pulse mb-8" />

      <SkeletonProgress className="mb-8" />

      <div className="grid md:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
