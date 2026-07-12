'use client'

import { useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { AppTopbar } from './app-topbar'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, CalendarCheck, ClipboardList, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

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
    { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/employee/absensi', label: 'Absensi', icon: CalendarCheck },
    { href: '/employee/izin', label: 'Izin', icon: ClipboardList },
  ]

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
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 text-xs font-medium w-20 h-full transition-colors",
                    isActive 
                      ? "text-primary border-t-2 border-primary pt-0.5" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            
            {/* Explicit Logout Button */}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center gap-1 text-xs font-medium w-20 h-full transition-colors text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-5 w-5" />
              <span>Keluar</span>
            </button>
          </div>
        </nav>
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
