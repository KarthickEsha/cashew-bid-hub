import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventory } from '@/hooks/useInventory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Eye, Check, X, Calendar, Clock } from 'lucide-react';
import ChatModal from './ChatModal';
import { format, isToday, parseISO, subDays } from 'date-fns';

interface Enquiry {
  id: string;
  customerName: string;
  message: string;
  quantity: string;
  date: string;
  status: 'Pending' | 'Responded' | 'Closed';
  productId?: string;
}

interface Order {
  id: string;
  customerName: string;
  quantity: string;
  totalAmount: number;
  date: string;
  status: 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered';
}

interface EnquiryOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  productName: string;
  productId: string;
}

interface EnquiryCardProps {
  enquiry: Enquiry;
  onChatClick: (name: string) => void;
  isNew: boolean;
  onStatusChange: (id: string, status: 'Pending' | 'Responded' | 'Closed') => void;
}

const EnquiryCard = ({ enquiry, onChatClick, isNew, onStatusChange }: EnquiryCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'responded': return 'default';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{enquiry.customerName}</CardTitle>
            {isNew && (
              <Badge variant="default" className="text-xs">New</Badge>
            )}
          </div>
          <Badge variant={getStatusColor(enquiry.status)}>
            {enquiry.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{enquiry.quantity} MT</p>
        <p className="text-sm mt-2">{enquiry.message}</p>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-3.5 w-3.5" />
            <span>{enquiry.date}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChatClick(enquiry.customerName)}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat
            </Button>
            <div className="flex border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => onStatusChange(enquiry.id, 'Pending')}
              >
                <X
                  className={`h-4 w-4 ${enquiry.status === 'Pending' ? 'text-destructive' : ''
                    }`}
                />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => onStatusChange(enquiry.id, 'Responded')}
              >
                <Check
                  className={`h-4 w-4 ${enquiry.status === 'Responded' ? 'text-green-500' : ''
                    }`}
                />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

  );
};

const EnquiryOrderDrawer = ({ isOpen, onClose, productName, productId }: EnquiryOrderDrawerProps) => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const { incrementBuyerResponseCount } = useInventory();

  // Fetch enquiries from local storage when component mounts or productId changes
  useEffect(() => {
    if (isOpen) {
      const storedEnquiries = JSON.parse(localStorage.getItem('productEnquiries') || '[]');
      // Filter enquiries for the current product
      const productEnquiries = storedEnquiries
        .filter((e: Enquiry) => e.productId === productId)
        .map((e: Enquiry) => ({
          id: e.id,
          customerName: e.customerName,
          message: e.message,
          quantity: e.quantity,
          date: e.date,
          status: e.status || 'pending',
          productId: e.productId
        }));
      setEnquiries(productEnquiries);
    }
  }, [isOpen, productId]);

  // Group enquiries by date (new and older than 7 days)
  const { newResponses, oldResponses } = useMemo(() => {
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    const sortedEnquiries = [...enquiries].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      newResponses: sortedEnquiries.filter(enquiry =>
        new Date(enquiry.date) >= sevenDaysAgo
      ),
      oldResponses: sortedEnquiries
    };
  }, [enquiries]);

  const handleChatOpen = (customerName: string) => {
    setSelectedCustomer(customerName);
    setChatModalOpen(true);
  };

  const updateEnquiryStatus = (id: string, status: 'Pending' | 'Responded' | 'Closed') => {
    const enquiry = enquiries.find(e => e.id === id);
    const isNewResponse = enquiry?.status === 'Pending' && status === 'Responded';

    const updatedEnquiries = enquiries.map(enquiry =>
      enquiry.id === id ? { ...enquiry, status } : enquiry
    );
    setEnquiries(updatedEnquiries);

    // Update in local storage
    const storedEnquiries = JSON.parse(localStorage.getItem('productEnquiries') || '[]');
    const updatedStoredEnquiries = storedEnquiries.map((e: Enquiry) =>
      e.id === id ? { ...e, status } : e
    );
    localStorage.setItem('productEnquiries', JSON.stringify(updatedStoredEnquiries));

    // Increment buyer response count if this is a new response
    if (isNewResponse && productId) {
      incrementBuyerResponseCount(productId);
    }
  };

  const mockOrders: Order[] = [
    {
      id: '1',
      customerName: 'Mike Wilson',
      quantity: '250kg',
      totalAmount: 2125,
      date: '2024-01-16',
      status: 'Confirmed',
    },
    {
      id: '2',
      customerName: 'Anna Davis',
      quantity: '100kg',
      totalAmount: 850,
      date: '2024-01-15',
      status: 'Shipped',
    },
  ];

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
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Buyer Response</SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="enquiries" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="enquiries">New Response ({newResponses.length})</TabsTrigger>
              <TabsTrigger value="orders">All Response ({oldResponses.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="enquiries" className="space-y-4 mt-4">
              <div className="space-y-4">
                {newResponses.length > 0 ? (
                  <div className="space-y-4">
                    {newResponses.map((enquiry) => (
                      <EnquiryCard
                        key={enquiry.id}
                        enquiry={enquiry}
                        onChatClick={handleChatOpen}
                        isNew={true}
                        onStatusChange={updateEnquiryStatus}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No new enquiries</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <div className="space-y-4">
                {oldResponses.length > 0 ? (
                  <div className="space-y-4">
                    {oldResponses.map((enquiry) => (
                      <EnquiryCard
                        key={enquiry.id}
                        enquiry={enquiry}
                        onChatClick={handleChatOpen}
                        isNew={false}
                        onStatusChange={updateEnquiryStatus}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No older enquiries</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
