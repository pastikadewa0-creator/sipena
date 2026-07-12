import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Attendance from '@/models/Attendance'
import User from '@/models/User' // MUST import to register schema for populate
import Setting from '@/models/Setting'
import { getSession } from '@/lib/session'
import { getDistanceFromLatLonInM } from '@/lib/geo'

const WORK_START_HOUR = 8
const WORK_START_MINUTE = 0

function getJakartaDateString(date: Date): string {
  // Returns YYYY-MM-DD in Asia/Jakarta
  const f = new Intl.DateTimeFormat('en-CA', { 
    timeZone: 'Asia/Jakarta', 
    year: 'numeric', month: '2-digit', day: '2-digit' 
  })
  return f.format(date)
}

function getJakartaDate(date: Date): Date {
  const dateString = getJakartaDateString(date)
  return new Date(`${dateString}T00:00:00.000Z`)
}

function isLate(checkInTime: Date): boolean {
  const f = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit', minute: '2-digit', hour12: false
  })
  const timeString = f.format(checkInTime) // "08:30"
  const [hoursStr, minutesStr] = timeString.split(':')
  const hours = parseInt(hoursStr, 10)
  const minutes = parseInt(minutesStr, 10)
  
  return (
    hours > WORK_START_HOUR ||
    (hours === WORK_START_HOUR && minutes > WORK_START_MINUTE)
  )
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const status = searchParams.get('status')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const userIdParam = searchParams.get('userId')

  const filter: Record<string, unknown> = {}

  if (session.role === 'karyawan') {
    filter.userId = session.userId
  } else if (userIdParam) {
    filter.userId = userIdParam
  }

  if (status) filter.status = status
  if (dateFrom || dateTo) {
    filter.date = {}
    if (dateFrom) (filter.date as Record<string, unknown>).$gte = new Date(dateFrom)
    if (dateTo) {
      const to = new Date(dateTo)
      to.setDate(to.getDate() + 1)
      ;(filter.date as Record<string, unknown>).$lt = to
    }
  }

  const skip = (page - 1) * limit
  const [data, total] = await Promise.all([
    Attendance.find(filter)
      .populate('userId', 'name position')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Attendance.countDocuments(filter),
  ])

  return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const now = new Date()
  const today = getJakartaDate(now)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const existing = await Attendance.findOne({
    userId: session.userId,
    date: { $gte: today, $lt: tomorrow },
  })

  if (existing) {
    return NextResponse.json({ error: 'Sudah melakukan absen hari ini' }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}))
  const documentUrl = body.documentUrl || ''
  const latitude = typeof body.latitude === 'number' ? body.latitude : null
  const longitude = typeof body.longitude === 'number' ? body.longitude : null

  // Validate Location if enabled
  const settings = await Setting.find({ key: { $in: ['attendanceLocationEnabled', 'attendanceLocationLat', 'attendanceLocationLng', 'attendanceRadius'] } }).lean()
  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))
  
  if (settingsMap.attendanceLocationEnabled === 'true') {
    if (latitude === null || longitude === null) {
      return NextResponse.json({ error: 'Akses lokasi wajib diizinkan' }, { status: 400 })
    }
    const targetLat = parseFloat(settingsMap.attendanceLocationLat || '0')
    const targetLng = parseFloat(settingsMap.attendanceLocationLng || '0')
    const radius = parseFloat(settingsMap.attendanceRadius || '50')
    const distance = getDistanceFromLatLonInM(latitude, longitude, targetLat, targetLng)
    
    if (distance > radius) {
      return NextResponse.json({ error: `Di luar jangkauan absensi (Jarak: ${Math.round(distance)}m / ${radius}m)` }, { status: 400 })
    }
  }

  const status = isLate(now) ? 'terlambat' : 'hadir'

  const attendance = await Attendance.create({
    userId: session.userId,
    date: today,
    checkIn: now,
    checkOut: null,
    status,
    documentUrl,
    latitude,
    longitude,
  })

  return NextResponse.json(attendance, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await connectDB()

  const today = getJakartaDate(new Date())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const attendance = await Attendance.findOne({
    userId: session.userId,
    date: { $gte: today, $lt: tomorrow },
  })

  if (!attendance) {
    return NextResponse.json(
      { error: 'Belum melakukan absen masuk hari ini' },
      { status: 400 }
    )
  }

  if (attendance.checkOut) {
    return NextResponse.json(
      { error: 'Sudah melakukan absen pulang hari ini' },
      { status: 400 }
    )
  }

  const body = await req.json().catch(() => ({}))
  const latitude = typeof body.latitude === 'number' ? body.latitude : null
  const longitude = typeof body.longitude === 'number' ? body.longitude : null

  // Validate Location if enabled
  const settings = await Setting.find({ key: { $in: ['attendanceLocationEnabled', 'attendanceLocationLat', 'attendanceLocationLng', 'attendanceRadius'] } }).lean()
  const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]))
  
  if (settingsMap.attendanceLocationEnabled === 'true') {
    if (latitude === null || longitude === null) {
      return NextResponse.json({ error: 'Akses lokasi wajib diizinkan' }, { status: 400 })
    }
    const targetLat = parseFloat(settingsMap.attendanceLocationLat || '0')
    const targetLng = parseFloat(settingsMap.attendanceLocationLng || '0')
    const radius = parseFloat(settingsMap.attendanceRadius || '50')
    const distance = getDistanceFromLatLonInM(latitude, longitude, targetLat, targetLng)
    
    if (distance > radius) {
      return NextResponse.json({ error: `Di luar jangkauan absensi (Jarak: ${Math.round(distance)}m / ${radius}m)` }, { status: 400 })
    }
  }

  attendance.checkOut = new Date()
  await attendance.save()

  return NextResponse.json(attendance)
}
