import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { getSession } from '@/lib/session'
import bcrypt from 'bcryptjs'

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
  const updateData: Record<string, unknown> = {}

  if (body.name) updateData.name = body.name
  if (body.email) updateData.email = body.email
  if (body.position !== undefined) updateData.position = body.position
  if (body.isActive !== undefined) updateData.isActive = body.isActive
  if (body.photoUrl !== undefined) updateData.photoUrl = body.photoUrl
  if (body.documentUrl !== undefined) updateData.documentUrl = body.documentUrl
  if (body.password) {
    updateData.password = await bcrypt.hash(body.password, 12)
  }

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    select: '-password',
  }).lean()

  if (!user) {
    return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session?.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params
  await connectDB()

  // Soft delete: set isActive = false
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true, select: '-password' }
  ).lean()

  if (!user) {
    return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
  }

  return NextResponse.json({ message: 'Karyawan berhasil dinonaktifkan', user })
}
