import type { MasterIPO, CreateMasterIPOPayload, MasterIPOStatus } from '@/types'

const STORAGE_KEY = 'audifi.masterIPOs'

const mockMasterIPOs: MasterIPO[] = [
  {
    id: 'master_ipo_001',
    title: 'Midnight Sessions',
    artistId: 'user_001',
    artistName: 'Alex Rivera',
    description: 'A collection of late-night production sessions captured in their purest form.',
    coverImageUrl: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=400',
    totalNFTSupply: 10000,
    nftHolderRevenueSharePercent: 40,
    artistRetainedPercent: 60,
    pricePerNFT: 0.05,
    currency: 'ETH',
    blockchain: 'ethereum',
    rightsConfirmed: true,
    collaborators: [
      {
        id: 'collab_001',
        name: 'Beat Smith',
        role: 'Producer',
        revenueSharePercent: 10,
        walletAddress: '0xabc123...',
      },
    ],
    status: 'ACTIVE',
    launchedAt: new Date('2024-11-15').toISOString(),
    nftsSold: 3420,
    totalRaised: 171,
    createdAt: new Date('2024-10-01').toISOString(),
    updatedAt: new Date('2024-11-20').toISOString(),
  },
  {
    id: 'master_ipo_002',
    title: 'Summer Vibes EP',
    artistId: 'user_001',
    artistName: 'Alex Rivera',
    description: 'Feel-good summer tracks that bring the heat.',
    coverImageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    totalNFTSupply: 5000,
    nftHolderRevenueSharePercent: 30,
    artistRetainedPercent: 70,
    pricePerNFT: 0.08,
    currency: 'ETH',
    blockchain: 'ethereum',
    rightsConfirmed: true,
    collaborators: [],
    status: 'DRAFT',
    nftsSold: 0,
    totalRaised: 0,
    createdAt: new Date('2024-12-01').toISOString(),
    updatedAt: new Date('2024-12-01').toISOString(),
  },
]

function getStoredMasterIPOs(): MasterIPO[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockMasterIPOs))
  return mockMasterIPOs
}

function saveMasterIPOs(masterIPOs: MasterIPO[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(masterIPOs))
}

export async function getMasterIPOsForArtist(artistId: string): Promise<MasterIPO[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const masterIPOs = getStoredMasterIPOs()
      resolve(masterIPOs.filter((m) => m.artistId === artistId))
    }, 400)
  })
}

export async function getMasterIPOById(id: string): Promise<MasterIPO | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const masterIPOs = getStoredMasterIPOs()
      resolve(masterIPOs.find((m) => m.id === id) || null)
    }, 300)
  })
}

export async function getActiveMasterIPOs(): Promise<MasterIPO[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const masterIPOs = getStoredMasterIPOs()
      resolve(masterIPOs.filter((m) => m.status === 'ACTIVE'))
    }, 400)
  })
}

export async function createMasterIPO(
  payload: CreateMasterIPOPayload,
  artistId: string,
  artistName: string
): Promise<MasterIPO> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const masterIPOs = getStoredMasterIPOs()
      const newMasterIPO: MasterIPO = {
        id: `master_ipo_${Date.now()}`,
        ...payload,
        artistId,
        artistName,
        collaborators: payload.collaborators.map((c, i) => ({
          ...c,
          id: `collab_${Date.now()}_${i}`,
        })),
        status: 'DRAFT',
        nftsSold: 0,
        totalRaised: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      masterIPOs.push(newMasterIPO)
      saveMasterIPOs(masterIPOs)
      resolve(newMasterIPO)
    }, 500)
  })
}

export async function updateMasterIPOStatus(
  id: string,
  status: MasterIPOStatus
): Promise<MasterIPO> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const masterIPOs = getStoredMasterIPOs()
      const index = masterIPOs.findIndex((m) => m.id === id)
      if (index === -1) {
        reject(new Error('Master IPO not found'))
        return
      }

      const updated: MasterIPO = {
        ...masterIPOs[index],
        status,
        updatedAt: new Date().toISOString(),
        ...(status === 'ACTIVE' ? { launchedAt: new Date().toISOString() } : {}),
        ...(status === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {}),
      }

      masterIPOs[index] = updated
      saveMasterIPOs(masterIPOs)
      resolve(updated)
    }, 500)
  })
}

export async function launchMasterIPO(id: string): Promise<MasterIPO> {
  return updateMasterIPOStatus(id, 'ACTIVE')
}

export async function simulatePurchaseNFT(
  masterIPOId: string,
  quantity: number,
  buyerWallet: string
): Promise<{ success: boolean; transactionHash: string; nftIds: string[] }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const masterIPOs = getStoredMasterIPOs()
      const index = masterIPOs.findIndex((m) => m.id === masterIPOId)
      if (index === -1) {
        reject(new Error('Master IPO not found'))
        return
      }

      const masterIPO = masterIPOs[index]
      if (masterIPO.status !== 'ACTIVE') {
        reject(new Error('Master IPO is not active'))
        return
      }

      if (masterIPO.nftsSold + quantity > masterIPO.totalNFTSupply) {
        reject(new Error('Not enough NFTs available'))
        return
      }

      // Update stats
      masterIPOs[index] = {
        ...masterIPO,
        nftsSold: masterIPO.nftsSold + quantity,
        totalRaised: masterIPO.totalRaised + quantity * masterIPO.pricePerNFT,
        updatedAt: new Date().toISOString(),
      }

      saveMasterIPOs(masterIPOs)

      const nftIds = Array.from({ length: quantity }, (_, i) =>
        `nft_${masterIPOId}_${masterIPO.nftsSold + i + 1}`
      )

      resolve({
        success: true,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        nftIds,
      })
    }, 2000)
  })
}
