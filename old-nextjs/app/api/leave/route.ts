import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import LeaveRequest from '@/models/LeaveRequest'
import User from '@/models/User'
import { getSession } from '@/lib/session'
import { z } from 'zod'

const LeaveSchema = z.object({
  type: z.enum(['izin', 'sakit', 'cuti', 'tugas_luar']),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
  reason: z.string().min(3, 'Alasan minimal 3 karakter'),
  documentUrl: z.string().optional().default(''),
})

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const filter: Record<string, unknown> = {}

  if (session.role === 'karyawan') {
    filter.userId = session.userId
  }

  if (status) filter.status = status

  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    LeaveRequest.find(filter)
      .populate('userId', 'name position')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LeaveRequest.countDocuments(filter),
  ])

  return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const body = await req.json()
  const parsed = LeaveSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { type, startDate, endDate, reason, documentUrl } = parsed.data

  if (new Date(endDate) < new Date(startDate)) {
    return NextResponse.json(
      { error: 'Tanggal selesai harus setelah atau sama dengan tanggal mulai' },
      { status: 400 }
    )
  }

  const leave = await LeaveRequest.create({
    userId: session.userId,
    type,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    reason,
    documentUrl,
    status: 'pending',
  })

  return NextResponse.json(leave, { status: 201 })
}
