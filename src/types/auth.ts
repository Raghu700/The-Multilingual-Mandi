// Authentication types for EktaMandi

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
