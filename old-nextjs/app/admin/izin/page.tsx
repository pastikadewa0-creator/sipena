'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/ui/status-badge'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, XCircle, Eye, Loader2, RefreshCw, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { toast } from 'sonner'

interface LeaveRequest {
  _id: string
  userId: { name: string; position: string; email: string } | null
  type: 'izin' | 'sakit' | 'cuti' | 'tugas_luar'
  startDate: string
  endDate: string
  reason: string
  documentUrl: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy: { name: string } | null
  reviewedAt: string | null
  createdAt: string
}

const leaveTypeLabel: Record<string, string> = {
  izin: 'Izin',
  sakit: 'Sakit',
  cuti: 'Cuti',
  tugas_luar: 'Tugas Luar',
}

export default function AdminIzinPage() {
  const [activeTab, setActiveTab] = useState('pending')
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null)
  const [approving, setApproving] = useState(false)

  const fetchLeaves = useCallback(async (status: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50', ...(status !== 'all' ? { status } : {}) })
      const res = await fetch(`/api/leave?${params}`)
      const data = await res.json()
      setLeaves(data.data || [])
      setTotal(data.total || 0)
    } catch {
      toast.error('Gagal memuat data izin')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLeaves(activeTab) }, [activeTab, fetchLeaves])

  async function handleApproval(id: string, status: 'approved' | 'rejected') {
    setApproving(true)
    try {
      const res = await fetch(`/api/leave/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      toast.success(status === 'approved' ? 'Izin disetujui!' : 'Izin ditolak')
      setSelectedLeave(null)
      fetchLeaves(activeTab)
    } catch {
      toast.error('Gagal memproses izin')
    } finally {
      setApproving(false)
    }
  }

  function renderTable(items: LeaveRequest[]) {
    if (loading) {
      return Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 6 }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
          ))}
        </TableRow>
      ))
    }
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
            <FileText className="mx-auto mb-2 h-8 w-8 opacity-30" />
            Tidak ada pengajuan
          </TableCell>
        </TableRow>
      )
    }
    return items.map((leave) => (
      <TableRow key={leave._id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedLeave(leave)}>
        <TableCell>
          <p className="text-sm font-medium">{leave.userId?.name ?? 'Unknown'}</p>
          <p className="text-xs text-muted-foreground">{leave.userId?.position}</p>
        </TableCell>
        <TableCell><StatusBadge status={leave.type} /></TableCell>
        <TableCell className="text-sm">
          {format(new Date(leave.startDate), 'dd MMM yyyy', { locale: localeId })}
          {leave.startDate !== leave.endDate && (
            <> – {format(new Date(leave.endDate), 'dd MMM', { locale: localeId })}</>
          )}
        </TableCell>
        <TableCell className="hidden md:table-cell text-sm text-muted-foreground max-w-48 truncate">{leave.reason}</TableCell>
        <TableCell><StatusBadge status={leave.status} /></TableCell>
        <TableCell>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Lihat detail">
            <Eye className="h-4 w-4" />
          </Button>
        </TableCell>
      </TableRow>
    ))
  }

  const tableHeader = (
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead>Karyawan</TableHead>
        <TableHead>Jenis</TableHead>
        <TableHead>Tanggal</TableHead>
        <TableHead className="hidden md:table-cell">Alasan</TableHead>
        <TableHead>Status</TableHead>
        <TableHead />
      </TableRow>
    </TableHeader>
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pengajuan Izin</h2>
          <p className="text-sm text-muted-foreground">{total} pengajuan</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => fetchLeaves(activeTab)} aria-label="Refresh">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setLeaves([]) }}>
        <TabsList>
          <TabsTrigger value="pending" id="tab-pending">Menunggu</TabsTrigger>
          <TabsTrigger value="approved" id="tab-approved">Disetujui</TabsTrigger>
          <TabsTrigger value="rejected" id="tab-rejected">Ditolak</TabsTrigger>
        </TabsList>

        {['pending', 'approved', 'rejected'].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="rounded-xl border bg-card overflow-hidden">
              <Table>
                {tableHeader}
                <TableBody>{renderTable(leaves)}</TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLeave} onOpenChange={(open) => !open && setSelectedLeave(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedLeave && (
            <>
              <DialogHeader>
                <DialogTitle>Detail Pengajuan Izin</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Karyawan</p>
                    <p className="font-medium">{selectedLeave.userId?.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedLeave.userId?.position}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Jenis Izin</p>
                    <StatusBadge status={selectedLeave.type} />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Tanggal Mulai</p>
                    <p className="font-medium">
                      {format(new Date(selectedLeave.startDate), 'dd MMMM yyyy', { locale: localeId })}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Tanggal Selesai</p>
                    <p className="font-medium">
                      {format(new Date(selectedLeave.endDate), 'dd MMMM yyyy', { locale: localeId })}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Alasan</p>
                  <p className="text-sm bg-muted/50 rounded-lg p-3">{selectedLeave.reason}</p>
                </div>
                {selectedLeave.documentUrl && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-1">Dokumen Pendukung</p>
                    <a
                      href={selectedLeave.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5" /> Lihat Dokumen
                    </a>
                  </div>
                )}
                <Separator />
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">Status:</p>
                  <StatusBadge status={selectedLeave.status} />
                  {selectedLeave.reviewedBy && (
                    <p className="text-xs text-muted-foreground ml-auto">
                      oleh {selectedLeave.reviewedBy.name}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelectedLeave(null)}>Tutup</Button>
                {selectedLeave.status === 'pending' && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleApproval(selectedLeave._id, 'rejected')}
                      disabled={approving}
                      id="reject-btn"
                    >
                      {approving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                      Tolak
                    </Button>
                    <Button
                      onClick={() => handleApproval(selectedLeave._id, 'approved')}
                      disabled={approving}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      id="approve-btn"
                    >
                      {approving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Setujui
                    </Button>
                  </>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
