import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { customAlphabet } from 'nanoid';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Create a custom alphabet for readable event codes
// Excluding similar looking characters like O, 0, 1, I, etc.
const eventCodeAlphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const generateNanoId = customAlphabet(eventCodeAlphabet, 8);

/**
 * Generates a readable event code for potlucks
 * Format: XXXX-XXXX (e.g., "ABCD-1234")
 */
export function generateEventCode(): string {
  const id = generateNanoId();
  // Always format as XXXX-XXXX and ensure uppercase
  const formattedId = `${id.slice(0, 4)}-${id.slice(4, 8)}`.toUpperCase();
  return formattedId;
}

/**
 * Generates a secure random token
 * @param length The length of the token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Maps a database ID to a token that can be used in URLs
 * This is a one-way mapping so the original ID cannot be guessed
 * @param id The database ID
 * @param salt A salt for the HMAC
 */
export function generateIdToken(id: number | string, salt: string): string {
  const hmac = crypto.createHmac('sha256', salt);
  hmac.update(String(id));
  return hmac.digest('hex');
}
