'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FileText,
  CalendarCheck,
  LogOut,
  ChevronRight,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface NavItem {
  href: string
  icon: React.ElementType
  label: string
}

const adminNav: NavItem[] = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/karyawan', icon: Users, label: 'Data Karyawan' },
  { href: '/admin/absensi', icon: CalendarCheck, label: 'Rekap Absensi' },
  { href: '/admin/izin', icon: FileText, label: 'Pengajuan Izin' },
]

const employeeNav: NavItem[] = [
  { href: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/employee/absensi', icon: CalendarCheck, label: 'Absensi' },
  { href: '/employee/izin', icon: ClipboardList, label: 'Pengajuan Izin' },
]

interface AppSidebarProps {
  role: 'admin' | 'karyawan'
  name: string
}

export function AppSidebar({ role, name }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const navItems = role === 'admin' ? adminNav : employeeNav

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
    <aside className="sidebar-gradient flex h-full w-64 flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Building2 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-sidebar-foreground">SIPENA</p>
          <p className="text-xs text-sidebar-foreground/50">Sistem Absensi</p>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            role === 'admin'
              ? 'bg-primary/20 text-primary'
              : 'bg-sidebar-accent text-sidebar-accent-foreground'
          )}
        >
          {role === 'admin' ? '⚙️ Admin' : '👤 Karyawan'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-3 w-3 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-bold text-sidebar-accent-foreground">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">{name}</p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  )
}
