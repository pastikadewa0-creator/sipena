# SIPENA — Sistem Manajemen Absensi Karyawan

Aplikasi web untuk manajemen kehadiran (absensi) karyawan berbasis **Laravel 11** + **MySQL**.
Dibuat sebagai pengganti versi Next.js sebelumnya, dioptimalkan untuk dijalankan secara lokal menggunakan **XAMPP** di Windows.

---

## 📋 Daftar Isi

1. [Prasyarat (Wajib Diinstall)](#-prasyarat-wajib-diinstall)
2. [Cara Install - Otomatis (Recommended)](#-cara-install---otomatis-recommended)
3. [Cara Install - Manual (Step by Step)](#-cara-install---manual-step-by-step)
4. [Menjalankan Aplikasi](#-menjalankan-aplikasi)
5. [Akun Demo](#-akun-demo)
6. [Fitur Aplikasi](#-fitur-aplikasi)
7. [Struktur Folder](#-struktur-folder)
8. [Troubleshooting](#-troubleshooting)

---

## 🔧 Prasyarat (Wajib Diinstall)

Sebelum mulai, pastikan software berikut sudah terinstall di komputer kamu:

### 1. XAMPP (versi 8.3 ke atas)

Download: [https://www.apachefriends.org/download.html](https://www.apachefriends.org/download.html)

> ⚠️ **PENTING:** Pilih versi XAMPP yang mengandung **PHP 8.3** atau lebih baru.
> Versi yang direkomendasikan: **XAMPP 8.3.x**

Saat install:
- Centang **Apache** dan **MySQL** (yang lain opsional)
- Install di lokasi default `C:\xampp`

### 2. Composer (PHP Package Manager)

Download: [https://getcomposer.org/Composer-Setup.exe](https://getcomposer.org/Composer-Setup.exe)

Saat install:
- Pilih PHP dari XAMPP: `C:\xampp\php\php.exe`
- Centang "Add to PATH"

### 3. Tambahkan PHP ke PATH (Jika Belum)

1. Tekan **Win + S**, ketik **"Environment Variables"**
2. Klik **"Edit the system environment variables"**
3. Klik tombol **"Environment Variables..."**
4. Di bagian **"System variables"**, cari **Path**, lalu klik **Edit**
5. Klik **New**, tambahkan:
   ```
   C:\xampp\php
   ```
6. Klik **OK** di semua dialog
7. **Tutup dan buka ulang CMD/Terminal**

### ✅ Verifikasi Prasyarat

Buka **CMD baru** (penting: harus CMD baru setelah install), lalu ketik:

```cmd
php -v
```
Harus muncul versi PHP 8.3.x

```cmd
composer --version
```
Harus muncul versi Composer 2.x

---

## 🚀 Cara Install - Otomatis (Recommended)

Cara paling mudah! Cukup jalankan script installer:

### Langkah:

1. **Extract** file ZIP ke folder manapun (contoh: `D:\Projects\sipena`)

2. **Buka XAMPP Control Panel**, klik **Start** pada **MySQL**
   
   ![XAMPP MySQL harus Running](https://i.imgur.com/placeholder.png)

3. **Buka CMD**, navigasi ke folder project:
   ```cmd
   cd D:\Projects\sipena
   ```

4. **Jalankan installer:**
   ```cmd
   install.bat
   ```

5. Script akan otomatis:
   - ✅ Cek PHP & Composer
   - ✅ Install semua dependencies
   - ✅ Generate application key
   - ✅ Buat database `sipena_db`
   - ✅ Jalankan migrasi tabel
   - ✅ Isi data demo (admin + 5 karyawan)
   - ✅ Buat storage link

6. **Selesai!** Ketik `y` untuk langsung menjalankan server.

---

## 📝 Cara Install - Manual (Step by Step)

Jika `install.bat` tidak bekerja, ikuti langkah manual berikut:

### Langkah 1: Extract ZIP

Extract file ZIP ke folder yang diinginkan, misalnya:
```
D:\Projects\sipena
```

### Langkah 2: Buka CMD di Folder Project

```cmd
cd D:\Projects\sipena
```

### Langkah 3: Install Dependencies

```cmd
composer install
```
> Tunggu sampai selesai (butuh internet, ~2-5 menit)

### Langkah 4: Buat File .env

```cmd
copy .env.example .env
```

### Langkah 5: Generate Application Key

```cmd
php artisan key:generate
```

### Langkah 6: Buat Database di phpMyAdmin

1. Pastikan **MySQL** sudah **Start** di XAMPP Control Panel
2. Buka browser → [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
3. Klik tab **"Databases"** (di atas)
4. Di kolom **"Create database"**, ketik: `sipena_db`
5. Di dropdown sebelahnya, pilih: `utf8mb4_unicode_ci`
6. Klik tombol **"Create"**

### Langkah 7: Jalankan Migrasi

```cmd
php artisan migrate
```
> Ketik `yes` jika ada konfirmasi

### Langkah 8: Isi Data Demo

```cmd
php artisan db:seed
```

### Langkah 9: Buat Storage Link

```cmd
php artisan storage:link
```

### Langkah 10: Jalankan Server

```cmd
php artisan serve
```

Buka browser → [http://localhost:8000](http://localhost:8000)

---

## ▶️ Menjalankan Aplikasi

Setiap kali ingin menjalankan aplikasi:

1. **Buka XAMPP Control Panel** → klik **Start** pada **MySQL**
2. **Buka CMD** di folder project:
   ```cmd
   cd D:\Projects\sipena
   php artisan serve
   ```
3. **Buka browser** → [http://localhost:8000](http://localhost:8000)
4. Untuk **menghentikan** server: tekan **Ctrl + C** di CMD

---

## 👤 Akun Demo

| Role     | Username    | Password   |
|----------|-------------|------------|
| Admin    | `admin`     | `password` |
| Karyawan | `employee1` | `password` |
| Karyawan | `employee2` | `password` |
| Karyawan | `employee3` | `password` |
| Karyawan | `employee4` | `password` |
| Karyawan | `employee5` | `password` |

---

## ✨ Fitur Aplikasi

### 🔐 Login
- Username & password
- Redirect otomatis berdasarkan role (Admin / Karyawan)

### 👨‍💼 Admin Panel
| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard** | Ringkasan total karyawan, hadir hari ini, izin pending |
| **Data Karyawan** | Daftar karyawan aktif beserta jabatan |
| **Rekap Absensi** | Tabel riwayat kehadiran semua karyawan |
| **Pengajuan Izin** | Approve/reject izin, sakit, cuti, tugas luar |
| **Pengaturan** | Setting koordinat GPS dan radius absensi kantor |

### 👷 Employee Panel
| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard** | Greeting, quick actions, jam real-time |
| **Absen Masuk** | Deteksi lokasi GPS + upload foto/dokumen |
| **Absen Pulang** | Satu klik absen pulang |
| **Pengajuan Izin** | Form izin/sakit/cuti/tugas luar + upload dokumen |
| **Riwayat** | Histori pengajuan + status (pending/approved/rejected) |
| **Notifikasi** | Alert saat izin disetujui/ditolak |

### 📍 Geolocation
- Validasi lokasi GPS karyawan saat absen masuk
- Rumus Haversine untuk menghitung jarak dari kantor
- Admin bisa setting radius (default: 50 meter)

---

## 📁 Struktur Folder

```
sipena/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AdminController.php      ← Logic admin
│   │   │   ├── AuthController.php       ← Login/logout
│   │   │   └── EmployeeController.php   ← Logic karyawan
│   │   └── Middleware/
│   │       ├── IsAdmin.php              ← Cek role admin
│   │       └── IsEmployee.php           ← Cek role karyawan
│   └── Models/
│       ├── Attendance.php
│       ├── LeaveRequest.php
│       ├── Notification.php
│       ├── Setting.php
│       └── User.php
├── database/
│   ├── migrations/                      ← Struktur tabel
│   └── seeders/
│       └── DatabaseSeeder.php           ← Data demo
├── resources/views/
│   ├── layouts/app.blade.php            ← Layout utama
│   ├── auth/login.blade.php             ← Halaman login
│   ├── admin/                           ← Views admin
│   │   ├── dashboard.blade.php
│   │   ├── employees/index.blade.php
│   │   ├── attendances/index.blade.php
│   │   ├── leaves/index.blade.php
│   │   └── settings.blade.php
│   └── employee/
│       └── dashboard.blade.php          ← Dashboard karyawan
├── routes/web.php                       ← Routing
├── .env.example                         ← Template konfigurasi
├── install.bat                          ← Installer otomatis Windows
└── README.md                            ← File ini
```

---

## 🛠 Troubleshooting

### ❌ "php is not recognized as a command"

**Solusi:** Tambahkan `C:\xampp\php` ke System PATH (lihat bagian Prasyarat).

### ❌ "SQLSTATE[HY000] [2002] Connection refused"

**Solusi:** MySQL belum running. Buka XAMPP Control Panel → klik **Start** pada **MySQL**.

### ❌ "SQLSTATE[HY000] [1049] Unknown database 'sipena_db'"

**Solusi:** Database belum dibuat. Buka phpMyAdmin → buat database `sipena_db`.

### ❌ "The stream or file storage/logs/laravel.log could not be opened"

**Solusi:** Jalankan di CMD:
```cmd
mkdir storage\logs
echo. > storage\logs\laravel.log
```

### ❌ "Class 'App\Models\Notification' not found"

**Solusi:** Jalankan:
```cmd
composer dump-autoload
```

### ❌ Halaman blank putih / error 500

**Solusi:**
1. Pastikan file `.env` ada (copy dari `.env.example`)
2. Jalankan:
   ```cmd
   php artisan key:generate
   php artisan config:clear
   php artisan cache:clear
   ```

### ❌ Port 8000 sudah digunakan

**Solusi:** Jalankan di port lain:
```cmd
php artisan serve --port=8080
```

---

## 📄 Teknologi yang Digunakan

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| PHP | 8.3+ | Backend |
| Laravel | 11.x | Framework |
| MySQL | 8.0+ | Database |
| Tailwind CSS | CDN | Styling |
| Lucide Icons | CDN | Ikon |
| XAMPP | 8.3+ | Local Server |

---

## 📞 Kontak

Jika ada pertanyaan atau masalah, hubungi developer.

---

*SIPENA © 2026 — Sistem Manajemen Absensi Karyawan*
