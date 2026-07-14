'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, Loader2, Save, Building2, ImageIcon, MapPin } from 'lucide-react'
import Image from 'next/image'
import { Switch } from '@/components/ui/switch'

export default function SettingsPage() {
  const [siteName, setSiteName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingLocation, setSavingLocation] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Location settings
  const [attendanceLocationEnabled, setAttendanceLocationEnabled] = useState(false)
  const [attendanceLocationLat, setAttendanceLocationLat] = useState('')
  const [attendanceLocationLng, setAttendanceLocationLng] = useState('')
  const [attendanceRadius, setAttendanceRadius] = useState('50')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSiteName(data.siteName || 'SIPENA')
        setLogoUrl(data.siteLogo || '')
        setAttendanceLocationEnabled(data.attendanceLocationEnabled === 'true')
        setAttendanceLocationLat(data.attendanceLocationLat || '')
        setAttendanceLocationLng(data.attendanceLocationLng || '')
        setAttendanceRadius(data.attendanceRadius || '50')
        setLoading(false)
      })
      .catch(() => {
        toast.error('Gagal memuat pengaturan')
        setLoading(false)
      })
  }, [])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar (JPG/PNG)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran maksimal gambar adalah 2MB')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) throw new Error('Gagal mengunggah gambar')

      const data = await res.json()
      setLogoUrl(data.url)
      
      // Save logo setting immediately
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'siteLogo', value: data.url }),
      })
      
      toast.success('Logo berhasil diperbarui')
    } catch (error) {
      toast.error('Terjadi kesalahan saat mengunggah logo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'siteName', value: siteName }),
      })

      if (!res.ok) throw new Error('Gagal menyimpan nama')
      toast.success('Nama aplikasi berhasil disimpan')
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingLocation(true)
    try {
      const updates = [
        { key: 'attendanceLocationEnabled', value: attendanceLocationEnabled ? 'true' : 'false' },
        { key: 'attendanceLocationLat', value: attendanceLocationLat },
        { key: 'attendanceLocationLng', value: attendanceLocationLng },
        { key: 'attendanceRadius', value: attendanceRadius }
      ]

      for (const update of updates) {
        await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        })
      }

      toast.success('Pengaturan lokasi absensi berhasil disimpan')
    } catch (error) {
      toast.error('Terjadi kesalahan saat menyimpan pengaturan lokasi')
    } finally {
      setSavingLocation(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Sistem</h1>
        <p className="text-muted-foreground mt-2">
          Kustomisasi tampilan dan informasi identitas aplikasi Anda.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Logo Settings */}
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Logo Aplikasi
            </CardTitle>
            <CardDescription>
              Unggah logo kustom untuk ditampilkan di sidebar dan halaman login.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 ring-4 ring-primary/5 transition-all hover:ring-primary/20">
                {logoUrl ? (
                  <Image src={logoUrl} alt="App Logo" fill className="object-contain p-4" unoptimized />
                ) : (
                  <Building2 className="h-12 w-12 text-primary/40" />
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploading}
                  className="w-full sm:w-auto"
                >
                  {uploading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mengunggah...</>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" /> Pilih Gambar Baru</>
                  )}
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Format disarankan: PNG transparan atau SVG. Maks 2MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Name Settings */}
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Nama Aplikasi
            </CardTitle>
            <CardDescription>
              Ubah teks nama aplikasi yang muncul di sidebar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveName} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nama Brand / Aplikasi</Label>
                <Input
                  id="siteName"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="Misal: SIPENA"
                  className="max-w-md"
                />
              </div>
              <Button type="submit" disabled={saving || !siteName.trim()}>
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Simpan Nama</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Location Settings */}
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Lokasi Absensi
            </CardTitle>
            <CardDescription>
              Batasi karyawan agar hanya bisa absensi di sekitar koordinat tertentu.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveLocation} className="space-y-4">
              <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Pembatasan Lokasi Aktif</Label>
                  <p className="text-sm text-muted-foreground">
                    Jika aktif, karyawan wajib memberikan akses GPS dan berada dalam radius.
                  </p>
                </div>
                <Switch 
                  checked={attendanceLocationEnabled} 
                  onCheckedChange={setAttendanceLocationEnabled} 
                />
              </div>

              {attendanceLocationEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        placeholder="-6.200000"
                        value={attendanceLocationLat}
                        onChange={(e) => setAttendanceLocationLat(e.target.value)}
                        required={attendanceLocationEnabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        placeholder="106.816666"
                        value={attendanceLocationLng}
                        onChange={(e) => setAttendanceLocationLng(e.target.value)}
                        required={attendanceLocationEnabled}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="radius">Radius Absensi (Meter)</Label>
                    <Input
                      id="radius"
                      type="number"
                      min="10"
                      placeholder="50"
                      value={attendanceRadius}
                      onChange={(e) => setAttendanceRadius(e.target.value)}
                      required={attendanceLocationEnabled}
                    />
                    <p className="text-xs text-muted-foreground">
                      Disarankan minimal 50 meter untuk mengakomodasi inakurasi GPS HP.
                    </p>
                  </div>
                </div>
              )}
              
              <Button type="submit" disabled={savingLocation}>
                {savingLocation ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Menyimpan...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Simpan Pengaturan Lokasi</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
