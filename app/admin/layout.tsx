import { verifyAdmin } from '@/lib/dal'
import { AppShell } from '@/components/layout/app-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin()

  return (
    <AppShell role="admin" name={session.name}>
      {children}
    </AppShell>
  )
}
