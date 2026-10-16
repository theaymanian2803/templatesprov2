import { useMemo, useState } from 'react'
import {
  useAddLandingSection,
  useDeleteLandingSection,
  useLandingSections,
  useReorderLandingSections,
  useUpdateLandingSection,
  type LandingSection,
} from '@/hooks/useLandingSections'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { R2ImageUpload } from '@/components/admin/R2ImageUpload'
import { ArrowDown, ArrowUp, Eye, EyeOff, LayoutDashboard, Loader2, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import {
  ADDABLE_SECTION_TYPES,
  LANDING_SECTION_KEYS,
  landingSectionLabel,
  sectionTypeLabel,
  type LandingLogo,
} from '@/lib/landingSections'

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
]
const TRANSFORM_OPTIONS = [
  { value: 'none', label: 'Normal' },
  { value: 'capitalize', label: 'Capitalize' },
  { value: 'uppercase', label: 'UPPERCASE' },
]

const isBuiltIn = (sectionKey: string) => LANDING_SECTION_KEYS.includes(sectionKey)

const BackgroundColorField = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const hex = value || '#111111'
  const valid = /^#[0-9a-fA-F]{6}$/.test(hex)
  return (
    <div>
      <Label className="text-xs">Background Color</Label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          type="color"
          value={valid ? hex : '#111111'}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-border"
          aria-label="Pick a background color"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#111111"
          className="h-8 text-sm font-mono"
        />
      </div>
    </div>
  )
}

