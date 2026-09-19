import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Template } from '@/hooks/useTemplates'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { z } from 'zod'

// Import the new R2 Image Uploader
import { R2ImageUpload } from './R2ImageUpload'
import { R2FileUpload } from './R2FileUpload'

const templateSchema = z.object({
  title: z.string().min(1, 'Le titre est requis').max(100),
  description: z.string().max(500).nullable(),
  category: z.string().min(1, 'La catégorie est requise').max(50),
  price: z.number().min(0, 'Le prix doit être positif'),
  image_url: z.string().url('Doit être une URL valide'),
  demo_url: z.string().url('Doit être une URL valide').nullable().or(z.literal('')),
  featured: z.boolean(),
  source_file_url: z.string().url('Doit être une URL de téléchargement valide').or(z.literal('')),
})

interface TemplateFormProps {
  template?: Template | null
  onSubmit: (data: Partial<Template>) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export const TemplateForm = ({ template, onSubmit, onCancel, isLoading }: TemplateFormProps) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [featured, setFeatured] = useState(false)
  const [techStack, setTechStack] = useState<string[]>([])
  const [features, setFeatures] = useState<string[]>([])
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [newTech, setNewTech] = useState('')
  const [newFeature, setNewFeature] = useState('')
  const [newGalleryImage, setNewGalleryImage] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [youtubeId, setYoutubeId] = useState('')
  const [sourceFileUrl, setSourceFileUrl] = useState('')

  useEffect(() => {
    if (template) {
      setTitle(template.title)
      setDescription(template.description || '')
      setCategory(template.category)
      setPrice(template.price.toString())
      setImageUrl(template.image_url)
      setDemoUrl(template.demo_url || '')
      setFeatured(template.featured)
      setTechStack(template.tech_stack || [])
      setFeatures(template.features || [])
      setGalleryImages(template.gallery_images || [])
      setYoutubeId(template.youtube_id || '')

      // Fetch source_file_url from template_downloads
      supabase
        .from('template_downloads' as any)
        .select('source_file_url')
        .eq('template_id', template.id)
        .single()
        .then(({ data }) => {
          setSourceFileUrl((data as any)?.source_file_url || '')
        })
    }
  }, [template])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const formData = {
      title: title.trim(),
      description: description.trim() || null,
      category: category.trim(),
      price: parseFloat(price) || 0,
      image_url: imageUrl.trim(),
      demo_url: demoUrl.trim() || null,
      featured,
      source_file_url: sourceFileUrl.trim(),
    }

