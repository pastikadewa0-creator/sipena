import { Skeleton } from '@/components/ui/skeleton'

export default function EmployeeLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
      <Skeleton className="h-[300px] w-full rounded-xl" />
    </div>
  )
}
