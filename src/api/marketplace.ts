import type { Track } from '@/types'

const mockMarketplaceTracks: Track[] = [
  {
    id: 'track_market_001',
    title: 'Midnight Pulse',
    description: 'A deep house track with ethereal vocals and driving bassline',
    genre: 'Deep House',
    bpm: 124,
    moodTags: ['Dark', 'Hypnotic', 'Energetic'],
    audioFileName: 'midnight_pulse.wav',
    coverImageUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400',
    artistId: 'artist_001',
    status: 'LISTED',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    ownerWalletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    currentPrice: 0.5,
    currency: 'ETH',
    royaltyPercent: 10,
    releaseDate: new Date('2024-11-01').toISOString(),
    allowSecondaryResale: true,
    createdAt: new Date('2024-10-15').toISOString(),
    updatedAt: new Date('2024-11-01').toISOString(),
  },
  {
    id: 'track_market_002',
    title: 'Neon Dreams',
    description: 'Synthwave inspired journey through cyberpunk landscapes',
    genre: 'Synthwave',
    bpm: 110,
    moodTags: ['Nostalgic', 'Cinematic', 'Uplifting'],
    audioFileName: 'neon_dreams.wav',
    coverImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    artistId: 'artist_002',
    status: 'LISTED',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH',
    ownerWalletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    currentPrice: 0.75,
    currency: 'ETH',
    royaltyPercent: 15,
    releaseDate: new Date('2024-12-05').toISOString(),
    allowSecondaryResale: true,
    createdAt: new Date('2024-11-20').toISOString(),
    updatedAt: new Date('2024-12-05').toISOString(),
  },
  {
    id: 'track_market_003',
    title: 'Sunset Boulevard',
    description: 'Chill lofi beats with warm vinyl textures',
    genre: 'Lo-Fi Hip Hop',
    bpm: 85,
    moodTags: ['Relaxing', 'Warm', 'Nostalgic'],
    audioFileName: 'sunset_boulevard.wav',
    coverImageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400',
    artistId: 'artist_003',
    status: 'LISTED',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdI',
    ownerWalletAddress: '0x7890abcdef1234567890abcdef1234567890abcd',
    currentPrice: 0.25,
    currency: 'ETH',
    royaltyPercent: 10,
    releaseDate: new Date('2024-12-10').toISOString(),
    allowSecondaryResale: true,
    createdAt: new Date('2024-12-01').toISOString(),
    updatedAt: new Date('2024-12-10').toISOString(),
  },
  {
    id: 'track_market_004',
    title: 'Techno Tribal',
    description: 'Hard-hitting techno with organic percussion',
    genre: 'Techno',
    bpm: 135,
    moodTags: ['Aggressive', 'Tribal', 'Industrial'],
    audioFileName: 'techno_tribal.wav',
    coverImageUrl: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400',
    artistId: 'artist_004',
    status: 'LISTED',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdJ',
    ownerWalletAddress: '0x4567890abcdef1234567890abcdef1234567890a',
    currentPrice: 1.2,
    currency: 'ETH',
    royaltyPercent: 12,
    releaseDate: new Date('2024-12-15').toISOString(),
    allowSecondaryResale: true,
    createdAt: new Date('2024-12-05').toISOString(),
    updatedAt: new Date('2024-12-15').toISOString(),
  },
  {
    id: 'track_market_005',
    title: 'Ambient Odyssey',
    description: 'Expansive ambient soundscapes for deep contemplation',
    genre: 'Ambient',
    bpm: 60,
    moodTags: ['Atmospheric', 'Meditative', 'Spacious'],
    audioFileName: 'ambient_odyssey.wav',
    coverImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    artistId: 'artist_005',
    status: 'LISTED',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdK',
    ownerWalletAddress: '0xbcdef1234567890abcdef1234567890abcdef123',
    currentPrice: 0.4,
    currency: 'ETH',
    royaltyPercent: 10,
    releaseDate: new Date('2024-12-18').toISOString(),
    allowSecondaryResale: true,
    createdAt: new Date('2024-12-08').toISOString(),
    updatedAt: new Date('2024-12-18').toISOString(),
  },
  {
    id: 'track_market_006',
    title: 'Bassline Warrior',
    description: 'Heavy drum and bass roller with deep sub bass',
    genre: 'Drum & Bass',
    bpm: 174,
    moodTags: ['Intense', 'Dark', 'Energetic'],
    audioFileName: 'bassline_warrior.wav',
    coverImageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=400',
    artistId: 'artist_006',
    status: 'LISTED',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdL',
    ownerWalletAddress: '0xef1234567890abcdef1234567890abcdef123456',
    currentPrice: 0.65,
    currency: 'ETH',
    royaltyPercent: 10,
    releaseDate: new Date('2024-12-20').toISOString(),
    allowSecondaryResale: true,
    createdAt: new Date('2024-12-10').toISOString(),
    updatedAt: new Date('2024-12-20').toISOString(),
  },
]

