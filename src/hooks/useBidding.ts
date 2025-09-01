import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Bid {
  id: string;
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  buyerId: string;
  buyerName: string;
  bidAmount: number;
  quantity: number;
  totalValue: number;
  status: 'active' | 'accepted' | 'rejected' | 'expired';
  bidDate: string;
  expiryDate: string;
  acceptedDate?: string;
  rejectedDate?: string;
  location: string;
  openingBid?: number;
  currentHighestBid?: number;
  bidHistory: {
    bidder: string;
    amount: number;
    timestamp: string;
  }[];
}

export interface BiddingState {
  bids: Bid[];
  activeBiddings: { [productId: string]: Bid[] };
  addBid: (bid: Omit<Bid, 'id' | 'bidDate'>) => void;
  updateBidStatus: (bidId: string, status: 'accepted' | 'rejected', date?: string) => void;
  getBidsForProduct: (productId: string) => Bid[];
  getBidsForBuyer: (buyerId: string) => Bid[];
  getBidsForMerchant: (merchantId: string) => Bid[];
  getActiveBiddingForProduct: (productId: string) => Bid[];
  placeBid: (productId: string, buyerId: string, buyerName: string, amount: number, quantity: number) => void;
}

export const useBidding = create<BiddingState>()(
  persist(
    (set, get) => ({
      bids: [
        {
          id: '1',
          productId: '1',
          productName: 'Premium Cashews W240',
          merchantId: 'merchant1',
          merchantName: 'Golden Cashew Co.',
          buyerId: 'buyer1',
          buyerName: 'John Doe',
          bidAmount: 8200,
          quantity: 25,
          totalValue: 205000,
          status: 'active',
          bidDate: '2024-08-20',
          expiryDate: '2024-08-25',
          location: 'Mumbai, India',
          openingBid: 8000,
          currentHighestBid: 8200,
          bidHistory: [
            { bidder: 'John Doe', amount: 8000, timestamp: '2024-08-20T10:00:00Z' },
            { bidder: 'John Doe', amount: 8200, timestamp: '2024-08-20T11:30:00Z' }
          ]
        },
        {
          id: '2',
          productId: '2',
          productName: 'Organic SW240 Cashews',
          merchantId: 'merchant2',
          merchantName: 'Vietnam Nuts Ltd.',
          buyerId: 'buyer1',
          buyerName: 'John Doe',
          bidAmount: 9500,
          quantity: 15,
          totalValue: 142500,
          status: 'accepted',
          bidDate: '2024-08-18',
          expiryDate: '2024-08-23',
          acceptedDate: '2024-08-19',
          location: 'Ho Chi Minh, Vietnam',
          openingBid: 9000,
          currentHighestBid: 9500,
          bidHistory: [
            { bidder: 'John Doe', amount: 9000, timestamp: '2024-08-18T09:00:00Z' },
            { bidder: 'Jane Smith', amount: 9300, timestamp: '2024-08-18T14:00:00Z' },
            { bidder: 'John Doe', amount: 9500, timestamp: '2024-08-18T16:00:00Z' }
          ]
        },
        {
          id: '3',
          productId: '3',
          productName: 'W240 Cashews',
          merchantId: 'merchant3',
          merchantName: 'African Cashew Co',
          buyerId: 'buyer1',
          buyerName: 'John Doe',
          bidAmount: 7800,
          quantity: 30,
          totalValue: 234000,
          status: 'rejected',
          bidDate: '2024-08-15',
          expiryDate: '2024-08-20',
          rejectedDate: '2024-08-16',
          location: 'Accra, Ghana',
          openingBid: 7500,
          currentHighestBid: 7800,
          bidHistory: [
            { bidder: 'John Doe', amount: 7500, timestamp: '2024-08-15T10:00:00Z' },
            { bidder: 'John Doe', amount: 7800, timestamp: '2024-08-15T15:00:00Z' }
          ]
        }
      ],
      activeBiddings: {},
      
      addBid: (bid) => {
        const newBid: Bid = {
          ...bid,
          id: Math.random().toString(36).substring(7),
          bidDate: new Date().toISOString().split('T')[0],
        };
        set((state) => ({
          bids: [...state.bids, newBid]
        }));
      },
      
      updateBidStatus: (bidId, status, date) => {
        set((state) => ({
          bids: state.bids.map(bid =>
            bid.id === bidId
              ? {
                  ...bid,
                  status,
                  ...(status === 'accepted' && { acceptedDate: date }),
                  ...(status === 'rejected' && { rejectedDate: date })
                }
              : bid
          )
        }));
      },
      
      getBidsForProduct: (productId) => {
        return get().bids.filter(bid => bid.productId === productId);
      },
      
      getBidsForBuyer: (buyerId) => {
        return get().bids.filter(bid => bid.buyerId === buyerId);
      },
      
      getBidsForMerchant: (merchantId) => {
        return get().bids.filter(bid => bid.merchantId === merchantId);
      },
      
      getActiveBiddingForProduct: (productId) => {
        return get().bids.filter(bid => bid.productId === productId && bid.status === 'active');
      },
      
      placeBid: (productId, buyerId, buyerName, amount, quantity) => {
        const existingBids = get().getBidsForProduct(productId);
        const productBid = existingBids[0]; // Get product info from existing bid
        
        if (productBid) {
          const newBid: Bid = {
            id: Math.random().toString(36).substring(7),
            productId,
            productName: productBid.productName,
            merchantId: productBid.merchantId,
            merchantName: productBid.merchantName,
            buyerId,
            buyerName,
            bidAmount: amount,
            quantity,
            totalValue: amount * quantity,
            status: 'active',
            bidDate: new Date().toISOString().split('T')[0],
            expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
            location: productBid.location,
            openingBid: productBid.openingBid,
            currentHighestBid: Math.max(amount, productBid.currentHighestBid || 0),
            bidHistory: [
              ...productBid.bidHistory,
              { bidder: buyerName, amount, timestamp: new Date().toISOString() }
            ]
          };
          
          set((state) => ({
            bids: [...state.bids, newBid]
          }));
        }
      }
    }),
    {
      name: 'bidding-storage',
    }
  )
);