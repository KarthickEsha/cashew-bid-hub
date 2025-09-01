import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, TrendingUp, Users } from 'lucide-react';
import { useBidding, Bid } from '@/hooks/useBidding';
import { toast } from 'sonner';

interface MerchantBidManagementProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

const MerchantBidManagement = ({ isOpen, onClose, productId, productName }: MerchantBidManagementProps) => {
  const { getBidsForProduct, updateBidStatus } = useBidding();
  const productBids = getBidsForProduct(productId);
  const activeBids = productBids.filter(bid => bid.status === 'active');
  const currentHighestBid = productBids.length > 0 ? Math.max(...productBids.map(b => b.bidAmount)) : 0;

  const handleAcceptBid = (bidId: string) => {
    updateBidStatus(bidId, 'accepted', new Date().toISOString().split('T')[0]);
    toast.success('Bid accepted successfully!');
  };

  const handleRejectBid = (bidId: string) => {
    updateBidStatus(bidId, 'rejected', new Date().toISOString().split('T')[0]);
    toast.success('Bid rejected');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock size={16} className="text-yellow-500" />;
      case 'accepted':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Bids - {productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Highest Bid</div>
                    <div className="text-xl font-bold">${currentHighestBid}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Active Bids</div>
                    <div className="text-xl font-bold">{activeBids.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Bids</div>
                    <div className="text-xl font-bold">{productBids.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bids Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Bids</CardTitle>
            </CardHeader>
            <CardContent>
              {productBids.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">No bids received yet</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bidder</TableHead>
                      <TableHead>Bid Amount</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Bid Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productBids.map((bid) => (
                      <TableRow key={bid.id}>
                        <TableCell className="font-medium">{bid.buyerName}</TableCell>
                        <TableCell>${bid.bidAmount}</TableCell>
                        <TableCell>{bid.quantity}</TableCell>
                        <TableCell>${bid.totalValue.toLocaleString()}</TableCell>
                        <TableCell>{new Date(bid.bidDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(bid.status)}
                            <Badge className={getStatusColor(bid.status)}>
                              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {bid.status === 'active' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleAcceptBid(bid.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectBid(bid.id)}
                                className="border-red-200 text-red-600 hover:bg-red-50"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MerchantBidManagement;