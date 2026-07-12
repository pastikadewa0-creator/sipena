import type { Metadata } from 'next'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import LeaveRequest from '@/models/LeaveRequest'
import { SummaryCard } from '@/components/ui/summary-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Users, FileText, CalendarCheck, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export const metadata: Metadata = {
  title: 'Dashboard Admin — SIPENA',
  description: 'Ringkasan data karyawan dan pengajuan izin',
}

interface PopulatedLeaveRequest {
  _id: string
  userId: { name: string; position: string } | null
  type: string
  startDate: string
  endDate: string
  status: string
  createdAt: string
}

export default async function AdminDashboardPage() {
  await connectDB()

  const [totalKaryawan, pendingIzin, approvedIzin, recentLeaves] = await Promise.all([
    User.countDocuments({ role: 'karyawan', isActive: true }),
    LeaveRequest.countDocuments({ status: 'pending' }),
    LeaveRequest.countDocuments({ status: 'approved' }),
    LeaveRequest.find({ status: 'pending' })
      .populate('userId', 'name position')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean() as unknown as Promise<PopulatedLeaveRequest[]>,
  ])

  const leaveTypeLabel: Record<string, string> = {
    izin: 'Izin',
    sakit: 'Sakit',
    cuti: 'Cuti',
    tugas_luar: 'Tugas Luar',
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Karyawan Aktif"
          value={totalKaryawan}
          description="Karyawan yang sedang aktif bekerja"
          icon={Users}
          colorClass="text-primary bg-primary/10"
        />
        <SummaryCard
          title="Izin Menunggu"
          value={pendingIzin}
          description="Pengajuan izin belum diproses"
          icon={Clock}
          colorClass="text-amber-600 bg-amber-100"
        />
        <SummaryCard
          title="Izin Disetujui"
          value={approvedIzin}
          description="Total pengajuan disetujui"
          icon={CalendarCheck}
          colorClass="text-emerald-600 bg-emerald-100"
        />
        <SummaryCard
          title="Total Pengajuan"
          value={pendingIzin + approvedIzin}
          description="Semua pengajuan izin"
          icon={FileText}
          colorClass="text-purple-600 bg-purple-100"
        />
      </div>

      {/* Pending Leave Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-amber-500" />
            Pengajuan Izin Menunggu Persetujuan
            {pendingIzin > 0 && (
              <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-100 px-1.5 text-xs font-bold text-amber-700">
                {pendingIzin}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeaves.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <CalendarCheck className="mx-auto mb-2 h-8 w-8 opacity-30" />
              Tidak ada pengajuan izin yang menunggu
            </div>
          ) : (
            <div className="divide-y">
              {recentLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {leave.userId?.name ?? 'Karyawan'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {leave.userId?.position} •{' '}
                      {leaveTypeLabel[leave.type] ?? leave.type} •{' '}
                      {format(new Date(leave.startDate), 'dd MMM yyyy', { locale: localeId })}
                      {leave.startDate !== leave.endDate
                        ? ` – ${format(new Date(leave.endDate), 'dd MMM', { locale: localeId })}`
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={leave.status as 'pending'} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {pendingIzin > 6 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              +{pendingIzin - 6} pengajuan lainnya —{' '}
              <a href="/admin/izin" className="text-primary hover:underline">
                Lihat semua
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
