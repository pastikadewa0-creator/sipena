import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hr-pro'

interface UserDoc {
  username: string
  password: string
  role: string
  name: string
  email: string
  position: string
  isActive: boolean
}

const UserSchema = new mongoose.Schema<UserDoc>(
  {
    username: String,
    password: String,
    role: String,
    name: String,
    email: String,
    position: String,
    isActive: Boolean,
  },
  { timestamps: true }
)

const User = mongoose.models.User || mongoose.model('User', UserSchema)

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Terhubung ke MongoDB')

    await User.deleteMany({})
    console.log('🗑️  Data lama dihapus')

    const [adminPwd, emp1Pwd, emp2Pwd] = await Promise.all([
      bcrypt.hash('admin123', 12),
      bcrypt.hash('karyawan123', 12),
      bcrypt.hash('karyawan123', 12),
    ])

    await User.insertMany([
      {
        username: 'admin',
        password: adminPwd,
        role: 'admin',
        name: 'Administrator',
        email: 'admin@hrpro.com',
        position: 'HR Manager',
        isActive: true,
      },
      {
        username: 'budi',
        password: emp1Pwd,
        role: 'karyawan',
        name: 'Budi Santoso',
        email: 'budi@hrpro.com',
        position: 'Staff IT',
        isActive: true,
      },
      {
        username: 'sari',
        password: emp2Pwd,
        role: 'karyawan',
        name: 'Sari Dewi',
        email: 'sari@hrpro.com',
        position: 'Staff Keuangan',
        isActive: true,
      },
    ])

    console.log('\n🎉 Seed database berhasil!')
    console.log('─────────────────────────────────────')
    console.log('Admin    : username=admin     | password=admin123')
    console.log('Karyawan : username=budi      | password=karyawan123')
    console.log('Karyawan : username=sari      | password=karyawan123')
    console.log('─────────────────────────────────────\n')
  } catch (err) {
    console.error('❌ Seed gagal:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
    console.log('🔌 Koneksi MongoDB ditutup')
  }
}

seed()
