import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import { QrCode, Key, CheckCircle, Copy } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface TwoFactorSetupProps {
  isEnabled: boolean
  onToggle: (enabled: boolean) => void
}

export function TwoFactorSetup({ isEnabled, onToggle }: TwoFactorSetupProps) {
  const [showSetupDialog, setShowSetupDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [setupStep, setSetupStep] = useState<'qr' | 'verify'>('qr')
  const [isVerifying, setIsVerifying] = useState(false)

  const secretKey = 'JBSWY3DPEHPK3PXP'
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/NFTTracks:user@example.com?secret=${secretKey}&issuer=NFTTracks`

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey)
    toast.success('Secret key copied to clipboard')
  }

  const handleVerifyCode = () => {
    setIsVerifying(true)
    
    setTimeout(() => {
      if (verificationCode.length === 6) {
        onToggle(true)
        setShowSetupDialog(false)
        setVerificationCode('')
        setSetupStep('qr')
        toast.success('Two-factor authentication enabled successfully!')
      } else {
        toast.error('Invalid verification code')
      }
      setIsVerifying(false)
    }, 1000)
  }

  const handleDisable2FA = () => {
    setIsVerifying(true)
    
    setTimeout(() => {
      if (verificationCode.length === 6) {
        onToggle(false)
        setShowDisableDialog(false)
        setVerificationCode('')
        toast.success('Two-factor authentication disabled')
      } else {
        toast.error('Invalid verification code')
      }
      setIsVerifying(false)
    }, 1000)
  }

  const handleStartSetup = () => {
    setSetupStep('qr')
    setVerificationCode('')
    setShowSetupDialog(true)
  }

  return (
    <>
      <div className="space-y-4">
        {isEnabled ? (
          <div className="flex items-center justify-between p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} weight="fill" className="text-secondary" />
              <div>
                <p className="font-medium">Two-Factor Authentication is Active</p>
                <p className="text-sm text-muted-foreground">
                  Your account is protected with 2FA
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowDisableDialog(true)}
            >
              Disable 2FA
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication adds an extra layer of security to your account. 
              You'll need to enter a code from your authenticator app in addition to your password when signing in.
            </p>
            <Button onClick={handleStartSetup}>
              Enable Two-Factor Authentication
            </Button>
          </div>
        )}
      </div>

      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              {setupStep === 'qr' 
                ? 'Scan this QR code with your authenticator app'
                : 'Enter the 6-digit code from your authenticator app'
              }
            </DialogDescription>
          </DialogHeader>

          {setupStep === 'qr' ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="bg-white p-4 rounded-lg">
                  <img 
                    src={qrCodeUrl} 
                    alt="2FA QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                <div className="w-full space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Or enter this key manually:
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={secretKey} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={handleCopySecret}
                    >
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Recommended Apps:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Google Authenticator</li>
                  <li>• Microsoft Authenticator</li>
                  <li>• Authy</li>
                </ul>
              </div>

              <DialogFooter>
                <Button 
                  onClick={() => setSetupStep('verify')}
                  className="w-full"
                >
                  Continue to Verification
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-center py-4">
                  <Key size={48} weight="duotone" className="text-primary" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verify-code">Verification Code</Label>
                  <Input
                    id="verify-code"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-widest font-mono"
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Enter the 6-digit code from your authenticator app
                  </p>
                </div>
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSetupStep('qr')}
                  className="w-full sm:w-auto"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 6 || isVerifying}
                  className="w-full sm:w-auto"
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Enable'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enter your current 2FA code to disable two-factor authentication
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center py-4">
                <Key size={48} weight="duotone" className="text-warning" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="disable-code">Verification Code</Label>
                <Input
                  id="disable-code"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-widest font-mono"
                  maxLength={6}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDisableDialog(false)
                  setVerificationCode('')
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDisable2FA}
                disabled={verificationCode.length !== 6 || isVerifying}
                className="w-full sm:w-auto"
              >
                {isVerifying ? 'Verifying...' : 'Disable 2FA'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
