import { useEffect, useState } from "react";
import { useParams, useNavigate } from 'react-router-dom';
import { useInventory } from '@/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { useInventory as useInventoryHook } from '@/hooks/useInventory';
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  MapPin, Calendar, Star, Phone, Mail, Globe, ArrowLeft,
  TrendingUp, Package, Shield, Clock, Send, Zap, Sparkles
} from "lucide-react";
import { useRole } from "@/hooks/useRole";
import { merchants, products } from "@/data/mockdata";
import { Product, Location as LocationType } from "@/types/user";
import { useUser } from "@clerk/clerk-react";
import { useProfile } from "@/hooks/useProfile";
import { useRequirements } from "@/hooks/useRequirements";
import { useOrders } from "@/hooks/useOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, CheckCircle, XCircle, Clock as ClockIcon, User, ArrowUpRight } from 'lucide-react';
import { useResponses } from '@/hooks/useResponses';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useSearchParams } from 'react-router-dom';

const ProductDetail = () => {
  // Hooks must be called at the top level
  const { id } = useParams<{ id: string }>();
  const { products: inventoryProducts, incrementEnquiryCount, incrementBuyerResponseCount } = useInventoryHook();
  const navigate = useNavigate();
  const { role } = useRole();
  const { user } = useUser();
  const { profile, setProfile } = useProfile();
  const { addRequirement } = useRequirements();
  const { orders: allOrders, addOrder, updateOrderStatus } = useOrders();
  const { toast } = useToast();

  const { getOrderByResponseId } = useOrders();
  const { responses, getResponsesByProductId } = useResponses();
  const [searchParams] = useSearchParams();
  const from = searchParams.get('from');

  // State hooks - all hooks must be called unconditionally at the top level
  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [merchant, setMerchant] = useState<{
    id: string;
    name: string;
    rating?: number;
    totalOrders?: number;
    location: string | LocationType;
    verified?: boolean;
    responseTime?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
  } | null>(null);
  const [bidQuantity, setBidQuantity] = useState("");
  const [bidPrice, setBidPrice] = useState("");
  const [bidMessage, setBidMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState("");
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [showEnquiryDetail, setShowEnquiryDetail] = useState(false);

  // Derived state
  const auctionEnd = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);



  // All effects must be defined before any conditional returns
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = auctionEnd.getTime() - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft("Auction Ended");
      } else {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const foundProduct = inventoryProducts.find((p) => p.id === id);
        if (foundProduct) {
          setProduct(foundProduct);
          // In a real app, you would fetch merchant data based on product.merchantId or similar
          const merchantData = merchants.find((m) => m.id === foundProduct.merchantId) || {
            id: user?.id || 'default-merchant',
            name: profile?.companyName || 'Unknown Merchant',
            rating: 4.5,
            totalOrders: 0,
            location: profile?.city || 'Unknown',
            verified: false,
            responseTime: 'Within 24 hours',
            phone: profile?.phone || 'N/A',
            email: profile?.email || 'N/A',
            website: 'www.kriyatec.in',
            description: 'Merchant information not available'
          };
          setMerchant(merchantData);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, inventoryProducts]);

  useEffect(() => {
    if (id) {
      // Get all orders for the current product - filter by productId
      const productOrders = allOrders.filter(order => order.productId === id);

      // Get all responses for the current product
      const productResponses = getResponsesByProductId(id);
      // Combine orders and responses into enquiries
      const combinedEnquiries = [
        ...productOrders.map(order => ({
          id: order.id,
          type: 'order',
          status: order.status,
          date: order.orderDate,
          customer: order.customerName,
          quantity: order.quantity,
          price: order.unitPrice,
          message: order.buyerRemarks || 'No message provided',
          details: order
        })),
        ...productResponses.map(response => ({
          id: response.id,
          type: 'response',
          status: response.status,
          date: response.responseDate || response.createdAt,
          customer: response.merchantName || 'Unknown',
          quantity: response.quantity,
          price: response.price,
          message: response.message || 'No message provided',
          details: response,
          orderId: getOrderByResponseId(response.id)?.id
        }))
      ];
      // Sort by date (newest first)
      combinedEnquiries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEnquiries(combinedEnquiries);
    }
  }, [id, allOrders, responses, getResponsesByProductId, getOrderByResponseId]);

  const getStatusBadge = (status: string) => {
    if (!status) return null;

    const statusLower = status.toLowerCase();

    if (['accepted', 'confirmed', 'processing'].includes(statusLower)) {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          {status === 'Processing' ? 'New' : status}
        </Badge>
      );
    }

    if (['rejected', 'cancelled', 'declined'].includes(statusLower)) {
      return (
        <Badge variant="destructive" className="hover:bg-destructive/90">
          <XCircle className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      );
    }

    if (['new', 'pending', 'in_progress'].includes(statusLower)) {
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-600">
          <ClockIcon className="mr-1 h-3 w-3" />
          {status}
        </Badge>
      );
    }

    return <Badge variant="outline">{status}</Badge>;
  };
  // Get product specifications safely
  const getProductSpecs = () => {
    if (!product) return [];

    const specs = [];

    // Add type-specific specs
    if (product.type === 'RCN') {
      if (product.yearOfCrop) specs.push(['Crop Year', product.yearOfCrop]);
      if (product.nutCount) specs.push(['Nut Count', product.nutCount]);
      if (product.outTurn) specs.push(['Out Turn', product.outTurn]);
    } else if (product.type === 'Kernel') {
      if (product.grade) specs.push(['Grade', product.grade]);
    }

    // Add common specs
    specs.push(
      // ['Stock', `${product.availableQty} ${product.unit}`],
      [
        'Minimum Order', product.minOrderQty ? `${product.minOrderQty.toLocaleString()} ${product.unit}` : 'No minimum'],
      // ['Pricing Type', product.pricingType === 'bidding' ? 'Bidding' : 'Fixed Price'],
      ['Origin', product.location || 'N/A']
    );

    return specs;
  };

  // Mock Current Bids (replace with API later)
  const currentBids = [
    { id: 1, bidder: "Food Corp Ltd", price: "$950/ton", quantity: "20 tons", time: "2h ago" },
    { id: 2, bidder: "SnackHub Traders", price: "$970/ton", quantity: "15 tons", time: "1h ago" },
  ];
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/marketplace')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const handleBack = () => {
    if (from === 'merchant-orders') return navigate('/merchant/buyer-response');
    if (role === 'processor') return navigate('/merchant/products');
    return navigate('/marketplace');
  };

  const handlePlaceBid = async () => {
    // Validate quantity doesn't exceed available stock
    if (bidQuantity && parseFloat(bidQuantity) > (product?.availableQty || 0)) {
      toast({
        title: "Invalid Quantity",
        description: `Quantity cannot exceed available stock of ${product?.availableQty} ${product?.unit}`,
        variant: "destructive",
      });
      return;
    }

    if ((!bidQuantity || !bidPrice) && product?.pricingType === 'bidding') {
      toast({
        title: "Missing Information",
        description: "Please fill in quantity and expected price.",
        variant: "destructive",
      });
      return;
    }

    try {
      const now = new Date().toISOString();
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
      // Create order data
      const orderData = {
        id: `ORD-${Date.now()}`,
        requirementId: `REQ-${Date.now()}`,
        responseId: `RES-${Date.now()}`,
        productId: product.id,
        productName: product.grade ? `${product.grade} Cashews` : 'Raw Cashews',
        merchantName: merchant?.name || 'Unknown Merchant',
        merchantId: product.merchantId || 'unknown',
        customerName: user?.fullName || profile?.name || 'Anonymous Buyer',
        quantity: bidQuantity ? `${bidQuantity} ${product.unit}` : 'Enquiry only',
        unitPrice: bidPrice != "" ? bidPrice : `${product.price}`,
        totalAmount: bidPrice != "" ?
          (parseFloat(bidQuantity || '0') * parseFloat(bidPrice || '0')).toFixed(2) :
          (parseFloat(bidQuantity) * product.price).toFixed(2),
        status: 'Processing' as const,
        orderDate: now,
        deliveryDate: deliveryDate.toISOString().split('T')[0],
        location: typeof product.location === 'string' ? product.location : 'Unknown Location',
        grade: product.grade || 'N/A',
        origin: typeof product.location === 'string' ? product.location : 'Unknown',
        buyerRemarks: bidMessage || 'Bid placed',
        source: 'Market Place',
        statusHistory: [
          {
            status: 'Processing',
            timestamp: now,
            remarks: bidMessage || 'Order placed',
            updatedBy: user?.fullName || profile?.name || 'System'
          }
        ]
      };
      // Create enquiry
      const enquiry = {
        id: Date.now().toString(),
        customerName: user?.fullName || profile?.name || 'Anonymous Buyer',
        message: bidMessage || `Interested in purchasing ${product.name}`,
        quantity: bidQuantity ? `${bidQuantity} ${product.unit}` : 'Enquiry only',
        date: now,
        status: 'accepted' as const, // Auto-accept the bid
        productId: product.id,
        source: 'marketplace' as const,
        productName: product.grade ? `${product.grade} Cashews` : 'Raw Cashews',
        grade: product.grade != "N/A" ? product.grade : "Raw Cashews",
        price: bidPrice != "" ?
          (parseFloat(bidQuantity || '0') * parseFloat(bidPrice || '0')).toFixed(2) :
          (parseFloat(bidQuantity) * product.price).toFixed(2),
        orderId: `ORD-${Date.now()}` // Link to the order
      };

      // Save order
      addOrder(orderData);

      // Save enquiry to local storage
      const existingEnquiries = JSON.parse(localStorage.getItem('productEnquiries') || '[]');
      localStorage.setItem('productEnquiries', JSON.stringify([...existingEnquiries, enquiry]));

      // Update product's enquiry and buyer response counts
      incrementEnquiryCount(product.id);
      incrementBuyerResponseCount(product.id);

      // Update the local state to reflect the changes
      setProduct(prev => prev ? {
        ...prev,
        enquiries: (prev.enquiries || 0) + 1,
        buyerResponses: (prev.buyerResponses || 0) + 1
      } : null);

      // For bidding products, also create a requirement
      if (product.pricingType === 'bidding') {
        addRequirement({
          customerName: user?.fullName || profile?.name || 'Anonymous Buyer',
          grade: product.grade || 'N/A',
          quantity: `${bidQuantity} ${product.unit}`,
          origin: typeof product.location === 'string' ? product.location.toLowerCase() : 'any',
          expectedPrice: bidPrice != "" ?
            (parseFloat(bidQuantity || '0') * parseFloat(bidPrice || '0')).toFixed(2) :
            (parseFloat(bidQuantity) * product.price).toFixed(2),
          minSupplyQuantity: bidQuantity,
          deliveryLocation: profile?.address || 'Not specified',
          city: profile?.city || 'Not specified',
          country: 'India',
          deliveryDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          specifications: bidMessage || 'Standard quality requirements',
          allowLowerBid: true,
          date: new Date().toISOString().split('T')[0],
          status: 'active',
          isDraft: false,
        });
      }

      toast({
        title: "Enquiry Submitted Successfully",
        description: "Your enquiry has been successfully submitted.",
      });

      // Reset form
      setBidQuantity('');
      setBidPrice('');
      setBidMessage('');
    } catch (error) {
      console.error('Error submitting bid:', error);
      toast({
        title: "Error",
        description: "Failed to place your bid. Please try again.",
        variant: "destructive",
      });
    }

    // Clear form
    setBidQuantity("");
    setBidPrice("");
    setBidMessage("");
  };

  const handleViewAllProducts = () => {
    navigate(`/merchant/${merchant.id}/products`);
  };

  // Handle enquiry confirmation
  const handleConfirmEnquiry = async (enquiryId: string) => {
    try {
      // Find the enquiry
      const enquiry = enquiries.find(e => e.id === enquiryId);
      if (!enquiry) {
        throw new Error('Enquiry not found');
      }

      // If it's an order type, update the order status using the orders hook
      if (enquiry.type === 'order' && enquiry.details) {
        await updateOrderStatus(enquiry.details.id, "Confirmed");
      }

      // Update the enquiry status to confirmed
      setEnquiries(prev =>
        prev.map(e =>
          e.id === enquiryId
            ? { ...e, status: 'confirmed' }
            : e
        )
      );

      // Update selected enquiry if it's currently being viewed
      if (selectedEnquiry?.id === enquiryId) {
        setSelectedEnquiry(prev => ({
          ...prev!,
          status: 'confirmed'
        }));
      }

      toast({
        title: "Enquiry Confirmed",
        description: `Enquiry from ${enquiry.customer} has been confirmed.`,
        variant: "default",
      });

      // Close the detail modal if it's open
      setShowEnquiryDetail(false);
    } catch (error) {
      console.error('Error confirming enquiry:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to confirm enquiry',
        variant: "destructive",
      });
    }
  };

  // Handle enquiry rejection
  const handleRejectEnquiry = async (enquiryId: string) => {
    try {
      // Find the enquiry
      const enquiry = enquiries.find(e => e.id === enquiryId);
      if (!enquiry) {
        throw new Error('Enquiry not found');
      }

      // If it's an order type, update the order status using the orders hook
      if (enquiry.type === 'order' && enquiry.details) {
        await updateOrderStatus(enquiry.details.id, "Cancelled");
      }

      // Update the enquiry status to rejected
      setEnquiries(prev =>
        prev.map(e =>
          e.id === enquiryId
            ? { ...e, status: 'rejected' }
            : e
        )
      );

      // Update selected enquiry if it's currently being viewed
      if (selectedEnquiry?.id === enquiryId) {
        setSelectedEnquiry(prev => ({
          ...prev!,
          status: 'rejected'
        }));
      }

      toast({
        title: "Enquiry Rejected",
        description: `Enquiry from ${enquiry.customer} has been rejected.`,
        variant: "default",
      });

      // Close the detail modal if it's open
      setShowEnquiryDetail(false);
    } catch (error) {
      console.error('Error rejecting enquiry:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to reject enquiry',
        variant: "destructive",
      });
    }
  };

  // Helpers to format numbers with Indian locale (en-IN) for display
  // while keeping raw numeric strings in state for calculations
  const formatNumberIND = (value: string) => {
    if (value === '' || value === '.') return value;
    const noCommas = value.replace(/,/g, '');
    const num = Number(noCommas);
    if (isNaN(num)) return '';
    const [intPart, decPart] = noCommas.split('.');
    const formattedInt = new Intl.NumberFormat('en-IN').format(Number(intPart || '0'));
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  };

  const normalizeNumberInput = (input: string) => {
    const noCommas = input.replace(/,/g, '');
    const parts = noCommas.replace(/[^0-9.]/g, '').split('.');
    return parts[0] + (parts.length > 1 ? '.' + parts.slice(1).join('') : '');
  };

  return (
    <div className={`${role === 'processor' ? 'w-full' : 'max-w-7xl'} mx-auto px-4 py-6`}>
      {/* Back Button */}
      <Button
        variant="ghost"
        className="inline-flex items-center mb-6"
        onClick={handleBack}
      >
        <ArrowLeft size={16} className="mr-2" />
        {role === "processor" ? "Back to My Product Stocks" : "Back to Marketplace"}
      </Button>

      <div className={`grid grid-cols-1 ${role === 'processor' ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8`}>
        {/* Main Content Column */}
        <div className={`${role === 'processor' ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-8`}>
          {/* Hero Product Card */}
          <Card className="overflow-hidden shadow-warm border-0 bg-gradient-warm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {product.grade} Cashews
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {product.type}
                    </Badge>
                    {merchant?.verified && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Shield size={12} className="mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
                </div>
                <div className="text-right bg-primary/5 p-6 rounded-2xl border border-primary/20">
                  <div className="text-4xl font-bold text-primary mb-1">
                    ₹{new Intl.NumberFormat("en-IN", {
                      maximumFractionDigits: 0,
                    }).format(product.price)}
                  </div>
                  <div className="text-sm font-medium text-primary/70">Per {product.unit}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {Array.isArray((product as any).images) && (product as any).images.length > 0 && (
                <div className="mb-6">
                  <div className="text-sm text-muted-foreground font-medium mb-2">Images</div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(product as any).images.map((src: string, idx: number) => (
                      <a key={idx} href={src} target="_blank" rel="noreferrer">
                        <img
                          src={src}
                          alt={`Product image ${idx + 1}`}
                          className="w-full h-28 md:h-32 object-cover rounded-lg border"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex items-center space-x-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Package size={24} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">Available Stock</div>
                    <div className="font-bold text-lg">
                      {product.availableQty?.toLocaleString()} {product.unit}
                    </div>
                  </div>

                </div>
                <div className="flex items-center space-x-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin size={24} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">Origin</div>
                    <div className="font-bold text-lg">
                      {typeof product.location === 'string'
                        ? product.location
                        : [
                          (product.location as LocationType)?.city,
                          (product.location as LocationType)?.country
                        ].filter(Boolean).join(', ') || 'N/A'
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar size={24} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground font-medium">Stock Until Date</div>
                    <div className="font-bold text-lg">{new Date(product.expireDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {product.pricingType === "bidding" && (
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <TrendingUp size={20} className="text-yellow-600" />
                  </div>
                  <div>
                    <span className="font-semibold text-yellow-800">Live Bidding Available</span>
                    <p className="text-sm text-yellow-700">This product accepts competitive bids</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Specifications */}
          <Card className="shadow-soft">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Sparkles className="text-primary" size={20} />
                <CardTitle>Product Specifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getProductSpecs().map(([key, value], index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-accent/30 to-accent/10 rounded-lg border border-accent/50">
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wide">{key}</div>
                    <div className="font-bold text-lg text-foreground mt-1">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Request Form - Hide in processor mode or if buyer offers are not allowed */}
          {role !== "processor" && (
            <Card className="shadow-warm border-primary/20 bg-gradient-to-br from-primary/5 to-accent/20">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Zap className="text-primary" size={20} />
                  <CardTitle className="text-primary">{product.pricingType === "bidding" ? "Place Your Bid" : "Send Enquiry"}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-foreground">Quantity ({product.unit})</label>
                    <div>
                    <Input
                        type="text"
                        inputMode="decimal"
                        value={formatNumberIND(bidQuantity)}
                        onChange={(e) => {
                          const raw = normalizeNumberInput(e.target.value);
                          setBidQuantity(raw);
                        }}
                        placeholder={`Min: ${product.minOrderQty || 1}, Max: ${product.availableQty.toLocaleString()} ${product.unit}`}
                        className={`border-primary/20 focus:border-primary ${(bidQuantity &&
                          parseFloat(bidQuantity) > product.availableQty) ||
                          (bidQuantity &&
                            product.minOrderQty &&
                            parseFloat(bidQuantity) < product.minOrderQty)
                          ? 'border-red-500'
                          : ''
                          }`}
                      />

                      {/* Validation message */}
                      {bidQuantity &&
                        parseFloat(bidQuantity) > product.availableQty && (
                          <p className="text-red-500 text-sm mt-1">
                            Quantity cannot exceed {product.availableQty} {product.unit}.
                          </p>
                        )}

                      {bidQuantity &&
                        product.minOrderQty &&
                        parseFloat(bidQuantity) < product.minOrderQty && (
                          <p className="text-red-500 text-sm mt-1">
                            Minimum order quantity is {product.minOrderQty} {product.unit}.
                          </p>
                        )}
                    </div>
                  </div>
                  {product.allowBuyerOffers ? (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">
                        Your Expected Price (₹/{product.unit})
                      </label>
                      <Input
                        type="text"
                        inputMode="decimal"
                        value={formatNumberIND(bidPrice)}
                        onChange={(e) => {
                          const raw = normalizeNumberInput(e.target.value);
                          setBidPrice(raw);
                        }}
                        placeholder="Enter your expected price"
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-foreground">
                        Price (₹/{product.unit})
                      </label>
                      <div className="flex items-center h-10 px-3 py-2 text-sm border rounded-md bg-muted/50 text-muted-foreground">
                        {bidQuantity && parseFloat(bidQuantity) > 0
                          ? `₹${(parseFloat(bidQuantity) * product.price).toFixed(2)} (${product.price}/${product.unit})`
                          : `₹${product.price}/${product.unit}`
                        }
                      </div>
                    </div>
                  )}

                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-foreground">Message to Merchant</label>
                  <Textarea
                    value={bidMessage}
                    onChange={(e) => setBidMessage(e.target.value)}
                    placeholder="Add any specific requirements or questions..."
                    rows={4}
                    className="border-primary/20 focus:border-primary resize-none"
                  />
                </div>
                <Button
                  onClick={handlePlaceBid}
                  className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white font-semibold py-3 text-lg shadow-warm"
                  size="lg"
                >
                  <Send className="mr-2" size={18} />
                  {product.pricingType === "bidding" ? "Place Bid Now" : "Submit"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Enhanced Right Sidebar */}
        <div className="space-y-8">
          {/* Enhanced Merchant Card */}
          {role !== "processor" && (
            <Card className="sticky top-20 shadow-warm border-0 bg-gradient-warm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-primary">{merchant.name}</CardTitle>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full border border-yellow-200">
                        <Star size={14} className="text-yellow-500 mr-1" />
                        <span className="font-semibold text-sm">{merchant?.rating || 'N/A'}</span>
                      </div>
                      {/* <span className="text-muted-foreground ml-2 text-sm">
 ({merchant?.totalOrders || 0} {merchant?.totalOrders === 1 ? 'order' : 'orders'})
 </span> */}
                    </div>
                  </div>
                  {merchant.verified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <Shield size={12} className="mr-1" /> Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{merchant?.description || 'Quality cashew supplier with years of experience'}</p>

                <div className="space-y-3">
                  <div className="flex items-center p-2 bg-primary/5 rounded-lg">
                    <MapPin size={16} className="mr-3 text-primary" />
                    <span className="text-sm font-medium">
                      {typeof merchant?.location === 'string'
                        ? merchant.location
                        : [
                          (merchant?.location as LocationType)?.city,
                          (merchant?.location as LocationType)?.country
                        ].filter(Boolean).join(', ') || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center p-2 bg-primary/5 rounded-lg">
                    <Phone size={16} className="mr-3 text-primary" />
                    <span className="text-sm font-medium">{merchant?.phone || 'Contact via platform'}</span>
                  </div>
                  <div className="flex items-center p-2 bg-primary/5 rounded-lg">
                    <Mail size={16} className="mr-3 text-primary" />
                    <span className="text-sm font-medium">{merchant?.email || 'Available on request'}</span>
                  </div>
                  <div className="flex items-center p-2 bg-primary/5 rounded-lg">
                    <Clock size={16} className="mr-3 text-primary" />
                    <span className="text-sm font-medium">Response: {merchant?.responseTime || 'Within 24 hours'}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button className="w-full bg-gradient-primary hover:bg-gradient-primary/90 text-white shadow-warm">
                    Contact Merchant
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-primary/20 hover:bg-primary/5"
                    onClick={handleViewAllProducts}
                  >
                    View All Products
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bid Details Card */}
          {product.pricingType === "bidding" && role !== "processor" && (
            <Card className="sticky top-20 shadow-md rounded-lg border border-gray-200 max-w-sm">
              <CardHeader className="pb-1">
                <CardTitle className="text-base font-semibold">Bid History</CardTitle>
                <p className="text-xs text-muted-foreground">Live trading updates</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Auction Timer */}
                <div className="p-3 rounded-lg border bg-purple-50 flex justify-between items-center">
                  <h4 className="text-xs font-medium">Auction Ends In</h4>
                  <p className="font-semibold text-purple-600 text-sm">{timeLeft}</p>
                </div>

                {/* Opening Bid */}
                <div className="p-3 rounded-lg border bg-muted/30">
                  <h4 className="text-xs font-medium mb-1">Opening Bid</h4>
                  <p className="text-base font-semibold text-primary">
                    {product.price} $/ton
                  </p>
                </div>

                {/* Current Bids Timeline */}
                <div className="p-3 rounded-lg border bg-muted/30">
                  <h4 className="text-xs font-medium mb-2">Bid Timeline</h4>
                  <ul className="space-y-3 text-xs relative">
                    {currentBids.map((bid, idx) => (
                      <li key={bid.id} className="relative flex items-start gap-2 pl-5">
                        {/* timeline line */}
                        {idx !== currentBids.length - 1 && (
                          <span className="absolute left-[4px] top-2 w-[1px] h-full bg-gray-300"></span>
                        )}
                        {/* timeline dot */}
                        <span className="absolute left-0 top-2 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white shadow"></span>

                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{bid.bidder}</span>
                            <span className="text-[10px] text-muted-foreground">{bid.time}</span>
                          </div>
                          <div className="text-xs">
                            {bid.price} $/ton &nbsp; | &nbsp; {bid.quantity} tons
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Your Bid */}
                <div className="p-3 rounded-lg border bg-muted/30">
                  <h4 className="text-xs font-medium mb-1">Your Bid</h4>
                  {bidPrice || bidQuantity ? (
                    <p className="text-xs">
                      <span className="font-medium">Qty:</span> {bidQuantity || "-"} tons
                      &nbsp; | &nbsp;
                      <span className="font-medium">Price:</span> {bidPrice || "-"} $/ton
                    </p>
                  ) : (
                    <p className="text-muted-foreground text-xs">
                      You haven’t placed a bid yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

          )}

          {/* Enquiries Section (Processor only) */}
          {role === 'processor' && (
            <Card className="shadow-warm border-0 bg-gradient-warm max-h-[39rem] flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageSquare size={18} className="mr-2" />
                  All Enquiries ({enquiries.length})
                </CardTitle>
              </CardHeader>

              {/* 👇 Add scroll here */}
              <CardContent className="flex-1 overflow-y-auto pr-2 space-y-3">
                {enquiries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No enquiries yet. Buyers will see your product and can send enquiries.
                  </div>
                ) : (
                  enquiries.map((enquiry) => (
                    <Card
                      key={enquiry.id}
                      className="p-3 border cursor-pointer hover:bg-accent/50 transition-colors relative"
                      onClick={() => {
                        setSelectedEnquiry(enquiry);
                        setShowEnquiryDetail(true);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{enquiry.customer}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <MapPin size={12} className="mr-1" />
                            {enquiry.type === 'order' ? enquiry.details?.location : 'N/A'}
                          </div>
                          {enquiry.price && (
                            <div className="text-sm text-primary font-medium">
                              Price:{" "}
                              {enquiry.price.toString().includes("₹")
                                ? enquiry.price
                                : `₹${enquiry.price}`}
                              /{product?.unit}
                            </div>
                          )}
                          {enquiry.quantity && (
                            <div className="text-sm text-muted-foreground">
                              Quantity: {enquiry.quantity}
                            </div>
                          )}
                          {enquiry.message && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Message: {enquiry.message.substring(0, 50)}
                              {enquiry.message.length > 50 ? "..." : ""}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          {getStatusBadge(enquiry.status)}
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(enquiry.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

          )}
        </div>
      </div>

      {/* Enquiry Detail Modal */}
      <Dialog open={showEnquiryDetail} onOpenChange={setShowEnquiryDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-l-4 border-l-purple-500">
          <DialogHeader>
            <DialogTitle className="flex items-center text-purple-700">
              <MessageSquare size={20} className="mr-2" />
              Enquiry Details
              {selectedEnquiry?.status === 'Processing' && (
                <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700 border-purple-300">
                  New
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-purple-50/80 border border-purple-100">
                <div>
                  <div className="text-sm text-purple-700 font-medium">Customer Name</div>
                  <div className="font-medium">{selectedEnquiry.customer}</div>
                </div>
                <div>
                  <div className="text-sm text-purple-700 font-medium">Enquiry Date</div>
                  <div className="font-medium">
                    {new Date(selectedEnquiry.date).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div>
                <div className="text-sm text-purple-700 font-medium mb-2">Product Details</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-accent/20 rounded-lg">
                  {selectedEnquiry.quantity && (
                    <div>
                      <div className="text-sm text-muted-foreground">Quantity</div>
                      <div className="font-medium">{selectedEnquiry.quantity}</div>
                    </div>
                  )}
                  {selectedEnquiry.price && (
                    <div>
                      <div className="text-sm text-muted-foreground">Expected Price</div>
                      <div className="font-medium text-primary">
                        {selectedEnquiry.price.toString().includes("₹")
                          ? selectedEnquiry.price
                          : `₹${selectedEnquiry.price}`}
                        /{product?.unit}
                      </div>
                    </div>
                  )}
                  {selectedEnquiry.details?.grade && (
                    <div>
                      <div className="text-sm text-muted-foreground">Grade</div>
                      <div className="font-medium">{selectedEnquiry.details.grade != "N/A" ? selectedEnquiry.details.grade : "Raw Cashews"}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Details (if it's an order) */}
              {selectedEnquiry.type === 'order' && selectedEnquiry.details && (
                <div>
                  <div className="text-sm text-purple-700 font-medium mb-2">Enquiry Information</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-accent/20 rounded-lg border border-purple-100">
                    <div>
                      <div className="text-sm text-purple-700 font-medium">Total Amount</div>
                      <div className="font-medium">
                        ₹{selectedEnquiry.details.totalAmount?.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-purple-700 font-medium">Delivery Date</div>
                      <div className="font-medium">
                        {selectedEnquiry.details.deliveryDate ?
                          new Date(selectedEnquiry.details.deliveryDate).toLocaleDateString() :
                          'Not specified'
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-purple-700 font-medium">Location</div>
                      <div className="font-medium">{selectedEnquiry.details.location || 'Not specified'}</div>
                    </div>
                  </div>
                </div>
              )}
              {/* Message */}
              <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100">
                <div className="text-sm text-purple-700 font-medium mb-2">Customer Message</div>
                <div className="p-4 bg-white rounded-md border border-purple-100">
                  <p className="text-sm">{selectedEnquiry.message || 'No message provided'}</p>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowEnquiryDetail(false)}>
                  Close
                </Button>
                {selectedEnquiry.status === 'Processing' ? (
                  <>
                    <Button
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => handleRejectEnquiry(selectedEnquiry.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleConfirmEnquiry(selectedEnquiry.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Confirm
                    </Button>
                  </>
                ) : (
                  <div>
                    <div className="text-sm text-muted-foreground">Status</div>
                    <div>{getStatusBadge(selectedEnquiry.status)}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductDetail;