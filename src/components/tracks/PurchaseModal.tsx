import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  Wallet, 
  CreditCard, 
  CheckCircle, 
  Warning,
  MusicNote,
  CurrencyEth
} from '@phosphor-icons/react'
import type { Track } from '@/types'
import { purchaseTrack, simulateMetaMaskConnection } from '@/api/marketplace'
import { toast } from 'sonner'

interface PurchaseModalProps {
  track: Track | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPurchaseComplete: () => void
}

type PurchaseStep = 'payment-method' | 'connecting-wallet' | 'processing' | 'success' | 'error'

export function PurchaseModal({ track, open, onOpenChange, onPurchaseComplete }: PurchaseModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'metamask' | 'stripe'>('metamask')
  const [step, setStep] = useState<PurchaseStep>('payment-method')
  const [walletAddress, setWalletAddress] = useState<string>('')
  const [transactionHash, setTransactionHash] = useState<string>('')
  const [error, setError] = useState<string>('')

  if (!track) return null

  const handlePurchase = async () => {
    try {
      if (paymentMethod === 'metamask') {
        setStep('connecting-wallet')
        const wallet = await simulateMetaMaskConnection()
        setWalletAddress(wallet)
        
        setStep('processing')
        const result = await purchaseTrack(track.id, wallet, 'metamask')
        
        if (result.success && result.transactionHash) {
          setTransactionHash(result.transactionHash)
          setStep('success')
          toast.success('NFT purchased successfully!')
          onPurchaseComplete()
        }
      } else {
        setStep('processing')
        const mockWallet = `0x${Math.random().toString(16).substring(2, 42)}`
        await purchaseTrack(track.id, mockWallet, 'stripe')
        setStep('success')
        toast.success('NFT purchased successfully!')
        onPurchaseComplete()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed')
      setStep('error')
      toast.error('Purchase failed. Please try again.')
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep('payment-method')
      setPaymentMethod('metamask')
      setWalletAddress('')
      setTransactionHash('')
      setError('')
    }, 300)
  }

  const renderContent = () => {
    switch (step) {
      case 'payment-method':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Purchase NFT Track</DialogTitle>
              <DialogDescription>
                Choose your payment method to complete the purchase
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="flex items-start gap-4 p-4 border border-border rounded-lg bg-card/50">
                {track.coverImageUrl ? (
                  <img
                    src={track.coverImageUrl}
                    alt={track.title}
                    className="w-20 h-20 rounded-md object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center">
                    <MusicNote size={32} className="text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1">{track.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{track.genre}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-accent flex items-center gap-1">
                      <CurrencyEth size={20} weight="fill" />
                      {track.currentPrice}
                    </span>
                    <span className="text-sm text-muted-foreground">{track.currency}</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-4 block">
                  Select Payment Method
                </Label>
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'metamask' | 'stripe')}>
                  <div className="space-y-3">
                    <Label
                      htmlFor="metamask"
                      className="flex items-start gap-3 p-4 border-2 border-border rounded-lg cursor-pointer transition-all hover:border-accent/50 has-[:checked]:border-accent has-[:checked]:bg-accent/5"
                    >
                      <RadioGroupItem value="metamask" id="metamask" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Wallet size={20} className="text-primary" />
                          <span className="font-semibold">MetaMask / Web3 Wallet</span>
                          <Badge variant="secondary" className="ml-auto">Recommended</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Connect your crypto wallet to purchase with ETH
                        </p>
                      </div>
                    </Label>

                    <Label
                      htmlFor="stripe"
                      className="flex items-start gap-3 p-4 border-2 border-border rounded-lg cursor-pointer transition-all hover:border-accent/50 has-[:checked]:border-accent has-[:checked]:bg-accent/5"
                    >
                      <RadioGroupItem value="stripe" id="stripe" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CreditCard size={20} className="text-primary" />
                          <span className="font-semibold">Credit Card via Stripe</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Pay with credit card (USD equivalent conversion)
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Track Price</span>
                  <span className="font-medium">{track.currentPrice} {track.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Artist Royalty</span>
                  <span className="font-medium">{track.royaltyPercent}% on resale</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-accent">{track.currentPrice} {track.currency}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handlePurchase} className="gap-2">
                {paymentMethod === 'metamask' ? (
                  <>
                    <Wallet size={18} />
                    Connect & Purchase
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Pay with Card
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )

      case 'connecting-wallet':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Connecting Wallet</DialogTitle>
              <DialogDescription>
                Please approve the connection in your wallet
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground text-center">
                Waiting for wallet connection...
              </p>
            </div>
          </>
        )

      case 'processing':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Processing Transaction</DialogTitle>
              <DialogDescription>
                Your purchase is being processed on the blockchain
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground text-center">
                Please wait while we complete your purchase...
                <br />
                <span className="text-xs">This may take a few moments</span>
              </p>
            </div>
          </>
        )

      case 'success':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Purchase Successful!</DialogTitle>
              <DialogDescription>
                Your NFT has been transferred to your wallet
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                <CheckCircle size={48} className="text-accent" weight="fill" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-xl">{track.title}</h3>
                <p className="text-muted-foreground">
                  You are now the owner of this NFT track
                </p>
              </div>
              {transactionHash && (
                <div className="w-full p-4 bg-muted/50 rounded-lg space-y-2">
                  <Label className="text-xs text-muted-foreground">Transaction Hash</Label>
                  <p className="font-mono text-xs break-all">{transactionHash}</p>
                </div>
              )}
              {walletAddress && (
                <div className="w-full p-4 bg-muted/50 rounded-lg space-y-2">
                  <Label className="text-xs text-muted-foreground">Your Wallet</Label>
                  <p className="font-mono text-xs break-all">{walletAddress}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </DialogFooter>
          </>
        )

      case 'error':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Purchase Failed</DialogTitle>
              <DialogDescription>
                There was an error processing your purchase
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-8 space-y-6">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <Warning size={48} className="text-destructive" weight="fill" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-xl">Transaction Failed</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button onClick={() => setStep('payment-method')}>
                Try Again
              </Button>
            </DialogFooter>
          </>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
}
