/**
 * Auth & Identity Service
 * 
 * Handles:
 * - Magic link authentication (passwordless)
 * - 2FA setup and verification (passkeys, TOTP)
 * - Wallet association
 * - SSO integration (Google, Microsoft)
 * 
 * TODO: Implement actual integrations with:
 * - Email provider (SendGrid, etc.) for magic links
 * - WebAuthn/passkeys for 2FA
 * - TOTP (Google Authenticator compatible)
 * - OAuth2 providers for SSO
 */

import { v4 as uuidv4 } from 'uuid';
import type { 
  User, 
  AuthSession, 
  WalletAssociation, 
  TwoFactorMethod,
  BlockchainNetwork 
} from '../types/index.js';

// =============================================================================
// IN-MEMORY STORE (Replace with database in production)
// =============================================================================

const users: Map<string, User> = new Map();
const sessions: Map<string, AuthSession> = new Map();
const magicLinkTokens: Map<string, { email: string; expiresAt: Date }> = new Map();
const totpSecrets: Map<string, string> = new Map();  // userId -> secret

// =============================================================================
// MAGIC LINK AUTHENTICATION
// =============================================================================

/**
 * Request a magic link for passwordless authentication
 * Generates a token and (in production) sends an email
 */
export async function requestMagicLink(email: string): Promise<{ success: boolean; message: string }> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  magicLinkTokens.set(token, { email, expiresAt });

  // TODO: Send email with magic link
  // In development, log the token for testing
  console.log(`[Auth] Magic link token for ${email}: ${token}`);
  console.log(`[Auth] Magic link URL: http://localhost:5173/auth/verify?token=${token}`);

  return {
    success: true,
    message: 'Magic link sent to your email',
  };
}

/**
 * Verify a magic link token and create/return user session
 */
export async function verifyMagicLink(token: string): Promise<AuthSession | null> {
  const tokenData = magicLinkTokens.get(token);

  if (!tokenData) {
    return null;
  }

  if (new Date() > tokenData.expiresAt) {
    magicLinkTokens.delete(token);
    return null;
  }

  // Delete the token (one-time use)
  magicLinkTokens.delete(token);

  // Find or create user
  let user = findUserByEmail(tokenData.email);
  
  if (!user) {
    user = await createUser({
      email: tokenData.email,
      name: tokenData.email.split('@')[0],
      role: 'fan',
    });
  }

  // Create session
  const session = createSession(user.id);
  
  return session;
}

// =============================================================================
// TWO-FACTOR AUTHENTICATION
// =============================================================================

/**
 * Set up TOTP-based 2FA for a user
 * Returns the secret and QR code URL for authenticator apps
 * 
 * TODO: Implement actual TOTP secret generation and QR code
 */
