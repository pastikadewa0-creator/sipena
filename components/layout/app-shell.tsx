'use client'

import { useState } from 'react'
import { AppSidebar } from './app-sidebar'
import { AppTopbar } from './app-topbar'
import { cn } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
  role: 'admin' | 'karyawan'
  name: string
  pendingCount?: number
}

export function AppShell({ children, role, name, pendingCount = 0 }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
