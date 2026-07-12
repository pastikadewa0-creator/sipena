'use client'

import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

export function AppTopbar({ name, role, pendingCount = 0, onMenuToggle }: AppTopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const title = pageTitles[pathname] || 'SIPENA'

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      toast.error('Gagal logout. Coba lagi.')
    }
  }

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
        {/* Notification bell (admin only) */}
        {role === 'admin' && (
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifikasi">
            <Bell className="h-5 w-5" />
            {pendingCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </Button>
        )}

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
              onClick={handleLogout}
              className="text-destructive focus:text-destructive"
            >
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
