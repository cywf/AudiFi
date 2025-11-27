import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { MagnifyingGlass, SlidersHorizontal, X } from '@phosphor-icons/react'
import type { MarketplaceFilters } from '@/api/marketplace'
import { useState } from 'react'

interface MarketplaceFiltersProps {
  filters: MarketplaceFilters
  onFiltersChange: (filters: MarketplaceFilters) => void
  genres: string[]
}

export function MarketplaceFiltersPanel({ filters, onFiltersChange, genres }: MarketplaceFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleGenreChange = (value: string) => {
    onFiltersChange({ ...filters, genre: value })
  }

  const handleSortChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      sortBy: value as MarketplaceFilters['sortBy']
    })
  }

  const handleBlockchainChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      blockchain: value === 'all' ? undefined : value as 'ethereum' | 'solana'
    })
  }

  const handleMinPriceChange = (value: string) => {
    const numValue = parseFloat(value)
    onFiltersChange({ 
      ...filters, 
      minPrice: isNaN(numValue) ? undefined : numValue 
    })
  }

  const handleMaxPriceChange = (value: string) => {
    const numValue = parseFloat(value)
    onFiltersChange({ 
      ...filters, 
      maxPrice: isNaN(numValue) ? undefined : numValue 
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
    setShowAdvanced(false)
  }

  const hasActiveFilters = filters.search || filters.genre || filters.blockchain || filters.minPrice !== undefined || filters.maxPrice !== undefined

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <Label htmlFor="search" className="sr-only">Search</Label>
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              id="search"
              placeholder="Search tracks..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="genre" className="sr-only">Genre</Label>
          <Select value={filters.genre || 'all'} onValueChange={handleGenreChange}>
            <SelectTrigger id="genre">
              <SelectValue placeholder="All Genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="blockchain" className="sr-only">Blockchain</Label>
          <Select value={filters.blockchain || 'all'} onValueChange={handleBlockchainChange}>
            <SelectTrigger id="blockchain">
              <SelectValue placeholder="All Blockchains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blockchains</SelectItem>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="solana">Solana</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sort" className="sr-only">Sort By</Label>
          <Select value={filters.sortBy || 'newest'} onValueChange={handleSortChange}>
            <SelectTrigger id="sort">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <SlidersHorizontal size={16} />
          {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
            Clear All
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-border rounded-lg bg-card/50">
          <div>
            <Label htmlFor="min-price" className="text-sm mb-2 block">
              Min Price (ETH)
            </Label>
            <Input
              id="min-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.0"
              value={filters.minPrice ?? ''}
              onChange={(e) => handleMinPriceChange(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="max-price" className="text-sm mb-2 block">
              Max Price (ETH)
            </Label>
            <Input
              id="max-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="10.0"
              value={filters.maxPrice ?? ''}
              onChange={(e) => handleMaxPriceChange(e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
