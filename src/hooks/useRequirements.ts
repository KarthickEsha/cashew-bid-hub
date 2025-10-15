import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useResponses } from './useResponses';
import { apiFetch } from '@/lib/api';

export interface Requirement {
  id: string;
  customerName: string;
  productName: string;
  grade: string;
  quantity: string;
  origin: string;
  expectedPrice: number;
  minSupplyQuantity: string;
  deliveryLocation: string;
  city: string;
  state: string;
  country: string;
  deliveryDeadline: string;
  specifications: string;
  allowLowerBid: boolean;
  message: string;
  date: string;
  status: 'pending' | 'responded' | 'active' | 'draft' | 'expired' | 'closed' | 'selected' | 'viewed';
  fixedPrice: number;
  isDraft: boolean;
  createdAt: string;
  // Additional fields for MyRequirements compatibility
  title?: string;
  preferredOrigin?: string;
  budgetRange?: string;
  requirementExpiry?: string;
  responsesCount?: number;
  createdDate?: string;
  lastModified?: string;
  [key: string]: any; // Add index signature to allow additional properties
}

interface RequirementsState {
  requirements: Requirement[];
  addRequirement: (requirement: Omit<Requirement, 'id' | 'createdAt' | 'productName' | 'message' | 'fixedPrice'>) => void;
  updateRequirement: (id: string, requirement: Omit<Requirement, 'id' | 'createdAt' | 'customerName' | 'productName' | 'message' | 'fixedPrice'>) => void;
  updateRequirementStatus: (id: string, status: 'pending' | 'responded' | 'active' | 'draft' | 'expired' | 'closed' | 'selected' | 'viewed') => Promise<void>;
  getRequirementById: (id: string) => Requirement | undefined;
  getRequirementsAsEnquiries: () => any[];
  getMyRequirements: () => any[];
  deleteRequirement: (id: string) => Promise<void>;
  fetchAllRequirements: () => Promise<void>;
}

// Product-based fixed prices by origin (₹ per kg)
const productPrices = {
  W180: {
    india: 8500,
    vietnam: 8200,
    ghana: 7800,
    tanzania: 7500
  },
  W240: {
    india: 8300,
    vietnam: 8000,
    ghana: 7600,
    tanzania: 7300
  },
  W320: {
    india: 8100,
    vietnam: 7800,
    ghana: 7400,
    tanzania: 7100
  },
  SW240: {
    india: 8200,
    vietnam: 7900,
    ghana: 7500,
    tanzania: 7200
  },
  SW320: {
    india: 8000,
    vietnam: 7700,
    ghana: 7300,
    tanzania: 7000
  },
  mixed: {
    india: 7800,
    vietnam: 7500,
    ghana: 7100,
    tanzania: 6800
  }
};

const getFixedPrice = (grade: string, origin: string): number => {
  if (!grade || !origin || origin === "any") {
    return 0;
  }
  return (
    productPrices[grade as keyof typeof productPrices]?.[
      origin as keyof typeof productPrices.W180
    ] || 0
  );
};

