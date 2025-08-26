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

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  grade?: string;
  yearOfCrop?: string;
  nutCount?: string;
  outTurn?: string;
  stock: number;
  price: number;
  unit: string;
  location: string;
  expireDate: string;
  status: 'active' | 'out_of_stock';
  enquiries: number;
  orders: number;
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'customer' | 'merchant') => Promise<void>;
  logout: () => void;
}