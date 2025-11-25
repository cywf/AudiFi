import type { Track, CreateTrackPayload } from '@/types'

const mockTracks: Track[] = [
  {
    id: 'track_001',
    title: 'Midnight Pulse',
    description: 'A deep house track with ethereal vocals and driving bassline',
    genre: 'Deep House',
    bpm: 124,
    moodTags: ['Dark', 'Hypnotic', 'Energetic'],
    audioFileName: 'midnight_pulse.wav',
    coverImageUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400',
    artistId: 'user_001',
    status: 'MINTED',
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
    id: 'track_002',
    title: 'Neon Dreams',
    description: 'Synthwave inspired journey through cyberpunk landscapes',
    genre: 'Synthwave',
    bpm: 110,
    moodTags: ['Nostalgic', 'Cinematic', 'Uplifting'],
    audioFileName: 'neon_dreams.wav',
    coverImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    artistId: 'user_001',
    status: 'LISTED',
    ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdH',
    ownerWalletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    currentPrice: 0.75,
    currency: 'ETH',
    royaltyPercent: 15,
    releaseDate: new Date('2024-12-05').toISOString(),
    allowSecondaryResale: true,
    createdAt: new Date('2024-11-20').toISOString(),
    updatedAt: new Date('2024-12-05').toISOString(),
  },
  {
    id: 'track_003',
    title: 'Untitled Project',
    description: 'Work in progress experimental beat',
    genre: 'Experimental',
    bpm: 95,
    moodTags: ['Abstract', 'Moody'],
    audioFileName: 'untitled_v3.wav',
    artistId: 'user_001',
    status: 'DRAFT',
    royaltyPercent: 10,
    createdAt: new Date('2024-12-20').toISOString(),
    updatedAt: new Date('2024-12-20').toISOString(),
  },
]

function getStoredTracks(): Track[] {
  const stored = localStorage.getItem('tracks')
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem('tracks', JSON.stringify(mockTracks))
  return mockTracks
}

function saveTracks(tracks: Track[]): void {
  localStorage.setItem('tracks', JSON.stringify(tracks))
}

export async function getTracksForCurrentUser(): Promise<Track[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks()
      resolve(tracks.filter(t => t.artistId === 'user_001'))
    }, 400)
  })
}

export async function getTrackById(id: string): Promise<Track | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks()
      const track = tracks.find(t => t.id === id)
      resolve(track || null)
    }, 300)
  })
}

export async function createTrackDraft(payload: CreateTrackPayload): Promise<Track> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tracks = getStoredTracks()
      const newTrack: Track = {
        id: `track_${Date.now()}`,
        ...payload,
        artistId: 'user_001',
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      tracks.push(newTrack)
      saveTracks(tracks)
      resolve(newTrack)
    }, 500)
  })
}

export async function simulateMint(trackId: string): Promise<Track> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tracks = getStoredTracks()
      const trackIndex = tracks.findIndex(t => t.id === trackId)
      
      if (trackIndex === -1) {
        reject(new Error('Track not found'))
        return
      }

      const track = tracks[trackIndex]
      const mintedTrack: Track = {
        ...track,
        status: 'MINTED',
        ipfsHash: `QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHd${Math.random().toString(36).substring(2, 15)}`,
        ownerWalletAddress: '0x1234567890abcdef1234567890abcdef12345678',
        updatedAt: new Date().toISOString(),
      }

      tracks[trackIndex] = mintedTrack
      saveTracks(tracks)
      resolve(mintedTrack)
    }, 2000)
  })
}

export async function simulatePurchase(trackId: string, buyerWallet: string): Promise<Track> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tracks = getStoredTracks()
      const trackIndex = tracks.findIndex(t => t.id === trackId)
      
      if (trackIndex === -1) {
        reject(new Error('Track not found'))
        return
      }

      const track = tracks[trackIndex]
      const purchasedTrack: Track = {
        ...track,
        status: 'SOLD',
        ownerWalletAddress: buyerWallet,
        updatedAt: new Date().toISOString(),
      }

      tracks[trackIndex] = purchasedTrack
      saveTracks(tracks)
      resolve(purchasedTrack)
    }, 1500)
  })
}
