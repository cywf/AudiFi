export async function connectWallet(): Promise<{ walletAddress: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockAddress = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6).toUpperCase()}`
      resolve({ walletAddress: mockAddress })
    }, 1500)
  })
}

export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address || address.length < startLength + endLength) return address
  return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`
}
