import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Clock, TrendingUp, Users, History } from 'lucide-react';
import { useBidding } from '@/hooks/useBidding';
import { toast } from 'sonner';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  currentPrice: number;
  unit: string;
}

const BidModal = ({ isOpen, onClose, productId, productName, currentPrice, unit }: BidModalProps) => {
  const [bidAmount, setBidAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const { getBidsForProduct, placeBid, getActiveBiddingForProduct } = useBidding();
  
  const productBids = getBidsForProduct(productId);
  const activeBids = getActiveBiddingForProduct(productId);
  const currentHighestBid = productBids.length > 0 ? Math.max(...productBids.map(b => b.bidAmount)) : currentPrice;
  const bidHistory = productBids.flatMap(b => b.bidHistory).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 5);

  const handlePlaceBid = () => {
    if (!bidAmount || !quantity) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(bidAmount);
    const qty = parseFloat(quantity);

    if (amount <= currentHighestBid) {
      toast.error(`Bid must be higher than current highest bid of $${currentHighestBid}`);
      return;
    }

    placeBid(productId, 'buyer1', 'John Doe', amount, qty);
    toast.success('Bid placed successfully!');
    setBidAmount('');
    setQuantity('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Place Bid - {productName}</DialogTitle>
          <DialogDescription>
            Current highest bid: ${currentHighestBid}/{unit}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Bidding Status */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-muted-foreground">Highest Bid</span>
                  </div>
                  <div className="text-2xl font-bold">${currentHighestBid}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-sm text-muted-foreground">Active Bidders</span>
                  </div>
                  <div className="text-2xl font-bold">{activeBids.length}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-orange-500 mr-2" />
                    <span className="text-sm text-muted-foreground">Time Left</span>
                  </div>
                  <div className="text-lg font-semibold">2d 5h</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Place New Bid */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Place Your Bid</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bidAmount">Bid Amount (per {unit})</Label>
                <Input
                  id="bidAmount"
                  type="number"
                  placeholder={`Minimum: $${currentHighestBid + 0.1}`}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity ({unit})</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            </div>
            {bidAmount && quantity && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Total Value</div>
                <div className="text-xl font-bold">
                  ${(parseFloat(bidAmount) * parseFloat(quantity)).toLocaleString()}
                </div>
              </div>
            )}
            <Button onClick={handlePlaceBid} className="w-full">
              Place Bid
            </Button>
          </div>

          {/* Bid History */}
          {bidHistory.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-semibold">Recent Bid History</h3>
                </div>
                <div className="space-y-2">
                  {bidHistory.map((bid, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{bid.bidder}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(bid.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="outline">${bid.amount}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;