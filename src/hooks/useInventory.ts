import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductType } from '@/types/user';

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  stock: number;
  price: number;
  unit: string;
  location: string;
  description?: string;
  images: string[];
  
  // RCN specific fields
  yearOfCrop?: string;
  nutCount?: string;
  outTurn?: string;
  
  // Kernel specific fields
  grade?: string;
  
  // Common fields
  expireDate: string;
  status: 'active' | 'out_of_stock';
  enquiries: number;
  orders: number;
  createdAt: string;
}

interface InventoryState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  reduceStock: (id: string, quantity: number) => void;
  getProductsByType: (type: ProductType) => Product[];
  getProductStats: () => {
    totalProducts: number;
    rcnProducts: number;
    kernelProducts: number;
    totalStock: { rcn: number; kernel: number };
  };
}

export const useInventory = create<InventoryState>()(
  persist(
    (set, get) => ({
      products: [
        {
          id: '1',
          name: 'Premium Cashews W240',
          type: 'Kernel',
          grade: 'W240',
          stock: 500,
          price: 8.5,
          unit: 'kg',
          location: 'Kerala, India',
          expireDate: '2025-12-15',
          status: 'active',
          enquiries: 3,
          orders: 2,
          images: [],
          createdAt: '2024-01-15',
        },
        {
          id: '2',
          name: 'Raw Cashew Nuts 2024',
          type: 'RCN',
          yearOfCrop: '2024',
          nutCount: '200-220',
          outTurn: '22-24%',
          stock: 1000,
          price: 3.2,
          unit: 'kg',
          location: 'Tamil Nadu, India',
          expireDate: '2025-10-30',
          status: 'active',
          enquiries: 5,
          orders: 1,
          images: [],
          createdAt: '2024-02-10',
        },
      ],
      
      addProduct: (product) => set((state) => ({
        products: [...state.products, {
          ...product,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        }]
      })),
      
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),
      
      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      
      reduceStock: (id, quantity) => set((state) => ({
        products: state.products.map(p => 
          p.id === id ? { 
            ...p, 
            stock: Math.max(0, p.stock - quantity),
            status: p.stock - quantity <= 0 ? 'out_of_stock' : p.status
          } : p
        )
      })),
      
      getProductsByType: (type) => {
        const { products } = get();
        return products.filter(p => p.type === type);
      },
      
      getProductStats: () => {
        const { products } = get();
        const rcnProducts = products.filter(p => p.type === 'RCN');
        const kernelProducts = products.filter(p => p.type === 'Kernel');
        
        return {
          totalProducts: products.length,
          rcnProducts: rcnProducts.length,
          kernelProducts: kernelProducts.length,
          totalStock: {
            rcn: rcnProducts.reduce((sum, p) => sum + p.stock, 0),
            kernel: kernelProducts.reduce((sum, p) => sum + p.stock, 0),
          }
        };
      },
    }),
    {
      name: 'inventory-storage',
    }
  )
);