export type UserRole = 'buyer' | 'processor' | 'both';
export type ProductType = 'RCN' | 'Kernel' | 'Both';
export type RegistrationType = 'private_limited' | 'public_limited' | 'llp' | 'sole_proprietorship' | 'partnership' | 'other';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  role: UserRole;
  profilePicture?: string;
  companyName?: string;
  registrationType?: RegistrationType;
  officeEmail?: string;
  officeAddress?: string;
  officePhone?: string;
  isGstRegistered?: boolean;
  productType?: ProductType;
  establishedYear?: string;
  businessType?: string;
  dealingWith: ProductType;
  description?: string;
  isProfileComplete: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  role: 'customer' | 'merchant';
  name: string;
}

export interface Location {
  country?: string;
  region?: string;
  city?: string;
  address?: string;
  postalCode?: string;
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
  location: string | Location;
  expireDate: string;
  status: 'active' | 'out_of_stock';
  enquiries: number;
  orders: number;
  buyerResponses: number;
  allowBuyerOffers: boolean;
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: 'customer' | 'merchant') => Promise<void>;
  logout: () => void;
}