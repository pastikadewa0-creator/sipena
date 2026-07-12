import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login — HR Pro',
  description: 'Masuk ke sistem absensi HR Pro',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 flex items-center justify-center p-4">
      {children}
    </div>
  )
}
