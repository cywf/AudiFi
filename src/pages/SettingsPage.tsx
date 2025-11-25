import { useState, useEffect } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Wallet, CreditCard, User, CheckCircle } from '@phosphor-icons/react'
import { getCurrentUser, updateUser } from '@/api/user'
import { getCurrentUserPlan } from '@/api/subscription'
import { connectWallet, truncateAddress } from '@/lib/wallet'
import { openCustomerPortal } from '@/lib/payments'
import type { User as UserType, SubscriptionPlan } from '@/types'
import { toast } from 'sonner'

export function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectingWallet, setConnectingWallet] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, planData] = await Promise.all([
          getCurrentUser(),
          getCurrentUserPlan(),
        ])
        setUser(userData)
        setPlan(planData)
      } catch (error) {
        console.error('Failed to load settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleConnectWallet = async () => {
    setConnectingWallet(true)
    try {
      const { walletAddress } = await connectWallet()
      const updatedUser = await updateUser({ walletAddress })
      setUser(updatedUser)
      toast.success('Wallet connected successfully', {
        description: truncateAddress(walletAddress),
      })
    } catch (error) {
      toast.error('Failed to connect wallet')
    } finally {
      setConnectingWallet(false)
    }
  }

  const handleOpenBilling = async () => {
    try {
      await openCustomerPortal()
      toast.info('Stripe Customer Portal', {
        description: 'In production, this would redirect to your Stripe billing portal.',
      })
    } catch (error) {
      toast.error('Failed to open billing portal')
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </MainLayout>
    )
  }

  if (!user || !plan) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Failed to load settings. Please try again.</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account, wallet, and subscription
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="gap-2">
              <User size={18} />
              Profile
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2">
              <Wallet size={18} />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard size={18} />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Your basic account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={user.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={user.email} disabled />
                </div>
                <p className="text-sm text-muted-foreground">
                  Profile editing coming soon. Contact support to update your information.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Wallet Connection</CardTitle>
                <CardDescription>
                  Connect your MetaMask wallet to receive payments and manage NFTs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.walletAddress ? (
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <CheckCircle size={24} weight="fill" className="text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">Wallet Connected</p>
                        <p className="text-sm text-muted-foreground font-mono">
                          {truncateAddress(user.walletAddress)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Connect your MetaMask wallet to enable NFT minting and receive cryptocurrency payments.
                    </p>
                    <Button
                      onClick={handleConnectWallet}
                      disabled={connectingWallet}
                      className="gap-2"
                    >
                      <Wallet size={18} />
                      {connectingWallet ? 'Connecting...' : 'Connect MetaMask'}
                    </Button>
                  </div>
                )}

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Important Notes</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>This is a simulated wallet connection for demo purposes</li>
                    <li>In production, this would trigger the actual MetaMask extension</li>
                    <li>Your wallet address is used for receiving payments and NFT ownership</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-lg">{plan.name} Plan</p>
                      <Badge variant={plan.pricePerMonthUSD === 0 ? 'secondary' : 'default'}>
                        {plan.pricePerMonthUSD === 0 ? 'Free' : 'Pro'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plan.pricePerMonthUSD === 0
                        ? 'No payment required'
                        : `$${plan.pricePerMonthUSD}/month`}
                    </p>
                  </div>
                  {plan.pricePerMonthUSD > 0 && (
                    <Button variant="outline" onClick={handleOpenBilling}>
                      Manage Subscription
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <h4 className="font-medium">Plan Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle size={16} weight="fill" className="text-accent mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {plan.pricePerMonthUSD === 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Upgrade to Pro for unlimited tracks and advanced features.
                      </p>
                      <Button className="gap-2">
                        Upgrade to Pro
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
