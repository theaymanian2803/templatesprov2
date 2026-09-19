import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { CheckCircle2, ExternalLink, Loader2, UploadCloud, X } from 'lucide-react'
import { useRef, useState } from 'react'

interface R2FileUploadProps {
  value: string
  onChange: (url: string) => void
}

const MAX_SIZE_MB = 300

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const guessContentType = (fileName: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase()
  const map: Record<string, string> = {
    zip: 'application/zip',
    rar: 'application/vnd.rar',
    '7z': 'application/x-7z-compressed',
    tar: 'application/x-tar',
    gz: 'application/gzip',
    pdf: 'application/pdf',
  }
  return map[ext || ''] || 'application/octet-stream'
}

export function R2FileUpload({ value, onChange }: R2FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<{ name: string; size: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({
        title: `Fichier trop volumineux`,
        description: `Maximum ${MAX_SIZE_MB} Mo.`,
        variant: 'destructive',
      })
      return
    }

    try {
      setIsUploading(true)
      setProgress({ name: file.name, size: file.size })

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`
      const contentType = file.type || guessContentType(file.name)

      const { data, error } = await supabase.functions.invoke('r2-upload-url', {
        body: { fileName, contentType, folder: 'sources' },
      })

      if (error) throw new Error(error.message)

      const { uploadUrl, publicUrl } = data

      if (uploadUrl.includes('pub-')) {
        throw new Error('Edge function returned the read-only link instead of the upload link.')
      }

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Cloudflare a rejeté l'envoi. Statut: ${uploadResponse.status}`)
      }

      onChange(publicUrl)
      toast({ title: 'Fichier source envoyé !', description: file.name })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Échec de l\'envoi du fichier',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      setProgress(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const fileNameFromUrl = value ? decodeURIComponent(value.split('/').pop() || value) : ''

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept=".zip,.rar,.7z,.tar,.gz,.pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {value ? (
        <div className="flex items-center justify-between gap-2 p-3 rounded-lg border border-green-200 bg-green-50">
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {fileNameFromUrl}
              </p>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> Vérifier le lien
              </a>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}>
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Remplacer'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onChange('')}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="w-full p-6 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-muted/10 transition-colors flex flex-col items-center justify-center cursor-pointer text-muted-foreground">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm font-medium">Envoi vers R2…</span>
              {progress && (
                <span className="text-xs text-muted-foreground">
                  {progress.name} ({formatBytes(progress.size)})
                </span>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <UploadCloud className="w-8 h-8 mb-1" />
              <span className="font-medium text-foreground">
                Cliquez pour télécharger le fichier source
              </span>
              <span className="text-xs">
                ZIP, RAR, 7Z, TAR, GZ, PDF — jusqu'à {MAX_SIZE_MB} Mo
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default R2FileUpload