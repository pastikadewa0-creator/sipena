import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import LeaveRequest from '@/models/LeaveRequest'
import Attendance from '@/models/Attendance'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  if (session.role === 'admin') {
    const [totalKaryawan, pendingIzin] = await Promise.all([
      User.countDocuments({ role: 'karyawan', isActive: true }),
      LeaveRequest.countDocuments({ status: 'pending' }),
    ])

    const recentLeaves = await LeaveRequest.find({ status: 'pending' })
      .populate('userId', 'name position')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()

    return NextResponse.json({ totalKaryawan, pendingIzin, recentLeaves })
  }

  // Karyawan dashboard
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [todayAttendance, recentLeaves] = await Promise.all([
    Attendance.findOne({
      userId: session.userId,
      date: { $gte: today, $lt: tomorrow },
    }).lean(),
    LeaveRequest.find({ userId: session.userId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
  ])

  return NextResponse.json({ todayAttendance, recentLeaves })
}
