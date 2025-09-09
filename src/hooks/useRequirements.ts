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
  country: string;
  deliveryDeadline: string;
  specifications: string;
  allowLowerBid: boolean;
  message: string;
  date: string;
  status: 'pending' | 'responded' | 'active' | 'draft' | 'expired' | 'closed';
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
}

interface RequirementsState {
  requirements: Requirement[];
  addRequirement: (requirement: Omit<Requirement, 'id' | 'createdAt' | 'productName' | 'message' | 'fixedPrice'>) => void;
  updateRequirement: (id: string, requirement: Omit<Requirement, 'id' | 'createdAt' | 'customerName' | 'productName' | 'message' | 'fixedPrice'>) => void;
  updateRequirementStatus: (id: string, status: 'pending' | 'responded' | 'active' | 'draft' | 'expired' | 'closed') => void;
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
        
        const newRequirement: Requirement = {
          ...requirement,
          id: Date.now().toString(),
          customerName: requirement.customerName || 'Anonymous Buyer',
          productName: `${requirement.grade} Cashews`,
          message: `Looking for ${requirement.quantity} of ${requirement.grade} cashews from ${requirement.origin}. ${requirement.specifications || 'Standard quality requirements.'}`,
          fixedPrice,
          createdAt: now,
          // Additional fields for MyRequirements compatibility
          title: `${requirement.grade} Cashews for ${requirement.deliveryLocation}`,
          preferredOrigin: originNames[requirement.origin] || requirement.origin,
          budgetRange: `₹${requirement.expectedPrice}/kg`,
          requirementExpiry: requirement.deliveryDeadline, // Use delivery deadline as expiry
          responsesCount: 0,
          createdDate: now.split('T')[0], // Date only
          lastModified: now.split('T')[0], // Date only
          status: requirement.isDraft ? 'draft' : 'active'
        };

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
          requirements: state.requirements.map(req =>
            req.id === id ? {
              ...req,
              ...requirement,
              fixedPrice,
              lastModified: now.split('T')[0],
              title: `${requirement.grade} Cashews for ${requirement.deliveryLocation}`,
              preferredOrigin: originNames[requirement.origin] || requirement.origin,
              budgetRange: `₹${requirement.expectedPrice}/kg`,
              requirementExpiry: requirement.deliveryDeadline,
              productName: `${requirement.grade} Cashews`,
              message: `Looking for ${requirement.quantity} of ${requirement.grade} cashews from ${requirement.origin}. ${requirement.specifications || 'Standard quality requirements.'}`,
              status: requirement.isDraft ? 'draft' : 'active'
            } : req
          )
        }));
      },

      updateRequirementStatus: (id, status) => {
        set((state) => ({
          requirements: state.requirements.map(req =>
            req.id === id ? { ...req, status } : req
          )
        }));
      },

      getRequirementById: (id) => {
        const { requirements } = get();
        return requirements.find(req => req.id === id);
      },

      getRequirementsAsEnquiries: () => {
        const { requirements } = get();
        return requirements
          .filter(req => !req.isDraft) // Only show non-draft requirements
          .map(req => ({
            id: parseInt(req.id),
            customerName: req.customerName,
            productName: req.productName,
            quantity: req.quantity,
            message: req.message,
            date: req.date,
            status: req.status,
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
            minSupplyQuantity: req.minSupplyQuantity
          }));
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
