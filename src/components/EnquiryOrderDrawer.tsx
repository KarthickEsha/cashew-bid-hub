import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useInventory } from '@/hooks/useInventory';
import { useResponses } from '@/hooks/useResponses';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Eye, Check, X, Calendar, Clock, MessageCircle } from 'lucide-react';
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
  responseCounts?: { [key: string]: number };
}

const EnquiryCard = ({ enquiry, onChatClick, isNew, onStatusChange, responseCounts = {} }: EnquiryCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'destructive';
      case 'responded':
        return 'success';
      case 'closed':
        return 'outline';
      case 'confirmed':
        return 'default';
      case 'shipped':
        return 'secondary';
      case 'delivered':
        return 'default';
      default:
        return 'outline';
    }
  };

  const handleMarkAsClosed = (id: string) => {
    onStatusChange(id, 'Closed');
  };

  const handleMarkAsResponded = (id: string) => {
    onStatusChange(id, 'Responded');
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {/* <MessageCircle className="h-4 w-4 text-muted-foreground" /> */}
          {/* <span className="text-sm font-medium">
            {responseCounts[enquiry.id] || 0} {responseCounts[enquiry.id] === 1 ? 'Response' : 'Responses'}
          </span> */}
        </div>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{enquiry.customerName}</CardTitle>
              {isNew && (
                <Badge variant="default" className="text-xs">New</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {enquiry.productName || 'Product Name N/A'}
            </p>
          </div>
          <Badge variant={getStatusColor(enquiry.status)}>
            {enquiry.status}
          </Badge>
        </div>

        <div className="mt-4 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-sm font-medium">Quantity</p>
              <p className="text-sm text-muted-foreground">{enquiry.quantity} MT</p>
            </div>
            <div>
              <p className="text-sm font-medium">Expected Price</p>
              <p className="text-sm text-muted-foreground">
                {enquiry.expectedPrice ? 
                  new Intl.NumberFormat("en-IN", { 
                    style: "currency", 
                    currency: "INR" 
                  }).format(Number(enquiry.expectedPrice)) : 'N/A'}
              </p>
            </div>
          </div>

          {enquiry.grade && (
            <div>
              <p className="text-sm font-medium">Grade</p>
              <p className="text-sm text-muted-foreground">{enquiry.grade}</p>
            </div>
          )}

          {enquiry.origin && (
            <div>
              <p className="text-sm font-medium">Origin</p>
              <p className="text-sm text-muted-foreground">{enquiry.origin}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-medium">Message</p>
            <p className="text-sm text-muted-foreground">
              {enquiry.message || 'No message provided'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-1 h-3.5 w-3.5" />
            <span>
              {format(new Date(enquiry.date), 'MMM d, yyyy h:mm a')}
              {enquiry.lastUpdated && ` • Updated: ${format(new Date(enquiry.lastUpdated), 'MMM d, yyyy h:mm a')}`}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChatClick(enquiry.customerName)}
              className="gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
              {(responseCounts[enquiry.id] > 0 || enquiry.responseCount > 0) && (
                <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 flex items-center justify-center">
                  {responseCounts[enquiry.id] || enquiry.responseCount}
                </Badge>
              )}
            </Button>
            <div className="flex border rounded-md">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleMarkAsClosed(enquiry.id)}
                title="Mark as Closed"
              >
                <X className="h-4 w-4 text-destructive" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => handleMarkAsResponded(enquiry.id)}
                title="Mark as Responded"
              >
                <Check className="h-4 w-4 text-green-500" />
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
  const { incrementBuyerResponseCount, reduceAvailableStock } = useInventory();
  const { addResponse, getResponsesByRequirementId } = useResponses();
  const { profile } = useProfile();
  const { toast } = useToast();

  const updateEnquiryStatus = (id: string, status: 'Pending' | 'Responded' | 'Closed') => {
    try {
      const storedEnquiries = JSON.parse(localStorage.getItem('productEnquiries') || '[]');
      const updatedEnquiries = storedEnquiries.map((enquiry: any) => 
        enquiry.id === id ? { ...enquiry, status } : enquiry
      );
      
      localStorage.setItem('productEnquiries', JSON.stringify(updatedEnquiries));
      
      // Update the local state to reflect the change
      setEnquiries(prevEnquiries => 
        prevEnquiries.map(enquiry => 
          enquiry.id === id ? { ...enquiry, status } : enquiry
        )
      );
      
      toast({
        title: 'Status updated',
        description: `Enquiry status changed to ${status}`,
      });
    } catch (error) {
      console.error('Error updating enquiry status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update enquiry status',
        variant: 'destructive',
      });
    }
  };

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

  // Get response counts for all enquiries
  const responseCounts = useMemo(() => {
    const counts: { [key: string]: number } = {};
    enquiries.forEach(enquiry => {
      counts[enquiry.id] = getResponsesByRequirementId(enquiry.id).length;
    });
    return counts;
  }, [enquiries, getResponsesByRequirementId]);

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

  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const handleChatOpen = (enquiry: Enquiry) => {
    setSelectedCustomer(enquiry.customerName);
    setSelectedEnquiry(enquiry);
    setChatModalOpen(true);
  };

  const handleStatusChange = async (id: string, status: 'Pending' | 'Responded' | 'Closed') => {
    try {
      const enquiry = enquiries.find(e => e.id === id);
      if (!enquiry) return;
      
      // If status is being changed to 'Responded', reduce the available stock
      if (status === 'Responded') {
        // Extract quantity from the enquiry (e.g., '10 MT' -> 10)
        const quantity = parseFloat(enquiry.quantity.split(' ')[0]);
        if (!isNaN(quantity)) {
          await reduceAvailableStock(productId, quantity);
          toast({
            title: 'Stock Updated',
            description: `Reduced available stock by ${quantity} MT for ${enquiry.customerName}'s enquiry.`,
          });
        }
      }

      // Update the enquiry status in state
      const updatedEnquiries = enquiries.map(e => 
        e.id === id 
          ? { 
              ...e, 
              status,
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
              lastUpdated: new Date().toISOString()
            }
          : e
      );

      localStorage.setItem('productEnquiries', JSON.stringify(updatedStoredEnquiries));

      // If this is a new response, add it to the responses and increment buyer response count
      if (status === 'Responded' && productId) {
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
          certifications: ['Organic', 'Fair Trade'],
          deliveryTime: '30 days',
          contact: profile?.email || 'contact@yourcompany.com',
          message: `Response to enquiry from ${enquiry.customerName} regarding ${enquiry.quantity || 'unknown quantity'}`,
          remarks: `Response to enquiry from ${enquiry.customerName} regarding ${enquiry.quantity || 'unknown quantity'}`,
          requirementTitle: enquiry.productName || productName,
          productName: enquiry.productName || productName,
        };

        // Add a new merchant response
        await addResponse(responseData);

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
            <SheetTitle>Buyer Responses</SheetTitle>
          </SheetHeader>

          <Tabs defaultValue="new" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="new">New Responses ({newResponses.length})</TabsTrigger>
              <TabsTrigger value="all">All Responses ({enquiries.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="mt-4">
              <div className="space-y-4">
                {newResponses.length > 0 ? (
                  newResponses.map((enquiry) => (
                    <EnquiryCard
                      key={enquiry.id}
                      enquiry={enquiry}
                      onChatClick={() => handleChatOpen(enquiry)}
                      isNew={true}
                      onStatusChange={handleStatusChange}
                      responseCounts={responseCounts}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No new responses</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="all" className="mt-4">
              <div className="space-y-4">
                {enquiries.length > 0 ? (
                  enquiries.map((enquiry) => (
                    <EnquiryCard
                      key={enquiry.id}
                      enquiry={enquiry}
                      onChatClick={() => handleChatOpen(enquiry)}
                      isNew={new Date(enquiry.date) >= subDays(new Date(), 7)}
                      onStatusChange={handleStatusChange}
                      responseCounts={responseCounts}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No responses found</p>
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
        enquiry={selectedEnquiry}
      />
    </>
  );
};

export default EnquiryOrderDrawer;