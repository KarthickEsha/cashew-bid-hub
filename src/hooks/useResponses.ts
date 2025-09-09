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
              
              // Create order when status is set to 'Accepted'
              if (status === 'Accepted') {
                const { addOrder } = useOrders.getState();
                addOrder({
                  requirementId: response.requirementId,
                  responseId: response.id,
                  productName: 'Cashews', // You might want to get this from requirement
                  merchantName: response.merchantName,
                  merchantId: response.merchantId,
                  customerName: 'Current User', // You might want to get this from auth
                  quantity: response.quantity,
                  unitPrice: response.price,
                  totalAmount: `$${(parseFloat(response.price.replace(/[^0-9.]/g, '')) * parseFloat(response.quantity.replace(/[^0-9.]/g, ''))).toLocaleString()}`,
                  status: 'processing',
                  orderDate: new Date().toISOString().split('T')[0],
                  location: response.merchantLocation,
                  grade: response.grade,
                  origin: response.origin,
                  remarks: response.message,
                });
              }
              
              return updatedResponse;
            }
            return response;
          })
        }));
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
