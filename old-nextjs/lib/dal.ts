import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession, SessionPayload } from '@/lib/session'

export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession()
  if (!session?.userId) {
    redirect('/login')
  }
  return session
})

export const verifyAdmin = cache(async (): Promise<SessionPayload> => {
  const session = await verifySession()
  if (session.role !== 'admin') {
    redirect('/employee/dashboard')
  }
  return session
})
