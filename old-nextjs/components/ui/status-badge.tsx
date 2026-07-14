import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type AttendanceStatus = 'hadir' | 'terlambat' | 'alpha'
type LeaveStatus = 'pending' | 'approved' | 'rejected'
type LeaveType = 'izin' | 'sakit' | 'cuti' | 'tugas_luar'

type StatusType = AttendanceStatus | LeaveStatus | LeaveType

const statusConfig: Record<
  StatusType,
  { label: string; className: string }
> = {
  // Attendance
  hadir: { label: 'Hadir', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  terlambat: { label: 'Terlambat', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  alpha: { label: 'Alpha', className: 'bg-red-100 text-red-700 border-red-200' },
  // Leave status
  pending: { label: 'Menunggu', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  approved: { label: 'Disetujui', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Ditolak', className: 'bg-red-100 text-red-700 border-red-200' },
  // Leave type
  izin: { label: 'Izin', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  sakit: { label: 'Sakit', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  cuti: { label: 'Cuti', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  tugas_luar: { label: 'Tugas Luar', className: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
}

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground' }
  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
