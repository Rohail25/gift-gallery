import bcrypt from "bcryptjs";

/**
 * Generates a random 6-digit OTP
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hashes an OTP or password using bcrypt
 */
export async function hashOtp(plainText: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainText, salt);
}

/**
 * Verifies an OTP or password against its hash
 */
export async function verifyOtp(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

/**
 * Generates OTP expiry date (default 10 minutes)
 */
export function getOtpExpiry(minutes: number = 10): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Generates delivery OTP expiry (3 hours)
 */
export function getDeliveryOtpExpiry(): Date {
  return new Date(Date.now() + 3 * 60 * 60 * 1000);
}
