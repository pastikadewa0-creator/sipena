import { verifySession } from '@/lib/dal'
import { AppShell } from '@/components/layout/app-shell'
import { redirect } from 'next/navigation'

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession()

  if (session.role !== 'karyawan') {
    redirect('/admin/dashboard')
  }

  return (
    <AppShell role="karyawan" name={session.name}>
      {children}
    </AppShell>
  )
}