    const result = templateSchema.safeParse(formData)
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message
        }
      })
      setErrors(newErrors)
      return
    }

    await onSubmit({
      ...formData,
      tech_stack: techStack,
      features,
      gallery_images: galleryImages,
      source_file_url: sourceFileUrl.trim(),
      youtube_id: youtubeId.trim() || null,
    })
  }

  const addToArray = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    inputSetter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value.trim()) {
      setter((prev) => [...prev, value.trim()])
      inputSetter('')
    }
  }

  const removeFromArray = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Titre *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du modèle"
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie *</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="ex. Tableau de bord, E-Commerce"
            className={errors.category ? 'border-destructive' : ''}
          />
          {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="price">Prix ($) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="49"
            className={errors.price ? 'border-destructive' : ''}
          />
          {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
        </div>

        {/* --- REPLACED WITH R2 UPLOADER --- */}
        {/* Main Image Upload */}
        <div className="space-y-2 md:col-span-2">
          <Label>Image du modèle *</Label>
          <div className="max-w-md">
            <R2ImageUpload
              value={imageUrl}
              onChange={(newUrl) => {
                setImageUrl(newUrl)
                if (errors.image_url) {
                  setErrors((prev) => ({ ...prev, image_url: '' }))
                }
              }}
            />
          </div>
          {errors.image_url && <p className="text-sm text-destructive">{errors.image_url}</p>}
        </div>

        {/* Demo URL */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="demoUrl">URL de démonstration</Label>
          <Input
            id="demoUrl"
            value={demoUrl}
            onChange={(e) => setDemoUrl(e.target.value)}
            placeholder="https://demo.example.com"
          />
        </div>

        {/* YouTube ID */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="youtubeId">ID Vidéo YouTube</Label>
          <Input
            id="youtubeId"
            value={youtubeId}
            onChange={(e) => setYoutubeId(e.target.value)}
            placeholder="ex. dQw4w9WgXcQ"
          />
          <p className="text-xs text-muted-foreground">
            L'ID de l'URL YouTube (ex. youtube.com/watch?v=<strong>dQw4w9WgXcQ</strong>)
          </p>
        </div>

        {/* Source File Upload (R2) or manual URL */}
        <div className="space-y-2 md:col-span-2">
          <Label>Fichier source * (envoyé à l'acheteur après l'achat)</Label>
          <R2FileUpload value={sourceFileUrl} onChange={setSourceFileUrl} />
          {errors.source_file_url && (
            <p className="text-sm text-destructive">{errors.source_file_url}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Ou collez un lien externe manuellement (Google Drive, Mega, etc.) :
          </p>
          <Input
            id="sourceFileUrl"
            value={sourceFileUrl}
            onChange={(e) => setSourceFileUrl(e.target.value)}
            placeholder="https://drive.google.com/file/d/..."
            className={errors.source_file_url ? 'border-destructive' : ''}
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description du modèle..."
          rows={3}
        />
      </div>

      {/* Featured Toggle */}
      <div className="flex items-center gap-3">
        <Switch id="featured" checked={featured} onCheckedChange={setFeatured} />
        <Label htmlFor="featured">Modèle en vedette</Label>
      </div>

      {/* Tech Stack */}
      <div className="space-y-2">
        <Label>Technologies</Label>
        <div className="flex gap-2">
          <Input
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            placeholder="React, TypeScript..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addToArray(newTech, setTechStack, setNewTech)
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addToArray(newTech, setTechStack, setNewTech)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {techStack.map((tech, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
              {tech}
              <button
                type="button"
                onClick={() => removeFromArray(index, setTechStack)}
                className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2">
        <Label>Fonctionnalités</Label>
        <div className="flex gap-2">
          <Input
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Design responsive, Mode sombre..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addToArray(newFeature, setFeatures, setNewFeature)
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addToArray(newFeature, setFeatures, setNewFeature)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {features.map((feature, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent-foreground rounded-full text-sm">
              {feature}
              <button
                type="button"
                onClick={() => removeFromArray(index, setFeatures)}
                className="hover:text-destructive">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* --- ADDED R2 UPLOADER TO GALLERY --- */}
      <div className="space-y-4">
        <Label>Images de la galerie</Label>

        {/* R2 Direct Upload for Gallery */}
        <div className="max-w-md">
          <p className="text-xs text-muted-foreground mb-2">Téléchargez une image directement vers R2 :</p>
          <R2ImageUpload
            value={''}
            onChange={(url) => {
              if (url) {
                setGalleryImages((prev) => [...prev, url])
              }
            }}
          />
        </div>

        {/* Manual URL Input (Fallback) */}
        <div className="flex gap-2">
          <Input
            value={newGalleryImage}
            onChange={(e) => setNewGalleryImage(e.target.value)}
            placeholder="Ou collez une URL d'image..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addToArray(newGalleryImage, setGalleryImages, setNewGalleryImage)
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addToArray(newGalleryImage, setGalleryImages, setNewGalleryImage)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Display Current Gallery Images */}
        <div className="space-y-2 mt-4">
          {galleryImages.map((url, index) => (
            <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <img
                src={url}
                alt={`Gallery ${index + 1}`}
                className="w-12 h-12 object-cover rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder.svg'
                }}
              />
              <span className="flex-1 text-sm truncate">{url}</span>
              <button
                type="button"
                onClick={() => removeFromArray(index, setGalleryImages)}
                className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enregistrement...
            </>
          ) : template ? (
            'Mettre à jour le modèle'
          ) : (
            'Créer le modèle'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
