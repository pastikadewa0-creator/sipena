'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/ui/status-badge'
import { CalendarCheck, Search, RefreshCw, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { toast } from 'sonner'

interface AttendanceRecord {
  _id: string
  userId: { name: string; position: string } | null
  date: string
  checkIn: string | null
  checkOut: string | null
  status: 'hadir' | 'terlambat' | 'alpha'
  latitude?: number | null
  longitude?: number | null
  documentUrl?: string
}

export default function AdminAbsensiPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const limit = 15

  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)
      const res = await fetch(`/api/attendance?${params}`)
      const data = await res.json()
      setRecords(data.data || [])
      setTotal(data.total || 0)
    } catch {
      toast.error('Gagal memuat data absensi')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, dateFrom, dateTo])

  useEffect(() => { fetchAttendance() }, [fetchAttendance])

  const totalPages = Math.ceil(total / limit)

  function formatTime(dateStr: string | null) {
    if (!dateStr) return '—'
    return format(new Date(dateStr), 'HH:mm')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Rekap Absensi</h2>
          <p className="text-sm text-muted-foreground">{total} record absensi</p>
        </div>
        <Button variant="outline" size="icon" onClick={fetchAttendance} aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={(v) => { if (v) { setStatusFilter(v); setPage(1) } }}>
          <SelectTrigger className="w-40" id="status-filter">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="hadir">Hadir</SelectItem>
            <SelectItem value="terlambat">Terlambat</SelectItem>
            <SelectItem value="alpha">Alpha</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
            className="w-40"
            id="date-from-filter"
          />
          <span className="text-sm text-muted-foreground">s/d</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
            className="w-40"
            id="date-to-filter"
          />
        </div>
        {(statusFilter !== 'all' || dateFrom || dateTo) && (
          <Button variant="ghost" size="sm" onClick={() => { setStatusFilter('all'); setDateFrom(''); setDateTo(''); setPage(1) }}>
            Reset Filter
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Karyawan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Jam Masuk</TableHead>
              <TableHead>Jam Pulang</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Dokumen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                  <CalendarCheck className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Tidak ada data absensi
                </TableCell>
              </TableRow>
            ) : (
              records.map((rec) => (
                <TableRow key={rec._id} className="hover:bg-muted/30">
                  <TableCell>
                    <p className="text-sm font-medium">{rec.userId?.name ?? 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{rec.userId?.position}</p>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(rec.date), 'dd MMM yyyy', { locale: localeId })}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{formatTime(rec.checkIn)}</TableCell>
                  <TableCell className="font-mono text-sm">{formatTime(rec.checkOut)}</TableCell>
                  <TableCell><StatusBadge status={rec.status} /></TableCell>
                  <TableCell>
                    {rec.latitude && rec.longitude ? (
                      <a
                        href={`https://www.openstreetmap.org/?mlat=${rec.latitude}&mlon=${rec.longitude}#map=17/${rec.latitude}/${rec.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                      >
                        <MapPin className="h-3 w-3" /> Lihat Map
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {rec.documentUrl ? (
                      <a
                        href={rec.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Lihat
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Menampilkan {(page - 1) * limit + 1}–{Math.min(page * limit, total)} dari {total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Sebelumnya</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Berikutnya</Button>
          </div>
        </div>
      )}
    </div>
  )
}
