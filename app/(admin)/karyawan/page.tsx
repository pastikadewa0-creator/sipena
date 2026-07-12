'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Search, UserX, UserCheck, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface Employee {
  _id: string
  username: string
  name: string
  email: string
  position: string
  isActive: boolean
  createdAt: string
}

interface FormState {
  username: string
  password: string
  name: string
  email: string
  position: string
}

const emptyForm: FormState = { username: '', password: '', name: '', email: '', position: '' }

export default function KaryawanPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)

  const fetchEmployees = useCallback(async (q = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: '50', ...(q && { search: q }) })
      const res = await fetch(`/api/users?${params}`)
      const data = await res.json()
      setEmployees(data.data || [])
      setTotal(data.total || 0)
    } catch {
      toast.error('Gagal memuat data karyawan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  useEffect(() => {
    const timer = setTimeout(() => fetchEmployees(search), 400)
    return () => clearTimeout(timer)
  }, [search, fetchEmployees])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, role: 'karyawan' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Karyawan berhasil ditambahkan!')
      setDialogOpen(false)
      setForm(emptyForm)
      fetchEmployees(search)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menambahkan karyawan')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActive(emp: Employee) {
    const action = emp.isActive ? 'nonaktifkan' : 'aktifkan'
    try {
      const res = await fetch(`/api/users/${emp._id}`, {
        method: emp.isActive ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: !emp.isActive ? JSON.stringify({ isActive: true }) : undefined,
      })
      if (!res.ok) throw new Error()
      toast.success(`Karyawan berhasil di${action}kan`)
      fetchEmployees(search)
    } catch {
      toast.error(`Gagal ${action}kan karyawan`)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Data Karyawan</h2>
          <p className="text-sm text-muted-foreground">{total} karyawan aktif</p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="search-karyawan"
              placeholder="Cari nama atau username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => fetchEmployees(search)}
            aria-label="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button onClick={() => setDialogOpen(true)} id="add-karyawan-btn">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Karyawan
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Nama</TableHead>
              <TableHead>Username</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden sm:table-cell">Jabatan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Bergabung</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Tidak ada karyawan ditemukan
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp._id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                        {emp.name.charAt(0)}
                      </div>
                      <span className="font-medium text-sm">{emp.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {emp.username}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {emp.email}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm">
                    {emp.position || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        emp.isActive
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }
                    >
                      {emp.isActive ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {format(new Date(emp.createdAt), 'dd MMM yyyy', { locale: localeId })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(emp)}
                      className={
                        emp.isActive
                          ? 'text-destructive hover:text-destructive hover:bg-destructive/10'
                          : 'text-emerald-600 hover:text-emerald-600 hover:bg-emerald-50'
                      }
                    >
                      {emp.isActive ? (
                        <><UserX className="mr-1.5 h-3.5 w-3.5" />Nonaktifkan</>
                      ) : (
                        <><UserCheck className="mr-1.5 h-3.5 w-3.5" />Aktifkan</>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Karyawan Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" id="add-employee-form">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="emp-username">Username</Label>
                <Input id="emp-username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="budi123" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="emp-password">Password</Label>
                <Input id="emp-password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="min. 6 karakter" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-name">Nama Lengkap</Label>
              <Input id="emp-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Budi Santoso" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-email">Email</Label>
              <Input id="emp-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="budi@perusahaan.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emp-position">Jabatan</Label>
              <Input id="emp-position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="Staff IT" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={submitting} id="submit-add-employee">
                {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</> : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
