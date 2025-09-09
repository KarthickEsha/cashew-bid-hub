import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Eye, Check, X } from 'lucide-react';
import ChatModal from './ChatModal';

interface Enquiry {
  id: string;
  customerName: string;
  message: string;
  quantity: string;
  date: string;
  status: 'pending' | 'responded' | 'closed';
}

interface Order {
  id: string;
  customerName: string;
  quantity: string;
  totalAmount: number;
  date: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
}

interface EnquiryOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
}

const EnquiryOrderDrawer = ({ isOpen, onClose, productName, productId }: EnquiryOrderDrawerProps) => {
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  
  // Mock data - in real app, this would come from backend
  const mockEnquiries: Enquiry[] = [
    {
      id: '1',
      customerName: 'John Smith',
      message: 'Interested in bulk purchase. What are your best rates for 1000kg?',
      quantity: '1000kg',
      date: '2024-01-15',
      status: 'pending',
    },
    {
      id: '2',
      customerName: 'Sarah Johnson',
      message: 'Can you provide samples before bulk order?',
      quantity: '500kg',
      date: '2024-01-14',
      status: 'responded',
    },
  ];

  const mockOrders: Order[] = [
    {
      id: '1',
      customerName: 'Mike Wilson',
      quantity: '250kg',
      totalAmount: 2125,
      date: '2024-01-16',
      status: 'confirmed',
    },
    {
      id: '2',
      customerName: 'Anna Davis',
      quantity: '100kg',
      totalAmount: 850,
      date: '2024-01-15',
      status: 'shipped',
    },
  ];

  const handleChatOpen = (customerName: string) => {
    setSelectedCustomer(customerName);
    setChatModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'responded': case 'confirmed': return 'default';
      case 'shipped': return 'secondary';
      case 'delivered': case 'closed': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="w-[600px] sm:w-[700px]">
          <SheetHeader>
            <SheetTitle>Buyer Response</SheetTitle>
            <p className="text-sm text-muted-foreground">{productName}</p>
          </SheetHeader>

          <div className="mt-6">
            <Tabs defaultValue="newResponse" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="newResponse" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  New Response
                </TabsTrigger>
                <TabsTrigger value="allResponse" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  All Response
                </TabsTrigger>
              </TabsList>

              {/* New Response Tab (previously Enquiries) */}
              <TabsContent value="newResponse" className="space-y-4 mt-4">
                {mockEnquiries.map((enquiry) => (
                  <Card key={enquiry.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{enquiry.customerName}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {enquiry.quantity} • {enquiry.date}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(enquiry.status)}>
                          {enquiry.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{enquiry.message}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleChatOpen(enquiry.customerName)}
                          className="flex items-center gap-1"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Chat
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* All Response Tab (previously Orders) */}
              <TabsContent value="allResponse" className="space-y-4 mt-4">
                {mockOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base">{order.customerName}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id} • {order.date}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span>Quantity:</span>
                          <span className="font-medium">{order.quantity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Amount:</span>
                          <span className="font-medium">${order.totalAmount}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleChatOpen(order.customerName)}
                          className="flex items-center gap-1"
                        >
                          <MessageSquare className="h-3 w-3" />
                          Chat
                        </Button>
                        <Button size="sm" variant="outline" className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          View Order
                        </Button>
                        {order.status === 'pending' && (
                          <>
                            <Button size="sm" className="flex items-center gap-1">
                              <Check className="h-3 w-3" />
                              Confirm
                            </Button>
                            <Button size="sm" variant="destructive" className="flex items-center gap-1">
                              <X className="h-3 w-3" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      <ChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        customerName={selectedCustomer}
        productName={productName}
        userType="merchant"
      />
    </>
  );
};

export default EnquiryOrderDrawer;
