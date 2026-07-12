import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { getSession } from '@/lib/session'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const CreateUserSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  position: z.string().optional().default(''),
  role: z.enum(['admin', 'karyawan']).default('karyawan'),
})

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const search = searchParams.get('search') || ''
  const includeInactive = searchParams.get('includeInactive') === 'true'

  const filter: Record<string, unknown> = { role: 'karyawan' }
  if (!includeInactive) filter.isActive = true
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { username: { $regex: search, $options: 'i' } },
      { position: { $regex: search, $options: 'i' } },
    ]
  }

  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    User.find(filter, '-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ])

  return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const body = await req.json()
  const parsed = CreateUserSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { username, password, name, email, position, role } = parsed.data

  const existing = await User.findOne({ username })
  if (existing) {
    return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 12)
  const user = await User.create({
    username,
    password: hashedPassword,
    name,
    email,
    position,
    role,
    isActive: true,
  })

  const { password: _pw, ...userWithoutPassword } = user.toObject()
  void _pw
  return NextResponse.json(userWithoutPassword, { status: 201 })
}
