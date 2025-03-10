const crypto = require('crypto');

function cn(...inputs) {
  // This is a simplified version for testing
  return inputs.filter(Boolean).join(' ');
}

// Create a custom alphabet for readable event codes
// Excluding similar looking characters like O, 0, 1, I, etc.
const eventCodeAlphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/**
 * Simple custom implementation to replace nanoid
 * @param {string} alphabet The alphabet to use
 * @param {number} length The length of the ID
 */
function customRandomId(alphabet, length) {
  const bytes = crypto.randomBytes(length);
  let id = '';
  for (let i = 0; i < length; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  return id;
}

/**
 * Generates a readable event code for potlucks
 * Format: XXXX-XXXX (e.g., "ABCD-1234")
 */
function generateEventCode() {
  const id = customRandomId(eventCodeAlphabet, 8);
  // Always format as XXXX-XXXX and ensure uppercase
  const formattedId = `${id.slice(0, 4)}-${id.slice(4, 8)}`.toUpperCase();
  return formattedId;
}

/**
 * Generates a secure random token
 * @param {number} length The length of the token
 */
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Maps a database ID to a token that can be used in URLs
 * This is a one-way mapping so the original ID cannot be guessed
 * @param {number|string} id The database ID
 * @param {string} salt A salt for the HMAC
 */
function generateIdToken(id, salt) {
  const hmac = crypto.createHmac('sha256', salt);
  hmac.update(String(id));
  return hmac.digest('hex');
}

module.exports = {
  cn,
  generateEventCode,
  generateSecureToken,
  generateIdToken
}; 