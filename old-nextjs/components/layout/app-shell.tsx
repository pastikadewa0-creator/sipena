'use client'

import { useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { AppTopbar } from './app-topbar'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, CalendarCheck, ClipboardList, LogOut, Aperture, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import useSWR from 'swr'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface AppShellProps {
  children: React.ReactNode
  role: 'admin' | 'karyawan'
  name: string
  pendingCount?: number
}

export function AppShell({ children, role, name, pendingCount = 0 }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { href: '/employee/dashboard', icon: Aperture },
    { href: '/employee/absensi', icon: CalendarCheck },
    { href: '#', icon: User, isProfile: true },
  ]

  const { data: userProfile, isLoading: profileLoading } = useSWR(
    role === 'karyawan' ? '/api/users/me' : null,
    (url: string) => fetch(url).then(r => r.json())
  )
  const [profileOpen, setProfileOpen] = useState(false)

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Gagal logout. Coba lagi.')
    }
  }

  if (role === 'karyawan') {
    return (
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        {/* Topbar */}
        <AppTopbar name={name} role={role} pendingCount={pendingCount} />

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-24">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>

        {/* Floating Action Button (Absensi) */}
        {pathname !== '/employee/absensi' && (
          <Link
            href="/employee/absensi"
            className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 md:right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_4px_14px_0_rgb(0,0,0,0.39)] shadow-primary/50 transition-transform hover:scale-105 active:scale-95"
            aria-label="Absen Sekarang"
          >
            <CalendarCheck className="h-6 w-6" />
          </Link>
        )}

        {/* Bottom Navigation Bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card pb-[env(safe-area-inset-bottom)] shadow-lg">
          <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4">
            {navItems.map((item, i) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={i}
                  href={item.href}
                  onClick={(e) => {
                    if (item.isProfile) {
                      e.preventDefault()
                      setProfileOpen(true)
                    } else if ((item as any).isComingSoon) {
                      e.preventDefault()
                      toast.info('Fitur Segera Hadir!')
                    }
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center w-20 h-full transition-colors",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className={cn("h-6 w-6", isActive && "text-primary fill-primary/10")} />
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Profile Dialog */}
        <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
          <DialogContent className="sm:max-w-sm rounded-xl p-0 overflow-hidden mx-auto w-[90vw]">
            <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
              <DialogTitle className="text-center">Profil Saya</DialogTitle>
            </DialogHeader>
            {profileLoading ? (
               <div className="p-8 text-center text-sm text-muted-foreground">Memuat profil...</div>
            ) : userProfile ? (
               <div className="flex flex-col items-center gap-3 p-6">
                 <Avatar className="h-24 w-24 border-4 border-primary/20">
                   {userProfile.photoUrl ? (
                     <img src={userProfile.photoUrl} alt={userProfile.name} className="object-cover w-full h-full" />
                   ) : (
                     <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                       {userProfile.name.charAt(0).toUpperCase()}
                     </AvatarFallback>
                   )}
                 </Avatar>
                 <div className="text-center w-full space-y-1 mt-2">
                   <p className="font-bold text-lg">{userProfile.name}</p>
                   <p className="text-sm text-muted-foreground font-mono mb-4">@{userProfile.username}</p>
                   
                   <div className="flex flex-col gap-2 mt-4 bg-muted/40 p-4 rounded-xl border text-sm text-left">
                     <div className="flex justify-between border-b pb-2">
                       <span className="text-muted-foreground">Jabatan</span>
                       <span className="font-medium">{userProfile.position || '-'}</span>
                     </div>
                     <div className="flex justify-between border-b pb-2 pt-1">
                       <span className="text-muted-foreground">Email</span>
                       <span className="font-medium truncate max-w-[150px]" title={userProfile.email}>{userProfile.email}</span>
                     </div>
                     <div className="flex justify-between pt-1">
                       <span className="text-muted-foreground">Status</span>
                       <span className="font-medium text-emerald-600">
                         {userProfile.isActive ? 'Aktif' : 'Nonaktif'}
                       </span>
                     </div>
                   </div>

                   {userProfile.documentUrl && (
                     <a href={userProfile.documentUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline block mt-4 font-medium">
                       Lihat Dokumen Kontrak
                     </a>
                   )}
                 </div>
                 <Button 
                   variant="destructive" 
                   className="w-full mt-4 rounded-xl"
                   onClick={() => {
                     setProfileOpen(false)
                     handleLogout()
                   }}
                 >
                   <LogOut className="mr-2 h-4 w-4" /> Keluar Akun
                 </Button>
               </div>
            ) : (
               <div className="p-8 text-center text-sm text-destructive">Gagal memuat profil</div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    )
  }

  // Admin layout
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop */}
      <div className="hidden md:flex md:w-64 md:flex-shrink-0">
        <AppSidebar role={role} name={name} />
      </div>

      {/* Sidebar — mobile overlay */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-40 w-64 md:hidden">
            <AppSidebar role={role} name={name} />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppTopbar
          name={name}
          role={role}
          pendingCount={pendingCount}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