export async function setupTOTP(userId: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> {
  // TODO: Generate actual TOTP secret using a library like `speakeasy` or `otplib`
  const mockSecret = `AUDIFI${uuidv4().replace(/-/g, '').substring(0, 16).toUpperCase()}`;
  
  totpSecrets.set(userId, mockSecret);

  // Generate backup codes
  const backupCodes = Array.from({ length: 8 }, () => 
    Math.random().toString(36).substring(2, 10).toUpperCase()
  );

  return {
    secret: mockSecret,
    qrCodeUrl: `otpauth://totp/AudiFi:user@audifi.io?secret=${mockSecret}&issuer=AudiFi`,
    backupCodes,
  };
}

/**
 * Verify a TOTP code for 2FA
 * 
 * TODO: Implement actual TOTP verification
 */
export async function verifyTOTP(userId: string, code: string): Promise<boolean> {
  const secret = totpSecrets.get(userId);
  
  if (!secret) {
    return false;
  }

  // TODO: Implement actual TOTP verification
  // For development, accept code "123456"
  if (code === '123456') {
    return true;
  }

  return false;
}

/**
 * Set up passkey-based 2FA for a user
 * 
 * TODO: Implement WebAuthn passkey registration
 */
export async function setupPasskey(userId: string): Promise<{
  challenge: string;
  rpId: string;
  rpName: string;
}> {
  // TODO: Implement WebAuthn registration options
  return {
    challenge: uuidv4(),
    rpId: 'audifi.io',
    rpName: 'AudiFi',
  };
}

/**
 * Verify a passkey for 2FA
 * 
 * TODO: Implement WebAuthn assertion verification
 */
export async function verifyPasskey(
  _userId: string,
  _credential: unknown
): Promise<boolean> {
  // TODO: Implement WebAuthn assertion verification
  return false;
}

/**
 * Enable 2FA for a user after successful setup and verification
 */
export async function enable2FA(
  userId: string,
  method: TwoFactorMethod
): Promise<User | null> {
  const user = users.get(userId);
  
  if (!user) {
    return null;
  }

  const updatedUser: User = {
    ...user,
    twoFactorEnabled: true,
    twoFactorMethod: method,
    updatedAt: new Date().toISOString(),
  };

  users.set(userId, updatedUser);
  
  return updatedUser;
}

/**
 * Disable 2FA for a user
 */
export async function disable2FA(userId: string): Promise<User | null> {
  const user = users.get(userId);
  
  if (!user) {
    return null;
  }

  const updatedUser: User = {
    ...user,
    twoFactorEnabled: false,
    twoFactorMethod: undefined,
    updatedAt: new Date().toISOString(),
  };

  users.set(userId, updatedUser);
  totpSecrets.delete(userId);
  
  return updatedUser;
}

// =============================================================================
// WALLET ASSOCIATION
// =============================================================================

/**
 * Associate a wallet address with a user account
 * 
 * TODO: Implement actual wallet signature verification
 */
export async function associateWallet(
  userId: string,
  walletAddress: string,
  chain: BlockchainNetwork,
  _signature: string,
  _message: string
): Promise<User | null> {
  const user = users.get(userId);
  
  if (!user) {
    return null;
  }

  // TODO: Verify the signature to ensure the user owns the wallet
  // This should verify that `signature` is a valid signature of `message`
  // signed by `walletAddress`

  // Check if wallet is already associated
  const existingWallet = user.walletAddresses.find(
    (w) => w.address.toLowerCase() === walletAddress.toLowerCase() && w.chain === chain
  );

  if (existingWallet) {
    return user; // Already associated
  }

  const newWallet: WalletAssociation = {
    address: walletAddress,
    chain,
    isPrimary: user.walletAddresses.length === 0, // First wallet is primary
    linkedAt: new Date().toISOString(),
  };

  const updatedUser: User = {
    ...user,
    walletAddresses: [...user.walletAddresses, newWallet],
    updatedAt: new Date().toISOString(),
  };

  users.set(userId, updatedUser);
  
  return updatedUser;
}

/**
 * Remove a wallet association from a user account
 */
export async function removeWallet(
  userId: string,
  walletAddress: string,
  chain: BlockchainNetwork
): Promise<User | null> {
  const user = users.get(userId);
  
  if (!user) {
    return null;
  }

  const updatedWallets = user.walletAddresses.filter(
    (w) => !(w.address.toLowerCase() === walletAddress.toLowerCase() && w.chain === chain)
  );

  // If we removed the primary wallet, make the first remaining one primary
  if (updatedWallets.length > 0 && !updatedWallets.some((w) => w.isPrimary)) {
    updatedWallets[0].isPrimary = true;
  }

  const updatedUser: User = {
    ...user,
    walletAddresses: updatedWallets,
    updatedAt: new Date().toISOString(),
  };

  users.set(userId, updatedUser);
  
  return updatedUser;
}

/**
 * Set a wallet as the primary wallet for a user
 */
export async function setPrimaryWallet(
  userId: string,
  walletAddress: string,
  chain: BlockchainNetwork
): Promise<User | null> {
  const user = users.get(userId);
  
  if (!user) {
    return null;
  }

  const updatedWallets = user.walletAddresses.map((w) => ({
    ...w,
    isPrimary: w.address.toLowerCase() === walletAddress.toLowerCase() && w.chain === chain,
  }));

  const updatedUser: User = {
    ...user,
    walletAddresses: updatedWallets,
    updatedAt: new Date().toISOString(),
  };

  users.set(userId, updatedUser);
  
  return updatedUser;
}

// =============================================================================
// SSO INTEGRATION
// =============================================================================

/**
 * Initiate Google OAuth flow
 * 
 * TODO: Implement Google OAuth
 */
export async function initiateGoogleSSO(): Promise<{ redirectUrl: string }> {
  // TODO: Build actual Google OAuth URL with proper scopes and state
  return {
    redirectUrl: 'https://accounts.google.com/o/oauth2/v2/auth?client_id=stub&redirect_uri=stub',
  };
}

/**
 * Handle Google OAuth callback
 * 
 * TODO: Implement Google OAuth callback handling
 */
export async function handleGoogleCallback(_code: string): Promise<AuthSession | null> {
  // TODO: Exchange code for tokens, fetch user info, create/update user
  return null;
}

/**
 * Initiate Microsoft OAuth flow
 * 
 * TODO: Implement Microsoft OAuth
 */
export async function initiateMicrosoftSSO(): Promise<{ redirectUrl: string }> {
  // TODO: Build actual Microsoft OAuth URL
  return {
    redirectUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=stub',
  };
}

/**
 * Handle Microsoft OAuth callback
 * 
 * TODO: Implement Microsoft OAuth callback handling
 */
export async function handleMicrosoftCallback(_code: string): Promise<AuthSession | null> {
  // TODO: Exchange code for tokens, fetch user info, create/update user
  return null;
}

// =============================================================================
// USER MANAGEMENT
// =============================================================================

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  name: string;
  role?: 'artist' | 'producer' | 'fan' | 'admin';
}): Promise<User> {
  const user: User = {
    id: `user_${uuidv4()}`,
    email: data.email,
    name: data.name,
    role: data.role || 'fan',
    walletAddresses: [],
    subscriptionPlan: 'FREE',
    subscriptionStatus: 'active',
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.set(user.id, user);
  
  return user;
}

/**
 * Find a user by email
 */
export function findUserByEmail(email: string): User | undefined {
  return Array.from(users.values()).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
}

/**
 * Find a user by ID
 */
export function findUserById(id: string): User | undefined {
  return users.get(id);
}

/**
 * Find a user by wallet address
 */
export function findUserByWallet(walletAddress: string): User | undefined {
  return Array.from(users.values()).find((u) =>
    u.walletAddresses.some(
      (w) => w.address.toLowerCase() === walletAddress.toLowerCase()
    )
  );
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'role'>>
): Promise<User | null> {
  const user = users.get(userId);
  
  if (!user) {
    return null;
  }

  const updatedUser: User = {
    ...user,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  users.set(userId, updatedUser);
  
  return updatedUser;
}

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

/**
 * Create a new session for a user
 */
function createSession(userId: string): AuthSession {
  const session: AuthSession = {
    userId,
    token: `session_${uuidv4()}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    refreshToken: `refresh_${uuidv4()}`,
  };

  sessions.set(session.token, session);
  
  return session;
}

/**
 * Validate a session token
 */
export function validateSession(token: string): AuthSession | null {
  const session = sessions.get(token);
  
  if (!session) {
    return null;
  }

  if (new Date() > new Date(session.expiresAt)) {
    sessions.delete(token);
    return null;
  }

  return session;
}

/**
 * Invalidate a session (logout)
 */
export function invalidateSession(token: string): boolean {
  return sessions.delete(token);
}

/**
 * Refresh a session using refresh token
 */
export async function refreshSession(refreshToken: string): Promise<AuthSession | null> {
  const existingSession = Array.from(sessions.values()).find(
    (s) => s.refreshToken === refreshToken
  );

  if (!existingSession) {
    return null;
  }

  // Delete old session
  sessions.delete(existingSession.token);

  // Create new session
  return createSession(existingSession.userId);
}
