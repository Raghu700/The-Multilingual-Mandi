/**
 * Authentication Service
 * Handles user registration, login, and session management
 * Uses localStorage for demo (upgrade to AWS Cognito for production)
 */

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
