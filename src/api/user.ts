import type { User } from '@/types'

const STORAGE_KEY = 'audifi.currentUser'

const mockUser: User = {
  id: 'user_001',
  name: 'Alex Rivera',
  email: 'alex@example.com',
  walletAddress: undefined,
  subscriptionPlan: 'FREE',
  createdAt: new Date('2024-01-15').toISOString(),
}

export async function getCurrentUser(): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedUser = localStorage.getItem(STORAGE_KEY)
      if (storedUser) {
        resolve(JSON.parse(storedUser))
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser))
        resolve(mockUser)
      }
    }, 300)
  })
}

export async function updateUser(updates: Partial<User>): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedUser = localStorage.getItem(STORAGE_KEY)
      const currentUser = storedUser ? JSON.parse(storedUser) : mockUser
      const updatedUser = { ...currentUser, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser))
      resolve(updatedUser)
    }, 300)
  })
}
