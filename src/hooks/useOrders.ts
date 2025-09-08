import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OrderItem {
  id: string;
  requirementId: string;
  responseId: string;
  productName: string;
  merchantName: string;
  merchantId: string;
  customerName: string;
  quantity: string;
  unitPrice: string;
  totalAmount: string;
  status: 'processing' | 'confirmed' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled';
  orderDate: string;
  shippingDate?: string;
  deliveryDate?: string;
  location: string;
  trackingNumber?: string;
  grade: string;
  origin: string;
  remarks?: string;
  steps: Array<{
    label: string;
    date: string;
    done: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface OrdersState {
  orders: OrderItem[];
  addOrder: (order: Omit<OrderItem, 'id' | 'createdAt' | 'updatedAt' | 'steps'>) => void;
  updateOrderStatus: (orderId: string, status: OrderItem['status']) => void;
  updateOrderTracking: (orderId: string, trackingNumber: string, shippingDate: string) => void;
  getOrdersByCustomer: (customerName: string) => OrderItem[];
  getOrdersByMerchant: (merchantId: string) => OrderItem[];
  getOrderById: (orderId: string) => OrderItem | undefined;
  updateOrderSteps: (orderId: string, steps: OrderItem['steps']) => void;
}

const generateDefaultSteps = (status: OrderItem['status']) => {
  const baseSteps = [
    { label: "Order Placed", date: new Date().toISOString().split('T')[0], done: true },
    { label: "Confirmed", date: "", done: false },
    { label: "Shipped", date: "", done: false },
    { label: "In Transit", date: "", done: false },
    { label: "Delivered", date: "", done: false },
  ];

  switch (status) {
    case 'confirmed':
      baseSteps[1] = { ...baseSteps[1], date: new Date().toISOString().split('T')[0], done: true };
      break;
    case 'shipped':
      baseSteps[1] = { ...baseSteps[1], date: new Date().toISOString().split('T')[0], done: true };
      baseSteps[2] = { ...baseSteps[2], date: new Date().toISOString().split('T')[0], done: true };
      break;
    case 'in_transit':
      baseSteps[1] = { ...baseSteps[1], date: new Date().toISOString().split('T')[0], done: true };
      baseSteps[2] = { ...baseSteps[2], date: new Date().toISOString().split('T')[0], done: true };
      baseSteps[3] = { ...baseSteps[3], date: new Date().toISOString().split('T')[0], done: true };
      break;
    case 'delivered':
      baseSteps.forEach((step, index) => {
        baseSteps[index] = { ...step, date: new Date().toISOString().split('T')[0], done: true };
      });
      break;
  }

  return baseSteps;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],

      addOrder: (orderData) => {
        const now = new Date().toISOString();
        const orderId = `ORD-${Date.now()}`;
        
        const newOrder: OrderItem = {
          ...orderData,
          id: orderId,
          createdAt: now,
          updatedAt: now,
          steps: generateDefaultSteps(orderData.status),
        };

        set((state) => ({
          orders: [...state.orders, newOrder]
        }));
      },

      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === orderId
              ? {
                  ...order,
                  status,
                  updatedAt: new Date().toISOString(),
                  steps: generateDefaultSteps(status)
                }
              : order
          )
        }));
      },

      updateOrderTracking: (orderId, trackingNumber, shippingDate) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === orderId
              ? {
                  ...order,
                  trackingNumber,
                  shippingDate,
                  status: 'shipped' as OrderItem['status'],
                  updatedAt: new Date().toISOString(),
                  steps: generateDefaultSteps('shipped')
                }
              : order
          )
        }));
      },

      updateOrderSteps: (orderId, steps) => {
        set((state) => ({
          orders: state.orders.map(order =>
            order.id === orderId
              ? {
                  ...order,
                  steps,
                  updatedAt: new Date().toISOString()
                }
              : order
          )
        }));
      },

      getOrdersByCustomer: (customerName) => {
        const { orders } = get();
        return orders.filter(order => order.customerName === customerName);
      },

      getOrdersByMerchant: (merchantId) => {
        const { orders } = get();
        return orders.filter(order => order.merchantId === merchantId);
      },

      getOrderById: (orderId) => {
        const { orders } = get();
        return orders.find(order => order.id === orderId);
      },
    }),
    {
      name: 'orders-storage',
    }
  )
);