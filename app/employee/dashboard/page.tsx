import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { connectDB } from '@/lib/db'
import Attendance from '@/models/Attendance'
import LeaveRequest from '@/models/LeaveRequest'
import { SummaryCard } from '@/components/ui/summary-card'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarCheck, Clock, FileText, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export const metadata: Metadata = {
  title: 'Dashboard — SIPENA',
  description: 'Ringkasan absensi dan izin Anda',
}

export default async function EmployeeDashboardPage() {
  const session = await verifySession()
  await connectDB()

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const currentMonth = new Date()
  currentMonth.setDate(1)
  currentMonth.setHours(0, 0, 0, 0)

  const [todayAttendance, recentLeaves, monthlyAttendance, approvedLeaves] = await Promise.all([
    Attendance.findOne({
      userId: session.userId,
      date: { $gte: today, $lt: tomorrow },
    }).lean(),
    LeaveRequest.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
    Attendance.countDocuments({
      userId: session.userId,
      date: { $gte: currentMonth },
      status: 'hadir',
    }),
    LeaveRequest.countDocuments({
      userId: session.userId,
      status: 'approved',
    }),
  ])

  const todayAtt = todayAttendance as {
    checkIn?: Date; checkOut?: Date; status?: string
  } | null

  const leaveTypeLabel: Record<string, string> = {
    izin: 'Izin', sakit: 'Sakit', cuti: 'Cuti', tugas_luar: 'Tugas Luar',
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-semibold">
          Halo, {session.name.split(' ')[0]}! 👋
        </h2>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), "EEEE, dd MMMM yyyy", { locale: localeId })}
        </p>
      </div>

      {/* Status absen hari ini */}
      <Card className="border-l-4 border-l-primary overflow-hidden">
        <CardContent className="pt-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CalendarCheck className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Status Absen Hari Ini</p>
              {todayAtt ? (
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <StatusBadge status={todayAtt.status as 'hadir' | 'terlambat' | 'alpha'} />
                  <span className="text-sm text-muted-foreground">
                    Masuk: <strong>{todayAtt.checkIn ? format(new Date(todayAtt.checkIn), 'HH:mm') : '—'}</strong>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Pulang: <strong>{todayAtt.checkOut ? format(new Date(todayAtt.checkOut), 'HH:mm') : '—'}</strong>
                  </span>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-medium text-amber-600">Belum absen hari ini</span>
                  <a href="/employee/absensi" className="text-xs text-primary hover:underline">
                    Absen sekarang →
                  </a>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          title="Hadir Bulan Ini"
          value={monthlyAttendance}
          description="Hari hadir bulan ini"
          icon={CheckCircle2}
          colorClass="text-emerald-600 bg-emerald-100"
        />
        <SummaryCard
          title="Total Izin Disetujui"
          value={approvedLeaves}
          description="Sepanjang masa kerja"
          icon={FileText}
          colorClass="text-primary bg-primary/10"
        />
        <SummaryCard
          title="Izin Menunggu"
          value={recentLeaves.filter((l) => (l as { status: string }).status === 'pending').length}
          description="Pengajuan belum diproses"
          icon={Clock}
          colorClass="text-amber-600 bg-amber-100"
        />
      </div>

      {/* Recent leave requests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Riwayat Pengajuan Izin
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeaves.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Belum ada pengajuan izin.{' '}
              <a href="/employee/izin" className="text-primary hover:underline">Ajukan sekarang</a>
            </div>
          ) : (
            <div className="divide-y">
              {recentLeaves.map((leave) => {
                const l = leave as unknown as {
                  _id: { toString(): string }; type: string; startDate: Date; endDate: Date; status: string
                }
                return (
                  <div key={l._id.toString()} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{leaveTypeLabel[l.type] ?? l.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(l.startDate), 'dd MMM', { locale: localeId })}
                        {' '}–{' '}
                        {format(new Date(l.endDate), 'dd MMM yyyy', { locale: localeId })}
                      </p>
                    </div>
                    <StatusBadge status={l.status as 'pending' | 'approved' | 'rejected'} />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
