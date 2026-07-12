import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Setting from '@/models/Setting'
import { verifySession } from '@/lib/dal'

export async function GET() {
  try {
    await connectDB()
    const settings = await Setting.find({}).lean()
    
    // Convert array of settings into a key-value object
    const settingsObject: Record<string, string> = {}
    settings.forEach((s) => {
      settingsObject[s.key] = s.value
    })
    
    return NextResponse.json(settingsObject)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession()
    if (session?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { key, value } = await req.json()
    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 })
    }

    await connectDB()
    
    await Setting.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
