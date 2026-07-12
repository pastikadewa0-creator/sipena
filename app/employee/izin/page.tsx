'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/ui/status-badge'
import { FileUploadField } from '@/components/ui/file-upload-field'
import { Plus, FileText, Loader2, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface LeaveRequest {
  _id: string
  type: 'izin' | 'sakit' | 'cuti' | 'tugas_luar'
  startDate: string
  endDate: string
  reason: string
  documentUrl: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  reviewedBy?: { name: string } | null
  reviewedAt?: string | null
}

const leaveTypeLabel: Record<string, string> = {
  izin: 'Izin',
  sakit: 'Sakit',
  cuti: 'Cuti',
  tugas_luar: 'Tugas Luar',
}

interface FormState {
  type: string
  startDate: string
  endDate: string
  reason: string
  documentUrl: string
}

const emptyForm: FormState = {
  type: '',
  startDate: '',
  endDate: '',
  reason: '',
  documentUrl: '',
}

export default function EmployeeIzinPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const fetchLeaves = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/leave?limit=30')
      const data = await res.json()
      setLeaves(data.data || [])
      setTotal(data.total || 0)
    } catch {
      toast.error('Gagal memuat riwayat izin')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLeaves() }, [fetchLeaves])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.type) { toast.error('Pilih jenis izin'); return }
    if (!form.startDate || !form.endDate) { toast.error('Tanggal wajib diisi'); return }
    if (!form.reason.trim()) { toast.error('Alasan wajib diisi'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Pengajuan izin berhasil dikirim!')
      setDialogOpen(false)
      setForm(emptyForm)
      fetchLeaves()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengajukan izin')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pengajuan Izin</h2>
          <p className="text-sm text-muted-foreground">{total} pengajuan</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} id="ajukan-izin-btn">
          <Plus className="mr-2 h-4 w-4" />
          Ajukan Izin
        </Button>
      </div>

      {/* History table */}
      <div className="rounded-xl border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Jenis</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="hidden md:table-cell">Alasan</TableHead>
              <TableHead>Dokumen</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : leaves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                  <FileText className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Belum ada pengajuan izin
                </TableCell>
              </TableRow>
            ) : (
              leaves.map((leave) => (
                <TableRow 
                  key={leave._id} 
                  className="hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedLeave(leave)
                    setDetailDialogOpen(true)
                  }}
                >
                  <TableCell><StatusBadge status={leave.type} /></TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(leave.startDate), 'dd MMM yyyy', { locale: localeId })}
                    {leave.startDate !== leave.endDate && (
                      <> – {format(new Date(leave.endDate), 'dd MMM', { locale: localeId })}</>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-48 truncate">
                    {leave.reason}
                  </TableCell>
                  <TableCell>
                    {leave.documentUrl ? (
                      <a
                        href={leave.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Lihat
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={leave.status} /></TableCell>
                  <TableCell className="text-right">
                    <ChevronRight className="inline-block h-4 w-4 text-muted-foreground opacity-50" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Submit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajukan Izin / Cuti</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" id="leave-request-form">
            {/* Jenis izin */}
            <div className="space-y-1.5">
              <Label htmlFor="leave-type">Jenis Izin</Label>
              <Select value={form.type} onValueChange={(v) => { if (v) setForm({ ...form, type: v }) }}>
                <SelectTrigger id="leave-type">
                  <SelectValue placeholder="Pilih jenis izin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="izin">Izin</SelectItem>
                  <SelectItem value="sakit">Sakit</SelectItem>
                  <SelectItem value="cuti">Cuti</SelectItem>
                  <SelectItem value="tugas_luar">Tugas Luar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tanggal */}
            <div className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="leave-start">Tanggal Mulai</Label>
                <Input
                  id="leave-start"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="leave-end">Tanggal Selesai</Label>
                <Input
                  id="leave-end"
                  type="date"
                  value={form.endDate}
                  min={form.startDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Alasan */}
            <div className="space-y-1.5">
              <Label htmlFor="leave-reason">Alasan</Label>
              <Textarea
                id="leave-reason"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="Jelaskan alasan pengajuan izin Anda..."
                rows={3}
                required
              />
            </div>

            {/* Upload surat */}
            <FileUploadField
              label="Surat Pendukung"
              onUpload={(url) => setForm({ ...form, documentUrl: url })}
              disabled={submitting}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); setForm(emptyForm) }}>
                Batal
              </Button>
              <Button type="submit" disabled={submitting} id="submit-leave-btn">
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Mengirim...</>
                ) : (
                  'Kirim Pengajuan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Pengajuan {selectedLeave?.type ? leaveTypeLabel[selectedLeave.type] : ''}</DialogTitle>
          </DialogHeader>
          
          {selectedLeave && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <StatusBadge status={selectedLeave.status} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">Tanggal Mulai</span>
                  <span className="text-sm font-medium">
                    {format(new Date(selectedLeave.startDate), 'dd MMM yyyy', { locale: localeId })}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-muted-foreground block">Tanggal Selesai</span>
                  <span className="text-sm font-medium">
                    {format(new Date(selectedLeave.endDate), 'dd MMM yyyy', { locale: localeId })}
                  </span>
                </div>
              </div>

              <div className="space-y-1 border-t pt-4">
                <span className="text-xs text-muted-foreground block">Alasan</span>
                <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-lg border">{selectedLeave.reason}</p>
              </div>

              {selectedLeave.documentUrl && (
                <div className="space-y-1 border-t pt-4">
                  <span className="text-xs text-muted-foreground block">Dokumen Lampiran</span>
                  <a
                    href={selectedLeave.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center mt-1"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Lihat Dokumen
                  </a>
                </div>
              )}

              {selectedLeave.status !== 'pending' && (
                <div className="space-y-1 border-t pt-4">
                  <span className="text-xs text-muted-foreground block">Ditinjau Oleh</span>
                  <p className="text-sm font-medium">{selectedLeave.reviewedBy?.name || 'Admin'}</p>
                  {selectedLeave.reviewedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Pada {format(new Date(selectedLeave.reviewedAt), 'dd MMM yyyy HH:mm', { locale: localeId })}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
