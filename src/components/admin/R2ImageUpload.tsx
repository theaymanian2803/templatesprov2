import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, UploadCloud, X } from 'lucide-react'
import { useRef, useState } from 'react'

interface R2ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function R2ImageUpload({ value, onChange }: R2ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}-${Date.now()}.${fileExt}`

      console.log('1. Asking Supabase for upload ticket...')

      const { data, error } = await supabase.functions.invoke('r2-upload-url', {
        body: { fileName, contentType: file.type },
      })

      if (error) throw new Error(error.message)

      const { uploadUrl, publicUrl } = data

      console.log('2. UPLOAD URL (Should be ugly and long):', uploadUrl)
      console.log('3. PUBLIC URL (Should be pub-):', publicUrl)

      // FAIL-SAFE: If the uploadUrl is pub-, something is deeply wrong in the backend
      if (uploadUrl.includes('pub-')) {
        throw new Error(
          'FATAL: Edge Function returned the read-only link instead of the upload link!'
        )
      }

      console.log('4. Starting actual file upload...')

      // THIS is the crucial fetch. It MUST use uploadUrl.
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Cloudflare rejected upload. Status: ${uploadResponse.status}`)
      }

      console.log('5. Upload success! Setting public URL...')
      onChange(publicUrl)
      toast({ title: 'Image téléchargée avec succès !' })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Échec du téléchargement',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {value ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-border/50 group">
          <img src={value} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}>
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Remplacer'}
            </Button>
            <Button type="button" variant="destructive" size="sm" onClick={() => onChange('')}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className="w-full h-48 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-muted/10 transition-colors flex flex-col items-center justify-center cursor-pointer text-muted-foreground">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-sm">Téléchargement vers R2...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <UploadCloud className="w-8 h-8 mb-2" />
              <span className="font-medium text-foreground">Cliquez pour télécharger une image</span>
              <span className="text-xs">PNG, JPG, WebP jusqu'à 5 Mo</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
