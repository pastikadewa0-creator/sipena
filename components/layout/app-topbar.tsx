'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'
import Link from 'next/link'
import useSWR from 'swr'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

  const [profileOpen, setProfileOpen] = useState(false)

  const { data: userProfile, isLoading: profileLoading } = useSWR(
    profileOpen ? '/api/users/me' : null,
    (url: string) => fetch(url).then(r => r.json())
  )

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
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
        <div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          <p className="hidden text-xs text-muted-foreground sm:block">
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
        <DropdownMenu>
          <DropdownMenuTrigger
            className="relative inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-9 w-9"
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
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
            <DropdownMenuLabel className="flex justify-between items-center">
              <span>Notifikasi</span>
              {role === 'karyawan' && employeeNotifications?.length > 0 && (
                <Button variant="ghost" size="sm" onClick={markNotificationsRead} className="h-auto p-1 text-xs">
                  Tandai dibaca
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {role === 'admin' ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <p>Anda memiliki {pendingCount} pengajuan izin menunggu.</p>
                <Link href="/admin/izin" className="text-primary hover:underline mt-2 block">
                  Lihat Pengajuan
                </Link>
              </div>
            ) : (
              // Employee notifications list
              <>
                {!employeeNotifications || employeeNotifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Belum ada notifikasi baru.
                  </div>
                ) : (
                  employeeNotifications.map((notif: any) => (
                    <DropdownMenuItem key={notif._id} className="flex flex-col items-start p-3 gap-1 whitespace-normal">
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-sm">{notif.title}</span>
                        {!notif.isRead && <span className="h-2 w-2 bg-blue-500 rounded-full"></span>}
                      </div>
                      <span className="text-xs text-muted-foreground">{notif.message}</span>
                      <span className="text-[10px] text-muted-foreground mt-1">
                        {new Date(notif.createdAt).toLocaleDateString('id-ID')}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex h-9 items-center gap-2 rounded-full px-2 text-sm font-medium hover:bg-accent focus:outline-none"
            aria-label="Menu pengguna"
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                {name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:block">{name}</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>
              <p className="font-medium">{name}</p>
              <p className="text-xs text-muted-foreground capitalize font-normal">{role}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                setProfileOpen(true)
              }}
            >
              Lihat Profil
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profil Saya</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {profileLoading ? (
              <p className="text-sm text-muted-foreground">Memuat data...</p>
            ) : userProfile ? (
              <>
                <Avatar className="h-24 w-24">
                  {userProfile.photoUrl ? (
                    <img src={userProfile.photoUrl} alt={userProfile.name} className="object-cover w-full h-full" />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                      {userProfile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="text-center space-y-1 w-full">
                  <h3 className="text-xl font-bold">{userProfile.name}</h3>
                  <p className="text-sm font-mono text-muted-foreground">@{userProfile.username}</p>
                  <div className="flex flex-col gap-2 mt-4 text-sm bg-muted/30 p-4 rounded-xl border">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground">Jabatan</span>
                      <span className="font-medium">{userProfile.position || '-'}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2 pt-2">
                      <span className="text-muted-foreground">Email</span>
                      <span className="font-medium">{userProfile.email}</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium text-emerald-600">
                        {userProfile.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </div>
                  </div>
                  {userProfile.documentUrl && (
                    <div className="mt-4 pt-4">
                      <a href={userProfile.documentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline flex justify-center items-center gap-2">
                        <span>Lihat Dokumen Kontrak</span>
                      </a>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-destructive">Gagal memuat profil</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  )
}
