/**
 * Shared OTP Storage
 * 
 * Centralized in-memory storage for OTP codes.
 * In production, replace with database storage.
 */

interface OTPData {
  otp: string;
  expiresAt: number;
}

// Shared in-memory storage (use database in production)
const otpStore = new Map<string, OTPData>();

/**
 * Store OTP for an email
 */
export function storeOTP(email: string, otp: string, expirationMinutes: number = 10): void {
  const expiresAt = Date.now() + expirationMinutes * 60 * 1000;
  otpStore.set(email.toLowerCase(), { otp, expiresAt });
}

/**
 * Get OTP for an email
 */
export function getOTP(email: string): OTPData | undefined {
  const normalizedEmail = email.toLowerCase();
  const data = otpStore.get(normalizedEmail);

  return data;
}

/**
 * Delete OTP for an email
 */
export function deleteOTP(email: string): boolean {
  const deleted = otpStore.delete(email.toLowerCase());
  if (deleted) {
    
  }
  return deleted;
}

/**
 * Check if OTP exists and is valid
 */
export function isOTPValid(email: string, otp: string): { valid: boolean; error?: string } {
  const stored = getOTP(email);

  if (!stored) {
    return { valid: false, error: 'No OTP found. Please request a new code.' };
  }

  if (Date.now() > stored.expiresAt) {
    deleteOTP(email);
    return { valid: false, error: 'OTP has expired. Please request a new code.' };
  }

  if (stored.otp !== otp) {
    return { valid: false, error: 'Invalid OTP. Please try again.' };
  }

  return { valid: true };
}

/**
 * Clean up expired OTPs (run periodically)
 */
export function cleanupExpiredOTPs(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
      cleaned++;
    }
  }

  if (cleaned > 0) {
  }

  return cleaned;
}

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredOTPs, 5 * 60 * 1000);
}
