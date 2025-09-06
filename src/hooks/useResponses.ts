import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MerchantResponse {
  id: string;
  requirementId: string;
  merchantId: string;
  merchantName: string;
  merchantLocation: string;
  price: string;
  responseDate: string;
  status: 'new' | 'viewed' | 'accepted' | 'rejected';
  grade: string;
  quantity: string;
  origin: string;
  certifications: string[];
  deliveryTime: string;
  contact: string;
  message: string;
  createdAt: string;
}

interface ResponsesState {
  responses: MerchantResponse[];
  addResponse: (response: Omit<MerchantResponse, 'id' | 'createdAt'>) => void;
  getResponsesByRequirementId: (requirementId: string) => MerchantResponse[];
  updateResponseStatus: (responseId: string, status: 'new' | 'viewed' | 'accepted' | 'rejected') => void;
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

      updateResponseStatus: (responseId, status) => {
        set((state) => ({
          responses: state.responses.map(response =>
            response.id === responseId ? { ...response, status } : response
          )
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
