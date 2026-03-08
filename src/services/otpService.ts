/**
 * OTP Service
 * Handles OTP generation, verification, and session management
 * Mock implementation for MVP - designed for easy integration with SMS gateways
 */

interface OTPSession {
  mobile: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
}

export interface OTPService {
  sendOTP(mobile: string): Promise<{ sessionId: string; expiresIn: number }>;
  verifyOTP(sessionId: string, otp: string): Promise<{ isValid: boolean; attemptsRemaining: number }>;
  resendOTP(sessionId: string): Promise<{ success: boolean; retryAfter?: number }>;
}

class MockOTPService implements OTPService {
  private sessions = new Map<string, OTPSession>();
  private readonly OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_ATTEMPTS = 3;
  private readonly RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds

  async sendOTP(mobile: string): Promise<{ sessionId: string; expiresIn: number }> {
    const sessionId = this.generateSessionId();
    const otp = this.generateOTP();

    this.sessions.set(sessionId, {
      mobile,
      otp,
      expiresAt: Date.now() + this.OTP_EXPIRY_MS,
      attempts: 0,
      maxAttempts: this.MAX_ATTEMPTS,
      createdAt: Date.now()
    });

    // Log OTP for demo purposes
    console.log(`[MOCK OTP] Mobile: ${mobile}, OTP: ${otp}, SessionId: ${sessionId}`);

    return { 
      sessionId, 
      expiresIn: Math.floor(this.OTP_EXPIRY_MS / 1000) 
    };
  }

  async verifyOTP(sessionId: string, otp: string): Promise<{ isValid: boolean; attemptsRemaining: number }> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return { isValid: false, attemptsRemaining: 0 };
    }

    // Check expiration
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return { isValid: false, attemptsRemaining: 0 };
    }

    // Increment attempts
    session.attempts++;

    // Check max attempts
    if (session.attempts > session.maxAttempts) {
      this.sessions.delete(sessionId);
      return { isValid: false, attemptsRemaining: 0 };
    }

    const isValid = session.otp === otp;

    if (isValid) {
      // Clean up session on successful verification
      this.sessions.delete(sessionId);
    }

    return {
      isValid,
      attemptsRemaining: session.maxAttempts - session.attempts
    };
  }

  async resendOTP(sessionId: string): Promise<{ success: boolean; retryAfter?: number }> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return { success: false };
    }

    // Check cooldown period
    const timeSinceCreation = Date.now() - session.createdAt;
    if (timeSinceCreation < this.RESEND_COOLDOWN_MS) {
      const retryAfter = Math.ceil((this.RESEND_COOLDOWN_MS - timeSinceCreation) / 1000);
      return { success: false, retryAfter };
    }

    // Generate new OTP
    const newOtp = this.generateOTP();
    session.otp = newOtp;
    session.expiresAt = Date.now() + this.OTP_EXPIRY_MS;
    session.attempts = 0;
    session.createdAt = Date.now();

    console.log(`[MOCK OTP RESEND] Mobile: ${session.mobile}, OTP: ${newOtp}`);

    return { success: true };
  }

  private generateOTP(): string {
    // For demo, always return '123456'
    // In production, use: Math.floor(100000 + Math.random() * 900000).toString()
    return '123456';
  }

  private generateSessionId(): string {
    return `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const otpService = new MockOTPService();
