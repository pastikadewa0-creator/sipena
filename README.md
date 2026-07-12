# SIPENA — Sistem Absensi Karyawan

Sistem Informasi Penilaian & Absensi (SIPENA) Karyawan berbasis web yang dibangun dengan Next.js 16, MongoDB, dan shadcn/ui.

## 🚀 Fitur

### Admin
- **Dashboard** — Total karyawan aktif, izin menunggu, riwayat pengajuan terbaru
- **Data Karyawan** — Tambah, cari, aktifkan/nonaktifkan karyawan
- **Rekap Absensi** — Lihat semua absensi dengan filter status dan rentang tanggal
- **Pengajuan Izin** — Setujui atau tolak pengajuan izin karyawan

### Karyawan
- **Dashboard** — Status absen hari ini + KPI bulan ini
- **Absensi** — Absen masuk/pulang dengan jam real-time + upload dokumen
- **Pengajuan Izin** — Ajukan izin/sakit/cuti/tugas luar + upload surat

## ⚙️ Setup

### 1. Copy environment variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` dengan credentials asli:
- `MONGODB_URI` — MongoDB Atlas connection string
- `SESSION_SECRET` — Random string min. 32 karakter
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Dari dashboard Cloudinary

### 2. Generate SESSION_SECRET
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Seed database (akun demo)
```bash
npm run seed
```

Akun yang dibuat:
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Admin |
| budi | karyawan123 | Karyawan |
| sari | karyawan123 | Karyawan |

### 4. Jalankan development server
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | MongoDB Atlas + Mongoose |
| Auth | Jose JWT (httpOnly cookies) |
| UI | shadcn/ui + Tailwind CSS v4 |
| File Upload | Cloudinary |
| Validation | Zod |
| Type Safety | TypeScript |

## 📁 Struktur Project

```
sipena/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (admin)/               # Admin dashboard & pages
│   │   ├── dashboard/
│   │   ├── karyawan/
│   │   ├── absensi/
│   │   └── izin/
│   ├── (employee)/            # Karyawan pages
│   │   ├── dashboard/
│   │   ├── absensi/
│   │   └── izin/
│   └── api/                   # API routes
│       ├── auth/
│       ├── attendance/
│       ├── dashboard/
│       ├── leave/
│       ├── upload/
│       └── users/
├── components/
│   ├── layout/                # AppShell, Sidebar, Topbar
│   └── ui/                    # shadcn + custom components
├── lib/
│   ├── db.ts                  # MongoDB connection
│   ├── session.ts             # JWT session management
│   └── dal.ts                 # Data Access Layer
├── models/                    # Mongoose schemas
│   ├── User.ts
│   ├── Attendance.ts
│   └── LeaveRequest.ts
├── proxy.ts                   # Route protection
└── scripts/seed.ts            # Database seeder
```

## 🌐 Deploy ke Vercel

1. Push ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan Environment Variables di Vercel Dashboard
4. Deploy!