export const LandingPageAdmin = () => {
  const { data: sections = [], isLoading } = useLandingSections()
  const updateMutation = useUpdateLandingSection()
  const reorderMutation = useReorderLandingSections()
  const addMutation = useAddLandingSection()
  const deleteMutation = useDeleteLandingSection()
  const { toast } = useToast()

  const ordered = useMemo(
    () => [...sections].sort((a, b) => a.sort_order - b.sort_order),
    [sections],
  )

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<LandingSection>>({})
  const [deleteSection, setDeleteSection] = useState<LandingSection | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newSection, setNewSection] = useState<{ type: string; title: string; subtitle: string; image_url: string; config: Record<string, any> }>({
    type: 'custom_banner',
    title: '',
    subtitle: '',
    image_url: '',
    config: {},
  })

  const notifyError = (title: string) => (error: Error) =>
    toast({ title, description: error.message, variant: 'destructive' })

  const handleToggle = (section: LandingSection) => {
    updateMutation.mutate(
      { id: section.id, updates: { visible: !section.visible } },
      { onSuccess: () => toast({ title: `${section.title || landingSectionLabel(section.section_key)} ${section.visible ? 'hidden' : 'shown'}` }), onError: notifyError('Could not update section') },
    )
  }

  const handleMove = async (section: LandingSection, direction: 'up' | 'down') => {
    const index = ordered.findIndex((s) => s.id === section.id)
    const target = direction === 'up' ? index - 1 : index + 1
    if (index < 0 || target < 0 || target >= ordered.length) return
    const next = [...ordered]
    ;[next[index], next[target]] = [next[target], next[index]]
    try {
      await reorderMutation.mutateAsync({ ids: next.map((s) => s.id) })
    } catch (error: unknown) {
      toast({ title: 'Could not update the order', description: error instanceof Error ? error.message : 'Please retry', variant: 'destructive' })
    }
  }

  const startEdit = (section: LandingSection) => {
    setEditingId(section.id)
    setEditForm({
      title: section.title,
      subtitle: section.subtitle,
      image_url: section.image_url,
      config: { ...(section.config ?? {}) },
    })
  }

  const setConfig = (field: string, value: unknown) =>
    setEditForm((p) => ({ ...p, config: { ...(p.config ?? {}), [field]: value } }))

  const setLogos = (logos: LandingLogo[]) => setConfig('logos', logos)

  const saveEdit = () => {
    if (!editingId) return
    updateMutation.mutate(
      { id: editingId, updates: { title: editForm.title, subtitle: editForm.subtitle, image_url: editForm.image_url, config: editForm.config } },
      {
        onSuccess: () => {
          toast({ title: 'Section updated' })
          setEditingId(null)
        },
        onError: notifyError('Could not save section'),
      },
    )
  }

  const handleAdd = () => {
    if (!newSection.title.trim()) return
    addMutation.mutate(
      { type: newSection.type, title: newSection.title.trim(), subtitle: newSection.subtitle, image_url: newSection.image_url, config: { ...newSection.config, type: newSection.type } },
      {
        onSuccess: () => {
          toast({ title: 'Section added' })
          setAddOpen(false)
          setNewSection({ type: 'custom_banner', title: '', subtitle: '', image_url: '', config: {} })
        },
        onError: notifyError('Could not add section'),
      },
    )
  }

  const confirmDelete = () => {
    if (!deleteSection) return
    deleteMutation.mutate(deleteSection.id, {
      onSuccess: () => {
        toast({ title: 'Section deleted' })
        setDeleteSection(null)
      },
      onError: notifyError('Could not delete section'),
    })
  }

  const editLogos = (Array.isArray(editForm.config?.logos) ? editForm.config!.logos : []) as LandingLogo[]
  const editType = String((editForm.config?.type as string) ?? '')
  const newLogos = (Array.isArray(newSection.config.logos) ? newSection.config.logos : []) as LandingLogo[]

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" /> Landing Page Sections
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Reorder, show/hide, edit the hero, and add custom banners or a logos strip.
          </p>
        </div>

        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1 shrink-0">
              <Plus className="w-4 h-4" /> Add section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add section</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Type</Label>
                <Select value={newSection.type} onValueChange={(v) => setNewSection((p) => ({ ...p, type: v, config: {} }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ADDABLE_SECTION_TYPES.map((t) => (
                      <SelectItem key={t.type} value={t.type}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input value={newSection.title} onChange={(e) => setNewSection((p) => ({ ...p, title: e.target.value }))} placeholder="Section title" />
              </div>

              {newSection.type === 'custom_banner' && (
                <>
                  <div>
                    <Label>Subtitle</Label>
                    <Input value={newSection.subtitle} onChange={(e) => setNewSection((p) => ({ ...p, subtitle: e.target.value }))} placeholder="Optional description" />
                  </div>
                  <R2ImageUpload value={newSection.image_url} onChange={(url) => setNewSection((p) => ({ ...p, image_url: url }))} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>CTA text</Label>
                      <Input value={newSection.config.cta_text ?? ''} onChange={(e) => setNewSection((p) => ({ ...p, config: { ...p.config, cta_text: e.target.value } }))} placeholder="Explore" />
                    </div>
                    <div>
                      <Label>CTA link</Label>
                      <Input value={newSection.config.cta_link ?? ''} onChange={(e) => setNewSection((p) => ({ ...p, config: { ...p.config, cta_link: e.target.value } }))} placeholder="/templates" />
                    </div>
                  </div>
                </>
              )}

              {newSection.type === 'logos' && (
                <div className="space-y-3">
                  {newLogos.map((logo, i) => (
                    <div key={i} className="rounded-lg border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold uppercase">Logo {i + 1}</Label>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setNewSection((p) => ({ ...p, config: { ...p.config, logos: newLogos.filter((_, j) => j !== i) } }))}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <R2ImageUpload value={logo.image} onChange={(url) => setNewSection((p) => ({ ...p, config: { ...p.config, logos: newLogos.map((l, j) => (j === i ? { ...l, image: url } : l)) } }))} />
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={logo.alt ?? ''} onChange={(e) => setNewSection((p) => ({ ...p, config: { ...p.config, logos: newLogos.map((l, j) => (j === i ? { ...l, alt: e.target.value } : l)) } }))} placeholder="Alt text" className="h-8 text-sm" />
                        <Input value={logo.link ?? ''} onChange={(e) => setNewSection((p) => ({ ...p, config: { ...p.config, logos: newLogos.map((l, j) => (j === i ? { ...l, link: e.target.value } : l)) } }))} placeholder="https://..." className="h-8 text-sm" />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setNewSection((p) => ({ ...p, config: { ...p.config, logos: [...newLogos, { image: '', alt: '', link: '' }] } }))}>
                    <Plus className="w-3.5 h-3.5" /> Add logo
                  </Button>
                </div>
              )}

              <Button className="w-full" onClick={handleAdd} disabled={addMutation.isPending || !newSection.title.trim()}>
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add section'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {ordered.map((section, idx) => {
          const editing = editingId === section.id
          const builtIn = isBuiltIn(section.section_key)
          const type = String(section.config?.type ?? '')
          const typeBadge = builtIn ? 'Built-in' : sectionTypeLabel(type)
          const isHero = section.section_key === 'hero'

          return (
            <Card key={section.id} className={`transition-all ${!section.visible ? 'opacity-50 border-dashed' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMove(section, 'up')} disabled={idx === 0} aria-label="Move up">
                      <ArrowUp className="h-3.5 w-3.5" />
                    </Button>
                    <span className="text-xs text-muted-foreground font-mono">{idx + 1}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMove(section, 'down')} disabled={idx === ordered.length - 1} aria-label="Move down">
                      <ArrowDown className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground truncate">
                        {section.title || landingSectionLabel(section.section_key)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider bg-secondary px-2 py-0.5 rounded-full shrink-0">
                        {typeBadge}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate">{section.section_key}</div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <div className="flex items-center gap-2 mr-2">
                      <Switch checked={section.visible} onCheckedChange={() => handleToggle(section)} aria-label={section.visible ? 'Hide section' : 'Show section'} />
                      {section.visible ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    {!editing && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(section)} aria-label="Edit section">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {!builtIn && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteSection(section)} aria-label="Delete section">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="mt-4 space-y-3 border-t pt-4">
                    {isHero ? (
                      <>
                        <div>
                          <Label className="text-xs">Badge</Label>
                          <Input value={editForm.config?.badge ?? ''} onChange={(e) => setConfig('badge', e.target.value)} placeholder="e.g. Website templates · iOS & Android" className="h-8 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Title line 1</Label>
                            <Input value={editForm.config?.title1 ?? ''} onChange={(e) => setConfig('title1', e.target.value)} className="h-8 text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Title line 2</Label>
                            <Input value={editForm.config?.title2 ?? ''} onChange={(e) => setConfig('title2', e.target.value)} className="h-8 text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Subtitle line 1</Label>
                            <Input value={editForm.config?.subtitle1 ?? ''} onChange={(e) => setConfig('subtitle1', e.target.value)} className="h-8 text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Subtitle line 2</Label>
                            <Input value={editForm.config?.subtitle2 ?? ''} onChange={(e) => setConfig('subtitle2', e.target.value)} className="h-8 text-sm" />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">Leave any field blank to keep the translated default.</p>
                        <div>
                          <Label className="text-xs">Website mockup image</Label>
                          <R2ImageUpload value={editForm.config?.web_image ?? ''} onChange={(url) => setConfig('web_image', url)} />
                        </div>
                        <div>
                          <Label className="text-xs">Phone mockup image</Label>
                          <R2ImageUpload value={editForm.config?.phone_image ?? ''} onChange={(url) => setConfig('phone_image', url)} />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Title</Label>
                            <Input value={editForm.title ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} className="h-8 text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">Subtitle</Label>
                            <Input value={editForm.subtitle ?? ''} onChange={(e) => setEditForm((p) => ({ ...p, subtitle: e.target.value }))} className="h-8 text-sm" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">Title alignment</Label>
                            <Select value={editForm.config?.title_align ?? 'left'} onValueChange={(v) => setConfig('title_align', v)}>
                              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>{ALIGN_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Title case</Label>
                            <Select value={editForm.config?.title_transform ?? 'none'} onValueChange={(v) => setConfig('title_transform', v)}>
                              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                              <SelectContent>{TRANSFORM_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                      </>
                    )}

                    {editType === 'custom_banner' && (
                      <>
                        <BackgroundColorField value={editForm.config?.background_color ?? ''} onChange={(v) => setConfig('background_color', v)} />
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-xs">CTA text</Label>
                            <Input value={editForm.config?.cta_text ?? ''} onChange={(e) => setConfig('cta_text', e.target.value)} className="h-8 text-sm" />
                          </div>
                          <div>
                            <Label className="text-xs">CTA link</Label>
                            <Input value={editForm.config?.cta_link ?? ''} onChange={(e) => setConfig('cta_link', e.target.value)} className="h-8 text-sm" />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Background image</Label>
                          <R2ImageUpload value={editForm.image_url ?? ''} onChange={(url) => setEditForm((p) => ({ ...p, image_url: url }))} />
                        </div>
                      </>
                    )}

                    {editType === 'logos' && (
                      <div className="space-y-3">
                        {editLogos.map((logo, i) => (
                          <div key={i} className="rounded-lg border p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-bold uppercase">Logo {i + 1}</Label>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setLogos(editLogos.filter((_, j) => j !== i))}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                            <R2ImageUpload value={logo.image} onChange={(url) => setLogos(editLogos.map((l, j) => (j === i ? { ...l, image: url } : l)))} />
                            <div className="grid grid-cols-2 gap-2">
                              <Input value={logo.alt ?? ''} onChange={(e) => setLogos(editLogos.map((l, j) => (j === i ? { ...l, alt: e.target.value } : l)))} placeholder="Alt text" className="h-8 text-sm" />
                              <Input value={logo.link ?? ''} onChange={(e) => setLogos(editLogos.map((l, j) => (j === i ? { ...l, link: e.target.value } : l)))} placeholder="https://..." className="h-8 text-sm" />
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => setLogos([...editLogos, { image: '', alt: '', link: '' }])}>
                          <Plus className="w-3.5 h-3.5" /> Add logo
                        </Button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending} className="gap-1">
                        {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {ordered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No landing sections found.</div>
      )}

      <AlertDialog open={!!deleteSection} onOpenChange={() => setDeleteSection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete section</AlertDialogTitle>
            <AlertDialogDescription>
              Delete &ldquo;{deleteSection?.title}&rdquo; from the landing page? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default LandingPageAdmin
