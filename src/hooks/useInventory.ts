import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, ProductType } from '@/types/user';

interface InventoryState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'> & { specifications?: any }) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  deleteProduct: (id: string) => void;
  reduceStock: (id: string, quantity: number) => void;
  reduceAvailableStock: (id: string, quantity: number) => void;
  incrementEnquiryCount: (productId: string) => void;
  incrementBuyerResponseCount: (productId: string) => void;
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
      products: [],
    
      addProduct: (product) =>
        set((state) => {
          // Required fields with defaults
          const now = new Date().toISOString();
          const newProduct: Product = {
            // Required fields with defaults
            id: Math.random().toString(36).substr(2, 9),
            name: product.name || 'Unnamed Product',
            type: product.type || 'RCN',
            stock: product.stock ?? 0,
            price: product.price ?? 0,
            unit: product.unit || 'kg',
            location: product.location || '',
            images: Array.isArray(product.images) ? product.images : [],
            pricingType: product.pricingType || 'fixed',
            status: 'active',
            allowBuyerOffers: product.allowBuyerOffers ?? false,
            enquiries: 0,
            orders: 0,
            buyerResponses: 0,
            createdAt: now,
            expireDate: product.expireDate ?? '',

            // Optional fields
            ...product,

            // Ensure specifications is a function
            specifications: (specs: any) => ({
              ...(typeof product.specifications === 'function' 
                ? product.specifications({}) 
                : {}),
              ...specs
            })
          };
          
          return {
            products: [...state.products, newProduct],
          };
        }),

      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p =>
          p.id === id ? { ...p, ...updates } : p
        )
      })),

      deleteProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
    
      reduceStock: (id, quantity) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id && product.stock >= quantity
              ? { 
                  ...product, 
                  stock: product.stock - quantity, 
                  availableQty: product.availableQty - quantity,
                  status: product.stock - quantity <= 0 ? 'out_of_stock' : product.status 
                }
              : product
          ),
        })),
        
  reduceAvailableStock: (id, quantity) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === id
              ? { 
                  ...product, 
                  availableQty: Math.max(0, (product.availableQty || product.stock) - quantity)
                }
              : product
          ),
        })),

      incrementEnquiryCount: (productId) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? { ...product, enquiries: (product.enquiries || 0) + 1 }
              : product
          ),
        })),

      incrementBuyerResponseCount: (productId) =>
        set((state) => ({
          products: state.products.map((product) =>
            product.id === productId
              ? { ...product, buyerResponses: (product.buyerResponses || 0) + 1 }
              : product
          ),
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