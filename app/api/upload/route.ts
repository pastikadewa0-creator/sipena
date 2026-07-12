import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Tipe file tidak diizinkan. Gunakan PDF, JPEG, atau PNG' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 })
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'hr-pro', resource_type: 'auto' },
        (error, result) => {
          if (error || !result) reject(error)
          else resolve(result as { secure_url: string })
        }
      )
      uploadStream.end(buffer)
    })

    return NextResponse.json({ url: result.secure_url })
  } catch {
    return NextResponse.json({ error: 'Gagal mengupload file' }, { status: 500 })
  }
}
