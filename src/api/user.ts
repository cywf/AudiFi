import type { User } from '@/types'

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
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        resolve(JSON.parse(storedUser))
      } else {
        localStorage.setItem('currentUser', JSON.stringify(mockUser))
        resolve(mockUser)
      }
    }, 300)
  })
}

export async function updateUser(updates: Partial<User>): Promise<User> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const storedUser = localStorage.getItem('currentUser')
      const currentUser = storedUser ? JSON.parse(storedUser) : mockUser
      const updatedUser = { ...currentUser, ...updates }
      localStorage.setItem('currentUser', JSON.stringify(updatedUser))
      resolve(updatedUser)
    }, 300)
  })
}
