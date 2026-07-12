import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import LeaveRequest from '@/models/LeaveRequest'
import Notification from '@/models/Notification'
import { getSession } from '@/lib/session'
import mongoose from 'mongoose'

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  await connectDB()

  const leave = await LeaveRequest.findById(id)
    .populate('userId', 'name position email')
    .populate('reviewedBy', 'name')
    .lean()

  if (!leave) {
    return NextResponse.json({ error: 'Pengajuan tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json(leave)
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  await connectDB()

  const body = await req.json()
  const { status } = body

  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
  }

  const leave = await LeaveRequest.findById(id)
  if (!leave) {
    return NextResponse.json({ error: 'Pengajuan tidak ditemukan' }, { status: 404 })
  }

  leave.status = status
  leave.reviewedBy = new mongoose.Types.ObjectId(session.userId)
  leave.reviewedAt = new Date()
  await leave.save()

  // Create notification for the employee
  const typeText = leave.type.replace('_', ' ')
  const statusText = status === 'approved' ? 'disetujui' : 'ditolak'
  
  await Notification.create({
    userId: leave.userId,
    title: `Pengajuan ${typeText} ${statusText}`,
    message: `Pengajuan ${typeText} Anda dari tanggal ${leave.startDate.toLocaleDateString('id-ID')} hingga ${leave.endDate.toLocaleDateString('id-ID')} telah ${statusText} oleh Admin.`,
  })

  return NextResponse.json(leave)
}
