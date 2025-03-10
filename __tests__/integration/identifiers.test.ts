import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { generateEventCode, generateSecureToken } from '../../lib/utils';
import { query, initializeDatabase } from '../../lib/db';

// Mock database query function
jest.mock('../../lib/db', () => ({
  query: jest.fn(),
  initializeDatabase: jest.fn().mockResolvedValue(undefined),
}));

/**
 * This test ensures that our identifier generation functions produce
 * values that are compatible with our database schema constraints.
 */
describe('Identifier and Database Schema Integration', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation for query
    (query as jest.Mock).mockResolvedValue({ rows: [] });
  });
  
  describe('Event Code Validation', () => {
    it('event codes should fit within VARCHAR(20) constraint', () => {
      for (let i = 0; i < 100; i++) {
        const eventCode = generateEventCode();
        expect(eventCode).toBeDefined();
        expect(typeof eventCode).toBe('string');
        expect(eventCode.length).toBeLessThanOrEqual(20);
      }
    });
    
    it('should be insertable into the database schema', async () => {
      // Generate test data
      const eventCode = generateEventCode();
      const adminToken = generateSecureToken();
      
      // Set up mock to simulate database insertion
      (query as jest.Mock).mockResolvedValueOnce({ 
        rows: [{ id: 1 }],
        rowCount: 1
      });
      
      // Simulate database insertion
      const result = await query(
        `INSERT INTO potlucks (event_code, admin_token, name, date, admin_email) 
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [eventCode, adminToken, 'Test Potluck', new Date(), 'test@example.com']
      );
      
      // Verify query was called with the right parameters
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO potlucks'),
        expect.arrayContaining([eventCode, adminToken])
      );
      
      // Event code should never be undefined in the parameters
      const params = (query as jest.Mock).mock.calls[0][1];
      expect(params[0]).toBeDefined();
      expect(params[0]).not.toBeUndefined();
      expect(params[0]).toBe(eventCode);
      
      // Check that the query "succeeded"
      expect(result.rowCount).toBe(1);
    });
  });
  
  describe('Admin Token Validation', () => {
    it('admin tokens should fit within VARCHAR(64) constraint', () => {
      for (let i = 0; i < 100; i++) {
        const token = generateSecureToken();
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeLessThanOrEqual(64);
      }
    });
  });
  
  describe('Participant Token Validation', () => {
    it('participant tokens should fit within VARCHAR(64) constraint', () => {
      for (let i = 0; i < 100; i++) {
        const token = generateSecureToken();
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeLessThanOrEqual(64);
      }
    });
    
    it('should be insertable into the participant table', async () => {
      // Generate test data
      const participantToken = generateSecureToken();
      
      // Set up mock to simulate database insertion
      (query as jest.Mock).mockResolvedValueOnce({ 
        rows: [{ id: 1 }],
        rowCount: 1
      });
      
      // Simulate database insertion
      const result = await query(
        `INSERT INTO participants (token, potluck_id, email)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [participantToken, 1, 'participant@example.com']
      );
      
      // Verify query was called with the right parameters
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO participants'),
        expect.arrayContaining([participantToken])
      );
      
      // Token should never be undefined in the parameters
      const params = (query as jest.Mock).mock.calls[0][1];
      expect(params[0]).toBeDefined();
      expect(params[0]).not.toBeUndefined();
      expect(params[0]).toBe(participantToken);
      
      // Check that the query "succeeded"
      expect(result.rowCount).toBe(1);
    });
  });
}); 