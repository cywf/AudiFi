/**
 * Auth Service Tests
 * 
 * Tests for JWT token generation and validation
 */

import { describe, it, expect } from 'vitest';
import { generateAccessToken, verifyAccessToken, validateSession } from '../services/authService.js';

describe('AuthService', () => {
  describe('JWT Token Management', () => {
    const testUserId = 'user_test_123';
    const testEmail = 'test@audifi.io';
    const testRole = 'artist' as const;

    it('should generate a valid JWT access token', () => {
      const token = generateAccessToken(testUserId, testEmail, testRole);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should verify a valid JWT token', () => {
      const token = generateAccessToken(testUserId, testEmail, testRole);
      const payload = verifyAccessToken(token);
      
      expect(payload).toBeDefined();
      expect(payload?.sub).toBe(testUserId);
      expect(payload?.email).toBe(testEmail);
      expect(payload?.role).toBe(testRole);
    });

    it('should return null for invalid JWT token', () => {
      const payload = verifyAccessToken('invalid.token.here');
      
      expect(payload).toBeNull();
    });

    it('should return null for empty token', () => {
      const payload = verifyAccessToken('');
      
      expect(payload).toBeNull();
    });

    it('should validate session from JWT token', () => {
      const token = generateAccessToken(testUserId, testEmail, testRole);
      const session = validateSession(token);
      
      expect(session).toBeDefined();
      expect(session?.userId).toBe(testUserId);
      expect(session?.email).toBe(testEmail);
      expect(session?.role).toBe(testRole);
    });

    it('should return null for invalid session token', () => {
      const session = validateSession('invalid.token');
      
      expect(session).toBeNull();
    });
  });
});
