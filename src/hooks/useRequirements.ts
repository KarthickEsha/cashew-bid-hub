import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useResponses } from './useResponses';

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
  updateRequirementStatus: (id: string, status: 'pending' | 'responded' | 'active' | 'draft' | 'expired' | 'closed' | 'selected' | 'viewed') => void;
  getRequirementById: (id: string) => Requirement | undefined;
  getRequirementsAsEnquiries: () => any[];
  getMyRequirements: () => any[];
  deleteRequirement: (id: string) => void;
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

      addRequirement: (requirement) => {
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
          fixedPrice: 0,
          state: '',
          city: '',
          country: '',
          deliveryLocation: '',
          specifications: '',
          allowLowerBid: false,
          date: now.split('T')[0],
          isDraft: false,
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
          requirementExpiry: requirement.deliveryDeadline, // Use delivery deadline as expiry
          status: requirement.isDraft ? 'draft' : 'active'
        } as Requirement;

        set((state) => ({
          requirements: [...state.requirements, newRequirement]
        }));
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

      updateRequirementStatus: (id, status) => {
        console.group('=== updateRequirementStatus ===');
        console.log('1. Starting update for requirement:', { id, newStatus: status });
        
        // First get current state
        const currentState = get();
        const requirement = currentState.requirements.find(req => req.id === id);
        
        if (!requirement) {
          console.error('Requirement not found:', id);
          console.groupEnd();
          return;
        }
        
        console.log('2. Current requirement data:', {
          id,
          oldStatus: requirement.status,
          currentData: requirement
        });
        
        // Update the state
        set((state) => {
          const updatedRequirements = state.requirements.map(req => {
            if (req.id === id) {
              const updated = { 
                ...req, 
                status,
                lastModified: new Date().toISOString()
              };
              
              console.log('3. Updated requirement data:', updated);
              return updated;
            }
            return req;
          });
          
          console.log('4. All requirements after update:', updatedRequirements);
          
          // Also update localStorage directly to ensure persistence
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
                    requirements: updatedStoredRequirements
                  }
                })
              );
              console.log('5. Successfully updated localStorage');
            }
          } catch (error) {
            console.error('Error updating localStorage:', error);
          }
          
          console.groupEnd();
          return { requirements: updatedRequirements };
        });
      },

      getRequirementById: (id) => {
        const { requirements } = get();
        return requirements.find(req => req.id === id);
      },

      getRequirementsAsEnquiries: () => {
        const { requirements } = get();
        console.group('=== getRequirementsAsEnquiries ===');
        console.log('Current requirements in store:', requirements);
        
        // Get responses from the responses store
        const responses = useResponses.getState().responses;
        
        return requirements
          .filter(req => {
            const isValid = !req.isDraft;
            console.log('Checking requirement:', { 
              id: req.id, 
              isDraft: req.isDraft, 
              status: req.status,
              isValid
            });
            return isValid;
          })
          .map(req => {
            const requirementResponses = responses.filter(r => r.requirementId === req.id);
            const hasResponses = requirementResponses.length > 0;
            
            console.log('Mapping requirement to enquiry:', { 
              id: req.id, 
              originalStatus: req.status,
              hasResponses,
              responseCount: requirementResponses.length
            });
            
            // If there are responses but status is still active, update it to responded
            let status = req.status;
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
            
            return {
              id: parseInt(req.id),
              customerName: req.customerName,
              productName: req.productName,
              quantity: req.quantity,
              message: req.message,
              date: req.date,
              status,
              expectedPrice: req.expectedPrice,
              fixedPrice: req.fixedPrice,
              origin: req.origin,
              grade: req.grade,
              deliveryLocation: req.deliveryLocation,
              city: req.city,
              country: req.country,
              deliveryDeadline: req.deliveryDeadline,
              specifications: req.specifications,
              allowLowerBid: req.allowLowerBid,
              minSupplyQuantity: req.minSupplyQuantity,
              createdAt: req.createdAt,
              lastModified: req.lastModified || req.createdAt
            };
          });
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

      deleteRequirement: (id) => {
        set((state) => ({
          requirements: state.requirements.filter(req => req.id !== id)
        }));
      },
    }),
    {
      name: 'requirements-storage',
    }
  )
);
