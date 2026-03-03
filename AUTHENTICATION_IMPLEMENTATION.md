# 🔐 Authentication Implementation Guide

## 🎯 Overview

We'll implement a simple authentication system that:
- ✅ Works locally (no backend needed initially)
- ✅ Stores users in localStorage
- ✅ Can be upgraded to AWS Cognito later
- ✅ Takes ~1 hour to implement

---

## 📋 What We'll Build

### Features:
1. **Register** - Create new account
2. **Login** - Sign in with email/password
3. **Logout** - Sign out
4. **Protected Routes** - Only logged-in users can access app
5. **User Profile** - Show user name in header
6. **Persistent Session** - Stay logged in after refresh

### User Flow:
```
New User → Register → Login → Use App
Returning User → Login → Use App
```

---

## 🏗️ Architecture

### Phase 1: Local (Browser Storage)
```
User → Login Form → localStorage → App
```

**Pros:**
- ✅ No backend needed
- ✅ Works immediately
- ✅ Good for prototype

**Cons:**
- ⚠️ Not secure (data in browser)
- ⚠️ Lost if user clears browser
- ⚠️ No cross-device sync

### Phase 2: AWS Cognito (Production)
```
User → Login Form → AWS Cognito → JWT Token → App
```

**Pros:**
- ✅ Secure
- ✅ Cross-device sync
- ✅ Password reset, email verification
- ✅ Production-ready

---

## 💻 Implementation Steps

### Step 1: Create Auth Types

**File:** `src/types/auth.ts`

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'vendor' | 'buyer';
  preferredLanguage: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'vendor' | 'buyer';
  preferredLanguage: string;
}
```

---

### Step 2: Create Auth Service

**File:** `src/services/authService.ts`

```typescript
import { User, LoginCredentials, RegisterData } from '../types/auth';

const STORAGE_KEY = 'ektamandi_users';
const SESSION_KEY = 'ektamandi_session';

// Simple password hashing (for demo only - use bcrypt in production)
function hashPassword(password: string): string {
  // This is NOT secure - just for demo!
  return btoa(password);
}

function verifyPassword(password: string, hash: string): boolean {
  return btoa(password) === hash;
}

