import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useInventory } from '@/hooks/useInventory';
import { useResponses } from '@/hooks/useResponses';
import { useProfile } from '@/hooks/useProfile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Eye, Check, X, Calendar, Clock, MessageCircle } from 'lucide-react';
import ChatModal from './ChatModal';
import { format, isToday, parseISO, subDays } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface Enquiry {
  id: string;
  customerName: string;
  message: string;
  quantity: string;
  date: string;
  status: 'Pending' | 'Responded' | 'Closed';
  productId?: string;
  productName?: string;
  responseCount?: number;
  lastUpdated?: string;
  grade?: string;
  origin?: string;
  expectedPrice?: string | number;
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
          <div className="flex items-center gap-2">
            {enquiry.responseCount > 0 && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MessageCircle className="h-4 w-4 mr-1" />
                {enquiry.responseCount}
              </div>
            )}
            <Badge variant={getStatusColor(enquiry.status)}>
              {enquiry.status}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{enquiry.quantity} MT</p>
        <p className="text-sm text-muted-foreground">
          {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(enquiry.expectedPrice))}
        </p>

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
  const { addResponse, getResponsesByRequirementId } = useResponses();
  const { profile } = useProfile();

  // Fetch enquiries from local storage when component mounts or productId changes
  useEffect(() => {
    if (isOpen) {
      try {
        const storedEnquiries = JSON.parse(localStorage.getItem('productEnquiries') || '[]');
        console.log('Stored enquiries:', storedEnquiries);

        // Filter enquiries for the current product and add response count
        const productEnquiries = storedEnquiries
          .filter((e: any) => e.productId === productId)
          .map((e: any) => {
            const responses = getResponsesByRequirementId(e.id);
            console.log(`Enquiry ${e.id} responses:`, responses);

            return {
              id: e.id,
              customerName: e.customerName || 'Unknown Buyer',
              message: e.message || 'No message provided',
              quantity: e.quantity || '0',
              date: e.date || new Date().toISOString(),
              status: e.status || 'Pending',
              productId: e.productId,
              grade: e.grade || 'N/A',
              expectedPrice: e.price || 'N/A',
              responseCount: responses.length,
              productName: e.productName || productName
            };
          });

        console.log('Processed product enquiries:', productEnquiries);
        setEnquiries(productEnquiries);
      } catch (error) {
        console.error('Error loading enquiries:', error);
        toast({
          title: 'Error',
          description: 'Failed to load enquiries. Please try again.',
          variant: 'destructive',
        });
      }
    }
  }, [isOpen, productId, getResponsesByRequirementId, productName]);

  // Group enquiries by date (new and older than 7 days)
  const { newResponses, oldResponses } = useMemo(() => {
    try {
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);

      // Create a safe copy and filter out any invalid entries
      const validEnquiries = enquiries.filter(e => e && e.date);

      const sortedEnquiries = [...validEnquiries].sort((a, b) => {
        // Handle potential invalid dates
        const dateA = new Date(a.date).getTime() || 0;
        const dateB = new Date(b.date).getTime() || 0;
        return dateB - dateA;
      });

      // Split into new and old responses
      const newResponses = sortedEnquiries.filter(enquiry => {
        try {
          const enquiryDate = new Date(enquiry.date);
          return !isNaN(enquiryDate.getTime()) && enquiryDate >= sevenDaysAgo;
        } catch (e) {
          console.error('Error processing enquiry date:', enquiry.date, e);
          return false;
        }
      });

      // Sort old responses by response count (highest first) then by date (newest first)
      const oldResponses = [...sortedEnquiries]
        .filter(enquiry => !newResponses.some(nr => nr.id === enquiry.id))
        .sort((a, b) => {
          // First sort by response count (descending)
          const countDiff = (b.responseCount || 0) - (a.responseCount || 0);
          if (countDiff !== 0) return countDiff;

          // If counts are equal, sort by date (newest first)
          const dateA = new Date(a.date).getTime() || 0;
          const dateB = new Date(b.date).getTime() || 0;
          return dateB - dateA;
        });

      return {
        newResponses: newResponses || [],
        oldResponses: oldResponses || []
      };
    } catch (error) {
      console.error('Error grouping enquiries:', error);
      return { newResponses: [], oldResponses: [] };
    }
  }, [enquiries]);

  const handleChatOpen = (customerName: string) => {
    setSelectedCustomer(customerName);
    setChatModalOpen(true);
  };

  const updateEnquiryStatus = async (id: string, status: 'Pending' | 'Responded' | 'Closed') => {
    try {
      const enquiry = enquiries.find(e => e.id === id);
      if (!enquiry) {
        console.error('Enquiry not found:', id);
        return;
      }

      const isNewResponse = enquiry.status === 'Pending' && status === 'Responded';

      // Get current responses to update the count
      const responses = getResponsesByRequirementId(id);
      const updatedResponseCount = isNewResponse ? responses.length + 1 : responses.length;

      // Update local state
      const updatedEnquiries = enquiries.map(e =>
        e.id === id
          ? {
            ...e,
            status,
            responseCount: updatedResponseCount,
            lastUpdated: new Date().toISOString()
          }
          : e
      );

      setEnquiries(updatedEnquiries);

      // Update in local storage
      const storedEnquiries = JSON.parse(localStorage.getItem('productEnquiries') || '[]');
      const updatedStoredEnquiries = storedEnquiries.map((e: Enquiry) =>
        e.id === id
          ? {
            ...e,
            status,
            responseCount: responses.length,
            lastUpdated: new Date().toISOString()
          }
          : e
      );

      localStorage.setItem('productEnquiries', JSON.stringify(updatedStoredEnquiries));

      // If this is a new response, add it to the responses and increment buyer response count
      if (isNewResponse && productId) {
        // Increment the response count
        incrementBuyerResponseCount(productId);
        const responseData = {
          requirementId: productId.toString(),
          merchantId: profile?.id || 'merchant-id',
          merchantName: profile?.companyName || profile?.name || 'Your Company',
          merchantLocation: [profile?.city, profile?.state, profile?.country].filter(Boolean).join(', ') || 'Your Location',
          price: enquiry.expectedPrice ? String(enquiry.expectedPrice) : "0",
          responseDate: new Date().toISOString(),
          status: 'new' as const,
          grade: enquiry.grade || '',
          quantity: enquiry.quantity || '0',
          origin: enquiry.origin || '',
          certifications: ['Organic', 'Fair Trade'], // Default certifications
          deliveryTime: '30 days', // Default delivery time
          contact: profile?.email || 'contact@yourcompany.com',
          message: `Response to enquiry from ${enquiry.customerName} regarding ${enquiry.quantity || 'unknown quantity'}`,
          remarks: `Response to enquiry from ${enquiry.customerName} regarding ${enquiry.quantity || 'unknown quantity'}`,
          requirementTitle: enquiry.productName || productName,
          productName: enquiry.productName || productName,
        };

        // Add a new merchant response
        addResponse(responseData);

        // Show success message
        toast({
          title: 'Response submitted',
          description: 'Your response has been recorded and will be visible to the buyer.',
        });
      }

    } catch (error) {
      console.error('Error updating enquiry status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update enquiry status. Please try again.',
        variant: 'destructive',
      });
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
  ] as Order[];

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