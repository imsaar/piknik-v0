/**
 * Simplified Test - Core Identifier Generation
 * 
 * This test verifies that our event code and token generation functions
 * never return undefined values.
 */

import { generateEventCode, generateSecureToken } from '../lib/utils';

// Simple test suite
const runTests = () => {
  console.log('\n=== Running Simplified Tests ===\n');
  let passed = 0;
  let failed = 0;
  
  // Test 1: Event Code Generation
  try {
    console.log('Test 1: Event code generation');
    const eventCode = generateEventCode();
    console.log(`Generated event code: ${eventCode}`);
    
    if (eventCode === undefined) {
      throw new Error('Event code is undefined');
    }
    
    if (typeof eventCode !== 'string') {
      throw new Error(`Event code is not a string, got ${typeof eventCode}`);
    }
    
    if (eventCode.length !== 9) { // 4 chars + hyphen + 4 chars
      throw new Error(`Event code has incorrect length: ${eventCode.length}, expected 9`);
    }
    
    // Check format: XXXX-XXXX
    if (!/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/.test(eventCode)) {
      throw new Error(`Event code has incorrect format: ${eventCode}`);
    }
    
    console.log('✅ Test 1 passed');
    passed++;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`❌ Test 1 failed: ${error.message}`);
    failed++;
  }
  
  // Test 2: Event Code Uniqueness
  try {
    console.log('\nTest 2: Event code uniqueness');
    const codes = new Set<string>();
    
    // Generate 100 codes and check for uniqueness
    for (let i = 0; i < 100; i++) {
      const code = generateEventCode();
      
      if (code === undefined) {
        throw new Error(`Event code is undefined at iteration ${i}`);
      }
      
      if (codes.has(code)) {
        throw new Error(`Duplicate event code detected: ${code} at iteration ${i}`);
      }
      
      codes.add(code);
    }
    
    console.log(`Generated ${codes.size} unique event codes`);
    console.log('✅ Test 2 passed');
    passed++;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`❌ Test 2 failed: ${error.message}`);
    failed++;
  }
  
  // Test 3: Secure Token Generation
  try {
    console.log('\nTest 3: Secure token generation');
    const token = generateSecureToken();
    console.log(`Generated token: ${token.substring(0, 10)}...${token.substring(token.length - 10)}`);
    
    if (token === undefined) {
      throw new Error('Token is undefined');
    }
    
    if (typeof token !== 'string') {
      throw new Error(`Token is not a string, got ${typeof token}`);
    }
    
    if (token.length !== 64) { // 32 bytes = 64 hex chars
      throw new Error(`Token has incorrect length: ${token.length}, expected 64`);
    }
    
    // Check format: hex string
    if (!/^[0-9a-f]{64}$/.test(token)) {
      throw new Error(`Token has incorrect format: ${token}`);
    }
    
    console.log('✅ Test 3 passed');
    passed++;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`❌ Test 3 failed: ${error.message}`);
    failed++;
  }
  
  // Test 4: Secure Token Uniqueness
  try {
    console.log('\nTest 4: Secure token uniqueness');
    const tokens = new Set<string>();
    
    // Generate 100 tokens and check for uniqueness
    for (let i = 0; i < 100; i++) {
      const token = generateSecureToken();
      
      if (token === undefined) {
        throw new Error(`Token is undefined at iteration ${i}`);
      }
      
      if (tokens.has(token)) {
        throw new Error(`Duplicate token detected at iteration ${i}`);
      }
      
      tokens.add(token);
    }
    
    console.log(`Generated ${tokens.size} unique tokens`);
    console.log('✅ Test 4 passed');
    passed++;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`❌ Test 4 failed: ${error.message}`);
    failed++;
  }
  
  // Test 5: Creating potluck with event code (simulated)
  try {
    console.log('\nTest 5: Simulating potluck creation');
    const eventCode = generateEventCode();
    const adminToken = generateSecureToken();
    
    if (!eventCode || !adminToken) {
      throw new Error('Generated identifiers are empty or undefined');
    }
    
    // Simulate database insert
    const insertParams = [eventCode, adminToken, 'Test Potluck', new Date(), null, null, 'test@example.com'];
    
    // Check parameters
    if (insertParams[0] === undefined) {
      throw new Error('Event code parameter is undefined');
    }
    
    if (insertParams[1] === undefined) {
      throw new Error('Admin token parameter is undefined');
    }
    
    console.log(`Simulated insert with event code: ${eventCode}`);
    console.log('✅ Test 5 passed');
    passed++;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error(`❌ Test 5 failed: ${error.message}`);
    failed++;
  }
  
  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${passed + failed}`);
  
  if (failed > 0) {
    console.error('\n❌ Some tests failed');
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed');
    process.exit(0);
  }
};

// Run the tests
runTests(); 