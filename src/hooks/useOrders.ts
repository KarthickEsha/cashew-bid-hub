import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StatusHistoryItem {
  status: string;
  timestamp: string;
  remarks?: string;
  updatedBy?: string;
}

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
  status: 'Processing' | 'Confirmed' | 'Shipped' | 'in_transit' | 'Delivered' | 'Cancelled';
  orderDate: string;
  shippingDate?: string;
  deliveryDate?: string;
  location: string;
  trackingNumber?: string;
  grade: string;
  source?: string;
  origin: string;
  remarks?: string;
  buyerRemarks?: string;
  productId: string;
  statusHistory: StatusHistoryItem[];
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
  updateOrderStatus: (orderId: string, status: OrderItem['status'], remarks?: string) => void;
  updateOrderTracking: (orderId: string, trackingNumber: string, shippingDate: string) => void;
  getOrdersByCustomer: (customerName: string) => OrderItem[];
  getOrdersByMerchant: (merchantId: string) => OrderItem[];
  getOrderById: (orderId: string) => OrderItem | undefined;
  getOrderByResponseId: (responseId: string) => OrderItem | undefined;
  updateOrderSteps: (orderId: string, steps: OrderItem['steps']) => void;
  deleteOrder: (orderId: string) => void;
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
    case 'Confirmed':
      baseSteps[1] = { ...baseSteps[1], date: new Date().toISOString().split('T')[0], done: true };
      break;
    case 'Shipped':
      baseSteps[1] = { ...baseSteps[1], date: new Date().toISOString().split('T')[0], done: true };
      baseSteps[2] = { ...baseSteps[2], date: new Date().toISOString().split('T')[0], done: true };
      break;
    case 'in_transit':
      baseSteps[1] = { ...baseSteps[1], date: new Date().toISOString().split('T')[0], done: true };
      baseSteps[2] = { ...baseSteps[2], date: new Date().toISOString().split('T')[0], done: true };
      baseSteps[3] = { ...baseSteps[3], date: new Date().toISOString().split('T')[0], done: true };
      break;
    case 'Delivered':
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
          source: orderData.source,
          buyerRemarks: orderData.buyerRemarks || '',
          statusHistory: orderData.statusHistory || [{
            status: orderData.status,
            timestamp: now,
            remarks: 'Order created',
            updatedBy: orderData.customerName || 'System'
          }],
          steps: generateDefaultSteps(orderData.status),
        };

        set((state) => ({
          orders: [...state.orders, newOrder]
        }));
      },

      updateOrderStatus: (orderId, status, remarks = '') => {
        const now = new Date().toISOString();
        set((state) => ({
          orders: state.orders.map(order => {
            if (order.id === orderId) {
              const statusUpdate = {
                status,
                timestamp: now,
                remarks: remarks || `Status changed to ${status}`,
                updatedBy: 'System'
              };

              return {
                ...order,
                status,
                updatedAt: now,
                steps: generateDefaultSteps(status),
                statusHistory: [
                  ...(order.statusHistory || []),
                  statusUpdate
                ]
              };
            }
            return order;
          })
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
                steps: generateDefaultSteps('Shipped')
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
        return get().orders.find(order => order.id === orderId);
      },

      getOrderByResponseId: (responseId) => {
        return get().orders.find(order => order.responseId === responseId);
      },
      deleteOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.filter(order => order.id !== orderId)
        }));
      },
    }),
    {
      name: 'orders-storage',
    }
  )
);