@echo off
chcp 65001 >nul
title SIPENA - Instalasi Otomatis
color 0A

echo ╔══════════════════════════════════════════════════════╗
echo ║        SIPENA - Sistem Manajemen Absensi            ║
echo ║              Instalasi Otomatis                     ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM ── Cek PHP ──
where php >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PHP tidak ditemukan di PATH!
    echo.
    echo Pastikan XAMPP sudah terinstall dan tambahkan path PHP ke System PATH:
    echo    C:\xampp\php
    echo.
    echo Cara menambahkan ke PATH:
    echo    1. Buka Start Menu, cari "Environment Variables"
    echo    2. Klik "Environment Variables..."
    echo    3. Di "System variables", klik "Path" lalu "Edit"
    echo    4. Klik "New" lalu ketik: C:\xampp\php
    echo    5. Klik OK semua, lalu buka CMD baru
    echo.
    pause
    exit /b 1
)

echo [OK] PHP ditemukan:
php -v | findstr /n "^" | findstr "^1:"
echo.

REM ── Cek Composer ──
where composer >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Composer tidak ditemukan!
    echo.
    echo Download dan install Composer dari:
    echo    https://getcomposer.org/Composer-Setup.exe
    echo.
    echo Setelah install, buka CMD baru dan jalankan install.bat lagi.
    echo.
    pause
    exit /b 1
)

echo [OK] Composer ditemukan:
composer --version
echo.

REM ── Cek MySQL (XAMPP) ──
echo [INFO] Pastikan MySQL di XAMPP sudah running (Start di XAMPP Control Panel)
echo.

REM ── Copy .env ──
if not exist .env (
    echo [INFO] Membuat file .env dari .env.example...
    copy .env.example .env >nul
    echo [OK] File .env berhasil dibuat
) else (
    echo [OK] File .env sudah ada
)
echo.

REM ── Install Dependencies ──
echo [INFO] Menginstall dependencies PHP (composer install)...
echo        Proses ini membutuhkan koneksi internet dan beberapa menit...
echo.
call composer install --no-interaction --prefer-dist
if %errorlevel% neq 0 (
    echo [ERROR] Gagal install dependencies!
    pause
    exit /b 1
)
echo.
echo [OK] Dependencies berhasil diinstall
echo.

REM ── Generate App Key ──
echo [INFO] Generate application key...
php artisan key:generate --force
echo [OK] Application key berhasil digenerate
echo.

REM ── Buat Database ──
echo [INFO] Membuat database sipena_db di MySQL...
echo        (Pastikan MySQL XAMPP sudah RUNNING!)
echo.

C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE IF NOT EXISTS sipena_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] Tidak bisa membuat database secara otomatis.
    echo           Silakan buat database secara manual:
    echo.
    echo    1. Buka http://localhost/phpmyadmin
    echo    2. Klik tab "Databases"
    echo    3. Ketik "sipena_db" di kolom "Create database"
    echo    4. Pilih "utf8mb4_unicode_ci"
    echo    5. Klik "Create"
    echo.
    echo    Setelah selesai, tekan tombol apa saja untuk melanjutkan...
    pause >nul
)
echo.

REM ── Migrasi Database ──
echo [INFO] Menjalankan migrasi database...
php artisan migrate --force
if %errorlevel% neq 0 (
    echo [ERROR] Migrasi gagal! Pastikan database sipena_db sudah dibuat dan MySQL running.
    pause
    exit /b 1
)
echo [OK] Migrasi database berhasil
echo.

REM ── Seed Data Demo ──
echo [INFO] Mengisi data demo (admin + karyawan)...
php artisan db:seed --force
echo [OK] Data demo berhasil ditambahkan
echo.

REM ── Storage Link ──
echo [INFO] Membuat storage link...
php artisan storage:link 2>nul
echo [OK] Storage link berhasil dibuat
echo.

REM ── Selesai ──
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║            INSTALASI BERHASIL!                      ║
echo ╠══════════════════════════════════════════════════════╣
echo ║                                                     ║
echo ║  Jalankan server:                                   ║
echo ║     php artisan serve                               ║
echo ║                                                     ║
echo ║  Buka browser:                                      ║
echo ║     http://localhost:8000                            ║
echo ║                                                     ║
echo ║  Akun Demo:                                         ║
echo ║     Admin:    admin / password                      ║
echo ║     Karyawan: employee1 / password                  ║
echo ║                                                     ║
echo ╚══════════════════════════════════════════════════════╝
echo.

set /p RUNSERVER="Apakah ingin langsung menjalankan server? (y/n): "
if /i "%RUNSERVER%"=="y" (
    echo.
    echo [INFO] Menjalankan server di http://localhost:8000 ...
    echo        Tekan Ctrl+C untuk menghentikan server
    echo.
    php artisan serve
)

pause
