import type { Metadata } from 'next'
import { verifySession } from '@/lib/dal'
import { connectDB } from '@/lib/db'
import Attendance from '@/models/Attendance'
import LeaveRequest from '@/models/LeaveRequest'
import Notification from '@/models/Notification'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/status-badge'
import { 
  Stethoscope, 
  FileText, 
  Plane, 
  Clock,
  CalendarCheck,
  Bell,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

export const metadata: Metadata = {
  title: 'Dashboard — SIPENA',
  description: 'Ringkasan absensi dan izin Anda',
}

export default async function EmployeeDashboardPage() {
  const session = await verifySession()
  await connectDB()

  const firstName = session.name.split(' ')[0]

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [todayAttendance, recentLeaves, notifications] = await Promise.all([
    Attendance.findOne({
      userId: session.userId,
      date: { $gte: today, $lt: tomorrow },
    }).lean(),
    LeaveRequest.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
    Notification.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()
  ])
  
  const todayAtt = todayAttendance as { checkIn?: Date; checkOut?: Date; status?: string } | null

  return (
    <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 min-h-screen bg-muted/30">
      {/* Teal Header Section */}
      <div className="bg-primary px-6 pb-24 pt-8 text-primary-foreground relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 opacity-20 pointer-events-none">
          <svg width="150" height="150" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M45.7,-76.4C58.9,-69.3,69.2,-55.4,77.7,-40.7C86.2,-26,93,-10.5,91.8,4.5C90.6,19.5,81.4,34,71.2,46.7C61,59.4,49.8,70.3,35.9,76.5C22,82.7,5.4,84.2,-10.5,81.4C-26.4,78.6,-41.6,71.5,-53.6,60.6C-65.6,49.7,-74.4,35,-79.6,19.3C-84.8,3.6,-86.4,-13.2,-81,-27.9C-75.6,-42.6,-63.2,-55.2,-49.1,-62.4C-35,-69.6,-19.2,-71.4,-2.2,-68.8C14.8,-66.2,29.6,-59.2,45.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
          </svg>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-2xl font-bold tracking-tight">
            Hi, {firstName}!
          </h2>
          <p className="mt-1 text-primary-foreground/90 font-medium">
            Jangan lupa bahagia
          </p>
        </div>
      </div>

      {/* Main Content Area overlapping header */}
      <div className="-mt-12 relative z-20">
        
        {/* Quick Actions Card */}
        <div className="px-4 md:px-6 mb-8">
          <Card className="shadow-xl shadow-primary/10 border-none rounded-2xl overflow-hidden">
            <div className="p-4 bg-card">
              <h3 className="text-sm font-semibold text-muted-foreground mb-4">Saya ingin membuat pengajuan</h3>
              <div className="grid grid-cols-4 gap-2">
                <QuickActionItem href="/employee/absensi" icon={Clock} label="Kehadiran" color="text-indigo-600" bgColor="bg-indigo-50" />
                <QuickActionItem href="/employee/izin?type=sakit" icon={Stethoscope} label="Sakit" color="text-red-500" bgColor="bg-red-50" />
                <QuickActionItem href="/employee/izin?type=izin" icon={FileText} label="Izin" color="text-blue-500" bgColor="bg-blue-50" />
                <QuickActionItem href="/employee/izin?type=cuti" icon={Plane} label="Cuti" color="text-emerald-500" bgColor="bg-emerald-50" />
              </div>
            </div>
          </Card>
        </div>

        {/* White Rounded Bottom Section (Activity Feed) */}
        <div className="bg-card rounded-t-[2.5rem] min-h-[60vh] px-6 pt-8 pb-32 shadow-sm border-t">
          
          {/* Absensi Hari Ini */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Aktivitas Hari Ini</h3>
            {todayAtt ? (
              <div className="bg-muted/30 rounded-2xl p-4 flex items-center justify-between border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CalendarCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Absensi Harian</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Masuk: {todayAtt.checkIn ? format(new Date(todayAtt.checkIn), 'HH:mm') : '-'} • 
                      Pulang: {todayAtt.checkOut ? format(new Date(todayAtt.checkOut), 'HH:mm') : '-'}
                    </p>
                  </div>
                </div>
                <StatusBadge status={todayAtt.status as any} />
              </div>
            ) : (
              <div className="bg-amber-50 rounded-2xl p-4 flex items-center justify-between border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-900">Belum Absen</p>
                    <p className="text-xs text-amber-700/80 mt-0.5">Lakukan absensi sekarang</p>
                  </div>
                </div>
                <Link href="/employee/absensi" className="text-xs font-semibold text-primary px-3 py-1.5 bg-primary/10 hover:bg-primary/20 transition-colors rounded-full">
                  Absen Masuk
                </Link>
              </div>
            )}
          </div>

          {/* Pengajuan Cuti/Izin */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground">Pengajuan Terbaru</h3>
              <Link href="/employee/izin" className="text-xs text-primary font-medium flex items-center hover:underline">
                Lihat Semua <ChevronRight className="h-3 w-3 ml-0.5" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {recentLeaves.length === 0 ? (
                <div className="text-center py-6 border rounded-2xl bg-muted/20 border-dashed text-xs text-muted-foreground">
                  Belum ada riwayat pengajuan
                </div>
              ) : (
                recentLeaves.map((leave) => {
                  const l = leave as any;
                  return (
                    <div key={l._id.toString()} className="flex items-center justify-between p-3 rounded-2xl border bg-card hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="text-sm font-medium capitalize">{l.type.replace('_', ' ')}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(l.startDate), 'dd MMM', { locale: localeId })} - {format(new Date(l.endDate), 'dd MMM yyyy', { locale: localeId })}
                        </p>
                      </div>
                      <StatusBadge status={l.status} />
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Notifikasi Terbaru */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Notifikasi Terbaru</h3>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-6 border rounded-2xl bg-muted/20 border-dashed text-xs text-muted-foreground">
                  Tidak ada notifikasi baru
                </div>
              ) : (
                notifications.map((notif) => {
                  const n = notif as any;
                  return (
                    <div key={n._id.toString()} className="flex gap-3 p-3 rounded-2xl border bg-card hover:bg-muted/50 transition-colors">
                      <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium opacity-70">
                          {format(new Date(n.createdAt), 'dd MMM HH:mm', { locale: localeId })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function QuickActionItem({ 
  href, 
  icon: Icon, 
  label, 
  color, 
  bgColor
}: { 
  href: string, 
  icon: any, 
  label: string, 
  color: string, 
  bgColor: string
}) {
  return (
    <Link href={href}>
      <div className="flex flex-col items-center justify-center gap-2 group cursor-pointer">
        <div className={`h-12 w-12 rounded-2xl ${bgColor} flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm`}>
          <Icon className={`h-6 w-6 ${color}`} strokeWidth={1.5} />
        </div>
        <span className="text-[11px] font-medium text-center text-foreground">{label}</span>
      </div>
    </Link>
  )
}
