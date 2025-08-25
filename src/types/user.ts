export type UserRole = 'buyer' | 'processor';
export type ProductType = 'RCN' | 'Kernel' | 'Both';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  address?: string;
  location?: string;
  role: UserRole;
  profilePicture?: string;
  merchantLogo?: string;
  productType: ProductType;
  isProfileComplete: boolean;
}

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