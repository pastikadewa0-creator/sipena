'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/ui/status-badge'
import { FileUploadField } from '@/components/ui/file-upload-field'
import { LogIn, LogOut, Clock, Loader2, CalendarCheck } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Label } from '@/components/ui/label'

interface AttendanceRecord {
  _id: string
  date: string
  checkIn: string | null
  checkOut: string | null
  status: 'hadir' | 'terlambat' | 'alpha'
}

interface TodayAttendance {
  _id?: string
  checkIn: string | null
  checkOut: string | null
  status: 'hadir' | 'terlambat' | 'alpha'
}

export default function EmployeeAbsensiPage() {
  const [time, setTime] = useState(new Date())
  const [today, setToday] = useState<TodayAttendance | null>(null)
  const [loadingToday, setLoadingToday] = useState(true)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [documentUrl, setDocumentUrl] = useState('')
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  
  // Geolocation states
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [loadingCoords, setLoadingCoords] = useState(false)

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch coordinates on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      setLoadingCoords(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setLoadingCoords(false)
        },
        (error) => {
          console.error('Error fetching geolocation', error)
          setLoadingCoords(false)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      )
    }
  }, [])

  const fetchToday = useCallback(async () => {
    setLoadingToday(true)
    try {
      const res = await fetch('/api/attendance?limit=1')
      const data = await res.json()
      // Find today's attendance
      const todayStr = new Date().toDateString()
      const todayRec = (data.data || []).find(
        (r: AttendanceRecord) => new Date(r.date).toDateString() === todayStr
      )
      setToday(todayRec ?? null)
    } catch {
      toast.error('Gagal memuat status absen')
    } finally {
      setLoadingToday(false)
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true)
    try {
      const res = await fetch('/api/attendance?limit=20')
      const data = await res.json()
      setRecords(data.data || [])
    } catch {
      toast.error('Gagal memuat riwayat absen')
    } finally {
      setLoadingHistory(false)
    }
  }, [])

  useEffect(() => {
    fetchToday()
    fetchHistory()
  }, [fetchToday, fetchHistory])

  async function handleCheckIn() {
    setCheckingIn(true)
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentUrl,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Absen masuk berhasil! 🎉')
      fetchToday()
      fetchHistory()
      setDocumentUrl('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal absen masuk')
    } finally {
      setCheckingIn(false)
    }
  }

  async function handleCheckOut() {
    setCheckingOut(true)
    try {
      const res = await fetch('/api/attendance', { method: 'PATCH' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Absen pulang berhasil! 👋')
      fetchToday()
      fetchHistory()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal absen pulang')
    } finally {
      setCheckingOut(false)
    }
  }

  const hasCheckedIn = !!today?.checkIn
  const hasCheckedOut = !!today?.checkOut

  return (
    <div className="space-y-6">
      {/* Check-in/out card */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 pb-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-primary" />
            Absensi Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {/* Live clock */}
          <div className="text-center">
            <p className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
              {format(time, 'HH:mm:ss')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {format(time, "EEEE, dd MMMM yyyy", { locale: localeId })}
            </p>
          </div>

          {/* Today's status */}
          {loadingToday ? (
            <div className="flex justify-center gap-6">
              <Skeleton className="h-12 w-36" />
              <Skeleton className="h-12 w-36" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/50 p-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Jam Masuk</p>
                <p className="mt-1 text-2xl font-bold font-mono">
                  {today?.checkIn ? format(new Date(today.checkIn), 'HH:mm') : '—'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Jam Pulang</p>
                <p className="mt-1 text-2xl font-bold font-mono">
                  {today?.checkOut ? format(new Date(today.checkOut), 'HH:mm') : '—'}
                </p>
              </div>
            </div>
          )}

          {/* Status badge */}
          {today && (
            <div className="flex justify-center">
              <StatusBadge status={today.status} className="text-sm px-4 py-1" />
            </div>
          )}

          {/* Geolocation Map */}
          {!hasCheckedIn && (
            <div className="space-y-2">
              <Label>Lokasi Presensi Anda</Label>
              {loadingCoords ? (
                <Skeleton className="h-[200px] w-full rounded-lg" />
              ) : coords ? (
                <div className="overflow-hidden rounded-lg border border-border">
                  <iframe
                    width="100%"
                    height="200"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude - 0.002},${coords.latitude - 0.0015},${coords.longitude + 0.002},${coords.latitude + 0.0015}&layer=mapnik&marker=${coords.latitude},${coords.longitude}`}
                  />
                  <p className="p-2 text-xs text-muted-foreground bg-muted/30 text-center font-mono">
                    Koordinat: {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                  </p>
                </div>
              ) : (
                <div className="flex h-[100px] items-center justify-center rounded-lg border border-dashed text-center p-4">
                  <p className="text-xs text-muted-foreground">
                    Gagal memuat lokasi. Pastikan izin akses lokasi browser Anda diaktifkan untuk akurasi data presensi.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Upload field (only before check-in) */}
          {!hasCheckedIn && (
            <FileUploadField
              label="Dokumen Pendukung"
              onUpload={setDocumentUrl}
              disabled={checkingIn}
            />
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <Button
              className="flex-1 h-12 text-base"
              onClick={handleCheckIn}
              disabled={hasCheckedIn || checkingIn || loadingToday}
              id="check-in-btn"
            >
              {checkingIn ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              Absen Masuk
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12 text-base"
              onClick={handleCheckOut}
              disabled={!hasCheckedIn || hasCheckedOut || checkingOut || loadingToday}
              id="check-out-btn"
            >
              {checkingOut ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="mr-2 h-5 w-5" />
              )}
              Absen Pulang
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarCheck className="h-4 w-4 text-primary" />
            Riwayat Absensi
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="pl-6">Tanggal</TableHead>
                  <TableHead>Jam Masuk</TableHead>
                  <TableHead>Jam Pulang</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingHistory ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <TableCell key={j} className={j === 0 ? 'pl-6' : ''}>
                          <Skeleton className="h-5 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                      Belum ada riwayat absensi
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((rec) => (
                    <TableRow key={rec._id} className="hover:bg-muted/30">
                      <TableCell className="pl-6 text-sm">
                        {format(new Date(rec.date), 'dd MMM yyyy', { locale: localeId })}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {rec.checkIn ? format(new Date(rec.checkIn), 'HH:mm') : '—'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {rec.checkOut ? format(new Date(rec.checkOut), 'HH:mm') : '—'}
                      </TableCell>
                      <TableCell><StatusBadge status={rec.status} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