export const useRequirements = create<RequirementsState>()(
  persist(
    (set, get) => ({
      requirements: [],
      
      // Load requirements from API and persist to the store (and localStorage)
      fetchAllRequirements: async () => {
        try {
          const data = await apiFetch('/api/requirement/get-all-requirements');

          // Cache raw payload separately if needed elsewhere
          try {
            localStorage.setItem('all_requirements_raw', JSON.stringify(data));
          } catch (_) {
            // ignore storage errors
          }

          // Normalize various possible payload shapes
          const list: any[] = Array.isArray(data)
            ? data
            : Array.isArray((data as any)?.items)
              ? (data as any).items
              : Array.isArray((data as any)?.data)
                ? (data as any).data
                : [];

          const toRequirement = (item: any): Requirement => {
            const id = String(item.id ?? item._id ?? Date.now() + Math.random());
            const createdAt = item.createdAt || item.created_at || new Date().toISOString();
            const updatedAt = item.updatedAt || item.updated_at || createdAt;

            const grade = item.grade || item.productGrade || item.product?.grade || 'W320';
            const quantity = String(item.requiredqty ?? item.qty ?? item.totalQuantity ?? '0');
            const origin = (item.origin || item.preferredOrigin || item.source || 'any').toString().toLowerCase();
            const expectedPrice = Number(item.expectedprice ?? item.price ?? item.expected_price ?? 0);
            const deliveryLocation = item.deliveryLocation || item.location || '';
            const city = item.city || '';
            const state = item.state || '';
            const country = item.country || '';
            const deliveryDeadline = item.deliverydate;
            const status = (item.status || 'active') as Requirement['status'];
            const specifications = item.description || item.specs || '';
            const allowLowerBid = Boolean(item.lowerbit ?? item.allow_lower_bid ?? false);
            const minSupplyQuantity = String(item.minimumqty ?? item.minSupplyQuantity ?? item.min_qty ?? '0');
            const customerName = item.user_name || item.buyerName || 'Anonymous Buyer';
            const productName = item.productName || `${grade} Cashews`;
            const fixedPrice = Number(item.fixedPrice ?? 0);
            const isDraft = Boolean(item.isDraft ?? (status === 'draft'));

            return {
              id,
              customerName,
              productName,
              grade,
              quantity,
              origin,
              expectedPrice,
              minSupplyQuantity,
              deliveryLocation,
              city,
              state,
              country,
              deliveryDeadline,
              specifications,
              allowLowerBid,
              message: item.message || '',
              date: (createdAt || '').split('T')[0],
              status,
              fixedPrice,
              isDraft,
              createdAt,
              // Extra fields for MyRequirements compatibility
              title: item.title || `${quantity} of ${grade} Cashews`,
              preferredOrigin: item.preferredOrigin || origin,
              budgetRange: typeof item.budgetRange === 'string' ? item.budgetRange : `₹${expectedPrice?.toLocaleString?.() || expectedPrice}/kg`,
              requirementExpiry: deliveryDeadline,
              responsesCount: Number(item.responsesCount ?? 0),
              createdDate: createdAt,
              lastModified: updatedAt,
            } as Requirement;
          };

          const normalized = list.map(toRequirement);
          set({ requirements: normalized });
        } catch (err) {
          console.error('Failed to fetch requirements:', err);
          // Do not throw to avoid breaking UI
        }
      },

      addRequirement: (requirement) => {
        console.group('=== addRequirement ===');
        console.log('Adding new requirement:', requirement);
        
        const fixedPrice = getFixedPrice(requirement.grade, requirement.origin);
        const now = new Date().toISOString();
        const originNames: { [key: string]: string } = {
          india: 'India',
          vietnam: 'Vietnam', 
          ghana: 'Ghana',
          tanzania: 'Tanzania',
          any: 'Any'
        };
        
        // Ensure all required fields have default values
        const defaultRequirement: Partial<Requirement> = {
          id: Date.now().toString(),
          customerName: 'Anonymous Buyer',
          productName: `${requirement.grade} Cashews`,
          message: '',
          fixedPrice,
          state: '',
          city: '',
          country: '',
          deliveryLocation: '',
          specifications: '',
          allowLowerBid: false,
          date: now.split('T')[0],
          isDraft: false, // Explicitly set to false for new requirements
          status: 'active',
          createdAt: now,
          responsesCount: 0,
          createdDate: now.split('T')[0],
          lastModified: now.split('T')[0]
        };
        
        const newRequirement: Requirement = {
          ...defaultRequirement,
          ...requirement,
          productName: `${requirement.grade} Cashews`,
          message: `Looking for ${requirement.quantity} of ${requirement.grade} cashews from ${requirement.origin}. ${requirement.specifications || 'Standard quality requirements.'}`,
          fixedPrice,
          // Additional fields for MyRequirements compatibility
          title: `${requirement.grade} Cashews for ${requirement.deliveryLocation}`,
          preferredOrigin: originNames[requirement.origin] || requirement.origin,
          budgetRange: `₹${requirement.expectedPrice}/kg`,
          requirementExpiry: requirement.deliveryDeadline,
          status: requirement.isDraft ? 'draft' : 'active',
          isDraft: requirement.isDraft || false // Ensure isDraft is always set
        } as Requirement;

        console.log('New requirement to be added:', newRequirement);
        
        set((state) => {
          const updatedRequirements = [...state.requirements, newRequirement];
          console.log('Updated requirements array:', updatedRequirements);
          return { requirements: updatedRequirements };
        });
        
        console.groupEnd();
      },

      updateRequirement: (id, requirement) => {
        const fixedPrice = getFixedPrice(requirement.grade, requirement.origin);
        const now = new Date().toISOString();
        const originNames: { [key: string]: string } = {
          india: 'India',
          vietnam: 'Vietnam',
          ghana: 'Ghana',
          tanzania: 'Tanzania',
          any: 'Any'
        };
        
        set((state) => ({
          requirements: state.requirements.map((req) => {
            if (req.id === id) {
              const updatedRequirement = {
                ...req,
                ...requirement,
                productName: requirement.grade ? `${requirement.grade} Cashews` : req.productName,
                fixedPrice,
                preferredOrigin: requirement.origin ? (originNames[requirement.origin] || requirement.origin) : req.preferredOrigin,
                budgetRange: requirement.expectedPrice ? `₹${requirement.expectedPrice}/kg` : req.budgetRange,
                requirementExpiry: requirement.deliveryDeadline || req.requirementExpiry,
                lastModified: now.split('T')[0],
                // Ensure required fields are not removed
                state: requirement.state ?? req.state,
                city: requirement.city ?? req.city,
                country: requirement.country ?? req.country,
                deliveryLocation: requirement.deliveryLocation ?? req.deliveryLocation,
                specifications: requirement.specifications ?? req.specifications,
                allowLowerBid: requirement.allowLowerBid ?? req.allowLowerBid,
                date: requirement.date ?? req.date,
                isDraft: requirement.isDraft ?? req.isDraft,
                status: requirement.status ?? req.status
              };
              return updatedRequirement;
            }
            return req;
          }),
        }));
      },

      updateRequirementStatus: async (id, status) => {
        console.group('=== updateRequirementStatus ===');
        console.log('1. Starting update for requirement:', { id, newStatus: status });

        // Snapshot previous state for potential rollback
        const previous = get().requirements;

        // Validate target requirement exists
        const existing = previous.find(req => req.id === id);
        if (!existing) {
          console.error('Requirement not found:', id);
          console.groupEnd();
          return;
        }

        console.log('2. Current requirement data:', {
          id,
          oldStatus: existing.status,
          currentData: existing,
        });

        // Optimistic update in store
        set(state => ({
          requirements: state.requirements.map(req =>
            req.id === id
              ? { ...req, status, lastModified: new Date().toISOString() }
              : req
          ),
        }));

        try {
          // Persist status to backend. Some backends replace the whole document on PUT,
          // so send a full payload derived from existing requirement to avoid wiping fields.
          const current = get().requirements.find(r => r.id === id)!;
          const toNumber = (val: any) => {
            const cleaned = String(val ?? '')
              .replace(/,/g, '')
              .replace(/[^0-9.]/g, '');
            const num = Number(cleaned);
            return isNaN(num) ? 0 : num;
          };
          const fullPayload = {
            grade: current.grade,
            origin: current.origin,
            requiredqty: toNumber(current.quantity),
            minimumqty: toNumber(current.minSupplyQuantity),
            expectedprice: toNumber(current.expectedPrice),
            deliverydate: current.deliveryDeadline || null,
            location: current.deliveryLocation,
            country: current.country,
            city: current.city,
            description: current.specifications,
            lowerbit: current.allowLowerBid,
            status,
          } as any;

          await apiFetch(`/api/requirement/update-requirement/${id}`, {
            method: 'PUT',
            body: JSON.stringify(fullPayload),
          });

          // Sync localStorage after successful API update
          try {
            const storageKey = 'requirements-storage';
            const storedData = localStorage.getItem(storageKey);
            if (storedData) {
              const parsedData = JSON.parse(storedData);
              const updatedStoredRequirements = parsedData.state.requirements.map((req: any) =>
                req.id === id ? { ...req, status, lastModified: new Date().toISOString() } : req
              );
              localStorage.setItem(
                storageKey,
                JSON.stringify({
                  ...parsedData,
                  state: {
                    ...parsedData.state,
                    requirements: updatedStoredRequirements,
                  },
                })
              );
              console.log('5. Successfully updated localStorage');
            }
          } catch (storageErr) {
            console.error('Error updating localStorage:', storageErr);
          }
        } catch (apiErr) {
          console.error('API status update failed. Rolling back state.', apiErr);
          // Rollback on failure
          set({ requirements: previous });
          throw apiErr;
        } finally {
          console.groupEnd();
        }
      },

      getRequirementById: (id) => {
        const { requirements } = get();
        return requirements.find(req => req.id === id);
      },

      getRequirementsAsEnquiries: () => {
        console.group('=== getRequirementsAsEnquiries ===');
        const { requirements } = get();
        console.log('Current requirements in store:', requirements);
        
        // Get responses from the responses store
        const responses = useResponses.getState().responses;
        
        const filteredRequirements = requirements.filter(req => {
          const isValid = req.isDraft !== true; // Explicitly check for true
          console.log('Checking requirement:', { 
            id: req.id, 
            isDraft: req.isDraft, 
            status: req.status,
            isValid,
            requirement: req
          });
          return isValid;
        });
        
        console.log('Filtered requirements (non-draft):', filteredRequirements);
        
        const mappedEnquiries = filteredRequirements.map(req => {
          const requirementResponses = responses.filter(r => r.requirementId === req.id || r.requirementId === req.id.toString());
          const hasResponses = requirementResponses.length > 0;
          
          console.log('Mapping requirement to enquiry:', { 
            id: req.id, 
            originalStatus: req.status,
            hasResponses,
            responseCount: requirementResponses.length,
            requirement: req
          });
          
          // If there are responses but status is still active, update it to responded
          let status = req.status || 'active'; // Default to 'active' if status is not set
          if (hasResponses && status === 'active') {
            status = 'responded';
            console.log('Updating status from active to responded for requirement:', req.id);
            
            // Update the requirement status in the store if it's different
            if (req.status !== status) {
              set(state => ({
                requirements: state.requirements.map(r => 
                  r.id === req.id ? { ...r, status } : r
                )
              }));
            }
          }
          
          // Ensure ID is a number for compatibility (UI), but also preserve backend ID for API calls
          const enquiryId = typeof req.id === 'string' ? parseInt(req.id, 10) : req.id;

          return {
            apiId: req.id,
            id: isNaN(enquiryId as any) ? req.id : enquiryId,
            customerName: req.customerName || 'Anonymous Buyer',
            productName: req.productName || `${req.grade || 'Cashew'} Product`,
            quantity: req.quantity || '0',
            message: req.message || '',
            date: req.date || new Date().toISOString().split('T')[0],
            status,
            expectedPrice: req.expectedPrice || 0,
            fixedPrice: req.fixedPrice || 0,
            origin: req.origin || 'any',
            grade: req.grade || 'W320',
            deliveryLocation: req.deliveryLocation || 'Not specified',
            city: req.city || '',
            country: req.country || '',
            deliveryDeadline: req.deliveryDeadline || req.requirementExpiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            specifications: req.specifications || '',
            allowLowerBid: req.allowLowerBid || false,
            minSupplyQuantity: req.minSupplyQuantity || '0',
            createdAt: req.createdAt || new Date().toISOString(),
            lastModified: req.lastModified || req.createdAt || new Date().toISOString()
          };
        });
        
        console.log('Mapped enquiries:', mappedEnquiries);
        console.groupEnd();
        
        return mappedEnquiries;
      },

      getMyRequirements: () => {
        const { responses } = useResponses.getState();
        const requirements = get().requirements;
        
        return requirements.map(req => ({
          id: req.id,
          title: `${req.quantity} of ${req.grade} Cashews`,
          grade: req.grade,
          quantity: req.quantity,
          preferredOrigin: req.origin,
          budgetRange: `₹${req.expectedPrice?.toLocaleString() || '0'}/kg`,
          deliveryLocation: `${req.deliveryLocation}, ${req.city}, ${req.country}`,
          requirementExpiry: req.deliveryDeadline,
          status: req.status,
          createdDate: req.createdAt,
          lastModified: (req as any).updatedAt || req.createdAt,
          responsesCount: responses.filter(r => r.requirementId === req.id).length
        }));
      },

      deleteRequirement: async (id) => {
        // Optimistic update
        const previous = get().requirements;
        set({ requirements: previous.filter(req => req.id !== id) });

        try {
          await apiFetch(`/api/requirement/delete-requirement/${id}`, {
            method: 'DELETE',
          });
        } catch (error) {
          console.error('Failed to delete requirement. Rolling back state.', error);
          // Rollback on failure
          set({ requirements: previous });
          throw error;
        }
      },
    }),
    {
      name: 'requirements-storage',
    }
  )
);