function getMarketplaceTracks(): Track[] {
  const stored = localStorage.getItem('marketplace-tracks')
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem('marketplace-tracks', JSON.stringify(mockMarketplaceTracks))
  return mockMarketplaceTracks
}

function saveMarketplaceTracks(tracks: Track[]): void {
  localStorage.setItem('marketplace-tracks', JSON.stringify(tracks))
}

export interface MarketplaceFilters {
  search?: string
  genre?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'oldest'
}

export async function getMarketplaceListings(filters?: MarketplaceFilters): Promise<Track[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let tracks = getMarketplaceTracks().filter(t => t.status === 'LISTED')

      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        tracks = tracks.filter(
          t =>
            t.title.toLowerCase().includes(searchLower) ||
            t.description.toLowerCase().includes(searchLower) ||
            t.genre.toLowerCase().includes(searchLower)
        )
      }

      if (filters?.genre && filters.genre !== 'all') {
        tracks = tracks.filter(t => t.genre === filters.genre)
      }

      if (filters?.minPrice !== undefined) {
        tracks = tracks.filter(t => (t.currentPrice || 0) >= filters.minPrice!)
      }

      if (filters?.maxPrice !== undefined) {
        tracks = tracks.filter(t => (t.currentPrice || 0) <= filters.maxPrice!)
      }

      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'price-asc':
            tracks.sort((a, b) => (a.currentPrice || 0) - (b.currentPrice || 0))
            break
          case 'price-desc':
            tracks.sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0))
            break
          case 'newest':
            tracks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            break
          case 'oldest':
            tracks.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
            break
        }
      }

      resolve(tracks)
    }, 400)
  })
}

export async function purchaseTrack(
  trackId: string,
  buyerWallet: string,
  paymentMethod: 'metamask' | 'stripe'
): Promise<{ success: boolean; transactionHash?: string; track: Track }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tracks = getMarketplaceTracks()
      const trackIndex = tracks.findIndex(t => t.id === trackId)

      if (trackIndex === -1) {
        reject(new Error('Track not found'))
        return
      }

      const track = tracks[trackIndex]

      if (track.status !== 'LISTED') {
        reject(new Error('Track is not available for purchase'))
        return
      }

      const purchasedTrack: Track = {
        ...track,
        status: 'SOLD',
        ownerWalletAddress: buyerWallet,
        updatedAt: new Date().toISOString(),
      }

      tracks[trackIndex] = purchasedTrack
      saveMarketplaceTracks(tracks)

      const transactionHash = paymentMethod === 'metamask' 
        ? `0x${Math.random().toString(16).substring(2, 66)}` 
        : undefined

      resolve({
        success: true,
        transactionHash,
        track: purchasedTrack,
      })
    }, 2500)
  })
}

export async function simulateMetaMaskConnection(): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockWalletAddress = `0x${Math.random().toString(16).substring(2, 42)}`
      resolve(mockWalletAddress)
    }, 1000)
  })
}

export function getAvailableGenres(): string[] {
  return [
    'Deep House',
    'Synthwave',
    'Lo-Fi Hip Hop',
    'Techno',
    'Ambient',
    'Drum & Bass',
    'Trap',
    'Progressive House',
    'Downtempo',
    'Experimental',
  ]
}
