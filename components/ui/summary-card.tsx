import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SummaryCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  colorClass?: string
  className?: string
}

export function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  colorClass = 'text-primary bg-primary/10',
  className,
}: SummaryCardProps) {
  return (
    <Card className={cn('card-hover overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
