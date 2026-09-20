// Server-side In-App OTP Store with expiration

export interface OtpRecord {
  code: string;
  email: string;
  expiresAt: number;
  name?: string;
  role?: string;
  phone?: string;
  city?: string;
}

// Global in-memory OTP cache across API requests
const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, OtpRecord>;
};

export const otpStore = globalForOtp.otpStore || new Map<string, OtpRecord>();
if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpStore = otpStore;
}

/**
 * Generate a 6-digit OTP code and store it for 10 minutes
 */
export function generateOtp(email: string, metadata?: { name?: string; role?: string; phone?: string; city?: string }): string {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Generate random 6-digit numeric OTP (e.g. 582914)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore.set(normalizedEmail, {
    code,
    email: normalizedEmail,
    expiresAt,
    name: metadata?.name,
    role: metadata?.role,
    phone: metadata?.phone,
    city: metadata?.city,
  });

  return code;
}

/**
 * Verify if the entered 6-digit code matches the stored OTP
 */
export function verifyStoredOtp(email: string, token: string): { valid: boolean; error?: string; record?: OtpRecord } {
  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record) {
    return { valid: false, error: 'No verification code was requested for this email. Please request a new code.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return { valid: false, error: 'Verification code has expired. Please request a new 6-digit code.' };
  }

  if (token.trim() !== record.code) {
    return { valid: false, error: 'Invalid verification code. Please check your email and enter the exact 6-digit code.' };
  }

  // OTP matched! Consume the code so it cannot be reused
  otpStore.delete(normalizedEmail);
  return { valid: true, record };
}
