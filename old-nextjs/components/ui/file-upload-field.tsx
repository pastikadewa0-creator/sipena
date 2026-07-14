'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Paperclip, X, Upload, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface FileUploadFieldProps {
  label?: string
  onUpload: (url: string) => void
  accept?: string
  className?: string
  disabled?: boolean
}

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_SIZE_MB = 5

export function FileUploadField({
  label = 'Upload Dokumen',
  onUpload,
  accept = '.pdf,.jpg,.jpeg,.png',
  className,
  disabled = false,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Tipe file tidak didukung. Gunakan PDF, JPEG, atau PNG.')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Ukuran file maksimal ${MAX_SIZE_MB}MB.`)
      return
    }

    setUploading(true)
    setFileName(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Gagal mengupload file')
      }

      const { url } = await res.json()
      onUpload(url)
      toast.success('File berhasil diupload!')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengupload file'
      toast.error(msg)
      setFileName(null)
      if (inputRef.current) inputRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }

  function handleClear() {
    setFileName(null)
    onUpload('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label>
          {label} <span className="text-muted-foreground">(opsional)</span>
        </Label>
      )}
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-3 transition-colors',
          !disabled && 'hover:border-primary/50 hover:bg-primary/5',
          disabled && 'opacity-60 cursor-not-allowed'
        )}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : fileName ? (
          <Paperclip className="h-4 w-4 shrink-0 text-primary" />
        ) : (
          <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}

        <div className="flex-1 min-w-0">
          {fileName ? (
            <p className="truncate text-sm text-foreground">{fileName}</p>
          ) : uploading ? (
            <p className="text-sm text-muted-foreground">Mengupload...</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Pilih file PDF, JPEG, atau PNG (maks. 5MB)
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {fileName && !uploading && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={handleClear}
              disabled={disabled}
              aria-label="Hapus file"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {!uploading && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => inputRef.current?.click()}
              disabled={disabled || uploading}
            >
              {fileName ? 'Ganti' : 'Pilih'}
            </Button>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
        aria-label={label}
      />
    </div>
  )
}
