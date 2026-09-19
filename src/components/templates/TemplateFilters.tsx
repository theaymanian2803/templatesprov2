import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCategories } from '@/hooks/useTemplates'
import { X } from 'lucide-react'

interface TemplateFiltersProps {
  selectedCategory: string | null
  onCategoryChange: (category: string | null) => void
}

const TemplateFilters = ({ selectedCategory, onCategoryChange }: TemplateFiltersProps) => {
  const { data: categories, isLoading } = useCategories()

  return (
    <aside className="w-full lg:sticky lg:top-24">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          {/* Matches the Card Title typography */}
          <h3 className="font-semibold text-foreground text-sm tracking-tight leading-tight">
            Catégories
          </h3>
          {selectedCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCategoryChange(null)}
              // Matches the Card Category typography
              className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-transparent">
              <X className="w-3 h-3 mr-1" />
              Effacer
            </Button>
          )}
        </div>

        {/* Category Filter Card */}
        <div className="bg-card/40 border border-border/40 p-2.5 rounded-[1.25rem] shadow-sm">
          {isLoading ? (
            <div className="space-y-2 pt-1 px-1">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => onCategoryChange(null)}
                className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 ${
                  !selectedCategory
                    ? 'font-semibold text-foreground text-sm tracking-tight bg-muted/60 shadow-sm' // Matches the Card Price Tag look
                    : 'text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}>
                Tous les templates
              </button>
              {categories?.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 capitalize ${
                    selectedCategory === category
                      ? 'font-semibold text-foreground text-sm tracking-tight bg-muted/60 shadow-sm' // Matches the Card Price Tag look
                      : 'text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}>
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default TemplateFilters
