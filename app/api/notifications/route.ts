import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Notification from '@/models/Notification'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  // Fetch unread notifications for the user
  const notifications = await Notification.find({ userId: session.userId, isRead: false })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()

  return NextResponse.json(notifications)
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()
  
  // Mark all unread notifications as read for this user
  await Notification.updateMany(
    { userId: session.userId, isRead: false },
    { $set: { isRead: true } }
  )

  return NextResponse.json({ success: true })
}
