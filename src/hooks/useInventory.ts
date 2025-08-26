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
        {
          id: '3',
          name: 'Whole Cashews W180',
          type: 'Kernel',
          grade: 'W180',
          stock: 300,
          price: 9.8,
          unit: 'kg',
          location: 'Goa, India',
          expireDate: '2026-01-20',
          status: 'active',
          enquiries: 7,
          orders: 4,
          images: [],
          createdAt: '2024-03-05',
        },
        {
          id: '4',
          name: 'Raw Cashew Nuts 2023',
          type: 'RCN',
          yearOfCrop: '2023',
          nutCount: '190-210',
          outTurn: '21-23%',
          stock: 1500,
          price: 2.9,
          unit: 'kg',
          location: 'Andhra Pradesh, India',
          expireDate: '2025-09-12',
          status: 'active',
          enquiries: 2,
          orders: 0,
          images: [],
          createdAt: '2023-12-01',
        },
        {
          id: '5',
          name: 'Split Cashews SW320',
          type: 'Kernel',
          grade: 'SW320',
          stock: 700,
          price: 7.2,
          unit: 'kg',
          location: 'Karnataka, India',
          expireDate: '2026-03-30',
          status: 'active',
          enquiries: 4,
          orders: 3,
          images: [],
          createdAt: '2024-04-12',
        },
        {
          id: '6',
          name: 'Raw Cashew Nuts 2025',
          type: 'RCN',
          yearOfCrop: '2025',
          nutCount: '210-230',
          outTurn: '23-25%',
          stock: 2000,
          price: 3.5,
          unit: 'kg',
          location: 'Odisha, India',
          expireDate: '2026-11-15',
          status: 'active',
          enquiries: 6,
          orders: 2,
          images: [],
          createdAt: '2024-06-08',
        },
        {
          id: '7',
          name: 'Cashew Kernels W320',
          type: 'Kernel',
          grade: 'W320',
          stock: 600,
          price: 7.9,
          unit: 'kg',
          location: 'Maharashtra, India',
          expireDate: '2025-07-10',
          status: 'active',
          enquiries: 8,
          orders: 5,
          images: [],
          createdAt: '2024-05-18',
        },
        {
          id: '8',
          name: 'Raw Cashew Nuts 2022',
          type: 'RCN',
          yearOfCrop: '2022',
          nutCount: '180-200',
          outTurn: '20-22%',
          stock: 800,
          price: 2.7,
          unit: 'kg',
          location: 'West Bengal, India',
          expireDate: '2025-05-25',
          status: 'active',
          enquiries: 1,
          orders: 0,
          images: [],
          createdAt: '2023-11-15',
        },
        {
          id: '9',
          name: 'Cashew Pieces SP',
          type: 'Kernel',
          grade: 'SP',
          stock: 400,
          price: 6.5,
          unit: 'kg',
          location: 'Kerala, India',
          expireDate: '2026-04-05',
          status: 'active',
          enquiries: 3,
          orders: 1,
          images: [],
          createdAt: '2024-07-01',
        },
        {
          id: '10',
          name: 'Raw Cashew Nuts Premium 2025',
          type: 'RCN',
          yearOfCrop: '2025',
          nutCount: '220-240',
          outTurn: '24-26%',
          stock: 2500,
          price: 3.8,
          unit: 'kg',
          location: 'Ghana, Africa',
          expireDate: '2026-12-31',
          status: 'active',
          enquiries: 9,
          orders: 6,
          images: [],
          createdAt: '2024-08-15',
        }
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