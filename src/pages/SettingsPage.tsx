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
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Manage your account, wallet, and subscription
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 h-auto bg-muted/40">
            <TabsTrigger 
              value="profile" 
              className="gap-1 sm:gap-2 py-3 sm:py-3.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:font-semibold data-[state=active]:shadow-sm"
            >
              <User size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="gap-1 sm:gap-2 py-3 sm:py-3.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:font-semibold data-[state=active]:shadow-sm"
            >
              <Wallet size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger 
              value="billing" 
              className="gap-1 sm:gap-2 py-3 sm:py-3.5 text-xs sm:text-sm data-[state=active]:bg-background data-[state=active]:text-accent data-[state=active]:font-semibold data-[state=active]:shadow-sm"
            >
              <CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
                <CardDescription className="text-sm">
                  Your basic account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                  <Input id="name" value={user.name} disabled className="h-11 border-input/80" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input id="email" type="email" value={user.email} disabled className="h-11 border-input/80" />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Profile editing coming soon. Contact support to update your information.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Wallet Connection</CardTitle>
                <CardDescription className="text-sm">
                  Connect your MetaMask wallet to receive payments and manage NFTs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {user.walletAddress ? (
                  <div className="flex items-center justify-between p-4 sm:p-5 bg-muted/50 rounded-lg border border-border/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                        <CheckCircle size={24} weight="fill" className="text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base">Wallet Connected</p>
                        <p className="text-xs sm:text-sm text-muted-foreground font-mono truncate">
                          {truncateAddress(user.walletAddress)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Connect your MetaMask wallet to enable NFT minting and receive cryptocurrency payments.
                    </p>
                    <Button
                      onClick={handleConnectWallet}
                      disabled={connectingWallet}
                      className="gap-2 w-full sm:w-auto"
                    >
                      <Wallet size={18} />
                      {connectingWallet ? 'Connecting...' : 'Connect MetaMask'}
                    </Button>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Important Notes</h4>
                  <ul className="text-xs sm:text-sm text-muted-foreground space-y-2 list-disc list-inside">
                    <li>This is a simulated wallet connection for demo purposes</li>
                    <li>In production, this would trigger the actual MetaMask extension</li>
                    <li>Your wallet address is used for receiving payments and NFT ownership</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Subscription</CardTitle>
                <CardDescription className="text-sm">
                  Manage your subscription plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 bg-muted/50 rounded-lg border border-border/40">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-base sm:text-lg">{plan.name} Plan</p>
                      <Badge variant={plan.pricePerMonthUSD === 0 ? 'secondary' : 'default'} className="text-xs rounded-full">
                        {plan.pricePerMonthUSD === 0 ? 'Free' : 'Pro'}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {plan.pricePerMonthUSD === 0
                        ? 'No payment required'
                        : `$${plan.pricePerMonthUSD}/month`}
                    </p>
                  </div>
                  {plan.pricePerMonthUSD > 0 && (
                    <Button variant="outline" size="sm" onClick={handleOpenBilling} className="w-full sm:w-auto">
                      Manage Subscription
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Plan Features</h4>
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 py-1">
                        <CheckCircle size={16} weight="fill" className="text-accent mt-0.5 shrink-0" />
                        <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {plan.pricePerMonthUSD === 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        Upgrade to Pro for unlimited tracks and advanced features.
                      </p>
                      <Button className="gap-2 w-full sm:w-auto">
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
