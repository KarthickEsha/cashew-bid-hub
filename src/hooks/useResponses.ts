import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useOrders } from './useOrders';
import { apiFetch } from '@/lib/api';
import { useProfile } from './useProfile';

export interface MerchantResponse {
  productName: string;
  id: string;
  requirementId: string;
  merchantId: string;
  merchantName: string;
  merchantLocation: string;
  price: string;
  responseDate: string;
  status: 'new' | 'viewed' | 'accepted' | 'rejected' | 'skipped';
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
  loaded: boolean;
  lastFetched?: string;
  addResponse: (response: Omit<MerchantResponse, 'id' | 'createdAt'>) => void;
  getResponsesByRequirementId: (requirementId: string) => MerchantResponse[];
  getResponsesByProductId: (productId: string) => MerchantResponse[];
  updateResponseStatus: (responseId: string, status: 'new' | 'viewed' | 'accepted' | 'rejected' | 'skipped', remarks?: string) => void;
  getResponseCount: (requirementId: string) => number;
  getSubmittedQuotesCount: (merchantId: string) => number;
  getStockEnquiriesCount: () => number;
  getSellerResponseCount: () => number;
  setResponses: (responses: MerchantResponse[]) => void;
  ensureLoaded: (force?: boolean) => Promise<void>;
  deleteResponse: (responseId: string) => void;
}

export const useResponses = create<ResponsesState>()(
 
  persist(
    (set, get) => ({
      responses: [],
      loaded: false,

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

      setResponses: (responses) => {
        set({ responses });
      },

      getResponsesByRequirementId: (requirementId) => {
        const { responses } = get();
        return responses.filter(response =>
          response.requirementId === requirementId &&
          response.status !== 'skipped'
        );
      },

      updateResponseStatus: (responseId, status, remarks) => {
        console.log('=== UPDATE RESPONSE STATUS START ===');
        console.log('Response ID:', responseId);
        console.log('New status:', status);
        console.log('Remarks:', remarks);

        set((state) => {
          console.log('Current responses in state:', state.responses);

          const updatedResponses = state.responses.map(response => {
            if (response.id === responseId) {
              console.log('Found response to update:', {
                id: response.id,
                oldStatus: response.status,
                newStatus: status
              });

              const updatedResponse = {
                ...response,
                status,
                ...(remarks !== undefined ? { remarks } : {})
              };

              console.log('Updated response:', updatedResponse);

              // Handle order creation/update for accepted/rejected statuses
              if (status === 'accepted' || status === 'rejected') {
                const now = new Date().toISOString();
                const { addOrder, updateOrderStatus, getOrderByResponseId } = useOrders.getState();

                // Check if order already exists for this response
                const existingOrder = getOrderByResponseId?.(responseId);

                if (existingOrder) {
                  // Update existing order status
                  updateOrderStatus(
                    existingOrder.id,
                    status === 'accepted' ? 'Processing' : 'Cancelled',
                    remarks || `Response ${status} by buyer`
                  );
                } else if (status === 'accepted') {
                  // Only create new order for accepted status
                  const statusHistory = [{
                    status: 'Processing',
                    timestamp: now,
                    remarks: remarks || 'Response received from buyer',
                    updatedBy: 'Buyer'
                  }];

                  if (remarks) {
                    statusHistory.push({
                      status: status,
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
                    status: 'Confirmed',
                    orderDate: now.split('T')[0],
                    location: response.merchantLocation,
                    grade: response.grade,
                    origin: response.origin,
                    remarks: response.message,
                    buyerRemarks: response.remarks,
                    source: 'My Requirement',
                    statusHistory: statusHistory,
                    productId: ''
                  });
                }
              }

              return updatedResponse;
            }
            return response;
          });

          console.log('All responses after update:', updatedResponses);
          return { responses: updatedResponses };
        });
      },

      getResponsesByProductId: (productId) => {
        const { responses } = get();
        // In a real implementation, you would need to filter responses based on the product ID
        // This assumes that the requirementId in the response is the same as the productId
        // You might need to adjust this based on your actual data structure
        return responses.filter(response => response.requirementId === productId);
      },

      getResponseCount: (requirementId) => {
        const responses = get().responses.filter(r => r.requirementId === requirementId);
        return responses.length;
      },
      getSubmittedQuotesCount: (merchantId) => {
        return get().responses.filter(
          (r) => r.merchantId === merchantId && (r.status === 'new' || r.status === 'viewed')
        ).length;
      },
      getStockEnquiriesCount: () => {
        // Count responses that are not skipped
        return get().responses.filter(r => r.status !== 'skipped').length;
      },
      getSellerResponseCount: () => {
        // Define "seller response count" as total responses; adjust if needed
        return get().responses.length;
      },

      ensureLoaded: async (force = false) => {
        const { loaded, responses } = get();
        if (loaded && !force) return;
        if (responses && responses.length > 0 && !force) {
          set({ loaded: true, lastFetched: new Date().toISOString() });
          return;
        }

        try {
          const { profile, setProfile } = useProfile();
          const viewer = profile?.role === 'processor' ? 'merchant' : 'buyer';
          const data: any = await apiFetch(`/api/quotes/get-all-quotes?viewer=${viewer}`);
          const arr = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
          const mapped: MerchantResponse[] = arr.map((q: any) => {
            const createdAt = q?.createdAt || new Date().toISOString();
            const status = String(q?.status ?? 'new').toLowerCase() as MerchantResponse['status'];
            return {
              id: q?.id || String(Date.now()),
              requirementId: q?.requirementId || '',
              merchantId: q?.merchantId || '',
              merchantName: q?.merchantCompanyName || 'Unknown',
              merchantLocation: q?.merchantAddress || '',
              price: String(q?.priceINR ?? ''),
              responseDate: createdAt,
              status,
              grade: String(q?.grade ?? 'N/A'),
              quantity: String(q?.supplyQtyKg ?? ''),
              origin: '',
              certifications: [],
              deliveryTime: '',
              productName: '',
              contact: '',
              message: q?.remarks || '',
              remarks: q?.remarks,
              createdAt,
            } as MerchantResponse;
          });
          set({ responses: mapped, loaded: true, lastFetched: new Date().toISOString() });
        } catch (e) {
          // Keep store as-is on failure; mark loaded to avoid loops, or leave as not loaded
          console.error('ensureLoaded() failed to fetch quotes', e);
          set({ loaded: true, lastFetched: new Date().toISOString() });
        }
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