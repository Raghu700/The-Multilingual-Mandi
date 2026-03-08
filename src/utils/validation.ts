/**
 * Validation Utilities
 * Provides validation functions for mobile numbers, OTP, email, etc.
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateMobileNumber(number: string): ValidationResult {
  // Remove spaces and dashes
  const cleaned = number.replace(/[\s-]/g, '');

  // Check if exactly 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'mobile_number_invalid'
    };
  }

  // Check if starts with valid Indian mobile prefix (6-9)
  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      error: 'mobile_number_invalid_prefix'
    };
  }

  return { isValid: true };
}

export function validateOTP(otp: string): ValidationResult {
  // Remove spaces
  const cleaned = otp.replace(/\s/g, '');

  // Check if exactly 6 digits
  if (!/^\d{6}$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'otp_invalid'
    };
  }

  return { isValid: true };
}

export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'invalid_credentials'
    };
  }

  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < 6) {
    return {
      isValid: false,
      error: 'password_min_length'
    };
  }

  return { isValid: true };
}