// Get all users from localStorage
function getUsers(): Record<string, { user: User; passwordHash: string }> {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

// Save users to localStorage
function saveUsers(users: Record<string, { user: User; passwordHash: string }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

// Register new user
export function register(data: RegisterData): { success: boolean; error?: string; user?: User } {
  const users = getUsers();

  // Check if email already exists
  if (Object.values(users).some(u => u.user.email === data.email)) {
    return { success: false, error: 'Email already registered' };
  }

  // Create new user
  const user: User = {
    id: `user_${Date.now()}`,
    email: data.email,
    name: data.name,
    phone: data.phone,
    role: data.role,
    preferredLanguage: data.preferredLanguage,
    createdAt: new Date().toISOString()
  };

  // Save user with hashed password
  users[user.id] = {
    user,
    passwordHash: hashPassword(data.password)
  };
  saveUsers(users);

  return { success: true, user };
}

// Login user
export function login(credentials: LoginCredentials): { success: boolean; error?: string; user?: User } {
  const users = getUsers();

  // Find user by email
  const userEntry = Object.values(users).find(u => u.user.email === credentials.email);

  if (!userEntry) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Verify password
  if (!verifyPassword(credentials.password, userEntry.passwordHash)) {
    return { success: false, error: 'Invalid email or password' };
  }

  // Save session
  localStorage.setItem(SESSION_KEY, JSON.stringify(userEntry.user));

  return { success: true, user: userEntry.user };
}

// Logout user
export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

// Get current user
export function getCurrentUser(): User | null {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// Update user profile
export function updateProfile(userId: string, updates: Partial<User>): { success: boolean; error?: string } {
  const users = getUsers();
  
  if (!users[userId]) {
    return { success: false, error: 'User not found' };
  }

  users[userId].user = { ...users[userId].user, ...updates };
  saveUsers(users);

  // Update session if it's the current user
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.id === userId) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(users[userId].user));
  }

  return { success: true };
}
```

---

### Step 3: Create Auth Context

**File:** `src/contexts/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types/auth';
import { getCurrentUser, logout as logoutService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check for existing session on mount
    const user = getCurrentUser();
    setAuthState({
      user,
      isAuthenticated: !!user,
      isLoading: false
    });
  }, []);

  const login = (user: User) => {
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false
    });
  };

  const logout = () => {
    logoutService();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
  };

  const updateUser = (user: User) => {
    setAuthState(prev => ({
      ...prev,
      user
    }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

---

### Step 4: Create Login Component

**File:** `src/components/Login.tsx`

```typescript
import { useState } from 'react';
import { LogIn, Mail, Lock } from 'lucide-react';
import { login as loginService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export function Login({ onSwitchToRegister }: LoginProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = loginService({ email, password });

    if (result.success && result.user) {
      login(result.user);
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-emerald-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🇮🇳</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">EktaMandi</h1>
          </div>
          <p className="text-slate-600">Unity in Diversity, Prosperity in Trade</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Register here
              </button>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-1">Demo Account:</p>
          <p>Email: demo@ektamandi.com</p>
          <p>Password: demo123</p>
        </div>
      </div>
    </div>
  );
}
```

---

### Step 5: Create Register Component

**File:** `src/components/Register.tsx`

```typescript
import { useState } from 'react';
import { UserPlus, Mail, Lock, User as UserIcon, Phone } from 'lucide-react';
import { register as registerService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import { Language } from '../types';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export function Register({ onSwitchToLogin }: RegisterProps) {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    role: 'vendor' as 'vendor' | 'buyer',
    preferredLanguage: 'en' as Language
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const result = registerService({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone,
      role: formData.role,
      preferredLanguage: formData.preferredLanguage
    });

    if (result.success && result.user) {
      // Auto-login after registration
      const loginResult = await import('../services/authService').then(m => 
        m.login({ email: formData.email, password: formData.password })
      );
      
      if (loginResult.success && loginResult.user) {
        login(loginResult.user);
      }
    } else {
      setError(result.error || 'Registration failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-emerald-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🇮🇳</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-800">EktaMandi</h1>
          </div>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="Rajesh Kumar"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="+91-9876543210"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'vendor' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.role === 'vendor'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium">Vendor</div>
                  <div className="text-xs text-slate-500">I sell products</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'buyer' })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.role === 'buyer'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-medium">Buyer</div>
                  <div className="text-xs text-slate-500">I buy products</div>
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-5 h-5" />
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Step 6: Update App.tsx

**File:** `src/App.tsx`

```typescript
import { useState } from 'react';
import { Header, Footer, TabNavigation } from './components';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onSwitchToRegister={() => setShowRegister(true)} />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50/30 via-white to-emerald-50/30">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <TabNavigation />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
```

---

### Step 7: Update Header with Logout

**File:** `src/components/Header.tsx` (add logout button)

```typescript
// Add this import
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Inside Header component, add:
const { user, logout } = useAuth();

// Add logout button in header (after language selector):
<button
  onClick={logout}
  className="flex items-center gap-2 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all text-rose-700"
>
  <LogOut className="w-4 h-4" />
  <span className="text-sm font-medium hidden sm:inline">Logout</span>
</button>

// Show user name:
<div className="text-sm text-slate-600">
  Welcome, <span className="font-medium text-slate-800">{user?.name}</span>
</div>
```

---

## 🧪 Testing

### Test Registration:
1. Open app
2. Click "Register here"
3. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
   - Role: Vendor
4. Click "Create Account"
5. Should auto-login and show app

### Test Login:
1. Logout
2. Login with:
   - Email: test@example.com
   - Password: test123
3. Should show app

### Test Session Persistence:
1. Login
2. Refresh page (F5)
3. Should stay logged in

---

## 🚀 Next Steps

### Phase 2: Upgrade to AWS Cognito

When ready for production, replace localStorage with AWS Cognito:

1. Install AWS Amplify:
```bash
npm install aws-amplify @aws-amplify/ui-react
```

2. Configure Cognito in AWS Console

3. Update authService.ts to use Cognito API

4. All UI components stay the same!

---

## 📝 Summary

**What you get:**
- ✅ Login/Register forms
- ✅ User sessions
- ✅ Protected routes
- ✅ Logout functionality
- ✅ User profile in header
- ✅ Works locally (no backend)

**Time to implement:** ~1 hour

**Ready to start?** Let me know and I'll help you implement it step by step!
