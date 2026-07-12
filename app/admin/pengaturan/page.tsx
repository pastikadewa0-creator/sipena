'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Upload, Loader2, Save, Building2, ImageIcon } from 'lucide-react'
import Image from 'next/image'

export default function SettingsPage() {
  const [siteName, setSiteName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setSiteName(data.siteName || 'SIPENA')
        setLogoUrl(data.siteLogo || '')
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
    </div>
  )
}
