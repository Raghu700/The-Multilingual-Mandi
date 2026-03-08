/**
 * Login Component - Farmer-Centric Mobile-First Design
 * Warm, trustworthy, culturally familiar UI for Indian farmers
 */

import { useState } from 'react';
import { LogIn, Mail, Lock, Shield, CheckCircle2 } from 'lucide-react';
import { login as loginService, loginWithMobile, createDemoSession } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { MobileAuthForm } from './MobileAuthForm';
import { DemoAccessCard } from './DemoAccessCard';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export function Login({ onSwitchToRegister }: LoginProps) {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [authMode, setAuthMode] = useState<'mobile' | 'email'>('mobile');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMobileSuccess = async (data: { mobile: string; otp: string }) => {
    setIsLoading(true);
    setError('');

    const result = loginWithMobile(data.mobile, data.otp);

    if (result.success && result.user) {
      login(result.user);
    } else {
      setError(result.error || t('auth_error_generic'));
    }

    setIsLoading(false);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = loginService({ email, password });

    if (result.success && result.user) {
      login(result.user);
    } else {
      setError(result.error || t('invalid_credentials'));
    }

    setIsLoading(false);
  };

  const handleDemoLogin = (_credentials: { mobile: string; otp: string }) => {
    const result = createDemoSession();
    if (result.success && result.user) {
      login(result.user);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-amber-50 via-green-50 to-emerald-50 px-3 sm:px-4 py-4">
      <div className="w-full max-w-md">
         
        {/* Header with Language Selector */}
        <div className="flex items-center justify-end mb-1">
          <img 
              src="/IndiaFlag.png" 
              alt="Indian Flag" 
              className="w-10 h-10 object-contain"
            />
          <LanguageSelector />
        </div>
       
        <div className="text-center mb-3">
          {/* Farmer Illustration */}
          <div className="mb-2 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg border-4 border-white overflow-hidden">
                <img 
                  src="/farmar.png" 
                  alt="Farmer with phone" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-lg">📱</span>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="inline-flex items-center gap-2 mb-1">
           
            <div className="text-center">
              <p className="text-sm text-orange-600 font-semibold">(एकता मंडी)</p>
            </div>
          </div>
          
          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-sm border border-green-200">
              <Shield className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-green-700">Secure</span>
            </div>
            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-sm border border-blue-200">
              <CheckCircle2 className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Verified</span>
            </div>
            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-full shadow-sm border border-orange-200">
              <span className="text-xs">🤖</span>
              <span className="text-xs font-medium text-orange-700">AI</span>
            </div>
          </div>
        </div>

        {/* Demo Access Card */}
        <DemoAccessCard onDemoLogin={handleDemoLogin} />

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-5 border-2 border-green-100">
          {/* Farmer-friendly header */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🌾</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-green-800">{t('welcome_back')}</h2>
              <p className="text-slate-600 text-xs">{t('sign_in_continue')}</p>
            </div>
          </div>

          {error && (
            <div className="mb-3 p-2 bg-rose-50 border-2 border-rose-300 rounded-xl text-rose-700 text-xs flex items-center gap-2" role="alert">
              <span className="text-base">⚠️</span>
              {error}
            </div>
          )}

          {authMode === 'mobile' ? (
            <MobileAuthForm
              mode="login"
              onSuccess={handleMobileSuccess}
              onSwitchToEmail={() => setAuthMode('email')}
            />
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-3">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-green-800 mb-1">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all min-h-[44px] bg-green-50/30 text-sm"
                    placeholder={t('email_placeholder')}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-green-800 mb-1">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all min-h-[44px] bg-green-50/30 text-sm"
                    placeholder={t('password_placeholder')}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 min-h-[48px] text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-4 h-4" />
                {isLoading ? t('signing_in') : t('sign_in')}
              </button>

              {/* Switch to Mobile */}
              <button
                type="button"
                onClick={() => setAuthMode('mobile')}
                className="w-full text-green-700 hover:text-green-800 font-semibold text-xs underline min-h-[40px]"
              >
                {t('use_mobile_instead')}
              </button>
            </form>
          )}

          {/* Register Link */}
          <div className="mt-4 text-center pt-3 border-t-2 border-green-100">
            <p className="text-slate-600 text-xs">
              {t('dont_have_account')}{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-green-700 hover:text-green-800 font-bold"
              >
                {t('register_here')}
              </button>
            </p>
          </div>
        </div>

        {/* Footer with Trust Message */}
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-green-200">
            <p className="text-xs font-semibold text-green-800">
               {t('made_for_bharat')}  
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
