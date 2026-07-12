import { verifyAdmin } from '@/lib/dal'
import { AppShell } from '@/components/layout/app-shell'
import { connectDB } from '@/lib/db'
import LeaveRequest from '@/models/LeaveRequest'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await verifyAdmin()
  await connectDB()
  const pendingCount = await LeaveRequest.countDocuments({ status: 'pending' })

  return (
    <AppShell role="admin" name={session.name} pendingCount={pendingCount}>
      {children}
    </AppShell>
  )
}
