import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useOrders } from './useOrders';

export interface MerchantResponse {
  id: string;
  requirementId: string;
  merchantId: string;
  merchantName: string;
  merchantLocation: string;
  price: string;
  responseDate: string;
  status: 'new' | 'viewed' | 'Accepted' | 'Rejected';
  grade: string;
  quantity: string;
  origin: string;
  certifications: string[];
  deliveryTime: string;
  contact: string;
  message: string;
  remarks?: string;
  createdAt: string;
}

interface ResponsesState {
  responses: MerchantResponse[];
  addResponse: (response: Omit<MerchantResponse, 'id' | 'createdAt'>) => void;
  getResponsesByRequirementId: (requirementId: string) => MerchantResponse[];
  getResponsesByProductId: (productId: string) => MerchantResponse[];
  updateResponseStatus: (responseId: string, status: 'new' | 'viewed' | 'Accepted' | 'Rejected', remarks?: string) => void;
  getResponseCount: (requirementId: string) => number;
  deleteResponse: (responseId: string) => void;
}

export const useResponses = create<ResponsesState>()(
  persist(
    (set, get) => ({
      responses: [],

      addResponse: (response) => {
        const now = new Date().toISOString();
        const newResponse: MerchantResponse = {
          ...response,
          id: Date.now().toString(),
          createdAt: now,
        };

        set((state) => ({
          responses: [...state.responses, newResponse]
        }));
      },

      getResponsesByRequirementId: (requirementId) => {
        const { responses } = get();
        return responses.filter(response => response.requirementId === requirementId);
      },

      updateResponseStatus: (responseId, status, remarks) => {
        set((state) => ({
          responses: state.responses.map(response => {
            if (response.id === responseId) {
              const updatedResponse = {
                ...response,
                status,
                ...(remarks !== undefined ? { remarks } : {})
              };

              const now = new Date().toISOString();

              // Handle both Accepted and Rejected statuses
              if (status === 'Accepted' || status === 'Rejected') {
                const { addOrder, updateOrderStatus, getOrderByResponseId } = useOrders.getState();

                // Check if order already exists for this response
                const existingOrder = getOrderByResponseId?.(responseId);

                if (existingOrder) {
                  // Update existing order status
                  updateOrderStatus(
                    existingOrder.id,
                    status === 'Accepted' ? 'Processing' : 'Cancelled',
                    remarks || `Response ${status.toLowerCase()} by buyer`
                  );
                } else if (status === 'Accepted') {
                  // Only create new order for Accepted status
                  const statusHistory = [{
                    status: 'Processing',
                    timestamp: now,
                    remarks: remarks || 'Order placed by buyer',
                    updatedBy: 'Buyer'
                  }];

                  if (remarks) {
                    statusHistory.push({
                      status: status.toLowerCase(),
                      timestamp: now,
                      remarks: remarks,
                      updatedBy: 'Buyer'
                    });
                  }

                  addOrder({
                    requirementId: response.requirementId,
                    responseId: response.id,
                    productName: 'Cashews',
                    merchantName: response.merchantName,
                    merchantId: response.merchantId,
                    customerName: 'Current User',
                    quantity: response.quantity,
                    unitPrice: response.price,
                    totalAmount: `$${(parseFloat(response.price.replace(/[^0-9.]/g, '')) * parseFloat(response.quantity.replace(/[^0-9.]/g, ''))).toLocaleString()}`,
                    status: 'Processing',
                    orderDate: now.split('T')[0],
                    location: response.merchantLocation,
                    grade: response.grade,
                    origin: response.origin,
                    remarks: response.message,
                    buyerRemarks: response.remarks,
                    statusHistory: statusHistory
                  });
                }
              }

              return updatedResponse;
            }
            return response;
          })
        }));
      },

      getResponsesByProductId: (productId) => {
        const { responses } = get();
        // In a real implementation, you would need to filter responses based on the product ID
        // This assumes that the requirementId in the response is the same as the productId
        // You might need to adjust this based on your actual data structure
        return responses.filter(response => response.requirementId === productId);
      },

      getResponseCount: (requirementId) => {
        const { responses } = get();
        return responses.filter(response => response.requirementId === requirementId).length;
      },

      deleteResponse: (responseId) => {
        set((state) => ({
          responses: state.responses.filter(response => response.id !== responseId)
        }));
      },
    }),
    {
      name: 'responses-storage',
    }
  )
);
