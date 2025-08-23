export interface User {
  id: string;
  email: string;
  role: 'customer' | 'merchant';
  name: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'customer' | 'merchant') => Promise<void>;
  logout: () => void;
}