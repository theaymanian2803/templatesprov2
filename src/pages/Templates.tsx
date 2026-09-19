import ShopFilters, { ShopFilterState, defaultFilters } from '@/components/shop/ShopFilters'
import ShopProductCard from '@/components/shop/ShopProductCard'
import ShopPromoBanner from '@/components/shop/ShopPromoBanner'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Template, useTemplates } from '@/hooks/useTemplates'
import { getDisplayRating, getDisplaySales } from '@/lib/seeded'
import { Filter, LayoutGrid, List, Search, SlidersHorizontal, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const ITEMS_PER_PAGE = 10

type SortOption = 'best_match' | 'best_sellers' | 'newest' | 'best_rated' | 'trending' | 'price'
type ViewMode = 'list' | 'grid'

const Templates = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCategory = searchParams.get('category')
  const initialQuery = searchParams.get('q') ?? ''

  const [filters, setFilters] = useState<ShopFilterState>(() => ({
    ...defaultFilters,
    category: initialCategory,
  }))
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [sortBy, setSortBy] = useState<SortOption>('best_match')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const { data: allTemplates, isLoading } = useTemplates({ limit: 200 })

  useEffect(() => {
    setPage(1)
  }, [filters, searchQuery, sortBy])

  const filteredTemplates = useMemo(() => {
    if (!allTemplates) return []
    let list = allTemplates as Template[]

    // Category filter
    if (filters.category) {
      list = list.filter((t) => t.category === filters.category)
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tech_stack?.some((s) => s.toLowerCase().includes(q)),
      )
    }

    // Price range filter
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice)
      if (!isNaN(min)) list = list.filter((t) => Number(t.price) >= min)
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice)
      if (!isNaN(max)) list = list.filter((t) => Number(t.price) <= max)
    }

    // On Sale filter - templates with extended_price or price below original were on sale
    if (filters.onSale) {
      list = list.filter(
        (t) => t.extended_price !== null && Number(t.extended_price) > Number(t.price),
      )
    }

    // Rating filter (use display rating = placeholder fallback + real)
    if (filters.rating !== null) {
      list = list.filter((t) => getDisplayRating(t.id, t.rating) >= filters.rating!)
    }

    // Sales filter (use display sales = placeholder + real)
    if (filters.sales.length > 0) {
      list = list.filter((t) => {
        const s = getDisplaySales(t.id, t.sales)
        return filters.sales.some((bucket) => {
          if (bucket === 'none') return s === 0
          if (bucket === 'low') return s > 0 && s < 50
          if (bucket === 'medium') return s >= 50 && s < 250
          if (bucket === 'high') return s >= 250 && s < 1000
          if (bucket === 'top') return s >= 1000
          return false
        })
      })
    }

    // Sort
    switch (sortBy) {
      case 'best_sellers':
        list = [...list].sort((a, b) => getDisplaySales(b.id, b.sales) - getDisplaySales(a.id, a.sales))
        break
      case 'newest':
        list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'best_rated':
        list = [...list].sort((a, b) => getDisplayRating(b.id, b.rating) - getDisplayRating(a.id, a.rating))
        break
      case 'price':
        list = [...list].sort((a, b) => Number(a.price) - Number(b.price))
        break
      case 'trending':
        list = [...list].sort((a, b) => getDisplaySales(b.id, b.sales) * getDisplayRating(b.id, b.rating) - getDisplaySales(a.id, a.sales) * getDisplayRating(a.id, a.rating))
        break
    }

    return list
  }, [allTemplates, filters, searchQuery, sortBy])

  const totalCount = filteredTemplates.length
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const pagedTemplates = filteredTemplates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const categoryCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = { __all: allTemplates?.length ?? 0 }
    if (!allTemplates) return counts
    allTemplates.forEach((t) => {
      const c = t.category || 'Uncategorized'
      counts[c] = (counts[c] ?? 0) + 1
    })
    return counts
  }, [allTemplates])

  // Sync URL when filters/search change
  useEffect(() => {
    const params: Record<string, string> = {}
    if (filters.category) params.category = filters.category
    if (searchQuery.trim()) params.q = searchQuery.trim()
    if (currentPage > 1) params.page = currentPage.toString()
    setSearchParams(params, { replace: true })
  }, [filters.category, searchQuery, currentPage, setSearchParams])

  const clearAll = () => {
    setFilters({ ...defaultFilters, category: null })
    setSearchQuery('')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const handlePageChange = (p: number) => {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }

  const breadcrumbText = useMemo(() => {
    const parts = []
    if (searchQuery.trim()) parts.push(t('templatesPage.termWithQuery', { query: searchQuery.trim() }))
    if (filters.category) parts.push(filters.category)
    return parts.length > 0 ? parts.join(' / ') : t('templatesPage.allCategories')
  }, [searchQuery, filters.category, t])

  const hasActiveFilters = filters.category || searchQuery.trim() || filters.minPrice || filters.maxPrice || filters.onSale || filters.sales.length > 0 || filters.rating !== null

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-5 pb-20">
        <div className="container mx-auto max-w-[1400px]">
          {/* Full-width search bar */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('templatesPage.searchPlaceholder')}
                className="flex-1 h-12 px-4 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="h-12 px-8 bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors flex items-center gap-2">
                <Search className="w-4 h-4" />
                {t('templatesPage.search')}
              </button>
            </form>
          </div>

          {/* Breadcrumb subtitle */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">{t('templatesPage.websitesAndTemplates', { breadcrumb: breadcrumbText })}</p>
          </div>

          {/* Filter & Refine header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-gray-200 mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                {t('templatesPage.filterRefine')}
                {hasActiveFilters && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                    !
                  </span>
                )}
              </button>
              <span className="hidden lg:flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Filter className="w-4 h-4" />
                {t('templatesPage.filterRefine')}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 hidden md:block">{t('templatesPage.priceDisclaimer')}</span>
              {/* View toggle */}
              <div className="flex items-center gap-1 border border-gray-300 rounded overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
              {/* Sort buttons */}
              <div className="flex items-center gap-1 border border-gray-300 rounded overflow-hidden">
                {(['best_match', 'best_sellers', 'newest', 'best_rated', 'trending', 'price'] as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setSortBy(opt)}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      sortBy === opt ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}>
                    {opt === 'best_match' ? t('templatesPage.sortBestMatch') : opt === 'best_sellers' ? t('templatesPage.sortBestSellers') : opt === 'newest' ? t('templatesPage.sortNewest') : opt === 'best_rated' ? t('templatesPage.sortBestRated') : opt === 'trending' ? t('templatesPage.sortTrending') : t('templatesPage.sortPrice')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div className="flex gap-8">
            {/* Left sidebar */}
            <div className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <ShopFilters
                  filters={filters}
                  onChange={setFilters}
                  totalCounts={categoryCounts}
                />
                {hasActiveFilters && (
                  <button
                    onClick={clearAll}
                    className="mt-4 w-full py-2 text-sm font-medium text-orange-500 border border-orange-300 rounded hover:bg-orange-50 transition-colors">
                    {t('templatesPage.clearAllFilters')}
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {/* Results count with breadcrumb links */}
              <div className="mb-4 text-sm text-gray-600">
                <span className="font-bold text-gray-900">{totalCount}</span>{' '}
                {t('templatesPage.itemsIn', { count: totalCount })}{' '}
                <button
                  onClick={() => setFilters({ ...filters, category: null })}
                  className="text-orange-500 hover:underline">
                  {t('templatesPage.allCategories')}
                </button>
                {filters.category && <> / <span className="text-gray-900">{filters.category}</span></>}
                {searchQuery && <> <span className="text-gray-500">{t('templatesPage.termWithQuery', { query: searchQuery })}</span></>}
                {hasActiveFilters && (
                  <button onClick={clearAll} className="ml-2 text-orange-500 hover:underline">
                    {t('templatesPage.clearAll')}
                  </button>
                )}
              </div>

              {isLoading ? (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex bg-white border border-gray-200 rounded-lg p-4 gap-4">
                      <Skeleton className="w-[280px] aspect-[16/10] rounded" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-3/5" />
                      </div>
                      <div className="w-[200px] space-y-3">
                        <Skeleton className="h-6 w-16 ml-auto" />
                        <Skeleton className="h-4 w-20 ml-auto" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : pagedTemplates.length > 0 ? (
                viewMode === 'list' ? (
                  <div className="flex flex-col gap-4">
                    {pagedTemplates.map((template, index) => (
                      <div key={template.id} className="flex flex-col gap-4">
                        {index === 1 && <ShopPromoBanner />}
                        <ShopProductCard template={template} query={searchQuery} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {pagedTemplates.map((template, index) => (
                      <div key={template.id} className="contents">
                        {index === 1 && <div className="sm:col-span-2 lg:col-span-3"><ShopPromoBanner /></div>}
                        <ShopProductCard template={template} query={searchQuery} cardView />
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                  <LayoutGrid className="w-10 h-10 text-gray-400 mb-3" />
                  <h3 className="text-base font-bold text-gray-900 mb-1">{t('templatesPage.noItems')}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {t('templatesPage.noItemsDesc')}
                  </p>
                  <Button onClick={clearAll} size="sm" variant="outline">
                    <SlidersHorizontal className="w-4 h-4 mr-1" />
                    {t('templatesPage.resetFilters')}
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalCount > 0 && totalPages > 1 && (
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      {getPageNumbers().map((p, idx) => (
                        <PaginationItem key={idx}>
                          {p === 'ellipsis' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => handlePageChange(p)}
                              isActive={currentPage === p}
                              className="cursor-pointer">
                              {p}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                          className={
                            currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-[60] lg:hidden bg-black/50"
          onClick={() => setMobileFiltersOpen(false)}>
          <div
            className="absolute top-0 left-0 h-full w-80 max-w-[85vw] bg-white p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <h2 className="font-bold text-gray-900">{t('templatesPage.filterRefine')}</h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <ShopFilters filters={filters} onChange={setFilters} totalCounts={categoryCounts} />
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="w-full mt-3 py-2 text-sm font-medium text-orange-500 border border-orange-300 rounded hover:bg-orange-50 transition-colors">
                {t('templatesPage.clearAllFilters')}
              </button>
            )}
            <Button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full mt-4 h-11 font-semibold bg-green-600 hover:bg-green-700">
              {t('templatesPage.showResults', { count: totalCount })}
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}

export default Templates