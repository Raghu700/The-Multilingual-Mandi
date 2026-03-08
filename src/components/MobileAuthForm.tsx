/**
 * Mobile Auth Form Component
 * Handles mobile number + OTP authentication
 */

import { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { otpService } from '../services/otpService';
import { validateMobileNumber, validateOTP } from '../utils/validation';

interface MobileAuthFormProps {
  mode: 'login' | 'register';
  onSuccess: (data: { mobile: string; otp: string }) => void;
  onSwitchToEmail?: () => void;
}

export function MobileAuthForm({ onSuccess, onSwitchToEmail }: MobileAuthFormProps) {
  const { t } = useLanguage();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Validation states
  const mobileValidation = validateMobileNumber(mobile);
  const otpValidation = validateOTP(otp);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendOTP = async () => {
    if (!mobileValidation.isValid) {
      setError(t(mobileValidation.error || 'mobile_number_invalid'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await otpService.sendOTP(mobile);
      setSessionId(result.sessionId);
      setIsOtpSent(true);
      setCountdown(30);
      setError('');
    } catch (err) {
      setError(t('auth_error_generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValidation.isValid) {
      setError(t(otpValidation.error || 'otp_invalid'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await otpService.verifyOTP(sessionId, otp);
      
      if (result.isValid) {
        onSuccess({ mobile, otp });
      } else {
        if (result.attemptsRemaining === 0) {
          setError(t('otp_max_attempts'));
          setIsOtpSent(false);
          setOtp('');
        } else {
          setError(t('otp_invalid'));
        }
      }
    } catch (err) {
      setError(t('auth_error_generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await otpService.resendOTP(sessionId);
      
      if (result.success) {
        setCountdown(30);
        setError('');
      } else if (result.retryAfter) {
        setError(t('resend_in', { seconds: result.retryAfter.toString() }));
      }
    } catch (err) {
      setError(t('auth_error_generic'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border-2 border-red-300 rounded-xl text-red-800 text-xs flex items-center gap-2 font-semibold" role="alert">
          <span className="text-base">⚠️</span>
          {error}
        </div>
      )}

      {/* Mobile Number Input */}
      <div>
        <label htmlFor="mobile" className="block text-xs font-semibold text-green-800 mb-1 flex items-center gap-1">
          <span>📱</span>
          {t('mobile_number')}
        </label>
        <div className="relative">
          <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
          <input
            id="mobile"
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            disabled={isOtpSent}
            className={`w-full pl-9 pr-10 py-2 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all min-h-[48px] text-sm font-semibold ${
              mobile && mobileValidation.isValid
                ? 'border-green-500 bg-green-50/50'
                : mobile && !mobileValidation.isValid
                ? 'border-red-500 bg-red-50/50'
                : 'border-green-200 bg-green-50/30'
            } disabled:bg-slate-100 disabled:cursor-not-allowed`}
            placeholder={t('mobile_number_placeholder')}
            aria-invalid={mobile ? !mobileValidation.isValid : undefined}
            aria-describedby={mobile && !mobileValidation.isValid ? 'mobile-error' : undefined}
          />
          {mobile && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {mobileValidation.isValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
          )}
        </div>
        {mobile && !mobileValidation.isValid && (
          <p id="mobile-error" className="mt-1 text-xs text-red-700 font-semibold flex items-center gap-1">
            <span>⚠️</span>
            {t(mobileValidation.error || 'mobile_number_invalid')}
          </p>
        )}
      </div>

      {/* OTP Input (shown after mobile verification) */}
      {isOtpSent && (
        <div>
          <label htmlFor="otp" className="block text-xs font-semibold text-green-800 mb-1 flex items-center gap-1">
            <span>🔒</span>
            {t('otp')}
          </label>
          <p className="text-xs text-green-700 mb-1 font-medium">{t('enter_otp_sent')}</p>
          <div className="relative">
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className={`w-full px-3 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all min-h-[52px] text-sm text-center text-2xl tracking-widest font-bold ${
                otp && otpValidation.isValid
                  ? 'border-green-500 bg-green-50/50'
                  : otp && !otpValidation.isValid
                  ? 'border-red-500 bg-red-50/50'
                  : 'border-green-200 bg-green-50/30'
              }`}
              placeholder={t('otp_placeholder')}
              aria-invalid={otp ? !otpValidation.isValid : undefined}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isOtpSent ? (
        <button
          onClick={handleSendOTP}
          disabled={isLoading || !mobileValidation.isValid}
          className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-xl min-h-[48px] disabled:bg-gray-300 disabled:text-gray-500"
          aria-label={t('send_otp')}
        >
         {t('send_otp')}
        </button>
      ) : (
        <div className="space-y-2">
          <button
            onClick={handleVerifyOTP}
            disabled={isLoading || !otpValidation.isValid}
            className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-xl min-h-[48px] disabled:bg-gray-300 disabled:text-gray-500"
            aria-label={t('verify_otp')}
          >
            <span className="text-lg">✓</span> {t('verify_otp')}
          </button>

          <button
            onClick={handleResendOTP}
            disabled={countdown > 0 || isLoading}
            className="w-full bg-orange-500 text-white font-bold text-sm py-3 px-4 rounded-xl min-h-[44px] disabled:bg-gray-300 disabled:text-gray-500"
            aria-label={countdown > 0 ? t('resend_in', { seconds: countdown.toString() }) : t('resend_otp')}
          >
            {countdown > 0 ? `⏱️ ${t('resend_in', { seconds: countdown.toString() })}` : `🔄 ${t('resend_otp')}`}
          </button>
        </div>
      )}

      {/* Switch to Email */}
      {onSwitchToEmail && (
        <button
          onClick={onSwitchToEmail}
          className="w-full text-green-700 hover:text-green-800 font-semibold text-xs underline min-h-[40px]"
          aria-label={t('use_email_instead')}
        >
          {t('use_email_instead')}
        </button>
      )}
    </div>
  );
}
