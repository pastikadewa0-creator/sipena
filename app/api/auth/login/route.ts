import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import { createSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username dan password wajib diisi' },
        { status: 400 }
      )
    }

    await connectDB()
    const user = await User.findOne({ username: username.toLowerCase(), isActive: true })

    if (!user) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })
    }

    await createSession({
      userId: user._id.toString(),
      role: user.role,
      name: user.name,
    })

    return NextResponse.json({
      success: true,
      role: user.role,
      redirectTo: user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard',
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
