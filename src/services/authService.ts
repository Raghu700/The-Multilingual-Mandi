/**
 * Authentication Service
 * Handles user registration, login, and session management
 * Uses localStorage for demo (upgrade to AWS Cognito for production)
 */

import { User, LoginCredentials, RegisterData } from '../types/auth';

const STORAGE_KEY = 'ektamandi_users';
const SESSION_KEY = 'ektamandi_session';
const DEMO_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

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
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    // Handle both old format (direct user) and new format (with expiresAt)
    if (parsed.user) {
      // Check if demo session expired
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return parsed.user;
    }
    return parsed;
  } catch (error) {
    console.error('Error parsing session data:', error);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
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

// Create demo account on first load
export function initializeDemoAccount(): void {
  const users = getUsers();
  
  // Check if demo account exists
  const demoExists = Object.values(users).some(u => u.user.email === 'demo@ektamandi.com');
  
  if (!demoExists) {
    register({
      email: 'demo@ektamandi.com',
      password: 'demo123',
      name: 'Demo User',
      phone: '+91-9876543210',
      role: 'vendor',
      preferredLanguage: 'en'
    });
  }
}

// Login with mobile number and OTP
export function loginWithMobile(mobile: string, _otp: string): { success: boolean; error?: string; user?: User } {
  const users = getUsers();

  // Find user by mobile
  const userEntry = Object.values(users).find(u => u.user.phone === mobile || u.user.phone === `+91-${mobile}`);

  if (!userEntry) {
    // Create new user for mobile login
    const user: User = {
      id: `user_${Date.now()}`,
      email: `${mobile}@mobile.ektamandi.com`,
      name: 'Mobile User',
      phone: mobile,
      role: 'farmer',
      preferredLanguage: 'hi',
      createdAt: new Date().toISOString()
    };

    users[user.id] = {
      user,
      passwordHash: ''
    };
    saveUsers(users);

    // Save session
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return { success: true, user };
  }

  // Save session
  localStorage.setItem(SESSION_KEY, JSON.stringify(userEntry.user));
  return { success: true, user: userEntry.user };
}

// Register with mobile number
export function registerWithMobile(data: { mobile: string; name: string; role: string; preferredLanguage: string }): { success: boolean; error?: string; user?: User } {
  const users = getUsers();

  // Check if mobile already exists
  if (Object.values(users).some(u => u.user.phone === data.mobile || u.user.phone === `+91-${data.mobile}`)) {
    return { success: false, error: 'Mobile number already registered' };
  }

  // Create new user
  const user: User = {
    id: `user_${Date.now()}`,
    email: `${data.mobile}@mobile.ektamandi.com`,
    name: data.name,
    phone: data.mobile,
    role: data.role as any,
    preferredLanguage: data.preferredLanguage as any,
    createdAt: new Date().toISOString()
  };

  // Save user
  users[user.id] = {
    user,
    passwordHash: ''
  };
  saveUsers(users);

  return { success: true, user };
}

// Create demo session with expiration
export function createDemoSession(): { success: boolean; user?: User } {
  const demoUser: User = {
    id: 'demo_user',
    email: 'demo@ektamandi.com',
    name: 'Demo User',
    phone: '9876543210',
    role: 'farmer',
    preferredLanguage: 'hi',
    createdAt: new Date().toISOString(),
    isDemo: true
  };

  const sessionData = {
    user: demoUser,
    expiresAt: Date.now() + DEMO_SESSION_DURATION
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  return { success: true, user: demoUser };
}
