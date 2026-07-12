'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Menu, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const pageTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/karyawan': 'Data Karyawan',
  '/admin/absensi': 'Rekap Absensi',
  '/admin/izin': 'Pengajuan Izin',
  '/employee/dashboard': 'Dashboard',
  '/employee/absensi': 'Absensi Saya',
  '/employee/izin': 'Pengajuan Izin',
}

interface AppTopbarProps {
  name: string
  role: 'admin' | 'karyawan'
  pendingCount?: number
  onMenuToggle?: () => void
}

export function AppTopbar({ name, role, pendingCount: initialPendingCount = 0, onMenuToggle }: AppTopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const title = pageTitles[pathname] || 'SIPENA'

  const { data } = useSWR(role === 'admin' ? '/api/dashboard/summary' : null, (url: string) => fetch(url).then(r => r.json()), { refreshInterval: 30000 })
  const pendingCount = data?.pendingIzin ?? initialPendingCount

  // Employee notifications
  const { data: employeeNotifications, mutate: mutateNotifications } = useSWR(
    role === 'karyawan' ? '/api/notifications' : null,
    (url: string) => fetch(url).then(r => r.json()),
    { refreshInterval: 30000 }
  )

  async function markNotificationsRead() {
    if (!employeeNotifications || employeeNotifications.length === 0) return
    try {
      await fetch('/api/notifications', { method: 'PATCH' })
      mutateNotifications(employeeNotifications.map((n: any) => ({ ...n, isRead: true })))
    } catch {
      toast.error('Gagal menandai notifikasi')
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Gagal logout. Coba lagi.')
    }
  }

  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const { data: userProfile, isLoading: profileLoading } = useSWR(
    '/api/users/me',
    (url: string) => fetch(url).then(r => r.json())
  )

  const isEmployeeDashboard = role === 'karyawan' && pathname === '/employee/dashboard'

  return (
    <header className={cn(
      "flex h-16 items-center justify-between px-6 transition-colors",
      isEmployeeDashboard ? "bg-primary text-primary-foreground border-none" : "border-b bg-card text-foreground"
    )}>
      <div className="flex items-center gap-3">
        {role === 'admin' && (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        {role === 'karyawan' && !isEmployeeDashboard && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Kembali"
            className="-ml-2"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        )}
        <div>
          <h1 className="text-lg font-semibold">{isEmployeeDashboard ? 'SIPENA' : title}</h1>
          <p className={cn("hidden text-xs sm:block", isEmployeeDashboard ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9"
          onClick={() => setNotificationsOpen(true)}
          aria-label="Notifikasi"
        >
          <Bell className="h-5 w-5" />
          {/* Admin pending count */}
          {role === 'admin' && pendingCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {pendingCount > 9 ? '9+' : pendingCount}
            </span>
          )}
          {/* Employee unread notifications count */}
          {role === 'karyawan' && employeeNotifications && employeeNotifications.length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              {employeeNotifications.length > 9 ? '9+' : employeeNotifications.length}
            </span>
          )}
        </Button>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-9 items-center gap-2 rounded-full px-2 text-sm font-medium hover:bg-accent focus:outline-none"
            aria-label="Menu pengguna"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className={cn("text-sm font-bold", isEmployeeDashboard ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground")}>
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block">{name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-0">
            {profileLoading ? (
               <div className="p-6 text-center text-sm text-muted-foreground">Memuat profil...</div>
            ) : userProfile ? (
               <div className="flex flex-col items-center gap-3 p-6 pb-4 border-b">
                 <Avatar className="h-20 w-20">
                   {userProfile.photoUrl ? (
                     <img src={userProfile.photoUrl} alt={userProfile.name} className="object-cover w-full h-full" />
                   ) : (
                     <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                       {userProfile.name.charAt(0).toUpperCase()}
                     </AvatarFallback>
                   )}
                 </Avatar>
                 <div className="text-center w-full space-y-1 mt-2">
                   <p className="font-bold text-base">{userProfile.name}</p>
                   <p className="text-xs text-muted-foreground font-mono">@{userProfile.username}</p>
                   
                   <div className="flex flex-col gap-1 mt-3 bg-muted/40 p-3 rounded-lg border text-xs text-left">
                     <div className="flex justify-between border-b pb-1">
                       <span className="text-muted-foreground">Jabatan</span>
                       <span className="font-medium">{userProfile.position || '-'}</span>
                     </div>
                     <div className="flex justify-between border-b pb-1 pt-1">
                       <span className="text-muted-foreground">Email</span>
                       <span className="font-medium truncate max-w-[120px]" title={userProfile.email}>{userProfile.email}</span>
                     </div>
                     <div className="flex justify-between pt-1">
                       <span className="text-muted-foreground">Status</span>
                       <span className="font-medium text-emerald-600">
                         {userProfile.isActive ? 'Aktif' : 'Nonaktif'}
                       </span>
                     </div>
                   </div>

                   {userProfile.documentUrl && (
                     <a href={userProfile.documentUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline block mt-3 font-medium">
                       Lihat Dokumen Kontrak
                     </a>
                   )}
                 </div>
               </div>
            ) : (
               <div className="p-6 text-center text-sm text-destructive">Gagal memuat profil</div>
            )}
            <div className="p-2">
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer justify-center font-medium py-2"
              >
                Keluar Akun
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="flex flex-row items-center justify-between p-6 pb-4 border-b">
            <DialogTitle>Notifikasi</DialogTitle>
            {role === 'karyawan' && employeeNotifications?.length > 0 && (
              <Button variant="ghost" size="sm" onClick={markNotificationsRead} className="h-8 text-xs">
                Tandai semua dibaca
              </Button>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {role === 'admin' ? (
              <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Bell className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">
                  Anda memiliki <strong className="text-foreground">{pendingCount}</strong> pengajuan izin menunggu persetujuan.
                </p>
                <Link 
                  href="/admin/izin" 
                  onClick={() => setNotificationsOpen(false)}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                >
                  Lihat Pengajuan
                </Link>
              </div>
            ) : (
              // Employee notifications list
              <>
                {!employeeNotifications || employeeNotifications.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Bell className="h-12 w-12 opacity-20 mb-3 mx-auto" />
                    Belum ada notifikasi baru.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {employeeNotifications.map((notif: any) => (
                      <div key={notif._id} className="flex flex-col p-5 border-b hover:bg-muted/30 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-semibold text-sm leading-none">{notif.title}</h4>
                          {!notif.isRead && <span className="h-2 w-2 mt-1 shrink-0 bg-blue-500 rounded-full"></span>}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{notif.message}</p>
                        <span className="text-xs text-muted-foreground mt-3 font-medium opacity-70">
                          {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
