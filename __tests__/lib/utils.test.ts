import { generateEventCode, generateSecureToken, generateIdToken } from '../../lib/utils';
import { describe, expect, it } from '@jest/globals';

describe('Identifier Generation Functions', () => {
  describe('generateEventCode', () => {
    it('should generate a properly formatted event code', () => {
      const eventCode = generateEventCode();
      
      // Check format: XXXX-XXXX
      expect(eventCode).toMatch(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/);
    });

    it('should never return undefined', () => {
      // Test multiple times to ensure reliability
      for (let i = 0; i < 100; i++) {
        const eventCode = generateEventCode();
        expect(eventCode).toBeDefined();
        expect(typeof eventCode).toBe('string');
        expect(eventCode.length).toBe(9); // 4 chars + hyphen + 4 chars
      }
    });

    it('should generate unique codes', () => {
      const codes = new Set();
      // Generate a bunch of codes and check for uniqueness
      for (let i = 0; i < 1000; i++) {
        const code = generateEventCode();
        expect(codes.has(code)).toBe(false); // Should not have duplicates
        codes.add(code);
      }
    });
  });

  describe('generateSecureToken', () => {
    it('should generate a secure token of correct length', () => {
      const token = generateSecureToken();
      // Default length is 32 bytes = 64 hex chars
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate tokens of specified length', () => {
      const token16 = generateSecureToken(16);
      expect(token16).toMatch(/^[0-9a-f]{32}$/); // 16 bytes = 32 hex chars
      
      const token8 = generateSecureToken(8);
      expect(token8).toMatch(/^[0-9a-f]{16}$/); // 8 bytes = 16 hex chars
    });

    it('should never return undefined', () => {
      // Test multiple times to ensure reliability
      for (let i = 0; i < 100; i++) {
        const token = generateSecureToken();
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBe(64);
      }
    });

    it('should generate unique tokens', () => {
      const tokens = new Set();
      // Generate a bunch of tokens and check for uniqueness
      for (let i = 0; i < 1000; i++) {
        const token = generateSecureToken();
        expect(tokens.has(token)).toBe(false); // Should not have duplicates
        tokens.add(token);
      }
    });
  });

  describe('generateIdToken', () => {
    it('should generate a consistent token for the same ID and salt', () => {
      const id = '12345';
      const salt = 'test-salt';
      
      const token1 = generateIdToken(id, salt);
      const token2 = generateIdToken(id, salt);
      
      expect(token1).toBe(token2);
    });

    it('should generate different tokens for different IDs with the same salt', () => {
      const salt = 'test-salt';
      
      const token1 = generateIdToken('12345', salt);
      const token2 = generateIdToken('12346', salt);
      
      expect(token1).not.toBe(token2);
    });

    it('should generate different tokens for the same ID with different salts', () => {
      const id = '12345';
      
      const token1 = generateIdToken(id, 'salt1');
      const token2 = generateIdToken(id, 'salt2');
      
      expect(token1).not.toBe(token2);
    });

    it('should never return undefined', () => {
      const id = '12345';
      const salt = 'test-salt';
      
      const token = generateIdToken(id, salt);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });
  });
}); 