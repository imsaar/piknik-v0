// Mock the database connection and utility functions
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

jest.mock('../../lib/db', () => ({
  query: jest.fn(),
}));

jest.mock('../../lib/utils', () => ({
  generateEventCode: jest.fn().mockReturnValue('TEST-CODE'),
  generateSecureToken: jest.fn().mockReturnValue('test-secure-token'),
}));

import { query } from '../../lib/db';
import { createPotluck, updateNotificationSettings, signUpForItem } from '../../lib/actions';
import { generateEventCode, generateSecureToken } from '../../lib/utils';

describe('Potluck Action Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock successful database insertion for potlucks
    (query as jest.Mock).mockImplementation((sql: string, params: any[]) => {
      if (sql.includes('INSERT INTO potlucks')) {
        return Promise.resolve({ 
          rows: [{ 
            id: 123,
            event_code: 'TEST-CODE',
            admin_token: 'test-secure-token'
          }] 
        });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  describe('createPotluck', () => {
    it('should create a potluck with event code and admin token', async () => {
      const potluckData = {
        name: 'Test Potluck',
        date: new Date(),
        adminEmail: 'test@example.com',
      };

      const result = await createPotluck(potluckData);

      // Check that the utility functions were called
      expect(generateEventCode).toHaveBeenCalled();
      expect(generateSecureToken).toHaveBeenCalled();

      // Check that the query was called with correct parameters
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO potlucks'),
        expect.arrayContaining(['TEST-CODE', 'test-secure-token'])
      );

      // Check the return value format
      expect(result).toEqual({
        eventCode: 'TEST-CODE',
        adminToken: 'test-secure-token'
      });

      // Most importantly, verify that eventCode and adminToken are never undefined
      expect(result.eventCode).toBeDefined();
      expect(result.adminToken).toBeDefined();
    });

    it('should handle items if provided', async () => {
      const potluckData = {
        name: 'Test Potluck',
        date: new Date(),
        adminEmail: 'test@example.com',
        items: [
          { name: 'Item 1', quantity: 2 },
          { name: 'Item 2', quantity: 3 }
        ]
      };

      await createPotluck(potluckData);

      // First query is for potluck creation
      expect(query).toHaveBeenCalledTimes(3);
      
      // Second and third queries are for item creation
      expect(query).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('INSERT INTO potluck_items'),
        expect.arrayContaining([123, 'Item 1', 2])
      );
      
      expect(query).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining('INSERT INTO potluck_items'),
        expect.arrayContaining([123, 'Item 2', 3])
      );
    });

    it('should handle errors gracefully', async () => {
      // Mock a database error
      (query as jest.Mock).mockRejectedValueOnce(new Error('Database error'));

      const potluckData = {
        name: 'Test Potluck',
        date: new Date(),
        adminEmail: 'test@example.com',
      };

      await expect(createPotluck(potluckData)).rejects.toThrow('Database error');
    });

    // This test is critical for detecting the undefined issue
    it('should never return undefined for eventCode or adminToken', async () => {
      // Test with various mock implementations of generateEventCode
      (generateEventCode as jest.Mock).mockReturnValueOnce('CODE-1');
      (generateSecureToken as jest.Mock).mockReturnValueOnce('token-1');
      
      // Mock the database to return the values we're generating
      (query as jest.Mock).mockResolvedValueOnce({ 
        rows: [{ 
          id: 123,
          event_code: 'CODE-1',
          admin_token: 'token-1'
        }] 
      });

      const result1 = await createPotluck({
        name: 'Test Potluck 1',
        date: new Date(),
        adminEmail: 'test1@example.com',
      });

      expect(result1.eventCode).toBe('CODE-1');
      expect(result1.adminToken).toBe('token-1');

      // Try another case
      (generateEventCode as jest.Mock).mockReturnValueOnce('');  // Empty string
      (generateSecureToken as jest.Mock).mockReturnValueOnce('');  // Empty string
      
      // Mock empty response from database
      (query as jest.Mock).mockResolvedValueOnce({ 
        rows: [{ 
          id: 124,
          event_code: '',
          admin_token: ''
        }] 
      });

      const result2 = await createPotluck({
        name: 'Test Potluck 2',
        date: new Date(),
        adminEmail: 'test2@example.com',
      });

      // Even with empty strings, we should not get undefined
      expect(result2.eventCode).toBe('');
      expect(result2.adminToken).toBe('');
      expect(result2.eventCode).not.toBeUndefined();
      expect(result2.adminToken).not.toBeUndefined();
    });
  });
}); 