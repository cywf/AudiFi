const WALLET_STORAGE_KEY = 'nftTracks.connectedWallet'

/**
 * Interface for wallet operations
 */
export interface WalletConnection {
  address: string
  connectedAt: string
}

/**
 * Connect a wallet (simulated MetaMask connection)
 * Returns a deterministic fake address and stores it in localStorage
 */
export async function connectWallet(): Promise<{ walletAddress: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if we already have a connected wallet
      const existing = getConnectedWallet()
      if (existing) {
        resolve({ walletAddress: existing })
        return
      }
      
      // Generate a deterministic-looking wallet address
      const walletAddress = generateWalletAddress()
      
      // Store the connection
      const connection: WalletConnection = {
        address: walletAddress,
        connectedAt: new Date().toISOString()
      }
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(connection))
      
      resolve({ walletAddress })
    }, 1500)
  })
}

/**
 * Get the currently connected wallet address from localStorage
 */
export function getConnectedWallet(): string | null {
  const stored = localStorage.getItem(WALLET_STORAGE_KEY)
  if (!stored) return null
  
  try {
    const connection: WalletConnection = JSON.parse(stored)
    return connection.address
  } catch {
    return null
  }
}

/**
 * Disconnect the current wallet
 */
export function disconnectWallet(): void {
  localStorage.removeItem(WALLET_STORAGE_KEY)
}

/**
 * Generate a realistic-looking Ethereum wallet address
 */
function generateWalletAddress(): string {
  const chars = '0123456789abcdef'
  let address = '0x'
  for (let i = 0; i < 40; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return address
}

/**
 * Truncate a wallet address for display (e.g., "0x1234...ABCD")
 */
export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address || address.length < startLength + endLength) return address
  return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`
}
